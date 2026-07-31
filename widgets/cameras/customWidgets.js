import { _ as or } from "./assets/preload-helper-PPVm8Dsz.js";
let Na, Ia;
let __tla = (async () => {
  var sr = {}, ir = {}, Rt = {}, I = {}, L = {}, N = {};
  const an = "federation-manifest.json", ln = ".json", cn = "FEDERATION_DEBUG", B = {
    AT: "@",
    HYPHEN: "-",
    SLASH: "/"
  }, Le = {
    [B.AT]: "scope_",
    [B.HYPHEN]: "_",
    [B.SLASH]: "__"
  }, un = {
    [Le[B.AT]]: B.AT,
    [Le[B.HYPHEN]]: B.HYPHEN,
    [Le[B.SLASH]]: B.SLASH
  }, fn = ":", dn = "mf-manifest.json", hn = "mf-stats.json", mn = {
    NPM: "npm",
    APP: "app"
  }, _n = "__MF_DEVTOOLS_MODULE_INFO__", pn = "ENCODE_NAME_PREFIX", gn = ".federation", En = {
    identifier: "MFDataPrefetch",
    globalKey: "__PREFETCH__",
    library: "mf-data-prefetch",
    exportsKey: "__PREFETCH_EXPORTS__",
    fileName: "bootstrap.js"
  };
  let yn = (function(e) {
    return e[e.UNKNOWN = 1] = "UNKNOWN", e[e.CALCULATED = 2] = "CALCULATED", e[e.NO_USE = 0] = "NO_USE", e;
  })({});
  N.BROWSER_LOG_KEY = cn;
  N.ENCODE_NAME_PREFIX = pn;
  N.EncodedNameTransformMap = un;
  N.FederationModuleManifest = an;
  N.MANIFEST_EXT = ln;
  N.MFModuleType = mn;
  N.MFPrefetchCommon = En;
  N.MODULE_DEVTOOL_IDENTIFIER = _n;
  N.ManifestFileName = dn;
  N.NameTransformMap = Le;
  N.NameTransformSymbol = B;
  N.SEPARATOR = fn;
  N.StatsFileName = hn;
  N.TEMP_DIR = gn;
  N.TreeShakingStatus = yn;
  var ar = {}, te = {}, Ot = Object.defineProperty, Sn = (e, t) => {
    let r = {};
    for (var n in e) Ot(r, n, {
      get: e[n],
      enumerable: true
    });
    return t || Ot(r, Symbol.toStringTag, {
      value: "Module"
    }), r;
  };
  te.__exportAll = Sn;
  (function(e) {
    var r = te.__exportAll({});
    Object.defineProperty(e, "ContainerPlugin_exports", {
      enumerable: true,
      get: function() {
        return r;
      }
    });
  })(ar);
  var lr = {};
  (function(e) {
    var r = te.__exportAll({});
    Object.defineProperty(e, "ContainerReferencePlugin_exports", {
      enumerable: true,
      get: function() {
        return r;
      }
    });
  })(lr);
  var cr = {};
  (function(e) {
    var r = te.__exportAll({});
    Object.defineProperty(e, "ModuleFederationPlugin_exports", {
      enumerable: true,
      get: function() {
        return r;
      }
    });
  })(cr);
  var ur = {};
  (function(e) {
    var r = te.__exportAll({});
    Object.defineProperty(e, "SharePlugin_exports", {
      enumerable: true,
      get: function() {
        return r;
      }
    });
  })(ur);
  var fr = {};
  (function(e) {
    var r = te.__exportAll({});
    Object.defineProperty(e, "ConsumeSharedPlugin_exports", {
      enumerable: true,
      get: function() {
        return r;
      }
    });
  })(fr);
  var dr = {};
  (function(e) {
    var r = te.__exportAll({});
    Object.defineProperty(e, "ProvideSharedPlugin_exports", {
      enumerable: true,
      get: function() {
        return r;
      }
    });
  })(dr);
  var z = {}, Se = {};
  const bn = N, hr = true;
  function mr() {
    return hr;
  }
  function Rn() {
    return typeof navigator < "u" && (navigator == null ? void 0 : navigator.product) === "ReactNative";
  }
  function Tn() {
    try {
      if (mr() && window.localStorage) return !!localStorage.getItem(bn.BROWSER_LOG_KEY);
    } catch {
      return false;
    }
    return false;
  }
  function In() {
    return typeof process < "u" && Se && Se.FEDERATION_DEBUG ? !!Se.FEDERATION_DEBUG : typeof FEDERATION_DEBUG < "u" && FEDERATION_DEBUG ? true : Tn();
  }
  const Nn = function() {
    return typeof process < "u" && Se ? Se : {};
  };
  z.getProcessEnv = Nn;
  z.isBrowserEnv = mr;
  z.isBrowserEnvValue = hr;
  z.isDebugMode = In;
  z.isReactNativeEnv = Rn;
  var D = {};
  const y = N, ft = z, _r = "[ Federation Runtime ]", Mn = (e, t, r = y.SEPARATOR) => {
    const n = e.split(r), o = ft.getProcessEnv().NODE_ENV === "development" && t, s = "*", i = (a) => a.startsWith("http") || a.includes(y.MANIFEST_EXT);
    if (n.length >= 2) {
      let [a, ...c] = n;
      e.startsWith(r) && (a = n.slice(0, 2).join(r), c = [
        o || n.slice(2).join(r)
      ]);
      let l = o || c.join(r);
      return i(l) ? {
        name: a,
        entry: l
      } : {
        name: a,
        version: l || s
      };
    } else if (n.length === 1) {
      const [a] = n;
      return o && i(o) ? {
        name: a,
        entry: o
      } : {
        name: a,
        version: o || s
      };
    } else throw `Invalid entry value: ${e}`;
  }, Pn = function(...e) {
    return e.length ? e.reduce((t, r) => r ? t ? `${t}${y.SEPARATOR}${r}` : r : t, "") : "";
  }, Tt = function(e, t = "", r = false) {
    try {
      const n = r ? ".js" : "";
      return `${t}${e.replace(new RegExp(`${y.NameTransformSymbol.AT}`, "g"), y.NameTransformMap[y.NameTransformSymbol.AT]).replace(new RegExp(`${y.NameTransformSymbol.HYPHEN}`, "g"), y.NameTransformMap[y.NameTransformSymbol.HYPHEN]).replace(new RegExp(`${y.NameTransformSymbol.SLASH}`, "g"), y.NameTransformMap[y.NameTransformSymbol.SLASH])}${n}`;
    } catch (n) {
      throw n;
    }
  }, vn = function(e, t, r) {
    try {
      let n = e;
      if (t) {
        if (!n.startsWith(t)) return n;
        n = n.replace(new RegExp(t, "g"), "");
      }
      return n = n.replace(new RegExp(`${y.NameTransformMap[y.NameTransformSymbol.AT]}`, "g"), y.EncodedNameTransformMap[y.NameTransformMap[y.NameTransformSymbol.AT]]).replace(new RegExp(`${y.NameTransformMap[y.NameTransformSymbol.SLASH]}`, "g"), y.EncodedNameTransformMap[y.NameTransformMap[y.NameTransformSymbol.SLASH]]).replace(new RegExp(`${y.NameTransformMap[y.NameTransformSymbol.HYPHEN]}`, "g"), y.EncodedNameTransformMap[y.NameTransformMap[y.NameTransformSymbol.HYPHEN]]), r && (n = n.replace(".js", "")), n;
    } catch (n) {
      throw n;
    }
  }, An = (e, t) => {
    if (!e) return "";
    let r = e;
    return r === "." && (r = "default_export"), r.startsWith("./") && (r = r.replace("./", "")), Tt(r, "__federation_expose_", t);
  }, On = (e, t) => e ? Tt(e, "__federation_shared_", t) : "", $n = (e, t) => {
    if ("getPublicPath" in e) {
      let r;
      return e.getPublicPath.startsWith("function") ? r = new Function("return " + e.getPublicPath)()() : r = new Function(e.getPublicPath)(), `${r}${t}`;
    } else return "publicPath" in e ? !ft.isBrowserEnv() && !ft.isReactNativeEnv() && "ssrPublicPath" in e && typeof e.ssrPublicPath == "string" ? `${e.ssrPublicPath}${t}` : `${e.publicPath}${t}` : (console.warn("Cannot get resource URL. If in debug mode, please ignore.", e, t), "");
  }, kn = (e, t) => {
    e || pr(t);
  }, pr = (e) => {
    throw new Error(`${_r}: ${e}`);
  }, Fn = (e) => {
    console.warn(`${_r}: ${e}`);
  };
  function wn(e) {
    try {
      return JSON.stringify(e, null, 2);
    } catch {
      return "";
    }
  }
  const Ln = /^([\d^=v<>~]|[*xX]$)/;
  function Dn(e) {
    return Ln.test(e);
  }
  D.assert = kn;
  D.composeKeyWithSeparator = Pn;
  D.decodeName = vn;
  D.encodeName = Tt;
  D.error = pr;
  D.generateExposeFilename = An;
  D.generateShareFilename = On;
  D.getResourceUrl = $n;
  D.isRequiredVersion = Dn;
  D.parseEntry = Mn;
  D.safeToString = wn;
  D.warn = Fn;
  var ce = {};
  const ge = N, Z = (e, t) => {
    if (!e) return t;
    const n = ((o) => {
      if (o === ".") return "";
      if (o.startsWith("./")) return o.replace("./", "");
      if (o.startsWith("/")) {
        const s = o.slice(1);
        return s.endsWith("/") ? s.slice(0, -1) : s;
      }
      return o;
    })(e);
    return n ? n.endsWith("/") ? `${n}${t}` : `${n}/${t}` : t;
  };
  function gr(e) {
    return e.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
  }
  function Hn(e, t = {}) {
    var _a2, _b, _c;
    const { remotes: r = {}, overrides: n = {}, version: o } = t;
    let s;
    const i = () => "publicPath" in e.metaData ? (e.metaData.publicPath === "auto" || e.metaData.publicPath === "") && o ? gr(o) : e.metaData.publicPath : e.metaData.getPublicPath, a = Object.keys(n);
    let c = {};
    Object.keys(r).length || (c = ((_a2 = e.remotes) == null ? void 0 : _a2.reduce((p, M) => {
      let k;
      const A = M.federationContainerName;
      return a.includes(A) ? k = n[A] : "version" in M ? k = M.version : k = M.entry, p[A] = {
        matchedVersion: k
      }, p;
    }, {})) || {}), Object.keys(r).forEach((p) => c[p] = {
      matchedVersion: a.includes(p) ? n[p] : r[p]
    });
    const { remoteEntry: { path: l, name: u, type: f }, types: d = {
      path: "",
      name: "",
      zip: "",
      api: ""
    }, buildInfo: { buildVersion: h }, globalName: m, ssrRemoteEntry: _ } = e.metaData, { exposes: E } = e;
    let g = {
      version: o || "",
      buildVersion: h,
      globalName: m,
      remoteEntry: Z(l, u),
      remoteEntryType: f,
      remoteTypes: Z(d.path, d.name),
      remoteTypesZip: d.zip || "",
      remoteTypesAPI: d.api || "",
      remotesInfo: c,
      shared: e == null ? void 0 : e.shared.map((p) => ({
        assets: p.assets,
        sharedName: p.name,
        version: p.version,
        usedExports: p.referenceExports || []
      })),
      modules: E == null ? void 0 : E.map((p) => ({
        moduleName: p.name,
        modulePath: p.path,
        assets: p.assets
      }))
    };
    if ((_b = e.metaData) == null ? void 0 : _b.prefetchInterface) {
      const p = e.metaData.prefetchInterface;
      g = {
        ...g,
        prefetchInterface: p
      };
    }
    if ((_c = e.metaData) == null ? void 0 : _c.prefetchEntry) {
      const { path: p, name: M, type: k } = e.metaData.prefetchEntry;
      g = {
        ...g,
        prefetchEntry: Z(p, M),
        prefetchEntryType: k
      };
    }
    if ("publicPath" in e.metaData ? (s = {
      ...g,
      publicPath: i()
    }, typeof e.metaData.ssrPublicPath == "string" && (s.ssrPublicPath = e.metaData.ssrPublicPath)) : s = {
      ...g,
      getPublicPath: i()
    }, _) {
      const p = Z(_.path, _.name);
      s.ssrRemoteEntry = p, s.ssrRemoteEntryType = _.type || "commonjs-module";
    }
    return s;
  }
  function Cn(e) {
    return !!("remoteEntry" in e && e.remoteEntry.includes(ge.MANIFEST_EXT));
  }
  function qn(e) {
    if (!e) return {
      statsFileName: ge.StatsFileName,
      manifestFileName: ge.ManifestFileName
    };
    let t = typeof e == "boolean" ? "" : e.filePath || "", r = typeof e == "boolean" ? "" : e.fileName || "";
    const n = ".json", o = (a) => a.endsWith(n) ? a : `${a}${n}`, s = (a, c) => a.replace(n, `${c}${n}`), i = r ? o(r) : ge.ManifestFileName;
    return {
      statsFileName: Z(t, r ? s(i, "-stats") : ge.StatsFileName),
      manifestFileName: Z(t, i)
    };
  }
  ce.generateSnapshotFromManifest = Hn;
  ce.getManifestFileName = qn;
  ce.inferAutoPublicPath = gr;
  ce.isManifestProvider = Cn;
  ce.simpleJoinRemoteEntry = Z;
  var ue = {};
  const $t = z, Er = "[ Module Federation ]", _e = console, Un = [
    "logger.ts",
    "logger.js",
    "captureStackTrace",
    "Logger.emit",
    "Logger.log",
    "Logger.info",
    "Logger.warn",
    "Logger.error",
    "Logger.debug"
  ];
  function Gn() {
    try {
      const e = new Error().stack;
      if (!e) return;
      const [, ...t] = e.split(`
`), r = t.filter((n) => !Un.some((o) => n.includes(o)));
      return r.length ? `Stack trace:
${r.slice(0, 5).join(`
`)}` : void 0;
    } catch {
      return;
    }
  }
  var yr = class {
    constructor(e, t = _e) {
      this.prefix = e, this.delegate = t ?? _e;
    }
    setPrefix(e) {
      this.prefix = e;
    }
    setDelegate(e) {
      this.delegate = e ?? _e;
    }
    emit(e, t) {
      const r = this.delegate, n = $t.isDebugMode() ? Gn() : void 0, o = n ? [
        ...t,
        n
      ] : t, s = (() => {
        switch (e) {
          case "log":
            return [
              "log",
              "info"
            ];
          case "info":
            return [
              "info",
              "log"
            ];
          case "warn":
            return [
              "warn",
              "info",
              "log"
            ];
          case "error":
            return [
              "error",
              "warn",
              "log"
            ];
          default:
            return [
              "debug",
              "log"
            ];
        }
      })();
      for (const i of s) {
        const a = r[i];
        if (typeof a == "function") {
          a.call(r, this.prefix, ...o);
          return;
        }
      }
      for (const i of s) {
        const a = _e[i];
        if (typeof a == "function") {
          a.call(_e, this.prefix, ...o);
          return;
        }
      }
    }
    log(...e) {
      this.emit("log", e);
    }
    warn(...e) {
      this.emit("warn", e);
    }
    error(...e) {
      this.emit("error", e);
    }
    success(...e) {
      this.emit("info", e);
    }
    info(...e) {
      this.emit("info", e);
    }
    ready(...e) {
      this.emit("info", e);
    }
    debug(...e) {
      $t.isDebugMode() && this.emit("debug", e);
    }
  };
  function Sr(e) {
    return new yr(e);
  }
  function br(e) {
    const t = new yr(e);
    return Object.defineProperty(t, "__mf_infrastructure_logger__", {
      value: true,
      enumerable: false,
      configurable: false
    }), t;
  }
  function Wn(e, t, r) {
    if (e.__mf_infrastructure_logger__ && (t == null ? void 0 : t.getInfrastructureLogger)) try {
      const n = t.getInfrastructureLogger(r);
      n && typeof n == "object" && (typeof n.log == "function" || typeof n.info == "function" || typeof n.warn == "function" || typeof n.error == "function") && e.setDelegate(n);
    } catch {
      e.setDelegate(void 0);
    }
  }
  const Bn = Sr(Er), Vn = br(Er);
  ue.bindLoggerToCompiler = Wn;
  ue.createInfrastructureLogger = br;
  ue.createLogger = Sr;
  ue.infrastructureLogger = Vn;
  ue.logger = Bn;
  var fe = {};
  const jn = D;
  async function It(e, t) {
    try {
      return await e();
    } catch (r) {
      !t && jn.warn(r);
      return;
    }
  }
  function Ue(e, t) {
    const r = /^(https?:)?\/\//i;
    return e.replace(r, "").replace(/\/$/, "") === t.replace(r, "").replace(/\/$/, "");
  }
  function Rr(e) {
    let t = null, r = true, n = 2e4, o;
    const s = document.getElementsByTagName("script");
    for (let l = 0; l < s.length; l++) {
      const u = s[l], f = u.getAttribute("src");
      if (f && Ue(f, e.url)) {
        t = u, r = false;
        break;
      }
    }
    if (!t) {
      const l = e.attrs;
      t = document.createElement("script"), t.type = (l == null ? void 0 : l.type) === "module" ? "module" : "text/javascript";
      let u;
      e.createScriptHook && (u = e.createScriptHook(e.url, e.attrs), u instanceof HTMLScriptElement ? t = u : typeof u == "object" && ("script" in u && u.script && (t = u.script), "timeout" in u && u.timeout && (n = u.timeout))), t.src || (t.src = e.url), l && !u && Object.keys(l).forEach((f) => {
        t && (f === "async" || f === "defer" ? t[f] = l[f] : t.getAttribute(f) || t.setAttribute(f, l[f]));
      });
    }
    let i = null;
    const a = typeof window < "u" ? (l) => {
      if (l.filename && Ue(l.filename, e.url)) {
        const u = new Error(`ScriptExecutionError: Script "${e.url}" loaded but threw a runtime error during execution: ${l.message} (${l.filename}:${l.lineno}:${l.colno})`);
        u.name = "ScriptExecutionError", i = u;
      }
    } : null;
    a && window.addEventListener("error", a);
    const c = async (l, u) => {
      clearTimeout(o), a && window.removeEventListener("error", a);
      const f = () => {
        if ((u == null ? void 0 : u.type) === "error") {
          const d = new Error((u == null ? void 0 : u.isTimeout) ? `ScriptNetworkError: Script "${e.url}" timed out.` : `ScriptNetworkError: Failed to load script "${e.url}" - the script URL is unreachable or the server returned an error (network failure, 404, CORS, etc.)`);
          d.name = "ScriptNetworkError", (e == null ? void 0 : e.onErrorCallback) && (e == null ? void 0 : e.onErrorCallback(d));
        } else i ? (e == null ? void 0 : e.onErrorCallback) && (e == null ? void 0 : e.onErrorCallback(i)) : (e == null ? void 0 : e.cb) && (e == null ? void 0 : e.cb());
      };
      if (t && (t.onerror = null, t.onload = null, It(() => {
        const { needDeleteScript: d = true } = e;
        d && (t == null ? void 0 : t.parentNode) && t.parentNode.removeChild(t);
      }), l && typeof l == "function")) {
        const d = l(u);
        if (d instanceof Promise) {
          const h = await d;
          return f(), h;
        }
        return f(), d;
      }
      f();
    };
    return t.onerror = c.bind(null, t.onerror), t.onload = c.bind(null, t.onload), o = setTimeout(() => {
      c(null, {
        type: "error",
        isTimeout: true
      });
    }, n), {
      script: t,
      needAttach: r
    };
  }
  function xn(e) {
    let t = null, r = true;
    const n = document.getElementsByTagName("link");
    for (let s = 0; s < n.length; s++) {
      const i = n[s], a = i.getAttribute("href"), c = i.getAttribute("rel");
      if (a && Ue(a, e.url) && c === e.attrs.rel) {
        t = i, r = false;
        break;
      }
    }
    if (!t) {
      t = document.createElement("link"), t.setAttribute("href", e.url);
      let s;
      const i = e.attrs;
      e.createLinkHook && (s = e.createLinkHook(e.url, i), s instanceof HTMLLinkElement && (t = s)), i && !s && Object.keys(i).forEach((a) => {
        t && !t.getAttribute(a) && t.setAttribute(a, i[a]);
      });
    }
    const o = (s, i) => {
      const a = () => {
        (i == null ? void 0 : i.type) === "error" ? (e == null ? void 0 : e.onErrorCallback) && (e == null ? void 0 : e.onErrorCallback(i)) : (e == null ? void 0 : e.cb) && (e == null ? void 0 : e.cb());
      };
      if (t && (t.onerror = null, t.onload = null, It(() => {
        const { needDeleteLink: c = true } = e;
        c && (t == null ? void 0 : t.parentNode) && t.parentNode.removeChild(t);
      }), s)) {
        const c = s(i);
        return a(), c;
      }
      a();
    };
    return t.onerror = o.bind(null, t.onerror), t.onload = o.bind(null, t.onload), {
      link: t,
      needAttach: r
    };
  }
  function Xn(e, t) {
    const { attrs: r = {}, createScriptHook: n } = t;
    return new Promise((o, s) => {
      const { script: i, needAttach: a } = Rr({
        url: e,
        cb: o,
        onErrorCallback: s,
        attrs: {
          fetchpriority: "high",
          ...r
        },
        createScriptHook: n,
        needDeleteScript: true
      });
      a && document.head.appendChild(i);
    });
  }
  fe.createLink = xn;
  fe.createScript = Rr;
  fe.isStaticResourcesEqual = Ue;
  fe.loadScript = Xn;
  fe.safeWrapper = It;
  var Nt = {};
  const Kn = (e, t, r, n) => {
    t(new Error("createScriptNode is disabled in non-Node.js environment"));
  }, Yn = (e, t) => {
    throw new Error("loadScriptNode is disabled in non-Node.js environment");
  };
  Nt.createScriptNode = Kn;
  Nt.loadScriptNode = Yn;
  var Tr = {};
  function zn(e, t, r) {
    return function(n) {
      if (n === false) return false;
      if (typeof n > "u") return e ? t : false;
      if (n === true) return t;
      if (n && typeof n == "object") return {
        ...t,
        ...n
      };
      throw new Error(`Unexpected type for \`${r}\`, expect boolean/undefined/object, got: ${typeof n}`);
    };
  }
  Tr.normalizeOptions = zn;
  var Ir = {};
  const Jn = (e) => e;
  Ir.createModuleFederationConfig = Jn;
  (function(e) {
    Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    });
    const t = N, r = ar, n = lr, o = cr, s = ur, i = fr, a = dr, c = z, l = D, u = ce, f = ue, d = fe, h = Nt, m = Tr, _ = Ir;
    e.BROWSER_LOG_KEY = t.BROWSER_LOG_KEY, e.ENCODE_NAME_PREFIX = t.ENCODE_NAME_PREFIX, e.EncodedNameTransformMap = t.EncodedNameTransformMap, e.FederationModuleManifest = t.FederationModuleManifest, e.MANIFEST_EXT = t.MANIFEST_EXT, e.MFModuleType = t.MFModuleType, e.MFPrefetchCommon = t.MFPrefetchCommon, e.MODULE_DEVTOOL_IDENTIFIER = t.MODULE_DEVTOOL_IDENTIFIER, e.ManifestFileName = t.ManifestFileName, e.NameTransformMap = t.NameTransformMap, e.NameTransformSymbol = t.NameTransformSymbol, e.SEPARATOR = t.SEPARATOR, e.StatsFileName = t.StatsFileName, e.TEMP_DIR = t.TEMP_DIR, e.TreeShakingStatus = t.TreeShakingStatus, e.assert = l.assert, e.bindLoggerToCompiler = f.bindLoggerToCompiler, e.composeKeyWithSeparator = l.composeKeyWithSeparator, Object.defineProperty(e, "consumeSharedPlugin", {
      enumerable: true,
      get: function() {
        return i.ConsumeSharedPlugin_exports;
      }
    }), Object.defineProperty(e, "containerPlugin", {
      enumerable: true,
      get: function() {
        return r.ContainerPlugin_exports;
      }
    }), Object.defineProperty(e, "containerReferencePlugin", {
      enumerable: true,
      get: function() {
        return n.ContainerReferencePlugin_exports;
      }
    }), e.createInfrastructureLogger = f.createInfrastructureLogger, e.createLink = d.createLink, e.createLogger = f.createLogger, e.createModuleFederationConfig = _.createModuleFederationConfig, e.createScript = d.createScript, e.createScriptNode = h.createScriptNode, e.decodeName = l.decodeName, e.encodeName = l.encodeName, e.error = l.error, e.generateExposeFilename = l.generateExposeFilename, e.generateShareFilename = l.generateShareFilename, e.generateSnapshotFromManifest = u.generateSnapshotFromManifest, e.getManifestFileName = u.getManifestFileName, e.getProcessEnv = c.getProcessEnv, e.getResourceUrl = l.getResourceUrl, e.inferAutoPublicPath = u.inferAutoPublicPath, e.infrastructureLogger = f.infrastructureLogger, e.isBrowserEnv = c.isBrowserEnv, e.isBrowserEnvValue = c.isBrowserEnvValue, e.isDebugMode = c.isDebugMode, e.isManifestProvider = u.isManifestProvider, e.isReactNativeEnv = c.isReactNativeEnv, e.isRequiredVersion = l.isRequiredVersion, e.isStaticResourcesEqual = d.isStaticResourcesEqual, e.loadScript = d.loadScript, e.loadScriptNode = h.loadScriptNode, e.logger = f.logger, Object.defineProperty(e, "moduleFederationPlugin", {
      enumerable: true,
      get: function() {
        return o.ModuleFederationPlugin_exports;
      }
    }), e.normalizeOptions = m.normalizeOptions, e.parseEntry = l.parseEntry, Object.defineProperty(e, "provideSharedPlugin", {
      enumerable: true,
      get: function() {
        return a.ProvideSharedPlugin_exports;
      }
    }), e.safeToString = l.safeToString, e.safeWrapper = d.safeWrapper, Object.defineProperty(e, "sharePlugin", {
      enumerable: true,
      get: function() {
        return s.SharePlugin_exports;
      }
    }), e.simpleJoinRemoteEntry = u.simpleJoinRemoteEntry, e.warn = l.warn;
  })(L);
  var Nr = {}, Mt = {};
  const Zn = (e) => `View the docs to see how to solve: https://module-federation.io/guide/troubleshooting/${e.split("-")[0].toLowerCase()}#${e.toLowerCase()}`, Qn = (e, t, r, n) => {
    const o = [
      `${[
        t[e]
      ]} #${e}`
    ];
    return r && o.push(`args: ${JSON.stringify(r)}`), o.push(Zn(e)), n && o.push(`Original Error Message:
 ${n}`), o.join(`
`);
  };
  Mt.getShortErrorMsg = Qn;
  (function(e) {
    Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    });
    const t = Mt;
    function r(n, o, s, i, a, c) {
      return i(t.getShortErrorMsg(n, o, s, a));
    }
    e.logAndReport = r;
  })(Nr);
  let eo = L, to = Nr;
  const Q = "[ Federation Runtime ]", dt = (0, eo.createLogger)(Q);
  function ro(e, t, r, n, o) {
    e || (r !== void 0 ? ht(t, r, n, void 0, o) : ht(t));
  }
  function ht(e, t, r, n, o) {
    if (t !== void 0) return (0, to.logAndReport)(e, t, r ?? {}, (i) => {
      throw new Error(`${Q}: ${i}`);
    }, n, o);
    const s = e;
    throw s instanceof Error ? (s.message.startsWith(Q) || (s.message = `${Q}: ${s.message}`), s) : new Error(`${Q}: ${s}`);
  }
  function no(e) {
    e instanceof Error && (e.message.startsWith(Q) || (e.message = `${Q}: ${e.message}`)), dt.warn(e);
  }
  I.assert = ro;
  I.error = ht;
  I.logger = dt;
  I.warn = no;
  var R = {};
  const oo = I;
  let kt = L;
  function so(e, t) {
    return e.findIndex((r) => r === t) === -1 && e.push(t), e;
  }
  function io(e) {
    return "version" in e && e.version ? `${e.name}:${e.version}` : "entry" in e && e.entry ? `${e.name}:${e.entry}` : `${e.name}`;
  }
  function ao(e) {
    return typeof e.entry < "u";
  }
  function lo(e) {
    return !e.entry.includes(".json");
  }
  async function co(e, t) {
    try {
      return await e();
    } catch (r) {
      !t && oo.warn(r);
      return;
    }
  }
  function uo(e) {
    return e && typeof e == "object";
  }
  const Mr = Object.prototype.toString;
  function fo(e) {
    return Mr.call(e) === "[object Object]";
  }
  function ho(e, t) {
    const r = /^(https?:)?\/\//i;
    return e.replace(r, "").replace(/\/$/, "") === t.replace(r, "").replace(/\/$/, "");
  }
  function mo(e) {
    return Array.isArray(e) ? e : [
      e
    ];
  }
  function _o(e) {
    const t = {
      url: "",
      type: "global",
      globalName: ""
    };
    return kt.isBrowserEnvValue || (0, kt.isReactNativeEnv)() || !("ssrRemoteEntry" in e) ? "remoteEntry" in e ? {
      url: e.remoteEntry,
      type: e.remoteEntryType,
      globalName: e.globalName
    } : t : "ssrRemoteEntry" in e ? {
      url: e.ssrRemoteEntry || t.url,
      type: e.ssrRemoteEntryType || t.type,
      globalName: e.globalName
    } : t;
  }
  const po = (e, t) => {
    let r;
    return e.endsWith("/") ? r = e.slice(0, -1) : r = e, t.startsWith(".") && (t = t.slice(1)), r = r + t, r;
  };
  R.addUniqueItem = so;
  R.arrayOptions = mo;
  R.getFMId = io;
  R.getRemoteEntryInfoFromSnapshot = _o;
  R.isObject = uo;
  R.isPlainObject = fo;
  R.isPureRemoteEntry = lo;
  R.isRemoteInfoWithEntry = ao;
  R.isStaticResourcesEqual = ho;
  R.objectToString = Mr;
  R.processModuleAlias = po;
  R.safeWrapper = co;
  var S = {};
  const Pr = I, mt = R;
  let go = L;
  const v = typeof globalThis == "object" ? globalThis : window, H = (() => {
    try {
      return document.defaultView;
    } catch {
      return v;
    }
  })(), Eo = H;
  function De(e, t, r) {
    Object.defineProperty(e, t, {
      value: r,
      configurable: false,
      writable: true
    });
  }
  function He(e, t) {
    return Object.hasOwnProperty.call(e, t);
  }
  He(v, "__GLOBAL_LOADING_REMOTE_ENTRY__") || De(v, "__GLOBAL_LOADING_REMOTE_ENTRY__", {});
  const _t = v.__GLOBAL_LOADING_REMOTE_ENTRY__;
  function vr(e) {
    var _a2, _b, _c, _d, _e2, _f;
    He(e, "__VMOK__") && !He(e, "__FEDERATION__") && De(e, "__FEDERATION__", e.__VMOK__), He(e, "__FEDERATION__") || (De(e, "__FEDERATION__", {
      __GLOBAL_PLUGIN__: [],
      __INSTANCES__: [],
      moduleInfo: {},
      __SHARE__: {},
      __MANIFEST_LOADING__: {},
      __PRELOADED_MAP__: /* @__PURE__ */ new Map()
    }), De(e, "__VMOK__", e.__FEDERATION__)), (_a2 = e.__FEDERATION__).__GLOBAL_PLUGIN__ ?? (_a2.__GLOBAL_PLUGIN__ = []), (_b = e.__FEDERATION__).__INSTANCES__ ?? (_b.__INSTANCES__ = []), (_c = e.__FEDERATION__).moduleInfo ?? (_c.moduleInfo = {}), (_d = e.__FEDERATION__).__SHARE__ ?? (_d.__SHARE__ = {}), (_e2 = e.__FEDERATION__).__MANIFEST_LOADING__ ?? (_e2.__MANIFEST_LOADING__ = {}), (_f = e.__FEDERATION__).__PRELOADED_MAP__ ?? (_f.__PRELOADED_MAP__ = /* @__PURE__ */ new Map());
  }
  vr(v);
  vr(H);
  function yo() {
    v.__FEDERATION__.__GLOBAL_PLUGIN__ = [], v.__FEDERATION__.__INSTANCES__ = [], v.__FEDERATION__.moduleInfo = {}, v.__FEDERATION__.__SHARE__ = {}, v.__FEDERATION__.__MANIFEST_LOADING__ = {}, Object.keys(_t).forEach((e) => {
      delete _t[e];
    });
  }
  function So(e) {
    v.__FEDERATION__.__INSTANCES__.push(e);
  }
  function bo() {
    return v.__FEDERATION__.__DEBUG_CONSTRUCTOR__;
  }
  function Ro(e, t = (0, go.isDebugMode)()) {
    t && (v.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = e, v.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = "2.3.3");
  }
  function pt(e, t) {
    if (typeof t == "string") {
      if (e[t]) return {
        value: e[t],
        key: t
      };
      {
        const r = Object.keys(e);
        for (const n of r) {
          const [o, s] = n.split(":"), i = `${o}:${t}`, a = e[i];
          if (a) return {
            value: a,
            key: i
          };
        }
        return {
          value: void 0,
          key: t
        };
      }
    } else Pr.error(`getInfoWithoutType: "key" must be a string, got ${typeof t} (${JSON.stringify(t)}).`);
  }
  const To = () => H.__FEDERATION__.moduleInfo, Ar = (e, t) => {
    const r = pt(t, mt.getFMId(e)).value;
    if (r && !r.version && "version" in e && e.version && (r.version = e.version), r) return r;
    if ("version" in e && e.version) {
      const { version: n, ...o } = e, s = mt.getFMId(o), i = pt(H.__FEDERATION__.moduleInfo, s).value;
      if ((i == null ? void 0 : i.version) === n) return i;
    }
  }, Io = (e) => Ar(e, H.__FEDERATION__.moduleInfo), No = (e, t) => {
    const r = mt.getFMId(e);
    return H.__FEDERATION__.moduleInfo[r] = t, H.__FEDERATION__.moduleInfo;
  }, Mo = (e) => (H.__FEDERATION__.moduleInfo = {
    ...H.__FEDERATION__.moduleInfo,
    ...e
  }, () => {
    const t = Object.keys(e);
    for (const r of t) delete H.__FEDERATION__.moduleInfo[r];
  }), Po = (e, t) => {
    const r = t || `__FEDERATION_${e}:custom__`;
    return {
      remoteEntryKey: r,
      entryExports: v[r]
    };
  }, vo = (e) => {
    const { __GLOBAL_PLUGIN__: t } = H.__FEDERATION__;
    e.forEach((r) => {
      t.findIndex((n) => n.name === r.name) === -1 ? t.push(r) : Pr.warn(`The plugin ${r.name} has been registered.`);
    });
  }, Ao = () => H.__FEDERATION__.__GLOBAL_PLUGIN__, Oo = (e) => v.__FEDERATION__.__PRELOADED_MAP__.get(e), $o = (e) => v.__FEDERATION__.__PRELOADED_MAP__.set(e, true);
  S.CurrentGlobal = v;
  S.Global = Eo;
  S.addGlobalSnapshot = Mo;
  S.getGlobalFederationConstructor = bo;
  S.getGlobalHostPlugins = Ao;
  S.getGlobalSnapshot = To;
  S.getGlobalSnapshotInfoByModuleInfo = Io;
  S.getInfoWithoutType = pt;
  S.getPreloaded = Oo;
  S.getRemoteEntryExports = Po;
  S.getTargetSnapshotInfoByModuleInfo = Ar;
  S.globalLoading = _t;
  S.nativeGlobal = H;
  S.registerGlobalPlugins = vo;
  S.resetFederationGlobalInfo = yo;
  S.setGlobalFederationConstructor = Ro;
  S.setGlobalFederationInstance = So;
  S.setGlobalSnapshotInfoByModuleInfo = No;
  S.setPreloaded = $o;
  var Pt = {}, re = {}, G = {};
  const Ft = "[0-9A-Za-z-]+", vt = `(?:\\+(${Ft}(?:\\.${Ft})*))`, be = "0|[1-9]\\d*", Ce = "[0-9]+", Or = "\\d*[a-zA-Z-][a-zA-Z0-9-]*", wt = `(?:${Ce}|${Or})`, ko = `(?:-?(${wt}(?:\\.${wt})*))`, Lt = `(?:${be}|${Or})`, $r = `(?:-(${Lt}(?:\\.${Lt})*))`, Ye = `${be}|x|X|\\*`, le = `[v=\\s]*(${Ye})(?:\\.(${Ye})(?:\\.(${Ye})(?:${$r})?${vt}?)?)?`, Fo = `^\\s*(${le})\\s+-\\s+(${le})\\s*$`, wo = `[v=\\s]*${`(${Ce})\\.(${Ce})\\.(${Ce})`}${ko}?${vt}?`, At = "((?:<|>)?=?)", Lo = `(\\s*)${At}\\s*(${wo}|${le})`, kr = "(?:~>?)", Do = `(\\s*)${kr}\\s+`, Fr = "(?:\\^)", Ho = `(\\s*)${Fr}\\s+`, Co = "(<|>)?=?\\s*\\*", qo = `^${Fr}${le}$`, Uo = `v?${`(${be})\\.(${be})\\.(${be})`}${$r}?${vt}?`, Go = `^${kr}${le}$`, Wo = `^${At}\\s*${le}$`, Bo = `^${At}\\s*(${Uo})$|^$`, Vo = "^\\s*>=\\s*0.0.0\\s*$";
  G.caret = qo;
  G.caretTrim = Ho;
  G.comparator = Bo;
  G.comparatorTrim = Lo;
  G.gte0 = Vo;
  G.hyphenRange = Fo;
  G.star = Co;
  G.tilde = Go;
  G.tildeTrim = Do;
  G.xRange = Wo;
  const jo = G;
  function wr(e) {
    return new RegExp(e);
  }
  function xo(e) {
    return !e || e.toLowerCase() === "x" || e === "*";
  }
  function Xo(...e) {
    return (t) => e.reduce((r, n) => n(r), t);
  }
  function Ko(e) {
    return e.match(wr(jo.comparator));
  }
  function Yo(e, t, r, n) {
    const o = `${e}.${t}.${r}`;
    return n ? `${o}-${n}` : o;
  }
  re.combineVersion = Yo;
  re.extractComparator = Ko;
  re.isXVersion = xo;
  re.parseRegex = wr;
  re.pipe = Xo;
  var V = {};
  const X = G, b = re;
  function zo(e) {
    return e.replace(b.parseRegex(X.hyphenRange), (t, r, n, o, s, i, a, c, l, u, f, d) => (b.isXVersion(n) ? r = "" : b.isXVersion(o) ? r = `>=${n}.0.0` : b.isXVersion(s) ? r = `>=${n}.${o}.0` : r = `>=${r}`, b.isXVersion(l) ? c = "" : b.isXVersion(u) ? c = `<${Number(l) + 1}.0.0-0` : b.isXVersion(f) ? c = `<${l}.${Number(u) + 1}.0-0` : d ? c = `<=${l}.${u}.${f}-${d}` : c = `<=${c}`, `${r} ${c}`.trim()));
  }
  function Jo(e) {
    return e.replace(b.parseRegex(X.comparatorTrim), "$1$2$3");
  }
  function Zo(e) {
    return e.replace(b.parseRegex(X.tildeTrim), "$1~");
  }
  function Qo(e) {
    return e.replace(b.parseRegex(X.caretTrim), "$1^");
  }
  function es(e) {
    return e.trim().split(/\s+/).map((t) => t.replace(b.parseRegex(X.caret), (r, n, o, s, i) => b.isXVersion(n) ? "" : b.isXVersion(o) ? `>=${n}.0.0 <${Number(n) + 1}.0.0-0` : b.isXVersion(s) ? n === "0" ? `>=${n}.${o}.0 <${n}.${Number(o) + 1}.0-0` : `>=${n}.${o}.0 <${Number(n) + 1}.0.0-0` : i ? n === "0" ? o === "0" ? `>=${n}.${o}.${s}-${i} <${n}.${o}.${Number(s) + 1}-0` : `>=${n}.${o}.${s}-${i} <${n}.${Number(o) + 1}.0-0` : `>=${n}.${o}.${s}-${i} <${Number(n) + 1}.0.0-0` : n === "0" ? o === "0" ? `>=${n}.${o}.${s} <${n}.${o}.${Number(s) + 1}-0` : `>=${n}.${o}.${s} <${n}.${Number(o) + 1}.0-0` : `>=${n}.${o}.${s} <${Number(n) + 1}.0.0-0`)).join(" ");
  }
  function ts(e) {
    return e.trim().split(/\s+/).map((t) => t.replace(b.parseRegex(X.tilde), (r, n, o, s, i) => b.isXVersion(n) ? "" : b.isXVersion(o) ? `>=${n}.0.0 <${Number(n) + 1}.0.0-0` : b.isXVersion(s) ? `>=${n}.${o}.0 <${n}.${Number(o) + 1}.0-0` : i ? `>=${n}.${o}.${s}-${i} <${n}.${Number(o) + 1}.0-0` : `>=${n}.${o}.${s} <${n}.${Number(o) + 1}.0-0`)).join(" ");
  }
  function rs(e) {
    return e.split(/\s+/).map((t) => t.trim().replace(b.parseRegex(X.xRange), (r, n, o, s, i, a) => {
      const c = b.isXVersion(o), l = c || b.isXVersion(s), u = l || b.isXVersion(i);
      return n === "=" && u && (n = ""), a = "", c ? n === ">" || n === "<" ? "<0.0.0-0" : "*" : n && u ? (l && (s = 0), i = 0, n === ">" ? (n = ">=", l ? (o = Number(o) + 1, s = 0, i = 0) : (s = Number(s) + 1, i = 0)) : n === "<=" && (n = "<", l ? o = Number(o) + 1 : s = Number(s) + 1), n === "<" && (a = "-0"), `${n + o}.${s}.${i}${a}`) : l ? `>=${o}.0.0${a} <${Number(o) + 1}.0.0-0` : u ? `>=${o}.${s}.0${a} <${o}.${Number(s) + 1}.0-0` : r;
    })).join(" ");
  }
  function ns(e) {
    return e.trim().replace(b.parseRegex(X.star), "");
  }
  function os(e) {
    return e.trim().replace(b.parseRegex(X.gte0), "");
  }
  V.parseCaretTrim = Qo;
  V.parseCarets = es;
  V.parseComparatorTrim = Jo;
  V.parseGTE0 = os;
  V.parseHyphen = zo;
  V.parseStar = ns;
  V.parseTildeTrim = Zo;
  V.parseTildes = ts;
  V.parseXRanges = rs;
  var Lr = {};
  function qe(e, t) {
    return e = Number(e) || e, t = Number(t) || t, e > t ? 1 : e === t ? 0 : -1;
  }
  function ss(e, t) {
    const { preRelease: r } = e, { preRelease: n } = t;
    if (r === void 0 && n) return 1;
    if (r && n === void 0) return -1;
    if (r === void 0 && n === void 0) return 0;
    for (let o = 0, s = r.length; o <= s; o++) {
      const i = r[o], a = n[o];
      if (i !== a) return i === void 0 && a === void 0 ? 0 : i ? a ? qe(i, a) : -1 : 1;
    }
    return 0;
  }
  function $e(e, t) {
    return qe(e.major, t.major) || qe(e.minor, t.minor) || qe(e.patch, t.patch) || ss(e, t);
  }
  function ze(e, t) {
    return e.version === t.version;
  }
  function is(e, t) {
    switch (e.operator) {
      case "":
      case "=":
        return ze(e, t);
      case ">":
        return $e(e, t) < 0;
      case ">=":
        return ze(e, t) || $e(e, t) < 0;
      case "<":
        return $e(e, t) > 0;
      case "<=":
        return ze(e, t) || $e(e, t) > 0;
      case void 0:
        return true;
      default:
        return false;
    }
  }
  Lr.compare = is;
  const ie = re, x = V, as = Lr;
  function ls(e) {
    return ie.pipe(x.parseCarets, x.parseTildes, x.parseXRanges, x.parseStar)(e);
  }
  function cs(e) {
    return ie.pipe(x.parseHyphen, x.parseComparatorTrim, x.parseTildeTrim, x.parseCaretTrim)(e.trim()).split(/\s+/).join(" ");
  }
  function us(e, t) {
    if (!e) return false;
    const r = ie.extractComparator(e);
    if (!r) return false;
    const [, n, , o, s, i, a] = r, c = {
      operator: n,
      version: ie.combineVersion(o, s, i, a),
      major: o,
      minor: s,
      patch: i,
      preRelease: a == null ? void 0 : a.split(".")
    }, l = t.split("||");
    for (const u of l) {
      const f = u.trim();
      if (!f || f === "*" || f === "x") return true;
      try {
        const d = cs(f);
        if (!d.trim()) return true;
        const h = d.split(" ").map((E) => ls(E)).join(" ");
        if (!h.trim()) return true;
        const m = h.split(/\s+/).map((E) => x.parseGTE0(E)).filter(Boolean);
        if (m.length === 0) continue;
        let _ = true;
        for (const E of m) {
          const g = ie.extractComparator(E);
          if (!g) {
            _ = false;
            break;
          }
          const [, p, , M, k, A, T] = g;
          if (!as.compare({
            operator: p,
            version: ie.combineVersion(M, k, A, T),
            major: M,
            minor: k,
            patch: A,
            preRelease: T == null ? void 0 : T.split(".")
          }, c)) {
            _ = false;
            break;
          }
        }
        if (_) return true;
      } catch (d) {
        console.error(`[semver] Error processing range part "${f}":`, d);
        continue;
      }
    }
    return false;
  }
  Pt.satisfy = us;
  var C = {}, ne = {};
  const fs = "default", ds = "global";
  ne.DEFAULT_REMOTE_TYPE = ds;
  ne.DEFAULT_SCOPE = fs;
  const Ge = I, Dr = R, Hr = S, hs = ne, Ee = Pt;
  let gt = L;
  function ms(e, t, r, n) {
    var _a2, _b;
    let o;
    return "get" in e ? o = e.get : "lib" in e ? o = () => Promise.resolve(e.lib) : o = () => Promise.resolve(() => {
      Ge.error(`Cannot get shared "${r}" from "${t}": neither "get" nor "lib" is provided in the share config.`);
    }), ((_a2 = e.shareConfig) == null ? void 0 : _a2.eager) && ((_b = e.treeShaking) == null ? void 0 : _b.mode) && Ge.error(`Invalid shared config for "${r}" from "${t}": cannot use both "eager: true" and "treeShaking.mode" simultaneously. Choose one strategy.`), {
      deps: [],
      useIn: [],
      from: t,
      loading: null,
      ...e,
      shareConfig: {
        requiredVersion: `^${e.version}`,
        singleton: false,
        eager: false,
        strictVersion: false,
        ...e.shareConfig
      },
      get: o,
      loaded: (e == null ? void 0 : e.loaded) || "lib" in e ? true : void 0,
      version: e.version ?? "0",
      scope: Array.isArray(e.scope) ? e.scope : [
        e.scope ?? "default"
      ],
      strategy: (e.strategy ?? n) || "version-first",
      treeShaking: e.treeShaking ? {
        ...e.treeShaking,
        mode: e.treeShaking.mode ?? "server-calc",
        status: e.treeShaking.status ?? gt.TreeShakingStatus.UNKNOWN,
        useIn: []
      } : void 0
    };
  }
  function _s(e, t) {
    const r = t.shared || {}, n = t.name, o = Object.keys(r).reduce((i, a) => {
      const c = Dr.arrayOptions(r[a]);
      return i[a] = i[a] || [], c.forEach((l) => {
        i[a].push(ms(l, n, a, t.shareStrategy));
      }), i;
    }, {}), s = {
      ...e.shared
    };
    return Object.keys(o).forEach((i) => {
      s[i] ? o[i].forEach((a) => {
        s[i].find((c) => c.version === a.version) || s[i].push(a);
      }) : s[i] = o[i];
    }), {
      allShareInfos: s,
      newShareInfos: o
    };
  }
  function Re(e, t) {
    if (!e) return false;
    const { status: r, mode: n } = e;
    return r === gt.TreeShakingStatus.NO_USE ? false : r === gt.TreeShakingStatus.CALCULATED ? true : n === "runtime-infer" ? t ? gs(e, t) : true : false;
  }
  function ee(e, t) {
    const r = (n) => {
      if (!Number.isNaN(Number(n))) {
        const o = n.split(".");
        let s = n;
        for (let i = 0; i < 3 - o.length; i++) s += ".0";
        return s;
      }
      return n;
    };
    return !!Ee.satisfy(r(e), `<=${r(t)}`);
  }
  const Te = (e, t) => {
    const r = t || function(n, o) {
      return ee(n, o);
    };
    return Object.keys(e).reduce((n, o) => !n || r(n, o) || n === "0" ? o : n, 0);
  }, We = (e) => !!e.loaded || typeof e.lib == "function", ps = (e) => !!e.loading, gs = (e, t) => {
    if (!e || !t) return false;
    const { usedExports: r } = e;
    return r ? !!t.every((n) => r.includes(n)) : false;
  };
  function Es(e, t, r, n) {
    const o = e[t][r];
    let s = "", i = Re(n);
    const a = function(c, l) {
      return i ? o[c].treeShaking ? o[l].treeShaking ? !We(o[c].treeShaking) && ee(c, l) : false : true : !We(o[c]) && ee(c, l);
    };
    if (i) {
      if (s = Te(e[t][r], a), s) return {
        version: s,
        useTreesShaking: i
      };
      i = false;
    }
    return {
      version: Te(e[t][r], a),
      useTreesShaking: i
    };
  }
  const oe = (e) => We(e) || ps(e);
  function ys(e, t, r, n) {
    const o = e[t][r];
    let s = "", i = Re(n);
    const a = function(c, l) {
      if (i) {
        if (!o[c].treeShaking) return true;
        if (!o[l].treeShaking) return false;
        if (oe(o[l].treeShaking)) return oe(o[c].treeShaking) ? !!ee(c, l) : true;
        if (oe(o[c].treeShaking)) return false;
      }
      return oe(o[l]) ? oe(o[c]) ? !!ee(c, l) : true : oe(o[c]) ? false : ee(c, l);
    };
    if (i) {
      if (s = Te(e[t][r], a), s) return {
        version: s,
        useTreesShaking: i
      };
      i = false;
    }
    return {
      version: Te(e[t][r], a),
      useTreesShaking: i
    };
  }
  function Ss(e) {
    return e === "loaded-first" ? ys : Es;
  }
  function bs(e, t, r, n) {
    if (!e) return;
    const { shareConfig: o, scope: s = hs.DEFAULT_SCOPE, strategy: i, treeShaking: a } = r, c = Array.isArray(s) ? s : [
      s
    ];
    for (const l of c) if (o && e[l] && e[l][t]) {
      const { requiredVersion: u } = o, { version: f, useTreesShaking: d } = Ss(i)(e, l, t, a), h = () => {
        const _ = e[l][t][f];
        if (o.singleton) {
          if (typeof u == "string" && !Ee.satisfy(f, u)) {
            const E = `Version ${f} from ${f && _.from} of shared singleton module ${t} does not satisfy the requirement of ${r.from} which needs ${u})`;
            o.strictVersion ? Ge.error(E) : Ge.warn(E);
          }
          return {
            shared: _,
            useTreesShaking: d
          };
        } else {
          if (u === false || u === "*") return {
            shared: _,
            useTreesShaking: d
          };
          if (Ee.satisfy(f, u)) return {
            shared: _,
            useTreesShaking: d
          };
          const E = Re(a);
          if (E) {
            for (const [g, p] of Object.entries(e[l][t])) if (Re(p.treeShaking, a == null ? void 0 : a.usedExports) && Ee.satisfy(g, u)) return {
              shared: p,
              useTreesShaking: E
            };
          }
          for (const [g, p] of Object.entries(e[l][t])) if (Ee.satisfy(g, u)) return {
            shared: p,
            useTreesShaking: false
          };
        }
      }, m = {
        shareScopeMap: e,
        scope: l,
        pkgName: t,
        version: f,
        GlobalFederation: Hr.Global.__FEDERATION__,
        shareInfo: r,
        resolver: h
      };
      return (n.emit(m) || m).resolver();
    }
  }
  function Rs() {
    return Hr.Global.__FEDERATION__.__SHARE__;
  }
  function Ts(e) {
    const { pkgName: t, extraOptions: r, shareInfos: n } = e, o = (c) => {
      if (!c) return;
      const l = {};
      return c.forEach((f) => {
        l[f.version] = f;
      }), l[Te(l, function(f, d) {
        return !We(l[f]) && ee(f, d);
      })];
    }, s = (r == null ? void 0 : r.resolver) ?? o, i = (c) => c !== null && typeof c == "object" && !Array.isArray(c), a = (...c) => {
      const l = {};
      for (const u of c) if (u) for (const [f, d] of Object.entries(u)) {
        const h = l[f];
        i(h) && i(d) ? l[f] = a(h, d) : d !== void 0 && (l[f] = d);
      }
      return l;
    };
    return a(s(n[t]), r == null ? void 0 : r.customShareInfo);
  }
  const Is = (e, t) => {
    e.useIn || (e.useIn = []), Dr.addUniqueItem(e.useIn, t);
  };
  function Ns(e, t) {
    return t && e.treeShaking ? e.treeShaking : e;
  }
  C.addUseIn = Is;
  C.directShare = Ns;
  C.formatShareConfigs = _s;
  C.getGlobalShareScope = Rs;
  C.getRegisteredShare = bs;
  C.getTargetSharedOptions = Ts;
  C.shouldUseTreeShaking = Re;
  var de = {};
  function Ms(e, t) {
    for (const r of e) {
      const n = t.startsWith(r.name);
      let o = t.replace(r.name, "");
      if (n) {
        if (o.startsWith("/")) {
          const a = r.name;
          return o = `.${o}`, {
            pkgNameOrAlias: a,
            expose: o,
            remote: r
          };
        } else if (o === "") return {
          pkgNameOrAlias: r.name,
          expose: ".",
          remote: r
        };
      }
      const s = r.alias && t.startsWith(r.alias);
      let i = r.alias && t.replace(r.alias, "");
      if (r.alias && s) {
        if (i && i.startsWith("/")) {
          const a = r.alias;
          return i = `.${i}`, {
            pkgNameOrAlias: a,
            expose: i,
            remote: r
          };
        } else if (i === "") return {
          pkgNameOrAlias: r.alias,
          expose: ".",
          remote: r
        };
      }
    }
  }
  function Ps(e, t) {
    for (const r of e) if (t === r.name || r.alias && t === r.alias) return r;
  }
  de.matchRemote = Ps;
  de.matchRemoteWithNameAndExpose = Ms;
  var j = {}, K = {}, $ = {};
  const vs = "RUNTIME-001", As = "RUNTIME-002", Os = "RUNTIME-003", $s = "RUNTIME-004", ks = "RUNTIME-005", Fs = "RUNTIME-006", ws = "RUNTIME-007", Ls = "RUNTIME-008", Ds = "RUNTIME-009", Hs = "RUNTIME-010", Cs = "RUNTIME-011", qs = "RUNTIME-012", Us = "TYPE-001", Gs = "BUILD-001", Ws = "BUILD-002";
  $.BUILD_001 = Gs;
  $.BUILD_002 = Ws;
  $.RUNTIME_001 = vs;
  $.RUNTIME_002 = As;
  $.RUNTIME_003 = Os;
  $.RUNTIME_004 = $s;
  $.RUNTIME_005 = ks;
  $.RUNTIME_006 = Fs;
  $.RUNTIME_007 = ws;
  $.RUNTIME_008 = Ls;
  $.RUNTIME_009 = Ds;
  $.RUNTIME_010 = Hs;
  $.RUNTIME_011 = Cs;
  $.RUNTIME_012 = qs;
  $.TYPE_001 = Us;
  var Me = {};
  const F = $, Cr = {
    [F.RUNTIME_001]: "Failed to get remoteEntry exports.",
    [F.RUNTIME_002]: 'The remote entry interface does not contain "init"',
    [F.RUNTIME_003]: "Failed to get manifest.",
    [F.RUNTIME_004]: "Failed to locate remote.",
    [F.RUNTIME_005]: "Invalid loadShareSync function call from bundler runtime",
    [F.RUNTIME_006]: "Invalid loadShareSync function call from runtime",
    [F.RUNTIME_007]: "Failed to get remote snapshot.",
    [F.RUNTIME_008]: "Failed to load script resources.",
    [F.RUNTIME_009]: "Please call createInstance first.",
    [F.RUNTIME_010]: 'The name option cannot be changed after initialization. If you want to create a new instance with a different name, please use "createInstance" api.',
    [F.RUNTIME_011]: "The remoteEntry URL is missing from the remote snapshot.",
    [F.RUNTIME_012]: 'The getter for the shared module is not a function. This may be caused by setting "shared.import: false" without the host providing the corresponding lib.'
  }, qr = {
    [F.TYPE_001]: "Failed to generate type declaration. Execute the below cmd to reproduce and fix the error."
  }, Ur = {
    [F.BUILD_001]: "Failed to find expose module.",
    [F.BUILD_002]: "PublicPath is required in prod mode."
  }, Bs = {
    ...Cr,
    ...qr,
    ...Ur
  };
  Me.buildDescMap = Ur;
  Me.errorDescMap = Bs;
  Me.runtimeDescMap = Cr;
  Me.typeDescMap = qr;
  (function(e) {
    Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    });
    const t = $, r = Mt, n = Me;
    e.BUILD_001 = t.BUILD_001, e.BUILD_002 = t.BUILD_002, e.RUNTIME_001 = t.RUNTIME_001, e.RUNTIME_002 = t.RUNTIME_002, e.RUNTIME_003 = t.RUNTIME_003, e.RUNTIME_004 = t.RUNTIME_004, e.RUNTIME_005 = t.RUNTIME_005, e.RUNTIME_006 = t.RUNTIME_006, e.RUNTIME_007 = t.RUNTIME_007, e.RUNTIME_008 = t.RUNTIME_008, e.RUNTIME_009 = t.RUNTIME_009, e.RUNTIME_010 = t.RUNTIME_010, e.RUNTIME_011 = t.RUNTIME_011, e.RUNTIME_012 = t.RUNTIME_012, e.TYPE_001 = t.TYPE_001, e.buildDescMap = n.buildDescMap, e.errorDescMap = n.errorDescMap, e.getShortErrorMsg = r.getShortErrorMsg, e.runtimeDescMap = n.runtimeDescMap, e.typeDescMap = n.typeDescMap;
  })(K);
  const Ve = I, ae = S, Dt = ne;
  let Gr = L, Ie = K;
  const Wr = ".then(callbacks[0]).catch(callbacks[1])";
  async function Vs({ entry: e, remoteEntryExports: t }) {
    return new Promise((r, n) => {
      try {
        t ? r(t) : typeof FEDERATION_ALLOW_NEW_FUNCTION < "u" ? new Function("callbacks", `import("${e}")${Wr}`)([
          r,
          n
        ]) : import(e).then(async (m) => {
          await m.__tla;
          return m;
        }).then(r).catch(n);
      } catch (o) {
        Ve.error(`Failed to load ESM entry from "${e}". ${o instanceof Error ? o.message : String(o)}`);
      }
    });
  }
  async function js({ entry: e, remoteEntryExports: t }) {
    return new Promise((r, n) => {
      try {
        t ? r(t) : typeof __system_context__ > "u" ? System.import(e).then(r).catch(n) : new Function("callbacks", `System.import("${e}")${Wr}`)([
          r,
          n
        ]);
      } catch (o) {
        Ve.error(`Failed to load SystemJS entry from "${e}". ${o instanceof Error ? o.message : String(o)}`);
      }
    });
  }
  function xs(e, t, r) {
    const { remoteEntryKey: n, entryExports: o } = ae.getRemoteEntryExports(e, t);
    return o || Ve.error(Ie.RUNTIME_001, Ie.runtimeDescMap, {
      remoteName: e,
      remoteEntryUrl: r,
      remoteEntryKey: n
    }), o;
  }
  async function Xs({ name: e, globalName: t, entry: r, remoteInfo: n, loaderHook: o, getEntryUrl: s }) {
    const { entryExports: i } = ae.getRemoteEntryExports(e, t);
    if (i) return i;
    const a = s ? s(r) : r;
    return (0, Gr.loadScript)(a, {
      attrs: {},
      createScriptHook: (c, l) => {
        const u = o.lifecycle.createScript.emit({
          url: c,
          attrs: l,
          remoteInfo: n
        });
        if (u && (u instanceof HTMLScriptElement || "script" in u || "timeout" in u)) return u;
      }
    }).then(() => xs(e, t, r), (c) => {
      const l = c instanceof Error ? c.message : String(c);
      Ve.error(Ie.RUNTIME_008, Ie.runtimeDescMap, {
        remoteName: e,
        resourceUrl: a
      }, l);
    });
  }
  async function Ks({ remoteInfo: e, remoteEntryExports: t, loaderHook: r, getEntryUrl: n }) {
    const { entry: o, entryGlobalName: s, name: i, type: a } = e;
    switch (a) {
      case "esm":
      case "module":
        return Vs({
          entry: o,
          remoteEntryExports: t
        });
      case "system":
        return js({
          entry: o,
          remoteEntryExports: t
        });
      default:
        return Xs({
          entry: o,
          globalName: s,
          name: i,
          remoteInfo: e,
          loaderHook: r,
          getEntryUrl: n
        });
    }
  }
  function Et(e) {
    const { entry: t, name: r } = e;
    return (0, Gr.composeKeyWithSeparator)(r, t);
  }
  async function Br(e) {
    const { origin: t, remoteEntryExports: r, remoteInfo: n, getEntryUrl: o, _inErrorHandling: s = false } = e, i = Et(n);
    if (r) return r;
    if (!ae.globalLoading[i]) {
      const a = t.remoteHandler.hooks.lifecycle.loadEntry, c = t.loaderHook;
      ae.globalLoading[i] = a.emit({
        loaderHook: c,
        remoteInfo: n,
        remoteEntryExports: r
      }).then((l) => l || Ks({
        remoteInfo: n,
        remoteEntryExports: r,
        loaderHook: c,
        getEntryUrl: o
      })).catch(async (l) => {
        const u = Et(n), f = l instanceof Error && l.message.includes("ScriptExecutionError");
        if (l instanceof Error && l.message.includes(Ie.RUNTIME_008) && !f && !s) {
          const d = (m) => Br({
            ...m,
            _inErrorHandling: true
          }), h = await t.loaderHook.lifecycle.loadEntryError.emit({
            getRemoteEntry: d,
            origin: t,
            remoteInfo: n,
            remoteEntryExports: r,
            globalLoading: ae.globalLoading,
            uniqueKey: u
          });
          if (h) return h;
        }
        throw l;
      });
    }
    return ae.globalLoading[i];
  }
  function Ys(e) {
    return {
      ...e,
      entry: "entry" in e ? e.entry : "",
      type: e.type || Dt.DEFAULT_REMOTE_TYPE,
      entryGlobalName: e.entryGlobalName || e.name,
      shareScope: e.shareScope || Dt.DEFAULT_SCOPE
    };
  }
  j.getRemoteEntry = Br;
  j.getRemoteEntryUniqueKey = Et;
  j.getRemoteInfo = Ys;
  var Vr = {};
  function zs() {
    return typeof FEDERATION_BUILD_IDENTIFIER < "u" ? FEDERATION_BUILD_IDENTIFIER : "";
  }
  Vr.getBuilderId = zs;
  var jr = {};
  const Js = S;
  function Zs(e, t) {
    const r = Js.getGlobalHostPlugins(), n = [
      t.hooks,
      t.remoteHandler.hooks,
      t.sharedHandler.hooks,
      t.snapshotHandler.hooks,
      t.loaderHook,
      t.bridgeHook
    ];
    return r.length > 0 && r.forEach((o) => {
      (e == null ? void 0 : e.find((s) => s.name !== o.name)) && e.push(o);
    }), e && e.length > 0 && e.forEach((o) => {
      n.forEach((s) => {
        s.applyPlugin(o, t);
      });
    }), e;
  }
  jr.registerPlugins = Zs;
  var Pe = {};
  function Qs(e) {
    return {
      name: e.name,
      alias: e.alias,
      entry: "entry" in e ? e.entry : void 0,
      version: "version" in e ? e.version : void 0,
      type: e.type,
      entryGlobalName: e.entryGlobalName,
      shareScope: e.shareScope
    };
  }
  function ei(e) {
    var _a2, _b, _c, _d, _e2, _f;
    const t = {};
    for (const [r, n] of Object.entries(e.shared)) {
      const o = n[0];
      o && (t[r] = {
        version: o.version,
        singleton: (_a2 = o.shareConfig) == null ? void 0 : _a2.singleton,
        requiredVersion: ((_b = o.shareConfig) == null ? void 0 : _b.requiredVersion) === false ? false : (_c = o.shareConfig) == null ? void 0 : _c.requiredVersion,
        eager: o.eager,
        strictVersion: (_d = o.shareConfig) == null ? void 0 : _d.strictVersion
      });
    }
    return {
      project: {
        name: e.name,
        mfRole: ((_e2 = e.remotes) == null ? void 0 : _e2.length) > 0 ? "host" : "unknown"
      },
      mfConfig: {
        name: e.name,
        remotes: ((_f = e.remotes) == null ? void 0 : _f.map(Qs)) ?? [],
        shared: t
      }
    };
  }
  Pe.optionsToMFContext = ei;
  var xr = {}, J = {};
  const ti = I, ri = de, Ht = j;
  let ye = L;
  function Xr(e) {
    return {
      resourceCategory: "sync",
      share: true,
      depsRemote: true,
      prefetchInterface: false,
      ...e
    };
  }
  function ni(e, t) {
    return t.map((r) => {
      const n = ri.matchRemote(e, r.nameOrAlias);
      return ti.assert(n, `Unable to preload ${r.nameOrAlias} as it is not included in ${!n && (0, ye.safeToString)({
        remoteInfo: n,
        remotes: e
      })}`), {
        remote: n,
        preloadConfig: Xr(r)
      };
    });
  }
  function oi(e) {
    return e ? e.map((t) => t === "." ? t : t.startsWith("./") ? t.replace("./", "") : t) : [];
  }
  function si(e, t, r, n = true) {
    const { cssAssets: o, jsAssetsWithoutEntry: s, entryAssets: i } = r;
    if (t.options.inBrowser) {
      if (i.forEach((a) => {
        const { moduleInfo: c } = a, l = t.moduleCache.get(e.name);
        l ? Ht.getRemoteEntry({
          origin: t,
          remoteInfo: c,
          remoteEntryExports: l.remoteEntryExports
        }) : Ht.getRemoteEntry({
          origin: t,
          remoteInfo: c,
          remoteEntryExports: void 0
        });
      }), n) {
        const a = {
          rel: "preload",
          as: "style"
        };
        o.forEach((c) => {
          const { link: l, needAttach: u } = (0, ye.createLink)({
            url: c,
            cb: () => {
            },
            attrs: a,
            createLinkHook: (f, d) => {
              const h = t.loaderHook.lifecycle.createLink.emit({
                url: f,
                attrs: d,
                remoteInfo: e
              });
              if (h instanceof HTMLLinkElement) return h;
            }
          });
          u && document.head.appendChild(l);
        });
      } else {
        const a = {
          rel: "stylesheet",
          type: "text/css"
        };
        o.forEach((c) => {
          const { link: l, needAttach: u } = (0, ye.createLink)({
            url: c,
            cb: () => {
            },
            attrs: a,
            createLinkHook: (f, d) => {
              const h = t.loaderHook.lifecycle.createLink.emit({
                url: f,
                attrs: d,
                remoteInfo: e
              });
              if (h instanceof HTMLLinkElement) return h;
            },
            needDeleteLink: false
          });
          u && document.head.appendChild(l);
        });
      }
      if (n) {
        const a = {
          rel: "preload",
          as: "script"
        };
        s.forEach((c) => {
          const { link: l, needAttach: u } = (0, ye.createLink)({
            url: c,
            cb: () => {
            },
            attrs: a,
            createLinkHook: (f, d) => {
              const h = t.loaderHook.lifecycle.createLink.emit({
                url: f,
                attrs: d,
                remoteInfo: e
              });
              if (h instanceof HTMLLinkElement) return h;
            }
          });
          u && document.head.appendChild(l);
        });
      } else {
        const a = {
          fetchpriority: "high",
          type: (e == null ? void 0 : e.type) === "module" ? "module" : "text/javascript"
        };
        s.forEach((c) => {
          const { script: l, needAttach: u } = (0, ye.createScript)({
            url: c,
            cb: () => {
            },
            attrs: a,
            createScriptHook: (f, d) => {
              const h = t.loaderHook.lifecycle.createScript.emit({
                url: f,
                attrs: d,
                remoteInfo: e
              });
              if (h instanceof HTMLScriptElement) return h;
            },
            needDeleteScript: true
          });
          u && document.head.appendChild(l);
        });
      }
    }
  }
  J.defaultPreloadArgs = Xr;
  J.formatPreloadArgs = ni;
  J.normalizePreloadExposes = oi;
  J.preloadAssets = si;
  const O = S, Ct = C, ii = de, ai = j, li = J, ci = {
    getRegisteredShare: Ct.getRegisteredShare,
    getGlobalShareScope: Ct.getGlobalShareScope
  }, ui = {
    Global: O.Global,
    nativeGlobal: O.nativeGlobal,
    resetFederationGlobalInfo: O.resetFederationGlobalInfo,
    setGlobalFederationInstance: O.setGlobalFederationInstance,
    getGlobalFederationConstructor: O.getGlobalFederationConstructor,
    setGlobalFederationConstructor: O.setGlobalFederationConstructor,
    getInfoWithoutType: O.getInfoWithoutType,
    getGlobalSnapshot: O.getGlobalSnapshot,
    getTargetSnapshotInfoByModuleInfo: O.getTargetSnapshotInfoByModuleInfo,
    getGlobalSnapshotInfoByModuleInfo: O.getGlobalSnapshotInfoByModuleInfo,
    setGlobalSnapshotInfoByModuleInfo: O.setGlobalSnapshotInfoByModuleInfo,
    addGlobalSnapshot: O.addGlobalSnapshot,
    getRemoteEntryExports: O.getRemoteEntryExports,
    registerGlobalPlugins: O.registerGlobalPlugins,
    getGlobalHostPlugins: O.getGlobalHostPlugins,
    getPreloaded: O.getPreloaded,
    setPreloaded: O.setPreloaded
  };
  var fi = {
    global: ui,
    share: ci,
    utils: {
      matchRemoteWithNameAndExpose: ii.matchRemoteWithNameAndExpose,
      preloadAssets: li.preloadAssets,
      getRemoteInfo: ai.getRemoteInfo
    }
  };
  xr.default = fi;
  var je = {};
  const Je = I, qt = R, di = j, hi = Pe;
  let mi = L, Ut = K;
  function _i(e, t, r) {
    const n = t, o = Array.isArray(e.shareScope) ? e.shareScope : [
      e.shareScope
    ];
    o.length || o.push("default"), o.forEach((i) => {
      n[i] || (n[i] = {});
    });
    const s = {
      version: e.version || "",
      shareScopeKeys: Array.isArray(e.shareScope) ? o : e.shareScope || "default"
    };
    return Object.defineProperty(s, "shareScopeMap", {
      value: n,
      enumerable: false
    }), {
      remoteEntryInitOptions: s,
      shareScope: n[o[0]],
      initScope: r ?? []
    };
  }
  var pi = class {
    constructor({ remoteInfo: e, host: t }) {
      this.inited = false, this.initing = false, this.lib = void 0, this.remoteInfo = e, this.host = t;
    }
    async getEntry() {
      if (this.remoteEntryExports) return this.remoteEntryExports;
      const e = await di.getRemoteEntry({
        origin: this.host,
        remoteInfo: this.remoteInfo,
        remoteEntryExports: this.remoteEntryExports
      });
      return Je.assert(e, `remoteEntryExports is undefined 
 ${(0, mi.safeToString)(this.remoteInfo)}`), this.remoteEntryExports = e, this.remoteEntryExports;
    }
    async init(e, t, r) {
      const n = await this.getEntry();
      if (this.inited) return n;
      if (this.initPromise) return await this.initPromise, n;
      this.initing = true, this.initPromise = (async () => {
        const { remoteEntryInitOptions: o, shareScope: s, initScope: i } = _i(this.remoteInfo, this.host.shareScopeMap, r), a = await this.host.hooks.lifecycle.beforeInitContainer.emit({
          shareScope: s,
          remoteEntryInitOptions: o,
          initScope: i,
          remoteInfo: this.remoteInfo,
          origin: this.host
        });
        typeof (n == null ? void 0 : n.init) > "u" && Je.error(Ut.RUNTIME_002, Ut.runtimeDescMap, {
          hostName: this.host.name,
          remoteName: this.remoteInfo.name,
          remoteEntryUrl: this.remoteInfo.entry,
          remoteEntryKey: this.remoteInfo.entryGlobalName
        }, void 0, hi.optionsToMFContext(this.host.options)), await n.init(a.shareScope, a.initScope, a.remoteEntryInitOptions), await this.host.hooks.lifecycle.initContainer.emit({
          ...a,
          id: e,
          remoteSnapshot: t,
          remoteEntryExports: n
        }), this.inited = true;
      })();
      try {
        await this.initPromise;
      } finally {
        this.initing = false, this.initPromise = void 0;
      }
      return n;
    }
    async get(e, t, r, n) {
      const { loadFactory: o = true } = r || {
        loadFactory: true
      }, s = await this.init(e, n);
      this.lib = s;
      let i;
      i = await this.host.loaderHook.lifecycle.getModuleFactory.emit({
        remoteEntryExports: s,
        expose: t,
        moduleInfo: this.remoteInfo
      }), i || (i = await s.get(t)), Je.assert(i, `${qt.getFMId(this.remoteInfo)} remote don't export ${t}.`);
      const a = qt.processModuleAlias(this.remoteInfo.name, t), c = this.wraperFactory(i, a);
      return o ? await c() : c;
    }
    wraperFactory(e, t) {
      function r(n, o) {
        n && typeof n == "object" && Object.isExtensible(n) && !Object.getOwnPropertyDescriptor(n, /* @__PURE__ */ Symbol.for("mf_module_id")) && Object.defineProperty(n, /* @__PURE__ */ Symbol.for("mf_module_id"), {
          value: o,
          enumerable: false
        });
      }
      return e instanceof Promise ? async () => {
        const n = await e();
        return r(n, t), n;
      } : () => {
        const n = e();
        return r(n, t), n;
      };
    }
  };
  je.Module = pi;
  var Kr = {}, he = {}, gi = class {
    constructor(e) {
      this.type = "", this.listeners = /* @__PURE__ */ new Set(), e && (this.type = e);
    }
    on(e) {
      typeof e == "function" && this.listeners.add(e);
    }
    once(e) {
      const t = this;
      this.on(function r(...n) {
        return t.remove(r), e.apply(null, n);
      });
    }
    emit(...e) {
      let t;
      return this.listeners.size > 0 && this.listeners.forEach((r) => {
        t = r(...e);
      }), t;
    }
    remove(e) {
      this.listeners.delete(e);
    }
    removeAll() {
      this.listeners.clear();
    }
  };
  he.SyncHook = gi;
  var ve = {};
  const Ei = he;
  var yi = class extends Ei.SyncHook {
    emit(...e) {
      let t;
      const r = Array.from(this.listeners);
      if (r.length > 0) {
        let n = 0;
        const o = (s) => s === false ? false : n < r.length ? Promise.resolve(r[n++].apply(null, e)).then(o) : s;
        t = o();
      }
      return Promise.resolve(t);
    }
  };
  ve.AsyncHook = yi;
  var me = {};
  const Ze = I, Yr = R, Si = he;
  function zr(e, t) {
    if (!Yr.isObject(t)) return false;
    if (e !== t) {
      for (const r in e) if (!(r in t)) return false;
    }
    return true;
  }
  var bi = class extends Si.SyncHook {
    constructor(e) {
      super(), this.onerror = Ze.error, this.type = e;
    }
    emit(e) {
      Yr.isObject(e) || Ze.error(`The data for the "${this.type}" hook should be an object.`);
      for (const t of this.listeners) try {
        const r = t(e);
        if (zr(e, r)) e = r;
        else {
          this.onerror(`A plugin returned an unacceptable value for the "${this.type}" type.`);
          break;
        }
      } catch (r) {
        Ze.warn(r), this.onerror(r);
      }
      return e;
    }
  };
  me.SyncWaterfallHook = bi;
  me.checkReturnData = zr;
  var Ae = {};
  const Qe = I, Ri = R, Ti = he, Ii = me;
  var Ni = class extends Ti.SyncHook {
    constructor(e) {
      super(), this.onerror = Qe.error, this.type = e;
    }
    emit(e) {
      Ri.isObject(e) || Qe.error(`The response data for the "${this.type}" hook must be an object.`);
      const t = Array.from(this.listeners);
      if (t.length > 0) {
        let r = 0;
        const n = (s) => (Qe.warn(s), this.onerror(s), e), o = (s) => {
          if (Ii.checkReturnData(e, s)) {
            if (e = s, r < t.length) try {
              return Promise.resolve(t[r++](e)).then(o, n);
            } catch (i) {
              return n(i);
            }
          } else this.onerror(`A plugin returned an incorrect value for the "${this.type}" type.`);
          return e;
        };
        return Promise.resolve(o(e));
      }
      return Promise.resolve(e);
    }
  };
  Ae.AsyncWaterfallHook = Ni;
  var Oe = {};
  const ke = I, Mi = R;
  var Pi = class {
    constructor(e) {
      this.registerPlugins = {}, this.lifecycle = e, this.lifecycleKeys = Object.keys(e);
    }
    applyPlugin(e, t) {
      var _a2;
      ke.assert(Mi.isPlainObject(e), "Plugin configuration is invalid.");
      const r = e.name;
      ke.assert(r, "A name must be provided by the plugin."), this.registerPlugins[r] || (this.registerPlugins[r] = e, (_a2 = e.apply) == null ? void 0 : _a2.call(e, t), Object.keys(this.lifecycle).forEach((n) => {
        const o = e[n];
        o && this.lifecycle[n].on(o);
      }));
    }
    removePlugin(e) {
      ke.assert(e, "A name is required.");
      const t = this.registerPlugins[e];
      ke.assert(t, `The plugin "${e}" is not registered.`), Object.keys(t).forEach((r) => {
        r !== "name" && this.lifecycle[r].remove(t[r]);
      });
    }
  };
  Oe.PluginSystem = Pi;
  var xe = {};
  const vi = I, yt = R, Ai = J;
  let Gt = L, Wt = K;
  function Jr(e, t) {
    const r = yt.getRemoteEntryInfoFromSnapshot(t);
    r.url || vi.error(Wt.RUNTIME_011, Wt.runtimeDescMap, {
      remoteName: e.name
    });
    let n = (0, Gt.getResourceUrl)(t, r.url);
    !Gt.isBrowserEnvValue && !n.startsWith("http") && (n = `https:${n}`), e.type = r.type, e.entryGlobalName = r.globalName, e.entry = n, e.version = t.version, e.buildVersion = t.buildVersion;
  }
  function Oi() {
    return {
      name: "snapshot-plugin",
      async afterResolve(e) {
        const { remote: t, pkgNameOrAlias: r, expose: n, origin: o, remoteInfo: s, id: i } = e;
        if (!yt.isRemoteInfoWithEntry(t) || !yt.isPureRemoteEntry(t)) {
          const { remoteSnapshot: a, globalSnapshot: c } = await o.snapshotHandler.loadRemoteSnapshotInfo({
            moduleInfo: t,
            id: i
          });
          Jr(s, a);
          const l = {
            remote: t,
            preloadConfig: {
              nameOrAlias: r,
              exposes: [
                n
              ],
              resourceCategory: "sync",
              share: false,
              depsRemote: false
            }
          }, u = await o.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit({
            origin: o,
            preloadOptions: l,
            remoteInfo: s,
            remote: t,
            remoteSnapshot: a,
            globalSnapshot: c
          });
          return u && Ai.preloadAssets(s, o, u, false), {
            ...e,
            remoteSnapshot: a
          };
        }
        return e;
      }
    };
  }
  xe.assignRemoteInfo = Jr;
  xe.snapshotPlugin = Oi;
  var Zr = {};
  const Ne = R, St = S, $i = C, Bt = J, ki = xe;
  let Be = L;
  function Fi(e) {
    const t = e.split(":");
    return t.length === 1 ? {
      name: t[0],
      version: void 0
    } : t.length === 2 ? {
      name: t[0],
      version: t[1]
    } : {
      name: t[1],
      version: t[2]
    };
  }
  function Qr(e, t, r, n, o = {}, s) {
    const { value: i } = St.getInfoWithoutType(e, Ne.getFMId(t)), a = s || i;
    if (a && !(0, Be.isManifestProvider)(a) && (r(a, t, n), a.remotesInfo)) {
      const c = Object.keys(a.remotesInfo);
      for (const l of c) {
        if (o[l]) continue;
        o[l] = true;
        const u = Fi(l), f = a.remotesInfo[l];
        Qr(e, {
          name: u.name,
          version: f.matchedVersion
        }, r, false, o, void 0);
      }
    }
  }
  const et = (e, t) => document.querySelector(`${e}[${e === "link" ? "href" : "src"}="${t}"]`);
  function wi(e, t, r, n, o) {
    const s = [], i = [], a = [], c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), { options: u } = e, { preloadConfig: f } = t, { depsRemote: d } = f;
    if (Qr(n, r, (m, _, E) => {
      var _a2;
      let g;
      if (E) g = f;
      else if (Array.isArray(d)) {
        const T = d.find((w) => w.nameOrAlias === _.name || w.nameOrAlias === _.alias);
        if (!T) return;
        g = Bt.defaultPreloadArgs(T);
      } else if (d === true) g = f;
      else return;
      const p = (0, Be.getResourceUrl)(m, Ne.getRemoteEntryInfoFromSnapshot(m).url);
      p && a.push({
        name: _.name,
        moduleInfo: {
          name: _.name,
          entry: p,
          type: "remoteEntryType" in m ? m.remoteEntryType : "global",
          entryGlobalName: "globalName" in m ? m.globalName : _.name,
          shareScope: "",
          version: "version" in m ? m.version : void 0
        },
        url: p
      });
      let M = "modules" in m ? m.modules : [];
      const k = Bt.normalizePreloadExposes(g.exposes);
      k.length && "modules" in m && (M = (_a2 = m == null ? void 0 : m.modules) == null ? void 0 : _a2.reduce((T, w) => ((k == null ? void 0 : k.indexOf(w.moduleName)) !== -1 && T.push(w), T), []));
      function A(T) {
        const w = T.map((W) => (0, Be.getResourceUrl)(m, W));
        return g.filter ? w.filter(g.filter) : w;
      }
      if (M) {
        const T = M.length;
        for (let w = 0; w < T; w++) {
          const W = M[w], Ke = `${_.name}/${W.moduleName}`;
          e.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
            id: W.moduleName === "." ? _.name : Ke,
            name: _.name,
            remoteSnapshot: m,
            preloadConfig: g,
            remote: _,
            origin: e
          }), !St.getPreloaded(Ke) && (g.resourceCategory === "all" ? (s.push(...A(W.assets.css.async)), s.push(...A(W.assets.css.sync)), i.push(...A(W.assets.js.async)), i.push(...A(W.assets.js.sync))) : g.resourceCategory === "sync" && (s.push(...A(W.assets.css.sync)), i.push(...A(W.assets.js.sync))), St.setPreloaded(Ke));
        }
      }
    }, true, {}, o), o.shared && o.shared.length > 0) {
      const m = (_, E) => {
        const { shared: g } = $i.getRegisteredShare(e.shareScopeMap, E.sharedName, _, e.sharedHandler.hooks.lifecycle.resolveShare) || {};
        g && typeof g.lib == "function" && (E.assets.js.sync.forEach((p) => {
          c.add(p);
        }), E.assets.css.sync.forEach((p) => {
          l.add(p);
        }));
      };
      o.shared.forEach((_) => {
        var _a2;
        const E = (_a2 = u.shared) == null ? void 0 : _a2[_.sharedName];
        if (!E) return;
        const g = _.version ? E.find((p) => p.version === _.version) : E;
        g && Ne.arrayOptions(g).forEach((p) => {
          m(p, _);
        });
      });
    }
    const h = i.filter((m) => !c.has(m) && !et("script", m));
    return {
      cssAssets: s.filter((m) => !l.has(m) && !et("link", m)),
      jsAssetsWithoutEntry: h,
      entryAssets: a.filter((m) => !et("script", m.url))
    };
  }
  const Li = function() {
    return {
      name: "generate-preload-assets-plugin",
      async generatePreloadAssets(e) {
        const { origin: t, preloadOptions: r, remoteInfo: n, remote: o, globalSnapshot: s, remoteSnapshot: i } = e;
        return Be.isBrowserEnvValue ? Ne.isRemoteInfoWithEntry(o) && Ne.isPureRemoteEntry(o) ? {
          cssAssets: [],
          jsAssetsWithoutEntry: [],
          entryAssets: [
            {
              name: o.name,
              url: o.entry,
              moduleInfo: {
                name: n.name,
                entry: o.entry,
                type: n.type || "global",
                entryGlobalName: "",
                shareScope: ""
              }
            }
          ]
        } : (ki.assignRemoteInfo(n, i), wi(t, r, n, s, i)) : {
          cssAssets: [],
          jsAssetsWithoutEntry: [],
          entryAssets: []
        };
      }
    };
  };
  Zr.generatePreloadAssetsPlugin = Li;
  var Xe = {};
  const tt = I, Di = R, U = S, Hi = j, Vt = Pe, Ci = ve, rt = Ae, qi = Oe;
  let nt = L, Fe = K;
  function en(e, t) {
    const r = U.getGlobalSnapshotInfoByModuleInfo({
      name: t.name,
      version: t.options.version
    }), n = r && "remotesInfo" in r && r.remotesInfo && U.getInfoWithoutType(r.remotesInfo, e.name).value;
    return n && n.matchedVersion ? {
      hostGlobalSnapshot: r,
      globalSnapshot: U.getGlobalSnapshot(),
      remoteSnapshot: U.getGlobalSnapshotInfoByModuleInfo({
        name: e.name,
        version: n.matchedVersion
      })
    } : {
      hostGlobalSnapshot: void 0,
      globalSnapshot: U.getGlobalSnapshot(),
      remoteSnapshot: U.getGlobalSnapshotInfoByModuleInfo({
        name: e.name,
        version: "version" in e ? e.version : void 0
      })
    };
  }
  var Ui = class {
    constructor(e) {
      this.loadingHostSnapshot = null, this.manifestCache = /* @__PURE__ */ new Map(), this.hooks = new qi.PluginSystem({
        beforeLoadRemoteSnapshot: new Ci.AsyncHook("beforeLoadRemoteSnapshot"),
        loadSnapshot: new rt.AsyncWaterfallHook("loadGlobalSnapshot"),
        loadRemoteSnapshot: new rt.AsyncWaterfallHook("loadRemoteSnapshot"),
        afterLoadSnapshot: new rt.AsyncWaterfallHook("afterLoadSnapshot")
      }), this.manifestLoading = U.Global.__FEDERATION__.__MANIFEST_LOADING__, this.HostInstance = e, this.loaderHook = e.loaderHook;
    }
    async loadRemoteSnapshotInfo({ moduleInfo: e, id: t, expose: r }) {
      const { options: n } = this.HostInstance;
      await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
        options: n,
        moduleInfo: e
      });
      let o = U.getGlobalSnapshotInfoByModuleInfo({
        name: this.HostInstance.options.name,
        version: this.HostInstance.options.version
      });
      o || (o = {
        version: this.HostInstance.options.version || "",
        remoteEntry: "",
        remotesInfo: {}
      }, U.addGlobalSnapshot({
        [this.HostInstance.options.name]: o
      })), o && "remotesInfo" in o && !U.getInfoWithoutType(o.remotesInfo, e.name).value && ("version" in e || "entry" in e) && (o.remotesInfo = {
        ...o == null ? void 0 : o.remotesInfo,
        [e.name]: {
          matchedVersion: "version" in e ? e.version : e.entry
        }
      });
      const { hostGlobalSnapshot: s, remoteSnapshot: i, globalSnapshot: a } = this.getGlobalRemoteInfo(e), { remoteSnapshot: c, globalSnapshot: l } = await this.hooks.lifecycle.loadSnapshot.emit({
        options: n,
        moduleInfo: e,
        hostGlobalSnapshot: s,
        remoteSnapshot: i,
        globalSnapshot: a
      });
      let u, f;
      if (c) if ((0, nt.isManifestProvider)(c)) {
        const d = nt.isBrowserEnvValue ? c.remoteEntry : c.ssrRemoteEntry || c.remoteEntry || "", h = await this.getManifestJson(d, e, {}), m = U.setGlobalSnapshotInfoByModuleInfo({
          ...e,
          entry: d
        }, h);
        u = h, f = m;
      } else {
        const { remoteSnapshot: d } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
          options: this.HostInstance.options,
          moduleInfo: e,
          remoteSnapshot: c,
          from: "global"
        });
        u = d, f = l;
      }
      else if (Di.isRemoteInfoWithEntry(e)) {
        const d = await this.getManifestJson(e.entry, e, {}), h = U.setGlobalSnapshotInfoByModuleInfo(e, d), { remoteSnapshot: m } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
          options: this.HostInstance.options,
          moduleInfo: e,
          remoteSnapshot: d,
          from: "global"
        });
        u = m, f = h;
      } else tt.error(Fe.RUNTIME_007, Fe.runtimeDescMap, {
        remoteName: e.name,
        remoteVersion: e.version,
        hostName: this.HostInstance.options.name,
        globalSnapshot: JSON.stringify(l)
      }, void 0, Vt.optionsToMFContext(this.HostInstance.options));
      return await this.hooks.lifecycle.afterLoadSnapshot.emit({
        id: t,
        host: this.HostInstance,
        options: n,
        moduleInfo: e,
        remoteSnapshot: u
      }), {
        remoteSnapshot: u,
        globalSnapshot: f
      };
    }
    getGlobalRemoteInfo(e) {
      return en(e, this.HostInstance);
    }
    async getManifestJson(e, t, r) {
      const n = async () => {
        let s = this.manifestCache.get(e);
        if (s) return s;
        try {
          let i = await this.loaderHook.lifecycle.fetch.emit(e, {}, Hi.getRemoteInfo(t));
          (!i || !(i instanceof Response)) && (i = await fetch(e, {})), s = await i.json();
        } catch (i) {
          s = await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
            id: e,
            error: i,
            from: "runtime",
            lifecycle: "afterResolve",
            origin: this.HostInstance
          }), s || (delete this.manifestLoading[e], tt.error(Fe.RUNTIME_003, Fe.runtimeDescMap, {
            manifestUrl: e,
            moduleName: t.name,
            hostName: this.HostInstance.options.name
          }, `${i}`, Vt.optionsToMFContext(this.HostInstance.options)));
        }
        return tt.assert(s.metaData && s.exposes && s.shared, `"${e}" is not a valid federation manifest for remote "${t.name}". Missing required fields: ${[
          !s.metaData && "metaData",
          !s.exposes && "exposes",
          !s.shared && "shared"
        ].filter(Boolean).join(", ")}.`), this.manifestCache.set(e, s), s;
      }, o = async () => {
        const s = await n(), i = (0, nt.generateSnapshotFromManifest)(s, {
          version: e
        }), { remoteSnapshot: a } = await this.hooks.lifecycle.loadRemoteSnapshot.emit({
          options: this.HostInstance.options,
          moduleInfo: t,
          manifestJson: s,
          remoteSnapshot: i,
          manifestUrl: e,
          from: "manifest"
        });
        return a;
      };
      return this.manifestLoading[e] || (this.manifestLoading[e] = o().then((s) => s)), this.manifestLoading[e];
    }
  };
  Xe.SnapshotHandler = Ui;
  Xe.getGlobalRemoteInfo = en;
  var tn = {};
  const ot = I, Gi = ne, P = C, jt = Pe, Wi = ve, st = me, xt = Ae, Bi = Oe;
  let pe = K;
  var Vi = class {
    constructor(e) {
      this.hooks = new Bi.PluginSystem({
        beforeRegisterShare: new st.SyncWaterfallHook("beforeRegisterShare"),
        afterResolve: new xt.AsyncWaterfallHook("afterResolve"),
        beforeLoadShare: new xt.AsyncWaterfallHook("beforeLoadShare"),
        loadShare: new Wi.AsyncHook(),
        resolveShare: new st.SyncWaterfallHook("resolveShare"),
        initContainerShareScopeMap: new st.SyncWaterfallHook("initContainerShareScopeMap")
      }), this.host = e, this.shareScopeMap = {}, this.initTokens = {}, this._setGlobalShareScopeMap(e.options);
    }
    registerShared(e, t) {
      const { newShareInfos: r, allShareInfos: n } = P.formatShareConfigs(e, t);
      return Object.keys(r).forEach((o) => {
        r[o].forEach((s) => {
          s.scope.forEach((i) => {
            var _a2;
            this.hooks.lifecycle.beforeRegisterShare.emit({
              origin: this.host,
              pkgName: o,
              shared: s
            }), ((_a2 = this.shareScopeMap[i]) == null ? void 0 : _a2[o]) || this.setShared({
              pkgName: o,
              lib: s.lib,
              get: s.get,
              loaded: s.loaded || !!s.lib,
              shared: s,
              from: t.name
            });
          });
        });
      }), {
        newShareInfos: r,
        allShareInfos: n
      };
    }
    async loadShare(e, t) {
      const { host: r } = this, n = P.getTargetSharedOptions({
        pkgName: e,
        extraOptions: t,
        shareInfos: r.options.shared
      });
      (n == null ? void 0 : n.scope) && await Promise.all(n.scope.map(async (a) => {
        await Promise.all(this.initializeSharing(a, {
          strategy: n.strategy
        }));
      }));
      const { shareInfo: o } = await this.hooks.lifecycle.beforeLoadShare.emit({
        pkgName: e,
        shareInfo: n,
        shared: r.options.shared,
        origin: r
      });
      ot.assert(o, `Cannot find shared "${e}" in host "${r.options.name}". Ensure the shared config for "${e}" is declared in the federation plugin options and the host has been initialized before loading shares.`);
      const { shared: s, useTreesShaking: i } = P.getRegisteredShare(this.shareScopeMap, e, o, this.hooks.lifecycle.resolveShare) || {};
      if (s) {
        const a = P.directShare(s, i);
        if (a.lib) return P.addUseIn(a, r.options.name), a.lib;
        if (a.loading && !a.loaded) {
          const c = await a.loading;
          return a.loaded = true, a.lib || (a.lib = c), P.addUseIn(a, r.options.name), c;
        } else {
          const l = (async () => {
            const u = await a.get();
            return P.addUseIn(a, r.options.name), a.loaded = true, a.lib = u, u;
          })();
          return this.setShared({
            pkgName: e,
            loaded: false,
            shared: s,
            from: r.options.name,
            lib: null,
            loading: l,
            treeShaking: i ? a : void 0
          }), l;
        }
      } else {
        if (t == null ? void 0 : t.customShareInfo) return false;
        const a = P.shouldUseTreeShaking(o.treeShaking), c = P.directShare(o, a), u = (async () => {
          const f = await c.get();
          c.lib = f, c.loaded = true, P.addUseIn(c, r.options.name);
          const { shared: d, useTreesShaking: h } = P.getRegisteredShare(this.shareScopeMap, e, o, this.hooks.lifecycle.resolveShare) || {};
          if (d) {
            const m = P.directShare(d, h);
            m.lib = f, m.loaded = true, d.from = o.from;
          }
          return f;
        })();
        return this.setShared({
          pkgName: e,
          loaded: false,
          shared: o,
          from: r.options.name,
          lib: null,
          loading: u,
          treeShaking: a ? c : void 0
        }), u;
      }
    }
    initializeSharing(e = Gi.DEFAULT_SCOPE, t) {
      const { host: r } = this, n = t == null ? void 0 : t.from, o = t == null ? void 0 : t.strategy;
      let s = t == null ? void 0 : t.initScope;
      const i = [];
      if (n !== "build") {
        const { initTokens: d } = this;
        s || (s = []);
        let h = d[e];
        if (h || (h = d[e] = {
          from: this.host.name
        }), s.indexOf(h) >= 0) return i;
        s.push(h);
      }
      const a = this.shareScopeMap, c = r.options.name;
      a[e] || (a[e] = {});
      const l = a[e], u = (d, h) => {
        var _a2;
        const { version: m, eager: _ } = h;
        l[d] = l[d] || {};
        const E = l[d], g = E[m] && P.directShare(E[m]), p = !!(g && ("eager" in g && g.eager || "shareConfig" in g && ((_a2 = g.shareConfig) == null ? void 0 : _a2.eager)));
        (!g || g.strategy !== "loaded-first" && !g.loaded && (!_ != !p ? _ : c > E[m].from)) && (E[m] = h);
      }, f = async (d) => {
        const { module: h } = await r.remoteHandler.getRemoteModuleAndOptions({
          id: d
        });
        let m;
        try {
          m = await h.getEntry();
        } catch (_) {
          if (m = await r.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
            id: d,
            error: _,
            from: "runtime",
            lifecycle: "beforeLoadShare",
            origin: r
          }), !m) return;
        } finally {
          (m == null ? void 0 : m.init) && !h.initing && (h.remoteEntryExports = m, await h.init(void 0, void 0, s));
        }
      };
      return Object.keys(r.options.shared).forEach((d) => {
        r.options.shared[d].forEach((h) => {
          h.scope.includes(e) && u(d, h);
        });
      }), (r.options.shareStrategy === "version-first" || o === "version-first") && r.options.remotes.forEach((d) => {
        d.shareScope === e && i.push(f(d.name));
      }), i;
    }
    loadShareSync(e, t) {
      const { host: r } = this, n = P.getTargetSharedOptions({
        pkgName: e,
        extraOptions: t,
        shareInfos: r.options.shared
      });
      (n == null ? void 0 : n.scope) && n.scope.forEach((i) => {
        this.initializeSharing(i, {
          strategy: n.strategy
        });
      });
      const { shared: o, useTreesShaking: s } = P.getRegisteredShare(this.shareScopeMap, e, n, this.hooks.lifecycle.resolveShare) || {};
      if (o) {
        if (typeof o.lib == "function") return P.addUseIn(o, r.options.name), o.loaded || (o.loaded = true, o.from === r.options.name && (n.loaded = true)), o.lib;
        if (typeof o.get == "function") {
          const i = o.get();
          if (!(i instanceof Promise)) return P.addUseIn(o, r.options.name), this.setShared({
            pkgName: e,
            loaded: true,
            from: r.options.name,
            lib: i,
            shared: o
          }), i;
        }
      }
      if (n.lib) return n.loaded || (n.loaded = true), n.lib;
      if (n.get) {
        const i = n.get();
        return i instanceof Promise && ot.error((t == null ? void 0 : t.from) === "build" ? pe.RUNTIME_005 : pe.RUNTIME_006, pe.runtimeDescMap, {
          hostName: r.options.name,
          sharedPkgName: e
        }, void 0, jt.optionsToMFContext(r.options)), n.lib = i, this.setShared({
          pkgName: e,
          loaded: true,
          from: r.options.name,
          lib: n.lib,
          shared: n
        }), n.lib;
      }
      ot.error(pe.RUNTIME_006, pe.runtimeDescMap, {
        hostName: r.options.name,
        sharedPkgName: e
      }, void 0, jt.optionsToMFContext(r.options));
    }
    initShareScopeMap(e, t, r = {}) {
      const { host: n } = this;
      this.shareScopeMap[e] = t, this.hooks.lifecycle.initContainerShareScopeMap.emit({
        shareScope: t,
        options: n.options,
        origin: n,
        scopeName: e,
        hostShareScopeMap: r.hostShareScopeMap
      });
    }
    setShared({ pkgName: e, shared: t, from: r, lib: n, loading: o, loaded: s, get: i, treeShaking: a }) {
      const { version: c, scope: l = "default", ...u } = t, f = Array.isArray(l) ? l : [
        l
      ], d = (h) => {
        const m = (E, g, p) => {
          p && !E[g] && (E[g] = p);
        }, _ = a ? h.treeShaking : h;
        m(_, "loaded", s), m(_, "loading", o), m(_, "get", i);
      };
      f.forEach((h) => {
        this.shareScopeMap[h] || (this.shareScopeMap[h] = {}), this.shareScopeMap[h][e] || (this.shareScopeMap[h][e] = {}), this.shareScopeMap[h][e][c] || (this.shareScopeMap[h][e][c] = {
          version: c,
          scope: [
            h
          ],
          ...u,
          lib: n
        });
        const m = this.shareScopeMap[h][e][c];
        d(m), r && m.from !== r && (m.from = r);
      });
    }
    _setGlobalShareScopeMap(e) {
      const t = P.getGlobalShareScope(), r = e.id || e.name;
      r && !t[r] && (t[r] = this.shareScopeMap);
    }
  };
  tn.SharedHandler = Vi;
  var rn = {};
  const we = I, q = S, Xt = ne, ji = C, xi = de, it = j, Xi = Pe, Kt = J, Ki = je, Yi = he, se = ve, Yt = me, zi = Ae, Ji = Oe, Zi = Xe;
  let at = L, zt = K;
  var Qi = class {
    constructor(e) {
      this.hooks = new Ji.PluginSystem({
        beforeRegisterRemote: new Yt.SyncWaterfallHook("beforeRegisterRemote"),
        registerRemote: new Yt.SyncWaterfallHook("registerRemote"),
        beforeRequest: new zi.AsyncWaterfallHook("beforeRequest"),
        onLoad: new se.AsyncHook("onLoad"),
        handlePreloadModule: new Yi.SyncHook("handlePreloadModule"),
        errorLoadRemote: new se.AsyncHook("errorLoadRemote"),
        beforePreloadRemote: new se.AsyncHook("beforePreloadRemote"),
        generatePreloadAssets: new se.AsyncHook("generatePreloadAssets"),
        afterPreloadRemote: new se.AsyncHook(),
        loadEntry: new se.AsyncHook()
      }), this.host = e, this.idToRemoteMap = {};
    }
    formatAndRegisterRemote(e, t) {
      return (t.remotes || []).reduce((r, n) => (this.registerRemote(n, r, {
        force: false
      }), r), e.remotes);
    }
    setIdToRemoteMap(e, t) {
      const { remote: r, expose: n } = t, { name: o, alias: s } = r;
      if (this.idToRemoteMap[e] = {
        name: r.name,
        expose: n
      }, s && e.startsWith(o)) {
        const i = e.replace(o, s);
        this.idToRemoteMap[i] = {
          name: r.name,
          expose: n
        };
        return;
      }
      if (s && e.startsWith(s)) {
        const i = e.replace(s, o);
        this.idToRemoteMap[i] = {
          name: r.name,
          expose: n
        };
      }
    }
    async loadRemote(e, t) {
      const { host: r } = this;
      try {
        const { loadFactory: n = true } = t || {
          loadFactory: true
        }, { module: o, moduleOptions: s, remoteMatchInfo: i } = await this.getRemoteModuleAndOptions({
          id: e
        }), { pkgNameOrAlias: a, remote: c, expose: l, id: u, remoteSnapshot: f } = i, d = await o.get(u, l, t, f), h = await this.hooks.lifecycle.onLoad.emit({
          id: u,
          pkgNameOrAlias: a,
          expose: l,
          exposeModule: n ? d : void 0,
          exposeModuleFactory: n ? void 0 : d,
          remote: c,
          options: s,
          moduleInstance: o,
          origin: r
        });
        return this.setIdToRemoteMap(e, i), typeof h == "function" ? h : d;
      } catch (n) {
        const { from: o = "runtime" } = t || {
          from: "runtime"
        }, s = await this.hooks.lifecycle.errorLoadRemote.emit({
          id: e,
          error: n,
          from: o,
          lifecycle: "onLoad",
          origin: r
        });
        if (!s) throw n;
        return s;
      }
    }
    async preloadRemote(e) {
      const { host: t } = this;
      await this.hooks.lifecycle.beforePreloadRemote.emit({
        preloadOps: e,
        options: t.options,
        origin: t
      });
      const r = Kt.formatPreloadArgs(t.options.remotes, e);
      await Promise.all(r.map(async (n) => {
        const { remote: o } = n, s = it.getRemoteInfo(o), { globalSnapshot: i, remoteSnapshot: a } = await t.snapshotHandler.loadRemoteSnapshotInfo({
          moduleInfo: o
        }), c = await this.hooks.lifecycle.generatePreloadAssets.emit({
          origin: t,
          preloadOptions: n,
          remote: o,
          remoteInfo: s,
          globalSnapshot: i,
          remoteSnapshot: a
        });
        c && Kt.preloadAssets(s, t, c);
      }));
    }
    registerRemotes(e, t) {
      const { host: r } = this;
      e.forEach((n) => {
        this.registerRemote(n, r.options.remotes, {
          force: t == null ? void 0 : t.force
        });
      });
    }
    async getRemoteModuleAndOptions(e) {
      const { host: t } = this, { id: r } = e;
      let n;
      try {
        n = await this.hooks.lifecycle.beforeRequest.emit({
          id: r,
          options: t.options,
          origin: t
        });
      } catch (h) {
        if (n = await this.hooks.lifecycle.errorLoadRemote.emit({
          id: r,
          options: t.options,
          origin: t,
          from: "runtime",
          error: h,
          lifecycle: "beforeRequest"
        }), !n) throw h;
      }
      const { id: o } = n, s = xi.matchRemoteWithNameAndExpose(t.options.remotes, o);
      s || we.error(zt.RUNTIME_004, zt.runtimeDescMap, {
        hostName: t.options.name,
        requestId: o
      }, void 0, Xi.optionsToMFContext(t.options));
      const { remote: i } = s, a = it.getRemoteInfo(i), c = await t.sharedHandler.hooks.lifecycle.afterResolve.emit({
        id: o,
        ...s,
        options: t.options,
        origin: t,
        remoteInfo: a
      }), { remote: l, expose: u } = c;
      we.assert(l && u, `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${o}.`);
      let f = t.moduleCache.get(l.name);
      const d = {
        host: t,
        remoteInfo: a
      };
      return f || (f = new Ki.Module(d), t.moduleCache.set(l.name, f)), {
        module: f,
        moduleOptions: d,
        remoteMatchInfo: c
      };
    }
    registerRemote(e, t, r) {
      const { host: n } = this, o = () => {
        if (e.alias) {
          const i = t.find((a) => {
            var _a2;
            return e.alias && (a.name.startsWith(e.alias) || ((_a2 = a.alias) == null ? void 0 : _a2.startsWith(e.alias)));
          });
          we.assert(!i, `The alias ${e.alias} of remote ${e.name} is not allowed to be the prefix of ${i && i.name} name or alias`);
        }
        "entry" in e && at.isBrowserEnvValue && typeof window < "u" && !e.entry.startsWith("http") && (e.entry = new URL(e.entry, window.location.origin).href), e.shareScope || (e.shareScope = Xt.DEFAULT_SCOPE), e.type || (e.type = Xt.DEFAULT_REMOTE_TYPE);
      };
      this.hooks.lifecycle.beforeRegisterRemote.emit({
        remote: e,
        origin: n
      });
      const s = t.find((i) => i.name === e.name);
      if (!s) o(), t.push(e), this.hooks.lifecycle.registerRemote.emit({
        remote: e,
        origin: n
      });
      else {
        const i = [
          `The remote "${e.name}" is already registered.`,
          "Please note that overriding it may cause unexpected errors."
        ];
        (r == null ? void 0 : r.force) && (this.removeRemote(s), o(), t.push(e), this.hooks.lifecycle.registerRemote.emit({
          remote: e,
          origin: n
        }), (0, at.warn)(i.join(" ")));
      }
    }
    removeRemote(e) {
      var _a2;
      try {
        const { host: t } = this, { name: r } = e, n = t.options.remotes.findIndex((s) => s.name === r);
        n !== -1 && t.options.remotes.splice(n, 1);
        const o = t.moduleCache.get(e.name);
        if (o) {
          const s = o.remoteInfo, i = s.entryGlobalName;
          q.CurrentGlobal[i] && (((_a2 = Object.getOwnPropertyDescriptor(q.CurrentGlobal, i)) == null ? void 0 : _a2.configurable) ? delete q.CurrentGlobal[i] : q.CurrentGlobal[i] = void 0);
          const a = it.getRemoteEntryUniqueKey(o.remoteInfo);
          q.globalLoading[a] && delete q.globalLoading[a], t.snapshotHandler.manifestCache.delete(s.entry);
          let c = s.buildVersion ? (0, at.composeKeyWithSeparator)(s.name, s.buildVersion) : s.name;
          const l = q.CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((f) => s.buildVersion ? f.options.id === c : f.name === c);
          if (l !== -1) {
            const f = q.CurrentGlobal.__FEDERATION__.__INSTANCES__[l];
            c = f.options.id || c;
            const d = ji.getGlobalShareScope();
            let h = true;
            const m = [];
            Object.keys(d).forEach((_) => {
              const E = d[_];
              E && Object.keys(E).forEach((g) => {
                const p = E[g];
                p && Object.keys(p).forEach((M) => {
                  const k = p[M];
                  k && Object.keys(k).forEach((A) => {
                    const T = k[A];
                    T && typeof T == "object" && T.from === s.name && (T.loaded || T.loading ? (T.useIn = T.useIn.filter((w) => w !== s.name), T.useIn.length ? h = false : m.push([
                      _,
                      g,
                      M,
                      A
                    ])) : m.push([
                      _,
                      g,
                      M,
                      A
                    ]));
                  });
                });
              });
            }), h && (f.shareScopeMap = {}, delete d[c]), m.forEach(([_, E, g, p]) => {
              var _a3, _b, _c;
              (_c = (_b = (_a3 = d[_]) == null ? void 0 : _a3[E]) == null ? void 0 : _b[g]) == null ? true : delete _c[p];
            }), q.CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(l, 1);
          }
          const { hostGlobalSnapshot: u } = Zi.getGlobalRemoteInfo(e, t);
          if (u) {
            const f = u && "remotesInfo" in u && u.remotesInfo && q.getInfoWithoutType(u.remotesInfo, e.name).key;
            f && (delete u.remotesInfo[f], q.Global.__FEDERATION__.__MANIFEST_LOADING__[f] && delete q.Global.__FEDERATION__.__MANIFEST_LOADING__[f]);
          }
          t.moduleCache.delete(e.name);
        }
      } catch (t) {
        we.logger.error(`removeRemote failed: ${t instanceof Error ? t.message : String(t)}`);
      }
    }
  };
  rn.RemoteHandler = Qi;
  const ea = I, ta = ne, ra = C, na = Vr, oa = jr, sa = j, ia = je, Y = he, lt = ve, aa = me, Jt = Ae, ct = Oe, la = xe, ca = Zr, ua = Xe, fa = tn, da = rn;
  let ha = L, ut = K;
  const ma = typeof FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN == "boolean" ? !FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN : true;
  var _a = class {
    constructor(e) {
      this.hooks = new ct.PluginSystem({
        beforeInit: new aa.SyncWaterfallHook("beforeInit"),
        init: new Y.SyncHook(),
        beforeInitContainer: new Jt.AsyncWaterfallHook("beforeInitContainer"),
        initContainer: new Jt.AsyncWaterfallHook("initContainer")
      }), this.version = "2.3.3", this.moduleCache = /* @__PURE__ */ new Map(), this.loaderHook = new ct.PluginSystem({
        getModuleInfo: new Y.SyncHook(),
        createScript: new Y.SyncHook(),
        createLink: new Y.SyncHook(),
        fetch: new lt.AsyncHook(),
        loadEntryError: new lt.AsyncHook(),
        getModuleFactory: new lt.AsyncHook()
      }), this.bridgeHook = new ct.PluginSystem({
        beforeBridgeRender: new Y.SyncHook(),
        afterBridgeRender: new Y.SyncHook(),
        beforeBridgeDestroy: new Y.SyncHook(),
        afterBridgeDestroy: new Y.SyncHook()
      });
      const t = ma ? [
        la.snapshotPlugin(),
        ca.generatePreloadAssetsPlugin()
      ] : [], r = {
        id: na.getBuilderId(),
        name: e.name,
        plugins: t,
        remotes: [],
        shared: {},
        inBrowser: ha.isBrowserEnvValue
      };
      this.name = e.name, this.options = r, this.snapshotHandler = new ua.SnapshotHandler(this), this.sharedHandler = new fa.SharedHandler(this), this.remoteHandler = new da.RemoteHandler(this), this.shareScopeMap = this.sharedHandler.shareScopeMap, this.registerPlugins([
        ...r.plugins,
        ...e.plugins || []
      ]), this.options = this.formatOptions(r, e);
    }
    initOptions(e) {
      e.name && e.name !== this.options.name && ea.error((0, ut.getShortErrorMsg)(ut.RUNTIME_010, ut.runtimeDescMap)), this.registerPlugins(e.plugins);
      const t = this.formatOptions(this.options, e);
      return this.options = t, t;
    }
    async loadShare(e, t) {
      return this.sharedHandler.loadShare(e, t);
    }
    loadShareSync(e, t) {
      return this.sharedHandler.loadShareSync(e, t);
    }
    initializeSharing(e = ta.DEFAULT_SCOPE, t) {
      return this.sharedHandler.initializeSharing(e, t);
    }
    initRawContainer(e, t, r) {
      const n = sa.getRemoteInfo({
        name: e,
        entry: t
      }), o = new ia.Module({
        host: this,
        remoteInfo: n
      });
      return o.remoteEntryExports = r, this.moduleCache.set(e, o), o;
    }
    async loadRemote(e, t) {
      return this.remoteHandler.loadRemote(e, t);
    }
    async preloadRemote(e) {
      return this.remoteHandler.preloadRemote(e);
    }
    initShareScopeMap(e, t, r = {}) {
      this.sharedHandler.initShareScopeMap(e, t, r);
    }
    formatOptions(e, t) {
      const { allShareInfos: r } = ra.formatShareConfigs(e, t), { userOptions: n, options: o } = this.hooks.lifecycle.beforeInit.emit({
        origin: this,
        userOptions: t,
        options: e,
        shareInfo: r
      }), s = this.remoteHandler.formatAndRegisterRemote(o, n), { allShareInfos: i } = this.sharedHandler.registerShared(o, n), a = [
        ...o.plugins
      ];
      n.plugins && n.plugins.forEach((l) => {
        a.includes(l) || a.push(l);
      });
      const c = {
        ...e,
        ...t,
        plugins: a,
        remotes: s,
        shared: i
      };
      return this.hooks.lifecycle.init.emit({
        origin: this,
        options: c
      }), c;
    }
    registerPlugins(e) {
      const t = oa.registerPlugins(e, this);
      this.options.plugins = this.options.plugins.reduce((r, n) => (n && r && !r.find((o) => o.name === n.name) && r.push(n), r), t || []);
    }
    registerRemotes(e, t) {
      return this.remoteHandler.registerRemotes(e, t);
    }
    registerShared(e) {
      this.sharedHandler.registerShared(this.options, {
        ...this.options,
        shared: e
      });
    }
  };
  Kr.ModuleFederation = _a;
  var nn = {}, on = {}, Zt = Object.defineProperty, pa = (e, t) => {
    let r = {};
    for (var n in e) Zt(r, n, {
      get: e[n],
      enumerable: true
    });
    return t || Zt(r, Symbol.toStringTag, {
      value: "Module"
    }), r;
  };
  on.__exportAll = pa;
  (function(e) {
    var r = on.__exportAll({});
    Object.defineProperty(e, "type_exports", {
      enumerable: true,
      get: function() {
        return r;
      }
    });
  })(nn);
  (function(e) {
    Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    });
    const t = I, r = R, n = S, o = Pt, s = C, i = de, a = j, c = xr, l = je, u = Kr, f = nn;
    let d = L;
    const h = c.default;
    e.CurrentGlobal = n.CurrentGlobal, e.Global = n.Global, e.Module = l.Module, e.ModuleFederation = u.ModuleFederation, e.addGlobalSnapshot = n.addGlobalSnapshot, e.assert = t.assert, e.error = t.error, e.getGlobalFederationConstructor = n.getGlobalFederationConstructor, e.getGlobalSnapshot = n.getGlobalSnapshot, e.getInfoWithoutType = n.getInfoWithoutType, e.getRegisteredShare = s.getRegisteredShare, e.getRemoteEntry = a.getRemoteEntry, e.getRemoteInfo = a.getRemoteInfo, e.helpers = h, e.isStaticResourcesEqual = r.isStaticResourcesEqual, Object.defineProperty(e, "loadScript", {
      enumerable: true,
      get: function() {
        return d.loadScript;
      }
    }), Object.defineProperty(e, "loadScriptNode", {
      enumerable: true,
      get: function() {
        return d.loadScriptNode;
      }
    }), e.matchRemoteWithNameAndExpose = i.matchRemoteWithNameAndExpose, e.registerGlobalPlugins = n.registerGlobalPlugins, e.resetFederationGlobalInfo = n.resetFederationGlobalInfo, e.safeWrapper = r.safeWrapper, e.satisfy = o.satisfy, e.setGlobalFederationConstructor = n.setGlobalFederationConstructor, e.setGlobalFederationInstance = n.setGlobalFederationInstance, Object.defineProperty(e, "types", {
      enumerable: true,
      get: function() {
        return f.type_exports;
      }
    });
  })(Rt);
  let ga = Rt;
  function Ea() {
    return typeof FEDERATION_BUILD_IDENTIFIER < "u" ? FEDERATION_BUILD_IDENTIFIER : "";
  }
  function ya(e, t) {
    const r = Ea();
    return ga.CurrentGlobal.__FEDERATION__.__INSTANCES__.find((n) => !!(r && n.options.id === r || n.options.name === e && !n.options.version && !t || n.options.name === e && t && n.options.version === t));
  }
  ir.getGlobalFederationInstance = ya;
  (function(e) {
    Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    });
    const t = ir;
    let r = Rt, n = K;
    function o(_) {
      const E = new ((0, r.getGlobalFederationConstructor)() || r.ModuleFederation)(_);
      return (0, r.setGlobalFederationInstance)(E), E;
    }
    let s = null;
    function i(_) {
      const E = t.getGlobalFederationInstance(_.name, _.version);
      return E ? (E.initOptions(_), s || (s = E), E) : (s = o(_), s);
    }
    function a(..._) {
      return (0, r.assert)(s, n.RUNTIME_009, n.runtimeDescMap), s.loadRemote.apply(s, _);
    }
    function c(..._) {
      return (0, r.assert)(s, n.RUNTIME_009, n.runtimeDescMap), s.loadShare.apply(s, _);
    }
    function l(..._) {
      return (0, r.assert)(s, n.RUNTIME_009, n.runtimeDescMap), s.loadShareSync.apply(s, _);
    }
    function u(..._) {
      return (0, r.assert)(s, n.RUNTIME_009, n.runtimeDescMap), s.preloadRemote.apply(s, _);
    }
    function f(..._) {
      return (0, r.assert)(s, n.RUNTIME_009, n.runtimeDescMap), s.registerRemotes.apply(s, _);
    }
    function d(..._) {
      return (0, r.assert)(s, n.RUNTIME_009, n.runtimeDescMap), s.registerPlugins.apply(s, _);
    }
    function h() {
      return s;
    }
    function m(..._) {
      return (0, r.assert)(s, n.RUNTIME_009, n.runtimeDescMap), s.registerShared.apply(s, _);
    }
    (0, r.setGlobalFederationConstructor)(r.ModuleFederation), Object.defineProperty(e, "Module", {
      enumerable: true,
      get: function() {
        return r.Module;
      }
    }), e.ModuleFederation = r.ModuleFederation, e.createInstance = o, e.getInstance = h, Object.defineProperty(e, "getRemoteEntry", {
      enumerable: true,
      get: function() {
        return r.getRemoteEntry;
      }
    }), Object.defineProperty(e, "getRemoteInfo", {
      enumerable: true,
      get: function() {
        return r.getRemoteInfo;
      }
    }), e.init = i, e.loadRemote = a, Object.defineProperty(e, "loadScript", {
      enumerable: true,
      get: function() {
        return r.loadScript;
      }
    }), Object.defineProperty(e, "loadScriptNode", {
      enumerable: true,
      get: function() {
        return r.loadScriptNode;
      }
    }), e.loadShare = c, e.loadShareSync = l, e.preloadRemote = u, Object.defineProperty(e, "registerGlobalPlugins", {
      enumerable: true,
      get: function() {
        return r.registerGlobalPlugins;
      }
    }), e.registerPlugins = d, e.registerRemotes = f, e.registerShared = m;
  })(sr);
  typeof __VUE_HMR_RUNTIME__ > "u" && (globalThis.__VUE_HMR_RUNTIME__ = {
    createRecord() {
    },
    rerender() {
    },
    reload() {
    }
  });
  const sn = "__mf_init____mf__virtual/__mfe_internal__vis2CameraWidgets__mf_v__runtimeInit__mf_v__.js__";
  let bt = globalThis[sn];
  if (!bt) {
    let e, t;
    const r = new Promise((n, o) => {
      e = n, t = o;
    });
    bt = globalThis[sn] = {
      initPromise: r,
      initResolve: e,
      initReject: t
    }, typeof window > "u" && e({
      loadRemote: function() {
        return Promise.resolve(void 0);
      },
      loadShare: function() {
        return Promise.resolve(void 0);
      }
    });
  }
  const Sa = bt.initResolve, Qt = {}, er = "default", tr = "__mfe_internal__vis2CameraWidgets";
  let rr, nr;
  async function ba() {
    return rr ?? (rr = or(() => import("./assets/localSharedImportMap-_97mKR4M.js").then(async (m) => {
      await m.__tla;
      return m;
    }), [], import.meta.url)), rr;
  }
  async function Ra() {
    return nr ?? (nr = or(() => import("./assets/virtualExposes-DRrTk0Va.js").then(async (m) => {
      await m.__tla;
      return m;
    }), [], import.meta.url).then((e) => e.default ?? e)), nr;
  }
  Ia = async function(e = {}, t = []) {
    const { usedShared: r, usedRemotes: n } = await ba(), o = sr.init({
      name: tr,
      remotes: n,
      shared: r,
      plugins: [],
      shareStrategy: "version-first"
    });
    var s = Qt[er];
    if (s || (s = Qt[er] = {
      from: tr
    }), !(t.indexOf(s) >= 0)) {
      t.push(s), o.initShareScopeMap("default", e), Sa(o);
      try {
        await Promise.all(await o.initializeSharing("default", {
          strategy: "version-first",
          from: "build",
          initScope: t
        }));
      } catch (i) {
        console.error("[Module Federation]", i);
      }
      return o;
    }
  };
  Na = async function(e) {
    const t = await Ra();
    if (!(e in t)) throw new Error(`[Module Federation] Module ${e} does not exist in container.`);
    return t[e]().then((r) => () => r);
  };
})();
export {
  __tla,
  Na as get,
  Ia as init
};
