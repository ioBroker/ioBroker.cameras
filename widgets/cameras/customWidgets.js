const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./assets/index-DJ9i4xbX.js","./assets/defaultTheme-Bm_nQg-l.js","./assets/vis2CameraWidgets__loadShare__react__loadShare__-DWj90Mgy.js","./assets/_commonjsHelpers-Cpj98o6Y.js","./assets/vis2CameraWidgets__mf_v__runtimeInit__mf_v__-B3P0TTkl.js","./assets/vis2CameraWidgets__loadShare__prop_mf_2_types__loadShare__-B_JDuqzl.js","./assets/vis2CameraWidgets__loadShare___mf_0_mui_mf_1_icons_mf_2_material__loadShare__-SliNyVJX.js","./assets/useTheme-Y4XGGz5f.js","./assets/index-Cry3hbk2.js","./assets/jsx-runtime-jrwWgduE.js","./assets/createSvgIcon-DSouWiIT.js","./assets/index-BihbAt5U.js","./assets/index-DQiceR5U.js","./assets/index-BEpFHtMA.js","./assets/index-CSiUj8cB.js"])))=>i.map(i=>d[i]);
import { i as d, __tla as __tla_0 } from "./assets/index.cjs-DgT9IskJ.js";
import s, { __tla as __tla_1 } from "./assets/virtualExposes-CjdSeOc8.js";
import { _ as o } from "./assets/preload-helper-PPVm8Dsz.js";
import { v as p } from "./assets/vis2CameraWidgets__mf_v__runtimeInit__mf_v__-B3P0TTkl.js";
let h, k;
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
  const i = {
    "@iobroker/adapter-react-v5": async () => await o(() => import("./assets/index-DJ9i4xbX.js").then(async (m2) => {
      await m2.__tla;
      return m2;
    }), __vite__mapDeps([0,1,2,3,4,5,6,7]), import.meta.url),
    "@mui/icons-material": async () => await o(() => import("./assets/index-Cry3hbk2.js").then(async (m2) => {
      await m2.__tla;
      return m2;
    }), __vite__mapDeps([8,9,2,3,4,10,5,1]), import.meta.url),
    "@mui/material": async () => await o(() => import("./assets/index-BihbAt5U.js").then(async (m2) => {
      await m2.__tla;
      return m2;
    }), __vite__mapDeps([11,1,2,3,4,5,10,9,7]), import.meta.url),
    "prop-types": async () => await o(() => import("./assets/index-DQiceR5U.js").then((t) => t.i), __vite__mapDeps([12,3]), import.meta.url),
    react: async () => await o(() => import("./assets/index-BEpFHtMA.js").then((t) => t.i), __vite__mapDeps([13,3]), import.meta.url),
    "react-dom": async () => await o(() => import("./assets/index-CSiUj8cB.js").then(async (m2) => {
      await m2.__tla;
      return m2;
    }).then((t) => t.i), __vite__mapDeps([14,3,2,4]), import.meta.url)
  }, a = {
    "@iobroker/adapter-react-v5": {
      name: "@iobroker/adapter-react-v5",
      version: "8.1.8",
      scope: [
        "default"
      ],
      loaded: false,
      from: "vis2CameraWidgets",
      async get() {
        a["@iobroker/adapter-react-v5"].loaded = true;
        const { "@iobroker/adapter-react-v5": e } = i, r = {
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
      from: "vis2CameraWidgets",
      async get() {
        a["@mui/icons-material"].loaded = true;
        const { "@mui/icons-material": e } = i, r = {
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
      from: "vis2CameraWidgets",
      async get() {
        a["@mui/material"].loaded = true;
        const { "@mui/material": e } = i, r = {
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
      from: "vis2CameraWidgets",
      async get() {
        a["prop-types"].loaded = true;
        const { "prop-types": e } = i, r = {
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
      from: "vis2CameraWidgets",
      async get() {
        a.react.loaded = true;
        const { react: e } = i, r = {
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
      from: "vis2CameraWidgets",
      async get() {
        a["react-dom"].loaded = true;
        const { "react-dom": e } = i, r = {
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
  }, f = [], u = {}, m = "default", l = "vis2CameraWidgets";
  k = async function(e = {}, t = []) {
    const r = d({
      name: l,
      remotes: f,
      shared: a,
      plugins: [],
      shareStrategy: "version-first"
    });
    var n = u[m];
    if (n || (n = u[m] = {
      from: l
    }), !(t.indexOf(n) >= 0)) {
      t.push(n), r.initShareScopeMap("default", e);
      try {
        await Promise.all(await r.initializeSharing("default", {
          strategy: "version-first",
          from: "build",
          initScope: t
        }));
      } catch (c) {
        console.error(c);
      }
      return p.initResolve(r), r;
    }
  };
  h = function(e) {
    if (!(e in s)) throw new Error(`Module ${e} does not exist in container.`);
    return s[e]().then((t) => () => t);
  };
});
export {
  __tla,
  h as get,
  k as init
};
