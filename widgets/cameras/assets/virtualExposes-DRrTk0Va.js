import { _ as o } from "./preload-helper-PPVm8Dsz.js";
let f;
let __tla = (async () => {
  const c = {}, i = /* @__PURE__ */ new Set();
  let u = Promise.resolve();
  async function n(t) {
    const e = u.then(t, t);
    return u = e.then(() => {
    }, () => {
    }), e;
  }
  async function a(t) {
    if (typeof document > "u") return;
    const e = c[t] || [];
    await Promise.all(e.map((l) => {
      const r = new URL(l, import.meta.url).href;
      return i.has(r) || (i.add(r), document.querySelector(`link[rel="stylesheet"][data-mf-href="${r}"]`)) ? Promise.resolve() : new Promise((d, m) => {
        const s = document.createElement("link");
        s.rel = "stylesheet", s.href = r, s.setAttribute("data-mf-href", r), s.onload = () => d(), s.onerror = () => m(new Error(`[Module Federation] Failed to load CSS asset: ${r}`)), document.head.appendChild(s);
      });
    }));
  }
  f = {
    "./RtspCamera": async () => {
      await a("./RtspCamera");
      const t = await n(() => o(() => import("./RtspCamera-UHEiSbtk.js").then(async (m) => {
        await m.__tla;
        return m;
      }), [], import.meta.url)), e = {};
      return Object.assign(e, t), Object.defineProperty(e, "__esModule", {
        value: true,
        enumerable: false
      }), e;
    },
    "./SnapshotCamera": async () => {
      await a("./SnapshotCamera");
      const t = await n(() => o(() => import("./SnapshotCamera-kaHwqTHr.js").then(async (m) => {
        await m.__tla;
        return m;
      }), [], import.meta.url)), e = {};
      return Object.assign(e, t), Object.defineProperty(e, "__esModule", {
        value: true,
        enumerable: false
      }), e;
    },
    "./translations": async () => {
      await a("./translations");
      const t = await n(() => o(() => import("./translations-BGRpfol-.js"), [], import.meta.url)), e = {};
      return Object.assign(e, t), Object.defineProperty(e, "__esModule", {
        value: true,
        enumerable: false
      }), e;
    }
  };
})();
export {
  __tla,
  f as default
};
