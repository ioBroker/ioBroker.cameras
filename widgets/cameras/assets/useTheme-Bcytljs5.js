import { o as n, __tla as __tla_0 } from "./__mfe_internal__vis2CameraWidgets__loadShare__react__loadShare__.js-Bg5qCBt3.js";
import { T as s, l as m, A as o, z as u, __tla as __tla_1 } from "./defaultTheme-Dxvmzdcl.js";
let h, a, i;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })(),
  (() => {
    try {
      return __tla_1;
    } catch {
    }
  })()
]).then(async () => {
  function r(e) {
    return Object.keys(e).length === 0;
  }
  a = function(e = null) {
    const t = n(s);
    return !t || r(t) ? e : t;
  };
  const c = m();
  h = function(e = c) {
    return a(e);
  };
  i = function() {
    const e = h(u);
    return e[o] || e;
  };
});
export {
  __tla,
  h as a,
  a as b,
  i as u
};
