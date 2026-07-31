let a;
let __tla = (async () => {
  const t = "__mf_init____mf__virtual/__mfe_internal__vis2CameraWidgets__mf_v__runtimeInit__mf_v__.js__";
  let n = globalThis[t];
  if (!n) {
    let _, o;
    const i = new Promise((f, m) => {
      _ = f, o = m;
    });
    n = globalThis[t] = {
      initPromise: i,
      initResolve: _,
      initReject: o
    }, typeof window > "u" && _({
      loadRemote: function() {
        return Promise.resolve(void 0);
      },
      loadShare: function() {
        return Promise.resolve(void 0);
      }
    });
  }
  let s, r, e, l, c, u, d, p, P, h, y, b, g, v, T, O, j, w, S, x, C, R, I, M, V;
  s = n.initPromise;
  r = s.then((_) => _.loadShare("prop-types", {
    customShareInfo: {
      shareConfig: {
        singleton: true,
        strictVersion: false,
        requiredVersion: "*"
      }
    }
  }));
  e = await r.then((_) => typeof _ == "function" ? _() : _);
  a = e.__esModule ? e.default : e.default ?? e;
  ({ array: l, bigint: c, bool: u, func: d, number: p, object: P, string: h, symbol: y, any: b, arrayOf: g, element: v, elementType: T, instanceOf: O, node: j, objectOf: w, oneOf: S, oneOfType: x, shape: C, exact: R, checkPropTypes: I, resetWarningCache: M, PropTypes: V } = e);
})();
export {
  a as P,
  __tla
};
