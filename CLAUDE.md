# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`ioBroker.cameras` is an ioBroker adapter that connects IP cameras to ioBroker. It is three separate
builds in one repo:

| Source        | Build tool           | Output (committed)  | Consumed by                                     |
| ------------- | -------------------- | ------------------- | ----------------------------------------------- |
| `src/`        | `tsc`                | `build/`            | js-controller (`main` = `build/main.js`)        |
| `src-admin/`  | vite (React 19)      | `admin/`            | ioBroker admin (`admin/index_m.html`)           |
| `src-widgets/`| vite + module fed.   | `widgets/cameras/`  | vis-2 (`common.visWidgets` in io-package.json)  |
| `src-devices/`| vite + module fed.   | `admin/dm-widgets/` | ioBroker.devices (`common.deviceWidgets`)      |

`admin/` and `widgets/` are generated but **committed** — they are listed in package.json `files`.

## Commands

```bash
npm run build          # everything: backend tsc + admin + widgets (this is what release runs)
npm run build-backend  # tsc -p tsconfig.build.json  ->  build/
npm run admin-build    # clean + npm i in src-admin + vite build + copy to admin/
npm run widget-build   # same for src-widgets -> widgets/cameras/
npm run lint           # eslint; covers src/ only (see ignores in eslint.config.mjs)
npm test               # mocha --exit  (runs everything under test/)
npx mocha --exit test/unit.js          # single test file (unit | integration | package)
npm run release-patch  # @alcalzone/release-script: lint, bump versions, build, tag
```

Granular build steps exist when a full rebuild is too slow: `0-clean` / `1-npm` / `2-build` / `3-copy`
for admin, and `widget-0-clean` … `widget-3-copy` for widgets. All are thin wrappers around `tasks.js`.

Integration tests start the real adapter, so run `npm run build-backend` before `npm test`.

Frontend dev servers: `cd src-admin && npm start` (port 3000, proxies to admin on :8081),
`cd src-widgets && npm start` (port 4173, proxies to web on :8082).

## Backend architecture (`src/`)

### `main.ts` — `CamerasAdapter`

- Runs a **private HTTP server** on `config.bind:config.port` (default `127.0.0.1:8200`). Every request
  must carry `?key=<config.key>`; wrong keys arm a 5-second per-IP block, plus an optional IP allowlist.
  This server is not meant to be reached by browsers directly — `lib/web.ts` proxies to it.
- Image pipeline, applied uniformly to every source:
  `camera.process()` → `resizeImage` → `rotateImage` → `addTextToImage` (all `sharp`). Results are cached
  per camera under a key of `{w,h,angle}` for `cacheTimeout` ms. The latest frame is also written to the
  adapter's meta files as `cameras.<i>/<name>.jpg`.
- Messages (`sendTo`): `image` (base64 JPEG for a configured camera), `test` (render a not-yet-saved
  camera config, used by the admin dialogs), `list`, `ffmpeg` (probe a binary's version).
- Per camera it creates two states: `<name>.running` (writable — writing `true`/`false` starts/stops the
  live stream) and `<name>.stream` (base64 JPEG, legacy push channel).
- **Windows ffmpeg is shipped in-repo** as `win-ffmpeg.zip` and decompressed at runtime. The expected
  version is hard-coded in `WIN_FFMPEG_VERSION` at the top of `main.ts`; if the zip is replaced, that
  constant must be updated or the adapter re-extracts on every start. README documents the update steps.

### Live-stream (MJPEG) transport — two paths

1. **Instance messages** (preferred, js-controller ≥ 5.0.13): the GUI subscribes with message type
   `startCamera/<cameraName>`; `uiClientSubscribe`/`uiClientUnsubscribe` in `main.ts` start/stop the
   ffmpeg process and frames are pushed with `adapter.sendToUI`. Subscribers are tracked in
   `streamSubscribes`, which is handed to each RTSP camera via `registerRtspStreams`.
2. **State fallback**: if no UI subscriber is found, frames are written to `<name>.stream`. The widget
   picks the path via `socket.checkFeatureSupported('INSTANCE_MESSAGES')`.

### `lib/web.ts` — web extension (runs inside ioBroker.web, not in this adapter)

Registered via `common.webExtension: "build/lib/web.js"`. It:
- mounts express routes `/<namespace>/<cameraName>` that forward to the adapter's private HTTP server on
  127.0.0.1, injecting the secret key — this is what makes `http://iobroker:8082/cameras.0/cam1` work;
- for RTSP cameras, adds a WebSocket route (`rtsp2mjpeg`) that spawns its own ffmpeg and pushes raw JPEG
  frames as binary. ffmpeg lingers 3 s after the last socket closes so page reloads don't restart it.
- `rtsp2WebRTC` is an unfinished experiment; it is not wired into any route.

Note there are **two independent ffmpeg stream implementations** (`GenericRtspCamera.startWebStream` for
the message/state path, `ProxyCameras.startFFmpeg` for the websocket path). Changes to streaming
behaviour usually need to be made in both.

### go2rtc — optional, off by default (`config.useGo2rtc`)

Split in two because the two consumers live in **different processes**:

- `lib/Go2RtcServer.ts` — process management, used by the adapter (`main.ts`). Binary lookup via
  `findBinary`: config path → `<adapterDir>/go2rtc/` → PATH. Writes a generated config into `tempPath`;
  streams are registered at runtime through the API, so **no camera credentials are written to disk**.
- `lib/Go2RtcClient.ts` — pure HTTP client. `lib/web.ts` runs inside the ioBroker.web process and
  cannot see the `Go2RtcServer` object, so it talks to the same local API through this client.

**The browser never reaches go2rtc directly.** Its API is bound to `127.0.0.1`; everything is proxied
by the web extension, which means the routes inherit ioBroker.web's authentication and its http/https
scheme (no mixed-content problem, no extra open port):

| Route | Source |
| --- | --- |
| WS `/<ns>/<cam>` | MJPEG frames, from go2rtc if enabled, else a local ffmpeg |
| GET `/<ns>/<cam>/stream.mjpeg` | passthrough of `/api/stream.mjpeg`, usable in a plain `<img>` |
| WS `/<ns>/<cam>/webrtc` | relay of go2rtc's `/api/ws` signalling |

Three things that are easy to get wrong and cost real debugging time:

1. **The RTSP module must stay enabled.** go2rtc pipes the output of `ffmpeg:`/`exec:` sources back
   through its own RTSP server; `rtsp: listen: ""` breaks every transcoded source with
   `streams: exec: rtsp module disabled`. It is bound to `127.0.0.1:<go2rtcRtspPort>`.
2. **`ensureStream` registers two producers**: the camera plus `ffmpeg:<name>#video=mjpeg`. Without the
   second one `/api/stream.mjpeg` rejects an H264 camera with `codecs not matched: video:H264 =>
   video:JPEG`. Producers only start once a consumer attaches, so this is free while nobody watches.
3. **go2rtc logs to stdout**, not stderr.

`GenericRtspCamera.process()` and `ProxyCameras.startSource()` both fall back to ffmpeg on any error,
so enabling go2rtc cannot break a working installation.

Caveat: only the **signalling** of WebRTC can be proxied — the media flows directly between browser and
go2rtc, so it needs `webrtcListen` set and that port reachable. The MJPEG path is the one that runs
fully behind ioBroker.web.

### `src/cameras/` — one class per camera type

- `GenericCamera` (abstract): `init()` / `destroy()` / `process(): Promise<ProcessData>`, HTTP path `/<name>`.
- `GenericRtspCamera` extends it with all ffmpeg logic (snapshot + MJPEG stream). Subclasses only fill
  `this.settings` (an `RtspOptions`) and `this.decodedPassword` in their `init()` **before** calling
  `super.init()` — the base `init()` throws if `settings.ip` is missing.
- `Factory.ts` — `createCamera()`, a switch on `config.type`. Single registration point for the backend.
- `rtspCommon.ts` — ffmpeg discovery (`findFFmpegPath`: config path → bundled Windows exe → `where`/`which`
  → known Linux paths), version probing, spawn helpers, and `maskPassword` (always used when logging
  ffmpeg command lines).

Passwords are stored encrypted; decrypt with `this.adapter.decrypt(...)` in the camera's `init()`.

## Adding a new camera type

The README's "How to add a new camera" section refers to the old pre-TypeScript layout. Current steps:

1. `src/types.d.ts` — add the key to the `CameraType` union, add a `CameraConfigX extends CameraConfig`
   interface, and add it to the `CameraConfigAny` union.
2. `src/cameras/XCamera.ts` — extend `GenericCamera` (plain HTTP snapshot) or `GenericRtspCamera` (RTSP).
3. `src/cameras/Factory.ts` — add the `case` to the switch.
4. `src-admin/src/Types/X.tsx` — extend `ConfigGeneric<CameraConfigX>`; set `static isRtsp` so the widget
   camera picker can filter it.
5. `src-admin/src/Tabs/Cameras.tsx` — import it and add an entry to the `TYPES` record. **The key must be
   identical to the backend `config.type`.**
6. Add label keys to all `src-admin/src/i18n/*.json`.

**Prefer the `universal` type over a new dedicated type.** It is data-driven and covers ~49
manufacturers / ~13 000 models without any backend code:
`src-admin/src/Types/Universal.tsx` reads `./data/manufacturers.json` to fill its manufacturer
dropdown, then `./data/<id>.json` for that manufacturer's model→URL table, and stores the choice as
`manufacturer` + `model` + `urlPath` + `urlProtocol` in the camera config. `UniversalCamera` builds
either an RTSP or an HTTP URL from it. **Adding a manufacturer means adding a data file, nothing else.**

Logos live next to the data as `data/<id>.svg` and are produced by `node tools/logos.js`
(`--force` also overwrites existing ones — careful, that includes hand-made logos). Two sources:
brand marks from `simple-icons` (CC0) for the nine manufacturers it actually carries, and a generated
monogram for the rest, because most IP camera brands have no freely licensed logo and copying
trademarked artwork into an MIT repo is not an option. **To use a real logo, just drop
`<id>.svg`/`.png`/`.jpg` into `src-admin/public/data/`** — `Universal.tsx` probes those three
extensions and `tools/logos.js` skips ids that already have a file.

Regenerate the model data with `node tools/parser.js` (all) or `node tools/parser.js hikvision dahua`
(selected). New manufacturers go into the `MANUFACTURERS` map at the top of the script; it writes
straight into `src-admin/public/data/` and rebuilds `manufacturers.json`. The scraper reads the
`data-protocol` / `data-path` / `data-port` / `data-conn` attributes of the `<tr>` elements on
ispyconnect.com — do not go back to reading column positions, that is what broke the previous version.
Rows with protocols `UniversalCamera` cannot build (`mms://`, `rtmp://`, …) are dropped.

A dedicated type is only worth it when the camera needs its own logic (Eufy reads the URL from another
adapter's state, Reolink/HiKam have fixed quality paths, Instar has a bespoke snapshot URL).

## Admin UI (`src-admin/`)

A standalone React app, **not** jsonConfig (`common.adminUI.config` is `materialize`). `tasks.js` copies
the vite output into `admin/` and renames `index.html` → `admin/index_m.html` after patching it.

`App.tsx` extends `GenericApp` from `@iobroker/gui-components` and renders two tabs: `Tabs/Options.tsx`
(adapter-wide settings) and `Tabs/Cameras.tsx` (the camera list plus the per-type dialogs).

## vis-2 widgets (`src-widgets/`)

A module-federation remote named `vis2CameraWidgets` exposing `./RtspCamera`, `./SnapshotCamera` and
`./translations` (see `src-widgets/vite.config.ts`; `src/index.tsx` is intentionally empty). Each widget
extends `(window.visRxWidget as typeof VisRxWidget)<TRxData, TState>` directly — there is no shared
`Generic` base class any more — and declares its own `static getI18nPrefix()` returning `cameras_`.
`CameraField` (the camera picker) lives in `RtspCamera.tsx` and is imported by `SnapshotCamera.tsx`.

`SnapshotCamera` just points an `<img>` at `../cameras.<instance>/<name>`; `RtspCamera` draws pushed
JPEG frames onto a canvas using the two-path subscription described above.

`tasks.js` post-processes the copied bundle to patch a zrender minification bug (`isFunction` used before
definition) — don't remove that `process` callback in `widgetsCopyAllFiles`.

## Device Manager widgets (`src-devices/`)

A second module-federation remote (`DevicesWidgetCamerasSet`, `customDevices.js`) that
**ioBroker.devices** loads, registered under `common.deviceWidgets` in io-package.json. Built with
`npm run devices-build` (granular: `devices-0-clean` … `devices-3-copy`); output goes to
`admin/dm-widgets/`, which ships because `admin/` is already in package.json `files`.
The pattern is taken from ioBroker.echarts' `src-devices/`.

Both components extend `CameraWidgetBase` → `WidgetGeneric` from `@iobroker/dm-widgets`. Note that
`WidgetGeneric` is only a *compilable mirror* — the host injects the real implementation at runtime via
federation, so React and MUI must be imported **from `@iobroker/dm-widgets`**, not directly.

- `RtspCameraComponent` — subscribes with `subscribeOnInstance(instance, 'startCamera/<name>')`, the
  same push channel the vis widget uses.
- `SnapshotCameraComponent` — polls the adapter's `image` message.

Both go over the **socket**, not over an HTTP route of the web adapter, because the Devices UI usually
runs inside admin (port 8081) where `/<instance>/<camera>` is not served.

The camera is picked as a plain `objectId` below the `cameras` namespace (e.g. `cameras.0.cam1.running`);
`parseCameraId()` derives instance and camera name from it. That avoids needing a dynamic list in the
JSON-config schema.

## Conventions

- Lint/format config comes from `@iobroker/eslint-config` (+ its prettier config). `eslint.config.mjs`
  ignores `src-admin/`, `src-widgets/`, `test/`, and both build outputs, so `npm run lint` only checks
  the backend.
- Backend TS is strict (`strict`, `noUnusedLocals`, `module: Node16`, target es2022) and emits CommonJS.
  `main.ts` ends with the compact-mode dual export (`module.exports = options => new CamerasAdapter(...)`).
- Version lives in four places: `package.json`, `io-package.json` (`common.version` **and** a `news`
  entry per language), `src-admin/package.json`, `src-widgets/package.json`. Use `npm run release-patch`
  rather than editing by hand; it runs `npm run lint` then `npm run build` before committing.
- Changelog is in README.md under the `### **WORK IN PROGRESS**` heading, which the release script
  consumes — keep the placeholder comment above it intact.
