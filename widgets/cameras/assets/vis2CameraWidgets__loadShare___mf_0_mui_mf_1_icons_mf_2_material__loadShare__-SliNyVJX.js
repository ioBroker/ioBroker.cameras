import { v as a } from "./vis2CameraWidgets__mf_v__runtimeInit__mf_v__-B3P0TTkl.js";
let l, m;
let __tla = (async () => {
  const { initPromise: i } = a, r = i.then((e) => e.loadShare("@mui/material", {
    customShareInfo: {
      shareConfig: {
        singleton: true,
        strictVersion: false,
        requiredVersion: "*"
      }
    }
  })), _ = await r.then((e) => e());
  m = _;
  const { initPromise: t } = a, o = t.then((e) => e.loadShare("@mui/icons-material", {
    customShareInfo: {
      shareConfig: {
        singleton: true,
        strictVersion: false,
        requiredVersion: "*"
      }
    }
  })), s = await o.then((e) => e());
  l = s;
})();
export {
  __tla,
  l as a,
  m as v
};
