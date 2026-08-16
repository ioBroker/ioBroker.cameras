import { _ as a } from "./preload-helper-PPVm8Dsz.js";
let s, n;
let __tla = (async () => {
  let o;
  o = {
    "@iobroker/adapter-react-v5": async () => await a(() => import("./index-CTlR_SOk.js").then(async (m) => {
      await m.__tla;
      return m;
    }), [], import.meta.url),
    "@mui/icons-material": async () => await a(() => import("./index-DgRQ6WGU.js").then(async (m) => {
      await m.__tla;
      return m;
    }), [], import.meta.url),
    "@mui/material": async () => await a(() => import("./index-BwPJIFtb.js").then(async (m) => {
      await m.__tla;
      return m;
    }), [], import.meta.url),
    "prop-types": async () => await a(() => import("./index-C0xjjQ_Z.js").then((t) => t.i), [], import.meta.url),
    react: async () => await a(() => import("./index-Cn47lpYS.js").then((t) => t.i), [], import.meta.url),
    "react-dom": async () => await a(() => import("./index-B9kW0PSR.js").then(async (m) => {
      await m.__tla;
      return m;
    }).then((t) => t.i), [], import.meta.url)
  };
  n = {
    "@iobroker/adapter-react-v5": {
      name: "@iobroker/adapter-react-v5",
      version: "8.3.2",
      scope: [
        "default"
      ],
      loaded: false,
      from: "__mfe_internal__vis2CameraWidgets",
      async get() {
        n["@iobroker/adapter-react-v5"].loaded = true;
        const { "@iobroker/adapter-react-v5": e } = o, r = {
          ...await e()
        };
        return Object.defineProperty(r, "__esModule", {
          value: true,
          enumerable: false
        }), function() {
          return r;
        };
      },
      shareConfig: {
        singleton: true,
        requiredVersion: "*"
      }
    },
    "@mui/icons-material": {
      name: "@mui/icons-material",
      version: "6.5.0",
      scope: [
        "default"
      ],
      loaded: false,
      from: "__mfe_internal__vis2CameraWidgets",
      async get() {
        n["@mui/icons-material"].loaded = true;
        const { "@mui/icons-material": e } = o, r = {
          ...await e()
        };
        return Object.defineProperty(r, "__esModule", {
          value: true,
          enumerable: false
        }), function() {
          return r;
        };
      },
      shareConfig: {
        singleton: true,
        requiredVersion: "*"
      }
    },
    "@mui/material": {
      name: "@mui/material",
      version: "6.5.0",
      scope: [
        "default"
      ],
      loaded: false,
      from: "__mfe_internal__vis2CameraWidgets",
      async get() {
        n["@mui/material"].loaded = true;
        const { "@mui/material": e } = o, r = {
          ...await e()
        };
        return Object.defineProperty(r, "__esModule", {
          value: true,
          enumerable: false
        }), function() {
          return r;
        };
      },
      shareConfig: {
        singleton: true,
        requiredVersion: "*"
      }
    },
    "prop-types": {
      name: "prop-types",
      version: "15.8.1",
      scope: [
        "default"
      ],
      loaded: false,
      from: "__mfe_internal__vis2CameraWidgets",
      async get() {
        n["prop-types"].loaded = true;
        const { "prop-types": e } = o, r = {
          ...await e()
        };
        return Object.defineProperty(r, "__esModule", {
          value: true,
          enumerable: false
        }), function() {
          return r;
        };
      },
      shareConfig: {
        singleton: true,
        requiredVersion: "*"
      }
    },
    react: {
      name: "react",
      version: "18.3.1",
      scope: [
        "default"
      ],
      loaded: false,
      from: "__mfe_internal__vis2CameraWidgets",
      async get() {
        n.react.loaded = true;
        const { react: e } = o, r = {
          ...await e()
        };
        return Object.defineProperty(r, "__esModule", {
          value: true,
          enumerable: false
        }), function() {
          return r;
        };
      },
      shareConfig: {
        singleton: true,
        requiredVersion: "*"
      }
    },
    "react-dom": {
      name: "react-dom",
      version: "18.3.1",
      scope: [
        "default"
      ],
      loaded: false,
      from: "__mfe_internal__vis2CameraWidgets",
      async get() {
        n["react-dom"].loaded = true;
        const { "react-dom": e } = o, r = {
          ...await e()
        };
        return Object.defineProperty(r, "__esModule", {
          value: true,
          enumerable: false
        }), function() {
          return r;
        };
      },
      shareConfig: {
        singleton: true,
        requiredVersion: "*"
      }
    }
  };
  s = [];
})();
export {
  __tla,
  s as usedRemotes,
  n as usedShared
};
