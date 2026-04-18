import { v as a, __tla as __tla_0 } from "./vis2CameraWidgets__loadShare__react__loadShare__-DWj90Mgy.js";
let c;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })()
]).then(async () => {
  var f = {
    exports: {}
  }, _ = {};
  var i = a, l = /* @__PURE__ */ Symbol.for("react.element"), m = /* @__PURE__ */ Symbol.for("react.fragment"), d = Object.prototype.hasOwnProperty, v = i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, y = {
    key: true,
    ref: true,
    __self: true,
    __source: true
  };
  function u(t, r, s) {
    var e, o = {}, n = null, p = null;
    s !== void 0 && (n = "" + s), r.key !== void 0 && (n = "" + r.key), r.ref !== void 0 && (p = r.ref);
    for (e in r) d.call(r, e) && !y.hasOwnProperty(e) && (o[e] = r[e]);
    if (t && t.defaultProps) for (e in r = t.defaultProps, r) o[e] === void 0 && (o[e] = r[e]);
    return {
      $$typeof: l,
      type: t,
      key: n,
      ref: p,
      props: o,
      _owner: v.current
    };
  }
  _.Fragment = m;
  _.jsx = u;
  _.jsxs = u;
  f.exports = _;
  c = f.exports;
});
export {
  __tla,
  c as j
};
