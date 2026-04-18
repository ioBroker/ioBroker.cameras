const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../customWidgets.js","./index.cjs-DgT9IskJ.js","./virtualExposes-CjdSeOc8.js","./preload-helper-PPVm8Dsz.js","./vis2CameraWidgets__mf_v__runtimeInit__mf_v__-B3P0TTkl.js"])))=>i.map(i=>d[i]);
import { _ as i } from "./preload-helper-PPVm8Dsz.js";
(async () => {
  const r = i(() => import("../customWidgets.js").then(async (m) => {
    await m.__tla;
    return m;
  }), __vite__mapDeps([0,1,2,3,4]), import.meta.url);
  Promise.resolve(r).then((e) => Promise.resolve(e.__tla).then(e.init).catch(e.init));
})();
