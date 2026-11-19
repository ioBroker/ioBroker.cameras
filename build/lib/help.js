"use strict";
/**
 * The answer of `help`: what the instance answers, written for an AI agent (e.g. ioBroker.pi-agent, or
 * the MCP server with `send_to`) and for script authors. Keep it in sync with `onMessage` in main.ts and the README.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HELP = exports.COMMANDS = void 0;
/** The commands `onMessage` answers; `write`: the command has an effect beyond returning information */
exports.COMMANDS = [
    { command: 'help', write: false },
    { command: 'list', write: false },
    { command: 'image', write: false },
    // renders a camera configuration that is not saved yet; a Eufy configuration starts the live stream of eusec
    { command: 'test', write: true },
    { command: 'unifiCameras', write: false },
    // runs the given binary with -version
    { command: 'ffmpeg', write: true },
];
exports.HELP = `ioBroker.cameras: connects IP cameras (snapshot URL, RTSP, the models of many
manufacturers, Eufy via eusec, UniFi Protect, HiKam, INSTAR) to ioBroker. An agent can list the cameras and get the
current picture of a camera as JPEG to look at it.

Commands (sendTo cameras.0):
- list: the enabled cameras: {list: [{name, desc, id}]}. name is what image needs, desc the description from the
  settings (e.g. "Garden"), id = "cameras.0.cameras.<name>" (a label, not an object).
- image {name, width?, height?, angle?, noCache?, noFileWrite?, title?, addTime?}: the picture of one camera:
  {data, contentType: "image/jpeg"}; data = the JPEG as base64 (no "data:" prefix), always JPEG.
  name (string, required): exactly as in list. width, height (pixels, default 0 = the size of the camera): one of
  them scales with the aspect ratio kept, both crop the picture to exactly that size. angle (degrees, e.g. 90, 180,
  270; default 0): rotates the picture. noCache (boolean, default false): a new picture instead of one from the
  cache (a picture is kept for the cache time of the camera in the settings, default 100 ms). noFileWrite
  (boolean, default false): true = do not store it as the file cameras.0/<name>.jpg. title (string) and addTime
  (boolean) override the settings of the camera: a text at the bottom, the time at the top.
  While somebody watches the live stream of the camera, the answer is the newest frame of that stream.
  Errors: {error}; "Name not found" = no enabled camera with that name, "Invalid request" = no message; a camera
  that does not answer gives {error} with the reason (e.g. a timeout): try once more, then tell the user.
- help: this text and the list of commands with their write flag.
- test, unifiCameras, ffmpeg: for the settings, not for agents.

How to talk to the user:
- Take the camera from list by its desc or name; if the user's words fit several cameras or none, ask which one.
- Ask for width 1280 or less (e.g. 640 for an overview): the whole JPEG comes back as base64 in the answer.
- For a question about now, get a new picture with noCache: true; do not reuse a picture from earlier.
- Look at the picture and say what it shows: people, vehicles, animals, an open door or gate, packages, light and
  weather; say when it is too dark or blurred to tell. Name the camera by its desc, not by its ID.
- A picture of a camera is private: do not send it to other people (messenger, e-mail) or to another adapter
  unless the user asked for exactly that.
- A battery camera (Eufy) is woken up for every picture: it takes up to 45 s and costs battery, do not poll it.`;
//# sourceMappingURL=help.js.map