let m, l, h;
let __tla = (async () => {
  const o = "__mf_init____mf__virtual/__mfe_internal__vis2CameraWidgets__mf_v__runtimeInit__mf_v__.js__";
  let t = globalThis[o];
  if (!t) {
    let e, n;
    const i = new Promise((r, s) => {
      e = r, n = s;
    });
    t = globalThis[o] = {
      initPromise: i,
      initResolve: e,
      initReject: n
    }, typeof window > "u" && e({
      loadRemote: function() {
        return Promise.resolve(void 0);
      },
      loadShare: function() {
        return Promise.resolve(void 0);
      }
    });
  }
  let a, f, _, d, u, c, R, P, S, v, b, p, E;
  a = t.initPromise;
  f = a.then((e) => e.loadShare("react-dom", {
    customShareInfo: {
      shareConfig: {
        singleton: true,
        strictVersion: false,
        requiredVersion: "*"
      }
    }
  }));
  _ = await f.then((e) => typeof e == "function" ? e() : e);
  m = _.__esModule ? _.default : _.default ?? _;
  ({ __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: d, createPortal: l, createRoot: u, findDOMNode: c, flushSync: h, hydrate: R, hydrateRoot: P, render: S, unmountComponentAtNode: v, unstable_batchedUpdates: b, unstable_renderSubtreeIntoContainer: p, version: E } = _);
})();
export {
  m as R,
  l as _,
  __tla,
  h as a
};
