var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const import_meta = {};
let dynamicLoadingCss, get, init;
var vis2CameraWidgets = (() => __async(void 0, null, function* () {
  const currentImports = {};
  const exportSet = /* @__PURE__ */ new Set([
    "Module",
    "__esModule",
    "default",
    "_export_sfc"
  ]);
  let moduleMap = {
    "./RtspCamera": () => {
      dynamicLoadingCss([], false, "./RtspCamera");
      return __federation_import("./__federation_expose_RtspCamera-DEDIMDIg.js").then((module) => Object.keys(module).every((item) => exportSet.has(item)) ? () => module.default : () => module);
    },
    "./SnapshotCamera": () => {
      dynamicLoadingCss([], false, "./SnapshotCamera");
      return __federation_import("./__federation_expose_SnapshotCamera-BDbQmboE.js").then((module) => Object.keys(module).every((item) => exportSet.has(item)) ? () => module.default : () => module);
    },
    "./translations": () => {
      dynamicLoadingCss([], false, "./translations");
      return __federation_import("./__federation_expose_Translations-HGakruMK.js").then((module) => Object.keys(module).every((item) => exportSet.has(item)) ? () => module.default : () => module);
    }
  };
  const seen = {};
  dynamicLoadingCss = (cssFilePaths, dontAppendStylesToHead, exposeItemName) => {
    const metaUrl = import_meta.url;
    if (typeof metaUrl == "undefined") {
      console.warn('The remote style takes effect only when the build.target option in the vite.config.ts file is higher than that of "es2020".');
      return;
    }
    const curUrl = metaUrl.substring(0, metaUrl.lastIndexOf("customWidgets.js"));
    cssFilePaths.forEach((cssFilePath) => {
      const href = curUrl + cssFilePath;
      if (href in seen) return;
      seen[href] = true;
      if (dontAppendStylesToHead) {
        const key = "css__vis2CameraWidgets__" + exposeItemName;
        if (window[key] == null) window[key] = [];
        window[key].push(href);
      } else {
        const element = document.head.appendChild(document.createElement("link"));
        element.href = href;
        element.rel = "stylesheet";
      }
    });
  };
  function __federation_import(name) {
    return __async(this, null, function* () {
      var _a;
      (_a = currentImports[name]) != null ? _a : currentImports[name] = import(name).then((m) => __async(this, null, function* () {
        yield m.__tla;
        return m;
      }));
      return currentImports[name];
    });
  }
  get = (module) => {
    if (!moduleMap[module]) throw new Error("Can not find remote module " + module);
    return moduleMap[module]();
  };
  init = (shareScope) => {
    globalThis.__federation_shared__ = globalThis.__federation_shared__ || {};
    Object.entries(shareScope).forEach(([key, value]) => {
      const versionKey = Object.keys(value)[0];
      const versionValue = Object.values(value)[0];
      const scope = versionValue.scope || "default";
      globalThis.__federation_shared__[scope] = globalThis.__federation_shared__[scope] || {};
      const shared = globalThis.__federation_shared__[scope];
      (shared[key] = shared[key] || {})[versionKey] = versionValue;
    });
  };
}))();
