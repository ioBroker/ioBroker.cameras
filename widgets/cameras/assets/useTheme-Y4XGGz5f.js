import { v as s, __tla as __tla_0 } from "./vis2CameraWidgets__loadShare__react__loadShare__-DWj90Mgy.js";
import { T as n, t as a, I as r, H as o, __tla as __tla_1 } from "./defaultTheme-Bm_nQg-l.js";
let h, u, _;
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
  function m(e) {
    return Object.keys(e).length === 0;
  }
  u = function(e = null) {
    const t = s.useContext(n);
    return !t || m(t) ? e : t;
  };
  const c = a();
  h = function(e = c) {
    return u(e);
  };
  _ = function() {
    const e = h(o);
    return e[r] || e;
  };
});
export {
  __tla,
  h as a,
  u as b,
  _ as u
};
