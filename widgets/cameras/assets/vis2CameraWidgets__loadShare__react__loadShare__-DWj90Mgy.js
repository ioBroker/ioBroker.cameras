import { g as i } from "./_commonjsHelpers-Cpj98o6Y.js";
import { v as _ } from "./vis2CameraWidgets__mf_v__runtimeInit__mf_v__-B3P0TTkl.js";
let u, p, n;
let __tla = (async () => {
  function c(e, s) {
    for (var o = 0; o < s.length; o++) {
      const t = s[o];
      if (typeof t != "string" && !Array.isArray(t)) {
        for (const r in t) if (r !== "default" && !(r in e)) {
          const a = Object.getOwnPropertyDescriptor(t, r);
          a && Object.defineProperty(e, r, a.get ? a : {
            enumerable: true,
            get: () => t[r]
          });
        }
      }
    }
    return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    }));
  }
  const { initPromise: f } = _, l = f.then((e) => e.loadShare("react", {
    customShareInfo: {
      shareConfig: {
        singleton: true,
        strictVersion: false,
        requiredVersion: "*"
      }
    }
  })), m = await l.then((e) => e());
  n = m;
  u = i(n);
  p = c({
    __proto__: null,
    default: u
  }, [
    n
  ]);
})();
export {
  u as R,
  __tla,
  p as a,
  n as v
};
