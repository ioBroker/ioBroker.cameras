import { r as i, __tla as __tla_0 } from "./__mfe_internal__vis2CameraWidgets__loadShare__react__loadShare__.js_commonjs-proxy-M-PPg5DN.js";
let O;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })()
]).then(async () => {
  var _ = {
    exports: {}
  }, n = {};
  var l = i, m = /* @__PURE__ */ Symbol.for("react.element"), y = /* @__PURE__ */ Symbol.for("react.fragment"), x = Object.prototype.hasOwnProperty, a = l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, v = {
    key: true,
    ref: true,
    __self: true,
    __source: true
  };
  function f(t, r, p) {
    var e, o = {}, s = null, u = null;
    p !== void 0 && (s = "" + p), r.key !== void 0 && (s = "" + r.key), r.ref !== void 0 && (u = r.ref);
    for (e in r) x.call(r, e) && !v.hasOwnProperty(e) && (o[e] = r[e]);
    if (t && t.defaultProps) for (e in r = t.defaultProps, r) o[e] === void 0 && (o[e] = r[e]);
    return {
      $$typeof: m,
      type: t,
      key: s,
      ref: u,
      props: o,
      _owner: a.current
    };
  }
  n.Fragment = y;
  n.jsx = f;
  n.jsxs = f;
  _.exports = n;
  O = _.exports;
});
export {
  __tla,
  O as j
};
