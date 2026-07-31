import { _ as t } from "./preload-helper-PPVm8Dsz.js";
(async () => {
  const i = await t(() => import("../customWidgets.js").then(async (m) => {
    await m.__tla;
    return m;
  }), [], import.meta.url);
  await i.init();
})();
