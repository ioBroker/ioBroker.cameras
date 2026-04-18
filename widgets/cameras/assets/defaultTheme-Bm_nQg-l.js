import { v as V, a as kt, __tla as __tla_0 } from "./vis2CameraWidgets__loadShare__react__loadShare__-DWj90Mgy.js";
import { __tla as __tla_1 } from "./vis2CameraWidgets__loadShare__prop_mf_2_types__loadShare__-B_JDuqzl.js";
let sa, ni, ke, ei, sr, ri, dn, ie, si, Za, Ea, Ua, _a, Da, At, $t, da, Xe, oa, Cr, on, ja, oi, Fa, ne, Ia, fa, dt, ua, cr, ka, za, at, ii, Ka, Wr, Ur, Xt, nn, ce, Qa, Se, fe, ti, pr, er, Qr, Yr, ae, le, rt, nt, me, se, ir, oe, tn, ia, Ja, re, an, ai, St, K;
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
  Se = {
    black: "#000",
    white: "#fff"
  };
  oe = {
    50: "#ffebee",
    100: "#ffcdd2",
    200: "#ef9a9a",
    300: "#e57373",
    400: "#ef5350",
    500: "#f44336",
    600: "#e53935",
    700: "#d32f2f",
    800: "#c62828",
    900: "#b71c1c",
    A100: "#ff8a80",
    A200: "#ff5252",
    A400: "#ff1744",
    A700: "#d50000"
  };
  se = {
    50: "#f3e5f5",
    100: "#e1bee7",
    200: "#ce93d8",
    300: "#ba68c8",
    400: "#ab47bc",
    500: "#9c27b0",
    600: "#8e24aa",
    700: "#7b1fa2",
    800: "#6a1b9a",
    900: "#4a148c",
    A100: "#ea80fc",
    A200: "#e040fb",
    A400: "#d500f9",
    A700: "#aa00ff"
  };
  ce = {
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#2196f3",
    600: "#1e88e5",
    700: "#1976d2",
    800: "#1565c0",
    900: "#0d47a1",
    A100: "#82b1ff",
    A200: "#448aff",
    A400: "#2979ff",
    A700: "#2962ff"
  };
  le = {
    50: "#e1f5fe",
    100: "#b3e5fc",
    200: "#81d4fa",
    300: "#4fc3f7",
    400: "#29b6f6",
    500: "#03a9f4",
    600: "#039be5",
    700: "#0288d1",
    800: "#0277bd",
    900: "#01579b",
    A100: "#80d8ff",
    A200: "#40c4ff",
    A400: "#00b0ff",
    A700: "#0091ea"
  };
  fe = {
    50: "#e8f5e9",
    100: "#c8e6c9",
    200: "#a5d6a7",
    300: "#81c784",
    400: "#66bb6a",
    500: "#4caf50",
    600: "#43a047",
    700: "#388e3c",
    800: "#2e7d32",
    900: "#1b5e20",
    A100: "#b9f6ca",
    A200: "#69f0ae",
    A400: "#00e676",
    A700: "#00c853"
  };
  me = {
    50: "#fff3e0",
    100: "#ffe0b2",
    200: "#ffcc80",
    300: "#ffb74d",
    400: "#ffa726",
    500: "#ff9800",
    600: "#fb8c00",
    700: "#f57c00",
    800: "#ef6c00",
    900: "#e65100",
    A100: "#ffd180",
    A200: "#ffab40",
    A400: "#ff9100",
    A700: "#ff6d00"
  };
  pr = {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
    A100: "#f5f5f5",
    A200: "#eeeeee",
    A400: "#bdbdbd",
    A700: "#616161"
  };
  ie = function(e, ...t) {
    const r = new URL(`https://mui.com/production-error/?code=${e}`);
    return t.forEach((n) => r.searchParams.append("args[]", n)), `Minified MUI error #${e}; visit ${r} for the full message.`;
  };
  Za = "$$material";
  function yr(e) {
    if (e.sheet) return e.sheet;
    for (var t = 0; t < document.styleSheets.length; t++) if (document.styleSheets[t].ownerNode === e) return document.styleSheets[t];
  }
  function br(e) {
    var t = document.createElement("style");
    return t.setAttribute("data-emotion", e.key), e.nonce !== void 0 && t.setAttribute("nonce", e.nonce), t.appendChild(document.createTextNode("")), t.setAttribute("data-s", ""), t;
  }
  let N, Ie, A, zt, gt, ht, Sr, Gt, wr, xr, Fe, Ar;
  Cr = (function() {
    function e(r) {
      var n = this;
      this._insertTag = function(a) {
        var o;
        n.tags.length === 0 ? n.insertionPoint ? o = n.insertionPoint.nextSibling : n.prepend ? o = n.container.firstChild : o = n.before : o = n.tags[n.tags.length - 1].nextSibling, n.container.insertBefore(a, o), n.tags.push(a);
      }, this.isSpeedy = r.speedy === void 0 ? true : r.speedy, this.tags = [], this.ctr = 0, this.nonce = r.nonce, this.key = r.key, this.container = r.container, this.prepend = r.prepend, this.insertionPoint = r.insertionPoint, this.before = null;
    }
    var t = e.prototype;
    return t.hydrate = function(n) {
      n.forEach(this._insertTag);
    }, t.insert = function(n) {
      this.ctr % (this.isSpeedy ? 65e3 : 1) === 0 && this._insertTag(br(this));
      var a = this.tags[this.tags.length - 1];
      if (this.isSpeedy) {
        var o = yr(a);
        try {
          o.insertRule(n, o.cssRules.length);
        } catch {
        }
      } else a.appendChild(document.createTextNode(n));
      this.ctr++;
    }, t.flush = function() {
      this.tags.forEach(function(n) {
        var a;
        return (a = n.parentNode) == null ? void 0 : a.removeChild(n);
      }), this.tags = [], this.ctr = 0;
    }, e;
  })();
  N = "-ms-";
  Ie = "-moz-";
  A = "-webkit-";
  zt = "comm";
  gt = "rule";
  ht = "decl";
  Sr = "@import";
  Gt = "@keyframes";
  wr = "@layer";
  xr = Math.abs;
  Fe = String.fromCharCode;
  Ar = Object.assign;
  function $r(e, t) {
    return W(e, 0) ^ 45 ? (((t << 2 ^ W(e, 0)) << 2 ^ W(e, 1)) << 2 ^ W(e, 2)) << 2 ^ W(e, 3) : 0;
  }
  function Ht(e) {
    return e.trim();
  }
  function vr(e, t) {
    return (e = t.exec(e)) ? e[0] : e;
  }
  function $(e, t, r) {
    return e.replace(t, r);
  }
  function ct(e, t) {
    return e.indexOf(t);
  }
  function W(e, t) {
    return e.charCodeAt(t) | 0;
  }
  function we(e, t, r) {
    return e.slice(t, r);
  }
  function Z(e) {
    return e.length;
  }
  function mt(e) {
    return e.length;
  }
  function Te(e, t) {
    return t.push(e), e;
  }
  function kr(e, t) {
    return e.map(t).join("");
  }
  var Me = 1, ge = 1, Yt = 0, z = 0, F = 0, he = "";
  function We(e, t, r, n, a, o, s) {
    return {
      value: e,
      root: t,
      parent: r,
      type: n,
      props: a,
      children: o,
      line: Me,
      column: ge,
      length: s,
      return: ""
    };
  }
  function pe(e, t) {
    return Ar(We("", null, null, "", null, null, 0), e, {
      length: -e.length
    }, t);
  }
  function Tr() {
    return F;
  }
  function Er() {
    return F = z > 0 ? W(he, --z) : 0, ge--, F === 10 && (ge = 1, Me--), F;
  }
  function H() {
    return F = z < Yt ? W(he, z++) : 0, ge++, F === 10 && (ge = 1, Me++), F;
  }
  function ee() {
    return W(he, z);
  }
  function Be() {
    return z;
  }
  function $e(e, t) {
    return we(he, e, t);
  }
  function xe(e) {
    switch (e) {
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
        return 5;
      case 33:
      case 43:
      case 44:
      case 47:
      case 62:
      case 64:
      case 126:
      case 59:
      case 123:
      case 125:
        return 4;
      case 58:
        return 3;
      case 34:
      case 39:
      case 40:
      case 91:
        return 2;
      case 41:
      case 93:
        return 1;
    }
    return 0;
  }
  function Vt(e) {
    return Me = ge = 1, Yt = Z(he = e), z = 0, [];
  }
  function Ut(e) {
    return he = "", e;
  }
  function Pe(e) {
    return Ht($e(z - 1, lt(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
  }
  function Or(e) {
    for (; (F = ee()) && F < 33; ) H();
    return xe(e) > 2 || xe(F) > 3 ? "" : " ";
  }
  function Br(e, t) {
    for (; --t && H() && !(F < 48 || F > 102 || F > 57 && F < 65 || F > 70 && F < 97); ) ;
    return $e(e, Be() + (t < 6 && ee() == 32 && H() == 32));
  }
  function lt(e) {
    for (; H(); ) switch (F) {
      case e:
        return z;
      case 34:
      case 39:
        e !== 34 && e !== 39 && lt(F);
        break;
      case 40:
        e === 41 && lt(e);
        break;
      case 92:
        H();
        break;
    }
    return z;
  }
  function Pr(e, t) {
    for (; H() && e + F !== 57; ) if (e + F === 84 && ee() === 47) break;
    return "/*" + $e(t, z - 1) + "*" + Fe(e === 47 ? e : H());
  }
  function Rr(e) {
    for (; !xe(ee()); ) H();
    return $e(e, z);
  }
  function Ir(e) {
    return Ut(Re("", null, null, null, [
      ""
    ], e = Vt(e), 0, [
      0
    ], e));
  }
  function Re(e, t, r, n, a, o, s, c, f) {
    for (var u = 0, h = 0, g = s, d = 0, b = 0, m = 0, p = 1, v = 1, w = 1, O = 0, S = "", C = a, B = o, M = n, x = S; v; ) switch (m = O, O = H()) {
      case 40:
        if (m != 108 && W(x, g - 1) == 58) {
          ct(x += $(Pe(O), "&", "&\f"), "&\f") != -1 && (w = -1);
          break;
        }
      case 34:
      case 39:
      case 91:
        x += Pe(O);
        break;
      case 9:
      case 10:
      case 13:
      case 32:
        x += Or(m);
        break;
      case 92:
        x += Br(Be() - 1, 7);
        continue;
      case 47:
        switch (ee()) {
          case 42:
          case 47:
            Te(_r(Pr(H(), Be()), t, r), f);
            break;
          default:
            x += "/";
        }
        break;
      case 123 * p:
        c[u++] = Z(x) * w;
      case 125 * p:
      case 59:
      case 0:
        switch (O) {
          case 0:
          case 125:
            v = 0;
          case 59 + h:
            w == -1 && (x = $(x, /\f/g, "")), b > 0 && Z(x) - g && Te(b > 32 ? Et(x + ";", n, r, g - 1) : Et($(x, " ", "") + ";", n, r, g - 2), f);
            break;
          case 59:
            x += ";";
          default:
            if (Te(M = Tt(x, t, r, u, h, a, c, S, C = [], B = [], g), o), O === 123) if (h === 0) Re(x, t, M, M, C, o, g, c, B);
            else switch (d === 99 && W(x, 3) === 110 ? 100 : d) {
              case 100:
              case 108:
              case 109:
              case 115:
                Re(e, M, M, n && Te(Tt(e, M, M, 0, 0, a, c, S, a, C = [], g), B), a, B, g, c, n ? C : B);
                break;
              default:
                Re(x, M, M, M, [
                  ""
                ], B, 0, c, B);
            }
        }
        u = h = b = 0, p = w = 1, S = x = "", g = s;
        break;
      case 58:
        g = 1 + Z(x), b = m;
      default:
        if (p < 1) {
          if (O == 123) --p;
          else if (O == 125 && p++ == 0 && Er() == 125) continue;
        }
        switch (x += Fe(O), O * p) {
          case 38:
            w = h > 0 ? 1 : (x += "\f", -1);
            break;
          case 44:
            c[u++] = (Z(x) - 1) * w, w = 1;
            break;
          case 64:
            ee() === 45 && (x += Pe(H())), d = ee(), h = g = Z(S = x += Rr(Be())), O++;
            break;
          case 45:
            m === 45 && Z(x) == 2 && (p = 0);
        }
    }
    return o;
  }
  function Tt(e, t, r, n, a, o, s, c, f, u, h) {
    for (var g = a - 1, d = a === 0 ? o : [
      ""
    ], b = mt(d), m = 0, p = 0, v = 0; m < n; ++m) for (var w = 0, O = we(e, g + 1, g = xr(p = s[m])), S = e; w < b; ++w) (S = Ht(p > 0 ? d[w] + " " + O : $(O, /&\f/g, d[w]))) && (f[v++] = S);
    return We(e, t, r, a === 0 ? gt : c, f, u, h);
  }
  function _r(e, t, r) {
    return We(e, t, r, zt, Fe(Tr()), we(e, 2, -2), 0);
  }
  function Et(e, t, r, n) {
    return We(e, t, r, ht, we(e, 0, n), we(e, n + 1, -1), n);
  }
  function ue(e, t) {
    for (var r = "", n = mt(e), a = 0; a < n; a++) r += t(e[a], a, e, t) || "";
    return r;
  }
  function Lr(e, t, r, n) {
    switch (e.type) {
      case wr:
        if (e.children.length) break;
      case Sr:
      case ht:
        return e.return = e.return || e.value;
      case zt:
        return "";
      case Gt:
        return e.return = e.value + "{" + ue(e.children, n) + "}";
      case gt:
        e.value = e.props.join(",");
    }
    return Z(r = ue(e.children, n)) ? e.return = e.value + "{" + r + "}" : "";
  }
  function Fr(e) {
    var t = mt(e);
    return function(r, n, a, o) {
      for (var s = "", c = 0; c < t; c++) s += e[c](r, n, a, o) || "";
      return s;
    };
  }
  function Mr(e) {
    return function(t) {
      t.root || (t = t.return) && e(t);
    };
  }
  Wr = function(e) {
    var t = /* @__PURE__ */ Object.create(null);
    return function(r) {
      return t[r] === void 0 && (t[r] = e(r)), t[r];
    };
  };
  var Dr = function(t, r, n) {
    for (var a = 0, o = 0; a = o, o = ee(), a === 38 && o === 12 && (r[n] = 1), !xe(o); ) H();
    return $e(t, z);
  }, Nr = function(t, r) {
    var n = -1, a = 44;
    do
      switch (xe(a)) {
        case 0:
          a === 38 && ee() === 12 && (r[n] = 1), t[n] += Dr(z - 1, r, n);
          break;
        case 2:
          t[n] += Pe(a);
          break;
        case 4:
          if (a === 44) {
            t[++n] = ee() === 58 ? "&\f" : "", r[n] = t[n].length;
            break;
          }
        default:
          t[n] += Fe(a);
      }
    while (a = H());
    return t;
  }, jr = function(t, r) {
    return Ut(Nr(Vt(t), r));
  }, Ot = /* @__PURE__ */ new WeakMap(), Kr = function(t) {
    if (!(t.type !== "rule" || !t.parent || t.length < 1)) {
      for (var r = t.value, n = t.parent, a = t.column === n.column && t.line === n.line; n.type !== "rule"; ) if (n = n.parent, !n) return;
      if (!(t.props.length === 1 && r.charCodeAt(0) !== 58 && !Ot.get(n)) && !a) {
        Ot.set(t, true);
        for (var o = [], s = jr(r, o), c = n.props, f = 0, u = 0; f < s.length; f++) for (var h = 0; h < c.length; h++, u++) t.props[u] = o[f] ? s[f].replace(/&\f/g, c[h]) : c[h] + " " + s[f];
      }
    }
  }, zr = function(t) {
    if (t.type === "decl") {
      var r = t.value;
      r.charCodeAt(0) === 108 && r.charCodeAt(2) === 98 && (t.return = "", t.value = "");
    }
  };
  function Qt(e, t) {
    switch ($r(e, t)) {
      case 5103:
        return A + "print-" + e + e;
      case 5737:
      case 4201:
      case 3177:
      case 3433:
      case 1641:
      case 4457:
      case 2921:
      case 5572:
      case 6356:
      case 5844:
      case 3191:
      case 6645:
      case 3005:
      case 6391:
      case 5879:
      case 5623:
      case 6135:
      case 4599:
      case 4855:
      case 4215:
      case 6389:
      case 5109:
      case 5365:
      case 5621:
      case 3829:
        return A + e + e;
      case 5349:
      case 4246:
      case 4810:
      case 6968:
      case 2756:
        return A + e + Ie + e + N + e + e;
      case 6828:
      case 4268:
        return A + e + N + e + e;
      case 6165:
        return A + e + N + "flex-" + e + e;
      case 5187:
        return A + e + $(e, /(\w+).+(:[^]+)/, A + "box-$1$2" + N + "flex-$1$2") + e;
      case 5443:
        return A + e + N + "flex-item-" + $(e, /flex-|-self/, "") + e;
      case 4675:
        return A + e + N + "flex-line-pack" + $(e, /align-content|flex-|-self/, "") + e;
      case 5548:
        return A + e + N + $(e, "shrink", "negative") + e;
      case 5292:
        return A + e + N + $(e, "basis", "preferred-size") + e;
      case 6060:
        return A + "box-" + $(e, "-grow", "") + A + e + N + $(e, "grow", "positive") + e;
      case 4554:
        return A + $(e, /([^-])(transform)/g, "$1" + A + "$2") + e;
      case 6187:
        return $($($(e, /(zoom-|grab)/, A + "$1"), /(image-set)/, A + "$1"), e, "") + e;
      case 5495:
      case 3959:
        return $(e, /(image-set\([^]*)/, A + "$1$`$1");
      case 4968:
        return $($(e, /(.+:)(flex-)?(.*)/, A + "box-pack:$3" + N + "flex-pack:$3"), /s.+-b[^;]+/, "justify") + A + e + e;
      case 4095:
      case 3583:
      case 4068:
      case 2532:
        return $(e, /(.+)-inline(.+)/, A + "$1$2") + e;
      case 8116:
      case 7059:
      case 5753:
      case 5535:
      case 5445:
      case 5701:
      case 4933:
      case 4677:
      case 5533:
      case 5789:
      case 5021:
      case 4765:
        if (Z(e) - 1 - t > 6) switch (W(e, t + 1)) {
          case 109:
            if (W(e, t + 4) !== 45) break;
          case 102:
            return $(e, /(.+:)(.+)-([^]+)/, "$1" + A + "$2-$3$1" + Ie + (W(e, t + 3) == 108 ? "$3" : "$2-$3")) + e;
          case 115:
            return ~ct(e, "stretch") ? Qt($(e, "stretch", "fill-available"), t) + e : e;
        }
        break;
      case 4949:
        if (W(e, t + 1) !== 115) break;
      case 6444:
        switch (W(e, Z(e) - 3 - (~ct(e, "!important") && 10))) {
          case 107:
            return $(e, ":", ":" + A) + e;
          case 101:
            return $(e, /(.+:)([^;!]+)(;|!.+)?/, "$1" + A + (W(e, 14) === 45 ? "inline-" : "") + "box$3$1" + A + "$2$3$1" + N + "$2box$3") + e;
        }
        break;
      case 5936:
        switch (W(e, t + 11)) {
          case 114:
            return A + e + N + $(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
          case 108:
            return A + e + N + $(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
          case 45:
            return A + e + N + $(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
        }
        return A + e + N + e + e;
    }
    return e;
  }
  let Gr, Hr, Vr;
  Gr = function(t, r, n, a) {
    if (t.length > -1 && !t.return) switch (t.type) {
      case ht:
        t.return = Qt(t.value, t.length);
        break;
      case Gt:
        return ue([
          pe(t, {
            value: $(t.value, "@", "@" + A)
          })
        ], a);
      case gt:
        if (t.length) return kr(t.props, function(o) {
          switch (vr(o, /(::plac\w+|:read-\w+)/)) {
            case ":read-only":
            case ":read-write":
              return ue([
                pe(t, {
                  props: [
                    $(o, /:(read-\w+)/, ":" + Ie + "$1")
                  ]
                })
              ], a);
            case "::placeholder":
              return ue([
                pe(t, {
                  props: [
                    $(o, /:(plac\w+)/, ":" + A + "input-$1")
                  ]
                }),
                pe(t, {
                  props: [
                    $(o, /:(plac\w+)/, ":" + Ie + "$1")
                  ]
                }),
                pe(t, {
                  props: [
                    $(o, /:(plac\w+)/, N + "input-$1")
                  ]
                })
              ], a);
          }
          return "";
        });
    }
  };
  Hr = [
    Gr
  ];
  Yr = function(t) {
    var r = t.key;
    if (r === "css") {
      var n = document.querySelectorAll("style[data-emotion]:not([data-s])");
      Array.prototype.forEach.call(n, function(p) {
        var v = p.getAttribute("data-emotion");
        v.indexOf(" ") !== -1 && (document.head.appendChild(p), p.setAttribute("data-s", ""));
      });
    }
    var a = t.stylisPlugins || Hr, o = {}, s, c = [];
    s = t.container || document.head, Array.prototype.forEach.call(document.querySelectorAll('style[data-emotion^="' + r + ' "]'), function(p) {
      for (var v = p.getAttribute("data-emotion").split(" "), w = 1; w < v.length; w++) o[v[w]] = true;
      c.push(p);
    });
    var f, u = [
      Kr,
      zr
    ];
    {
      var h, g = [
        Lr,
        Mr(function(p) {
          h.insert(p);
        })
      ], d = Fr(u.concat(a, g)), b = function(v) {
        return ue(Ir(v), d);
      };
      f = function(v, w, O, S) {
        h = O, b(v ? v + "{" + w.styles + "}" : w.styles), S && (m.inserted[w.name] = true);
      };
    }
    var m = {
      key: r,
      sheet: new Cr({
        key: r,
        container: s,
        nonce: t.nonce,
        speedy: t.speedy,
        prepend: t.prepend,
        insertionPoint: t.insertionPoint
      }),
      nonce: t.nonce,
      inserted: o,
      registered: {},
      insert: f
    };
    return m.sheet.hydrate(c), m;
  };
  Vr = true;
  Ur = function(e, t, r) {
    var n = "";
    return r.split(" ").forEach(function(a) {
      e[a] !== void 0 ? t.push(e[a] + ";") : a && (n += a + " ");
    }), n;
  };
  Xt = function(t, r, n) {
    var a = t.key + "-" + r.name;
    (n === false || Vr === false) && t.registered[a] === void 0 && (t.registered[a] = r.styles);
  };
  Qr = function(t, r, n) {
    Xt(t, r, n);
    var a = t.key + "-" + r.name;
    if (t.inserted[r.name] === void 0) {
      var o = r;
      do
        t.insert(r === o ? "." + a : "", o, t.sheet, true), o = o.next;
      while (o !== void 0);
    }
  };
  function Xr(e) {
    for (var t = 0, r, n = 0, a = e.length; a >= 4; ++n, a -= 4) r = e.charCodeAt(n) & 255 | (e.charCodeAt(++n) & 255) << 8 | (e.charCodeAt(++n) & 255) << 16 | (e.charCodeAt(++n) & 255) << 24, r = (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16), r ^= r >>> 24, t = (r & 65535) * 1540483477 + ((r >>> 16) * 59797 << 16) ^ (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
    switch (a) {
      case 3:
        t ^= (e.charCodeAt(n + 2) & 255) << 16;
      case 2:
        t ^= (e.charCodeAt(n + 1) & 255) << 8;
      case 1:
        t ^= e.charCodeAt(n) & 255, t = (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
    }
    return t ^= t >>> 13, t = (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16), ((t ^ t >>> 15) >>> 0).toString(36);
  }
  var qr = {
    animationIterationCount: 1,
    aspectRatio: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    msGridRow: 1,
    msGridRowSpan: 1,
    msGridColumn: 1,
    msGridColumnSpan: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    scale: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1
  }, Zr = /[A-Z]|^ms/g, Jr = /_EMO_([^_]+?)_([^]*?)_EMO_/g, qt = function(t) {
    return t.charCodeAt(1) === 45;
  }, Bt = function(t) {
    return t != null && typeof t != "boolean";
  }, it = Wr(function(e) {
    return qt(e) ? e : e.replace(Zr, "-$&").toLowerCase();
  }), Pt = function(t, r) {
    switch (t) {
      case "animation":
      case "animationName":
        if (typeof r == "string") return r.replace(Jr, function(n, a, o) {
          return J = {
            name: a,
            styles: o,
            next: J
          }, a;
        });
    }
    return qr[t] !== 1 && !qt(t) && typeof r == "number" && r !== 0 ? r + "px" : r;
  };
  function Ae(e, t, r) {
    if (r == null) return "";
    var n = r;
    if (n.__emotion_styles !== void 0) return n;
    switch (typeof r) {
      case "boolean":
        return "";
      case "object": {
        var a = r;
        if (a.anim === 1) return J = {
          name: a.name,
          styles: a.styles,
          next: J
        }, a.name;
        var o = r;
        if (o.styles !== void 0) {
          var s = o.next;
          if (s !== void 0) for (; s !== void 0; ) J = {
            name: s.name,
            styles: s.styles,
            next: J
          }, s = s.next;
          var c = o.styles + ";";
          return c;
        }
        return en(e, t, r);
      }
      case "function": {
        if (e !== void 0) {
          var f = J, u = r(e);
          return J = f, Ae(e, t, u);
        }
        break;
      }
    }
    var h = r;
    if (t == null) return h;
    var g = t[h];
    return g !== void 0 ? g : h;
  }
  function en(e, t, r) {
    var n = "";
    if (Array.isArray(r)) for (var a = 0; a < r.length; a++) n += Ae(e, t, r[a]) + ";";
    else for (var o in r) {
      var s = r[o];
      if (typeof s != "object") {
        var c = s;
        t != null && t[c] !== void 0 ? n += o + "{" + t[c] + "}" : Bt(c) && (n += it(o) + ":" + Pt(o, c) + ";");
      } else if (Array.isArray(s) && typeof s[0] == "string" && (t == null || t[s[0]] === void 0)) for (var f = 0; f < s.length; f++) Bt(s[f]) && (n += it(o) + ":" + Pt(o, s[f]) + ";");
      else {
        var u = Ae(e, t, s);
        switch (o) {
          case "animation":
          case "animationName": {
            n += it(o) + ":" + u + ";";
            break;
          }
          default:
            n += o + "{" + u + "}";
        }
      }
    }
    return n;
  }
  var Rt = /label:\s*([^\s;{]+)\s*(;|$)/g, J;
  tn = function(e, t, r) {
    if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0) return e[0];
    var n = true, a = "";
    J = void 0;
    var o = e[0];
    if (o == null || o.raw === void 0) n = false, a += Ae(r, t, o);
    else {
      var s = o;
      a += s[0];
    }
    for (var c = 1; c < e.length; c++) if (a += Ae(r, t, e[c]), n) {
      var f = o;
      a += f[c];
    }
    Rt.lastIndex = 0;
    for (var u = "", h; (h = Rt.exec(a)) !== null; ) u += "-" + h[1];
    var g = Xr(a) + u;
    return {
      name: g,
      styles: a,
      next: J
    };
  };
  let rn, Zt, Jt, ft, sn, cn, tr, E;
  rn = function(t) {
    return t();
  };
  Zt = kt.useInsertionEffect ? kt.useInsertionEffect : false;
  nn = Zt || rn;
  Ja = Zt || V.useLayoutEffect;
  Jt = V.createContext(typeof HTMLElement < "u" ? Yr({
    key: "css"
  }) : null);
  ei = Jt.Provider;
  an = function(t) {
    return V.forwardRef(function(r, n) {
      var a = V.useContext(Jt);
      return t(r, a, n);
    });
  };
  on = V.createContext({});
  er = {}.hasOwnProperty;
  ft = "__EMOTION_TYPE_PLEASE_DO_NOT_USE__";
  ti = function(t, r) {
    var n = {};
    for (var a in r) er.call(r, a) && (n[a] = r[a]);
    return n[ft] = t, n;
  };
  sn = function(t) {
    var r = t.cache, n = t.serialized, a = t.isStringTag;
    return Xt(r, n, a), nn(function() {
      return Qr(r, n, a);
    }), null;
  };
  cn = an(function(e, t, r) {
    var n = e.css;
    typeof n == "string" && t.registered[n] !== void 0 && (n = t.registered[n]);
    var a = e[ft], o = [
      n
    ], s = "";
    typeof e.className == "string" ? s = Ur(t.registered, o, e.className) : e.className != null && (s = e.className + " ");
    var c = tn(o, void 0, V.useContext(on));
    s += t.key + "-" + c.name;
    var f = {};
    for (var u in e) er.call(e, u) && u !== "css" && u !== ft && (f[u] = e[u]);
    return f.className = s, r && (f.ref = r), V.createElement(V.Fragment, null, V.createElement(sn, {
      cache: t,
      serialized: c,
      isStringTag: typeof a == "string"
    }), V.createElement(a, f));
  });
  ri = cn;
  tr = {
    exports: {}
  };
  E = {};
  var pt = /* @__PURE__ */ Symbol.for("react.transitional.element"), yt = /* @__PURE__ */ Symbol.for("react.portal"), De = /* @__PURE__ */ Symbol.for("react.fragment"), Ne = /* @__PURE__ */ Symbol.for("react.strict_mode"), je = /* @__PURE__ */ Symbol.for("react.profiler"), Ke = /* @__PURE__ */ Symbol.for("react.consumer"), ze = /* @__PURE__ */ Symbol.for("react.context"), Ge = /* @__PURE__ */ Symbol.for("react.forward_ref"), He = /* @__PURE__ */ Symbol.for("react.suspense"), Ye = /* @__PURE__ */ Symbol.for("react.suspense_list"), Ve = /* @__PURE__ */ Symbol.for("react.memo"), Ue = /* @__PURE__ */ Symbol.for("react.lazy"), ln = /* @__PURE__ */ Symbol.for("react.view_transition"), fn = /* @__PURE__ */ Symbol.for("react.client.reference");
  function U(e) {
    if (typeof e == "object" && e !== null) {
      var t = e.$$typeof;
      switch (t) {
        case pt:
          switch (e = e.type, e) {
            case De:
            case je:
            case Ne:
            case He:
            case Ye:
            case ln:
              return e;
            default:
              switch (e = e && e.$$typeof, e) {
                case ze:
                case Ge:
                case Ue:
                case Ve:
                  return e;
                case Ke:
                  return e;
                default:
                  return t;
              }
          }
        case yt:
          return t;
      }
    }
  }
  E.ContextConsumer = Ke;
  E.ContextProvider = ze;
  E.Element = pt;
  E.ForwardRef = Ge;
  E.Fragment = De;
  E.Lazy = Ue;
  E.Memo = Ve;
  E.Portal = yt;
  E.Profiler = je;
  E.StrictMode = Ne;
  E.Suspense = He;
  E.SuspenseList = Ye;
  E.isContextConsumer = function(e) {
    return U(e) === Ke;
  };
  E.isContextProvider = function(e) {
    return U(e) === ze;
  };
  E.isElement = function(e) {
    return typeof e == "object" && e !== null && e.$$typeof === pt;
  };
  E.isForwardRef = function(e) {
    return U(e) === Ge;
  };
  E.isFragment = function(e) {
    return U(e) === De;
  };
  E.isLazy = function(e) {
    return U(e) === Ue;
  };
  E.isMemo = function(e) {
    return U(e) === Ve;
  };
  E.isPortal = function(e) {
    return U(e) === yt;
  };
  E.isProfiler = function(e) {
    return U(e) === je;
  };
  E.isStrictMode = function(e) {
    return U(e) === Ne;
  };
  E.isSuspense = function(e) {
    return U(e) === He;
  };
  E.isSuspenseList = function(e) {
    return U(e) === Ye;
  };
  E.isValidElementType = function(e) {
    return typeof e == "string" || typeof e == "function" || e === De || e === je || e === Ne || e === He || e === Ye || typeof e == "object" && e !== null && (e.$$typeof === Ue || e.$$typeof === Ve || e.$$typeof === ze || e.$$typeof === Ke || e.$$typeof === Ge || e.$$typeof === fn || e.getModuleId !== void 0);
  };
  E.typeOf = U;
  tr.exports = E;
  var rr = tr.exports;
  ae = function(e) {
    if (typeof e != "object" || e === null) return false;
    const t = Object.getPrototypeOf(e);
    return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
  };
  function nr(e) {
    if (V.isValidElement(e) || rr.isValidElementType(e) || !ae(e)) return e;
    const t = {};
    return Object.keys(e).forEach((r) => {
      t[r] = nr(e[r]);
    }), t;
  }
  K = function(e, t, r = {
    clone: true
  }) {
    const n = r.clone ? {
      ...e
    } : e;
    return ae(e) && ae(t) && Object.keys(t).forEach((a) => {
      V.isValidElement(t[a]) || rr.isValidElementType(t[a]) ? n[a] = t[a] : ae(t[a]) && Object.prototype.hasOwnProperty.call(e, a) && ae(e[a]) ? n[a] = K(e[a], t[a], r) : r.clone ? n[a] = ae(t[a]) ? nr(t[a]) : t[a] : n[a] = t[a];
    }), n;
  };
  const un = (e) => {
    const t = Object.keys(e).map((r) => ({
      key: r,
      val: e[r]
    })) || [];
    return t.sort((r, n) => r.val - n.val), t.reduce((r, n) => ({
      ...r,
      [n.key]: n.val
    }), {});
  };
  dn = function(e) {
    const { values: t = {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536
    }, unit: r = "px", step: n = 5, ...a } = e, o = un(t), s = Object.keys(o);
    function c(d) {
      return `@media (min-width:${typeof t[d] == "number" ? t[d] : d}${r})`;
    }
    function f(d) {
      return `@media (max-width:${(typeof t[d] == "number" ? t[d] : d) - n / 100}${r})`;
    }
    function u(d, b) {
      const m = s.indexOf(b);
      return `@media (min-width:${typeof t[d] == "number" ? t[d] : d}${r}) and (max-width:${(m !== -1 && typeof t[s[m]] == "number" ? t[s[m]] : b) - n / 100}${r})`;
    }
    function h(d) {
      return s.indexOf(d) + 1 < s.length ? u(d, s[s.indexOf(d) + 1]) : c(d);
    }
    function g(d) {
      const b = s.indexOf(d);
      return b === 0 ? c(s[1]) : b === s.length - 1 ? f(s[b]) : u(d, s[s.indexOf(d) + 1]).replace("@media", "@media not all and");
    }
    return {
      keys: s,
      values: o,
      up: c,
      down: f,
      between: u,
      only: h,
      not: g,
      unit: r,
      ...a
    };
  };
  function It(e, t) {
    if (!e.containerQueries) return t;
    const r = Object.keys(t).filter((n) => n.startsWith("@container")).sort((n, a) => {
      var _a2, _b;
      const o = /min-width:\s*([0-9.]+)/;
      return +(((_a2 = n.match(o)) == null ? void 0 : _a2[1]) || 0) - +(((_b = a.match(o)) == null ? void 0 : _b[1]) || 0);
    });
    return r.length ? r.reduce((n, a) => {
      const o = t[a];
      return delete n[a], n[a] = o, n;
    }, {
      ...t
    }) : t;
  }
  function gn(e, t) {
    return t === "@" || t.startsWith("@") && (e.some((r) => t.startsWith(`@${r}`)) || !!t.match(/^@\d/));
  }
  function hn(e, t) {
    const r = t.match(/^@([^/]+)?\/?(.+)?$/);
    if (!r) return null;
    const [, n, a] = r, o = Number.isNaN(+n) ? n || 0 : +n;
    return e.containerQueries(a).up(o);
  }
  function mn(e) {
    const t = (o, s) => o.replace("@media", s ? `@container ${s}` : "@container");
    function r(o, s) {
      o.up = (...c) => t(e.breakpoints.up(...c), s), o.down = (...c) => t(e.breakpoints.down(...c), s), o.between = (...c) => t(e.breakpoints.between(...c), s), o.only = (...c) => t(e.breakpoints.only(...c), s), o.not = (...c) => {
        const f = t(e.breakpoints.not(...c), s);
        return f.includes("not all and") ? f.replace("not all and ", "").replace("min-width:", "width<").replace("max-width:", "width>").replace("and", "or") : f;
      };
    }
    const n = {}, a = (o) => (r(n, o), n);
    return r(a), {
      ...e,
      containerQueries: a
    };
  }
  const pn = {
    borderRadius: 4
  };
  function Ce(e, t) {
    return t ? K(e, t, {
      clone: false
    }) : e;
  }
  const Qe = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536
  }, _t = {
    keys: [
      "xs",
      "sm",
      "md",
      "lg",
      "xl"
    ],
    up: (e) => `@media (min-width:${Qe[e]}px)`
  }, yn = {
    containerQueries: (e) => ({
      up: (t) => {
        let r = typeof t == "number" ? t : Qe[t] || t;
        return typeof r == "number" && (r = `${r}px`), e ? `@container ${e} (min-width:${r})` : `@container (min-width:${r})`;
      }
    })
  };
  re = function(e, t, r) {
    const n = e.theme || {};
    if (Array.isArray(t)) {
      const o = n.breakpoints || _t;
      return t.reduce((s, c, f) => (s[o.up(o.keys[f])] = r(t[f]), s), {});
    }
    if (typeof t == "object") {
      const o = n.breakpoints || _t;
      return Object.keys(t).reduce((s, c) => {
        if (gn(o.keys, c)) {
          const f = hn(n.containerQueries ? n : yn, c);
          f && (s[f] = r(t[c], c));
        } else if (Object.keys(o.values || Qe).includes(c)) {
          const f = o.up(c);
          s[f] = r(t[c], c);
        } else {
          const f = c;
          s[f] = t[f];
        }
        return s;
      }, {});
    }
    return r(t);
  };
  function ar(e = {}) {
    var _a2;
    return ((_a2 = e.keys) == null ? void 0 : _a2.reduce((r, n) => {
      const a = e.up(n);
      return r[a] = {}, r;
    }, {})) || {};
  }
  function ut(e, t) {
    return e.reduce((r, n) => {
      const a = r[n];
      return (!a || Object.keys(a).length === 0) && delete r[n], r;
    }, t);
  }
  ni = function(e, ...t) {
    const r = ar(e), n = [
      r,
      ...t
    ].reduce((a, o) => K(a, o), {});
    return ut(Object.keys(r), n);
  };
  function bn(e, t) {
    if (typeof e != "object") return {};
    const r = {}, n = Object.keys(t);
    return Array.isArray(e) ? n.forEach((a, o) => {
      o < e.length && (r[a] = true);
    }) : n.forEach((a) => {
      e[a] != null && (r[a] = true);
    }), r;
  }
  ai = function({ values: e, breakpoints: t, base: r }) {
    const n = r || bn(e, t), a = Object.keys(n);
    if (a.length === 0) return e;
    let o;
    return a.reduce((s, c, f) => (Array.isArray(e) ? (s[c] = e[f] != null ? e[f] : e[o], o = f) : typeof e == "object" ? (s[c] = e[c] != null ? e[c] : e[o], o = c) : s[c] = e, s), {});
  };
  ir = function(e) {
    if (typeof e != "string") throw new Error(ie(7));
    return e.charAt(0).toUpperCase() + e.slice(1);
  };
  Xe = function(e, t, r = true) {
    if (!t || typeof t != "string") return null;
    if (e && e.vars && r) {
      const n = `vars.${t}`.split(".").reduce((a, o) => a && a[o] ? a[o] : null, e);
      if (n != null) return n;
    }
    return t.split(".").reduce((n, a) => n && n[a] != null ? n[a] : null, e);
  };
  function _e(e, t, r, n = r) {
    let a;
    return typeof e == "function" ? a = e(r) : Array.isArray(e) ? a = e[r] || n : a = Xe(e, r) || n, t && (a = t(a, n, e)), a;
  }
  function L(e) {
    const { prop: t, cssProperty: r = e.prop, themeKey: n, transform: a } = e, o = (s) => {
      if (s[t] == null) return null;
      const c = s[t], f = s.theme, u = Xe(f, n) || {};
      return re(s, c, (g) => {
        let d = _e(u, a, g);
        return g === d && typeof g == "string" && (d = _e(u, a, `${t}${g === "default" ? "" : ir(g)}`, g)), r === false ? d : {
          [r]: d
        };
      });
    };
    return o.propTypes = {}, o.filterProps = [
      t
    ], o;
  }
  function Cn(e) {
    const t = {};
    return (r) => (t[r] === void 0 && (t[r] = e(r)), t[r]);
  }
  const Sn = {
    m: "margin",
    p: "padding"
  }, wn = {
    t: "Top",
    r: "Right",
    b: "Bottom",
    l: "Left",
    x: [
      "Left",
      "Right"
    ],
    y: [
      "Top",
      "Bottom"
    ]
  }, Lt = {
    marginX: "mx",
    marginY: "my",
    paddingX: "px",
    paddingY: "py"
  }, xn = Cn((e) => {
    if (e.length > 2) if (Lt[e]) e = Lt[e];
    else return [
      e
    ];
    const [t, r] = e.split(""), n = Sn[t], a = wn[r] || "";
    return Array.isArray(a) ? a.map((o) => n + o) : [
      n + a
    ];
  }), bt = [
    "m",
    "mt",
    "mr",
    "mb",
    "ml",
    "mx",
    "my",
    "margin",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "marginX",
    "marginY",
    "marginInline",
    "marginInlineStart",
    "marginInlineEnd",
    "marginBlock",
    "marginBlockStart",
    "marginBlockEnd"
  ], Ct = [
    "p",
    "pt",
    "pr",
    "pb",
    "pl",
    "px",
    "py",
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "paddingX",
    "paddingY",
    "paddingInline",
    "paddingInlineStart",
    "paddingInlineEnd",
    "paddingBlock",
    "paddingBlockStart",
    "paddingBlockEnd"
  ];
  [
    ...bt,
    ...Ct
  ];
  function ve(e, t, r, n) {
    const a = Xe(e, t, true) ?? r;
    return typeof a == "number" || typeof a == "string" ? (o) => typeof o == "string" ? o : typeof a == "string" ? `calc(${o} * ${a})` : a * o : Array.isArray(a) ? (o) => {
      if (typeof o == "string") return o;
      const s = Math.abs(o), c = a[s];
      return o >= 0 ? c : typeof c == "number" ? -c : `-${c}`;
    } : typeof a == "function" ? a : () => {
    };
  }
  St = function(e) {
    return ve(e, "spacing", 8);
  };
  ke = function(e, t) {
    return typeof t == "string" || t == null ? t : e(t);
  };
  function An(e, t) {
    return (r) => e.reduce((n, a) => (n[a] = ke(t, r), n), {});
  }
  function $n(e, t, r, n) {
    if (!t.includes(r)) return null;
    const a = xn(r), o = An(a, n), s = e[r];
    return re(e, s, o);
  }
  function or(e, t) {
    const r = St(e.theme);
    return Object.keys(e).map((n) => $n(e, t, n, r)).reduce(Ce, {});
  }
  function R(e) {
    return or(e, bt);
  }
  R.propTypes = {};
  R.filterProps = bt;
  function I(e) {
    return or(e, Ct);
  }
  I.propTypes = {};
  I.filterProps = Ct;
  sr = function(e = 8, t = St({
    spacing: e
  })) {
    if (e.mui) return e;
    const r = (...n) => (n.length === 0 ? [
      1
    ] : n).map((o) => {
      const s = t(o);
      return typeof s == "number" ? `${s}px` : s;
    }).join(" ");
    return r.mui = true, r;
  };
  function qe(...e) {
    const t = e.reduce((n, a) => (a.filterProps.forEach((o) => {
      n[o] = a;
    }), n), {}), r = (n) => Object.keys(n).reduce((a, o) => t[o] ? Ce(a, t[o](n)) : a, {});
    return r.propTypes = {}, r.filterProps = e.reduce((n, a) => n.concat(a.filterProps), []), r;
  }
  function Y(e) {
    return typeof e != "number" ? e : `${e}px solid`;
  }
  function Q(e, t) {
    return L({
      prop: e,
      themeKey: "borders",
      transform: t
    });
  }
  const vn = Q("border", Y), kn = Q("borderTop", Y), Tn = Q("borderRight", Y), En = Q("borderBottom", Y), On = Q("borderLeft", Y), Bn = Q("borderColor"), Pn = Q("borderTopColor"), Rn = Q("borderRightColor"), In = Q("borderBottomColor"), _n = Q("borderLeftColor"), Ln = Q("outline", Y), Fn = Q("outlineColor"), Ze = (e) => {
    if (e.borderRadius !== void 0 && e.borderRadius !== null) {
      const t = ve(e.theme, "shape.borderRadius", 4), r = (n) => ({
        borderRadius: ke(t, n)
      });
      return re(e, e.borderRadius, r);
    }
    return null;
  };
  Ze.propTypes = {};
  Ze.filterProps = [
    "borderRadius"
  ];
  qe(vn, kn, Tn, En, On, Bn, Pn, Rn, In, _n, Ze, Ln, Fn);
  const Je = (e) => {
    if (e.gap !== void 0 && e.gap !== null) {
      const t = ve(e.theme, "spacing", 8), r = (n) => ({
        gap: ke(t, n)
      });
      return re(e, e.gap, r);
    }
    return null;
  };
  Je.propTypes = {};
  Je.filterProps = [
    "gap"
  ];
  const et = (e) => {
    if (e.columnGap !== void 0 && e.columnGap !== null) {
      const t = ve(e.theme, "spacing", 8), r = (n) => ({
        columnGap: ke(t, n)
      });
      return re(e, e.columnGap, r);
    }
    return null;
  };
  et.propTypes = {};
  et.filterProps = [
    "columnGap"
  ];
  const tt = (e) => {
    if (e.rowGap !== void 0 && e.rowGap !== null) {
      const t = ve(e.theme, "spacing", 8), r = (n) => ({
        rowGap: ke(t, n)
      });
      return re(e, e.rowGap, r);
    }
    return null;
  };
  tt.propTypes = {};
  tt.filterProps = [
    "rowGap"
  ];
  const Mn = L({
    prop: "gridColumn"
  }), Wn = L({
    prop: "gridRow"
  }), Dn = L({
    prop: "gridAutoFlow"
  }), Nn = L({
    prop: "gridAutoColumns"
  }), jn = L({
    prop: "gridAutoRows"
  }), Kn = L({
    prop: "gridTemplateColumns"
  }), zn = L({
    prop: "gridTemplateRows"
  }), Gn = L({
    prop: "gridTemplateAreas"
  }), Hn = L({
    prop: "gridArea"
  });
  qe(Je, et, tt, Mn, Wn, Dn, Nn, jn, Kn, zn, Gn, Hn);
  function de(e, t) {
    return t === "grey" ? t : e;
  }
  const Yn = L({
    prop: "color",
    themeKey: "palette",
    transform: de
  }), Vn = L({
    prop: "bgcolor",
    cssProperty: "backgroundColor",
    themeKey: "palette",
    transform: de
  }), Un = L({
    prop: "backgroundColor",
    themeKey: "palette",
    transform: de
  });
  qe(Yn, Vn, Un);
  function G(e) {
    return e <= 1 && e !== 0 ? `${e * 100}%` : e;
  }
  const Qn = L({
    prop: "width",
    transform: G
  }), wt = (e) => {
    if (e.maxWidth !== void 0 && e.maxWidth !== null) {
      const t = (r) => {
        var _a2, _b, _c, _d, _e2;
        const n = ((_c = (_b = (_a2 = e.theme) == null ? void 0 : _a2.breakpoints) == null ? void 0 : _b.values) == null ? void 0 : _c[r]) || Qe[r];
        return n ? ((_e2 = (_d = e.theme) == null ? void 0 : _d.breakpoints) == null ? void 0 : _e2.unit) !== "px" ? {
          maxWidth: `${n}${e.theme.breakpoints.unit}`
        } : {
          maxWidth: n
        } : {
          maxWidth: G(r)
        };
      };
      return re(e, e.maxWidth, t);
    }
    return null;
  };
  wt.filterProps = [
    "maxWidth"
  ];
  const Xn = L({
    prop: "minWidth",
    transform: G
  }), qn = L({
    prop: "height",
    transform: G
  }), Zn = L({
    prop: "maxHeight",
    transform: G
  }), Jn = L({
    prop: "minHeight",
    transform: G
  });
  L({
    prop: "size",
    cssProperty: "width",
    transform: G
  });
  L({
    prop: "size",
    cssProperty: "height",
    transform: G
  });
  const ea = L({
    prop: "boxSizing"
  });
  qe(Qn, wt, Xn, qn, Zn, Jn, ea);
  rt = {
    border: {
      themeKey: "borders",
      transform: Y
    },
    borderTop: {
      themeKey: "borders",
      transform: Y
    },
    borderRight: {
      themeKey: "borders",
      transform: Y
    },
    borderBottom: {
      themeKey: "borders",
      transform: Y
    },
    borderLeft: {
      themeKey: "borders",
      transform: Y
    },
    borderColor: {
      themeKey: "palette"
    },
    borderTopColor: {
      themeKey: "palette"
    },
    borderRightColor: {
      themeKey: "palette"
    },
    borderBottomColor: {
      themeKey: "palette"
    },
    borderLeftColor: {
      themeKey: "palette"
    },
    outline: {
      themeKey: "borders",
      transform: Y
    },
    outlineColor: {
      themeKey: "palette"
    },
    borderRadius: {
      themeKey: "shape.borderRadius",
      style: Ze
    },
    color: {
      themeKey: "palette",
      transform: de
    },
    bgcolor: {
      themeKey: "palette",
      cssProperty: "backgroundColor",
      transform: de
    },
    backgroundColor: {
      themeKey: "palette",
      transform: de
    },
    p: {
      style: I
    },
    pt: {
      style: I
    },
    pr: {
      style: I
    },
    pb: {
      style: I
    },
    pl: {
      style: I
    },
    px: {
      style: I
    },
    py: {
      style: I
    },
    padding: {
      style: I
    },
    paddingTop: {
      style: I
    },
    paddingRight: {
      style: I
    },
    paddingBottom: {
      style: I
    },
    paddingLeft: {
      style: I
    },
    paddingX: {
      style: I
    },
    paddingY: {
      style: I
    },
    paddingInline: {
      style: I
    },
    paddingInlineStart: {
      style: I
    },
    paddingInlineEnd: {
      style: I
    },
    paddingBlock: {
      style: I
    },
    paddingBlockStart: {
      style: I
    },
    paddingBlockEnd: {
      style: I
    },
    m: {
      style: R
    },
    mt: {
      style: R
    },
    mr: {
      style: R
    },
    mb: {
      style: R
    },
    ml: {
      style: R
    },
    mx: {
      style: R
    },
    my: {
      style: R
    },
    margin: {
      style: R
    },
    marginTop: {
      style: R
    },
    marginRight: {
      style: R
    },
    marginBottom: {
      style: R
    },
    marginLeft: {
      style: R
    },
    marginX: {
      style: R
    },
    marginY: {
      style: R
    },
    marginInline: {
      style: R
    },
    marginInlineStart: {
      style: R
    },
    marginInlineEnd: {
      style: R
    },
    marginBlock: {
      style: R
    },
    marginBlockStart: {
      style: R
    },
    marginBlockEnd: {
      style: R
    },
    displayPrint: {
      cssProperty: false,
      transform: (e) => ({
        "@media print": {
          display: e
        }
      })
    },
    display: {},
    overflow: {},
    textOverflow: {},
    visibility: {},
    whiteSpace: {},
    flexBasis: {},
    flexDirection: {},
    flexWrap: {},
    justifyContent: {},
    alignItems: {},
    alignContent: {},
    order: {},
    flex: {},
    flexGrow: {},
    flexShrink: {},
    alignSelf: {},
    justifyItems: {},
    justifySelf: {},
    gap: {
      style: Je
    },
    rowGap: {
      style: tt
    },
    columnGap: {
      style: et
    },
    gridColumn: {},
    gridRow: {},
    gridAutoFlow: {},
    gridAutoColumns: {},
    gridAutoRows: {},
    gridTemplateColumns: {},
    gridTemplateRows: {},
    gridTemplateAreas: {},
    gridArea: {},
    position: {},
    zIndex: {
      themeKey: "zIndex"
    },
    top: {},
    right: {},
    bottom: {},
    left: {},
    boxShadow: {
      themeKey: "shadows"
    },
    width: {
      transform: G
    },
    maxWidth: {
      style: wt
    },
    minWidth: {
      transform: G
    },
    height: {
      transform: G
    },
    maxHeight: {
      transform: G
    },
    minHeight: {
      transform: G
    },
    boxSizing: {},
    font: {
      themeKey: "font"
    },
    fontFamily: {
      themeKey: "typography"
    },
    fontSize: {
      themeKey: "typography"
    },
    fontStyle: {
      themeKey: "typography"
    },
    fontWeight: {
      themeKey: "typography"
    },
    letterSpacing: {},
    textTransform: {},
    lineHeight: {},
    textAlign: {},
    typography: {
      cssProperty: false,
      themeKey: "typography"
    }
  };
  function ta(...e) {
    const t = e.reduce((n, a) => n.concat(Object.keys(a)), []), r = new Set(t);
    return e.every((n) => r.size === Object.keys(n).length);
  }
  function ra(e, t) {
    return typeof e == "function" ? e(t) : e;
  }
  function na() {
    function e(r, n, a, o) {
      const s = {
        [r]: n,
        theme: a
      }, c = o[r];
      if (!c) return {
        [r]: n
      };
      const { cssProperty: f = r, themeKey: u, transform: h, style: g } = c;
      if (n == null) return null;
      if (u === "typography" && n === "inherit") return {
        [r]: n
      };
      const d = Xe(a, u) || {};
      return g ? g(s) : re(s, n, (m) => {
        let p = _e(d, h, m);
        return m === p && typeof m == "string" && (p = _e(d, h, `${r}${m === "default" ? "" : ir(m)}`, m)), f === false ? p : {
          [f]: p
        };
      });
    }
    function t(r) {
      const { sx: n, theme: a = {}, nested: o } = r || {};
      if (!n) return null;
      const s = a.unstable_sxConfig ?? rt;
      function c(f) {
        let u = f;
        if (typeof f == "function") u = f(a);
        else if (typeof f != "object") return f;
        if (!u) return null;
        const h = ar(a.breakpoints), g = Object.keys(h);
        let d = h;
        return Object.keys(u).forEach((b) => {
          const m = ra(u[b], a);
          if (m != null) if (typeof m == "object") if (s[b]) d = Ce(d, e(b, m, a, s));
          else {
            const p = re({
              theme: a
            }, m, (v) => ({
              [b]: v
            }));
            ta(p, m) ? d[b] = t({
              sx: m,
              theme: a,
              nested: true
            }) : d = Ce(d, p);
          }
          else d = Ce(d, e(b, m, a, s));
        }), !o && a.modularCssLayers ? {
          "@layer sx": It(a, ut(g, d))
        } : It(a, ut(g, d));
      }
      return Array.isArray(n) ? n.map(c) : c(n);
    }
    return t;
  }
  nt = na();
  nt.filterProps = [
    "sx"
  ];
  function aa(e, t) {
    var _a2;
    const r = this;
    if (r.vars) {
      if (!((_a2 = r.colorSchemes) == null ? void 0 : _a2[e]) || typeof r.getColorSchemeSelector != "function") return {};
      let n = r.getColorSchemeSelector(e);
      return n === "&" ? t : ((n.includes("data-") || n.includes(".")) && (n = `*:where(${n.replace(/\s*&$/, "")}) &`), {
        [n]: t
      });
    }
    return r.palette.mode === e ? t : {};
  }
  ia = function(e = {}, ...t) {
    const { breakpoints: r = {}, palette: n = {}, spacing: a, shape: o = {}, ...s } = e, c = dn(r), f = sr(a);
    let u = K({
      breakpoints: c,
      direction: "ltr",
      components: {},
      palette: {
        mode: "light",
        ...n
      },
      spacing: f,
      shape: {
        ...pn,
        ...o
      }
    }, s);
    return u = mn(u), u.applyStyles = aa, u = t.reduce((h, g) => K(h, g), u), u.unstable_sxConfig = {
      ...rt,
      ...s == null ? void 0 : s.unstable_sxConfig
    }, u.unstable_sx = function(g) {
      return nt({
        sx: g,
        theme: this
      });
    }, u;
  };
  oa = function(e, t = Number.MIN_SAFE_INTEGER, r = Number.MAX_SAFE_INTEGER) {
    return Math.max(t, Math.min(e, r));
  };
  function xt(e, t = 0, r = 1) {
    return oa(e, t, r);
  }
  sa = function(e) {
    e = e.slice(1);
    const t = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
    let r = e.match(t);
    return r && r[0].length === 1 && (r = r.map((n) => n + n)), r ? `rgb${r.length === 4 ? "a" : ""}(${r.map((n, a) => a < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
  };
  function ca(e) {
    const t = e.toString(16);
    return t.length === 1 ? `0${t}` : t;
  }
  ne = function(e) {
    if (e.type) return e;
    if (e.charAt(0) === "#") return ne(sa(e));
    const t = e.indexOf("("), r = e.substring(0, t);
    if (![
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "color"
    ].includes(r)) throw new Error(ie(9, e));
    let n = e.substring(t + 1, e.length - 1), a;
    if (r === "color") {
      if (n = n.split(" "), a = n.shift(), n.length === 4 && n[3].charAt(0) === "/" && (n[3] = n[3].slice(1)), ![
        "srgb",
        "display-p3",
        "a98-rgb",
        "prophoto-rgb",
        "rec-2020"
      ].includes(a)) throw new Error(ie(10, a));
    } else n = n.split(",");
    return n = n.map((o) => parseFloat(o)), {
      type: r,
      values: n,
      colorSpace: a
    };
  };
  const la = (e) => {
    const t = ne(e);
    return t.values.slice(0, 3).map((r, n) => t.type.includes("hsl") && n !== 0 ? `${r}%` : r).join(" ");
  }, ye = (e, t) => {
    try {
      return la(e);
    } catch {
      return e;
    }
  };
  at = function(e) {
    const { type: t, colorSpace: r } = e;
    let { values: n } = e;
    return t.includes("rgb") ? n = n.map((a, o) => o < 3 ? parseInt(a, 10) : a) : t.includes("hsl") && (n[1] = `${n[1]}%`, n[2] = `${n[2]}%`), t.includes("color") ? n = `${r} ${n.join(" ")}` : n = `${n.join(", ")}`, `${t}(${n})`;
  };
  ii = function(e) {
    if (e.startsWith("#")) return e;
    const { values: t } = ne(e);
    return `#${t.map((r, n) => ca(n === 3 ? Math.round(255 * r) : r)).join("")}`;
  };
  cr = function(e) {
    e = ne(e);
    const { values: t } = e, r = t[0], n = t[1] / 100, a = t[2] / 100, o = n * Math.min(a, 1 - a), s = (u, h = (u + r / 30) % 12) => a - o * Math.max(Math.min(h - 3, 9 - h, 1), -1);
    let c = "rgb";
    const f = [
      Math.round(s(0) * 255),
      Math.round(s(8) * 255),
      Math.round(s(4) * 255)
    ];
    return e.type === "hsla" && (c += "a", f.push(t[3])), at({
      type: c,
      values: f
    });
  };
  dt = function(e) {
    e = ne(e);
    let t = e.type === "hsl" || e.type === "hsla" ? ne(cr(e)).values : e.values;
    return t = t.map((r) => (e.type !== "color" && (r /= 255), r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
  };
  fa = function(e, t) {
    const r = dt(e), n = dt(t);
    return (Math.max(r, n) + 0.05) / (Math.min(r, n) + 0.05);
  };
  ua = function(e, t) {
    return e = ne(e), t = xt(t), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${t}` : e.values[3] = t, at(e);
  };
  function Ee(e, t, r) {
    try {
      return ua(e, t);
    } catch {
      return e;
    }
  }
  At = function(e, t) {
    if (e = ne(e), t = xt(t), e.type.includes("hsl")) e.values[2] *= 1 - t;
    else if (e.type.includes("rgb") || e.type.includes("color")) for (let r = 0; r < 3; r += 1) e.values[r] *= 1 - t;
    return at(e);
  };
  function k(e, t, r) {
    try {
      return At(e, t);
    } catch {
      return e;
    }
  }
  $t = function(e, t) {
    if (e = ne(e), t = xt(t), e.type.includes("hsl")) e.values[2] += (100 - e.values[2]) * t;
    else if (e.type.includes("rgb")) for (let r = 0; r < 3; r += 1) e.values[r] += (255 - e.values[r]) * t;
    else if (e.type.includes("color")) for (let r = 0; r < 3; r += 1) e.values[r] += (1 - e.values[r]) * t;
    return at(e);
  };
  function T(e, t, r) {
    try {
      return $t(e, t);
    } catch {
      return e;
    }
  }
  da = function(e, t = 0.15) {
    return dt(e) > 0.5 ? At(e, t) : $t(e, t);
  };
  function Oe(e, t, r) {
    try {
      return da(e, t);
    } catch {
      return e;
    }
  }
  function ga(e = "") {
    function t(...n) {
      if (!n.length) return "";
      const a = n[0];
      return typeof a == "string" && !a.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${a}${t(...n.slice(1))})` : `, ${a}`;
    }
    return (n, ...a) => `var(--${e ? `${e}-` : ""}${n}${t(...a)})`;
  }
  const Ft = (e, t, r, n = []) => {
    let a = e;
    t.forEach((o, s) => {
      s === t.length - 1 ? Array.isArray(a) ? a[Number(o)] = r : a && typeof a == "object" && (a[o] = r) : a && typeof a == "object" && (a[o] || (a[o] = n.includes(o) ? [] : {}), a = a[o]);
    });
  }, ha = (e, t, r) => {
    function n(a, o = [], s = []) {
      Object.entries(a).forEach(([c, f]) => {
        (!r || r && !r([
          ...o,
          c
        ])) && f != null && (typeof f == "object" && Object.keys(f).length > 0 ? n(f, [
          ...o,
          c
        ], Array.isArray(f) ? [
          ...s,
          c
        ] : s) : t([
          ...o,
          c
        ], f, s));
      });
    }
    n(e);
  }, ma = (e, t) => typeof t == "number" ? [
    "lineHeight",
    "fontWeight",
    "opacity",
    "zIndex"
  ].some((n) => e.includes(n)) || e[e.length - 1].toLowerCase().includes("opacity") ? t : `${t}px` : t;
  function ot(e, t) {
    const { prefix: r, shouldSkipGeneratingVar: n } = t || {}, a = {}, o = {}, s = {};
    return ha(e, (c, f, u) => {
      if ((typeof f == "string" || typeof f == "number") && (!n || !n(c, f))) {
        const h = `--${r ? `${r}-` : ""}${c.join("-")}`, g = ma(c, f);
        Object.assign(a, {
          [h]: g
        }), Ft(o, c, `var(${h})`, u), Ft(s, c, `var(${h}, ${g})`, u);
      }
    }, (c) => c[0] === "vars"), {
      css: a,
      vars: o,
      varsWithDefaults: s
    };
  }
  function pa(e, t = {}) {
    const { getSelector: r = v, disableCssColorScheme: n, colorSchemeSelector: a } = t, { colorSchemes: o = {}, components: s, defaultColorScheme: c = "light", ...f } = e, { vars: u, css: h, varsWithDefaults: g } = ot(f, t);
    let d = g;
    const b = {}, { [c]: m, ...p } = o;
    if (Object.entries(p || {}).forEach(([S, C]) => {
      const { vars: B, css: M, varsWithDefaults: x } = ot(C, t);
      d = K(d, x), b[S] = {
        css: M,
        vars: B
      };
    }), m) {
      const { css: S, vars: C, varsWithDefaults: B } = ot(m, t);
      d = K(d, B), b[c] = {
        css: S,
        vars: C
      };
    }
    function v(S, C) {
      var _a2, _b;
      let B = a;
      if (a === "class" && (B = ".%s"), a === "data" && (B = "[data-%s]"), (a == null ? void 0 : a.startsWith("data-")) && !a.includes("%s") && (B = `[${a}="%s"]`), S) {
        if (B === "media") return e.defaultColorScheme === S ? ":root" : {
          [`@media (prefers-color-scheme: ${((_b = (_a2 = o[S]) == null ? void 0 : _a2.palette) == null ? void 0 : _b.mode) || S})`]: {
            ":root": C
          }
        };
        if (B) return e.defaultColorScheme === S ? `:root, ${B.replace("%s", String(S))}` : B.replace("%s", String(S));
      }
      return ":root";
    }
    return {
      vars: d,
      generateThemeVars: () => {
        let S = {
          ...u
        };
        return Object.entries(b).forEach(([, { vars: C }]) => {
          S = K(S, C);
        }), S;
      },
      generateStyleSheets: () => {
        var _a2, _b;
        const S = [], C = e.defaultColorScheme || "light";
        function B(X, D) {
          Object.keys(D).length && S.push(typeof X == "string" ? {
            [X]: {
              ...D
            }
          } : X);
        }
        B(r(void 0, {
          ...h
        }), h);
        const { [C]: M, ...x } = b;
        if (M) {
          const { css: X } = M, D = (_b = (_a2 = o[C]) == null ? void 0 : _a2.palette) == null ? void 0 : _b.mode, i = !n && D ? {
            colorScheme: D,
            ...X
          } : {
            ...X
          };
          B(r(C, {
            ...i
          }), i);
        }
        return Object.entries(x).forEach(([X, { css: D }]) => {
          var _a3, _b2;
          const i = (_b2 = (_a3 = o[X]) == null ? void 0 : _a3.palette) == null ? void 0 : _b2.mode, y = !n && i ? {
            colorScheme: i,
            ...D
          } : {
            ...D
          };
          B(r(X, {
            ...y
          }), y);
        }), S;
      }
    };
  }
  function ya(e) {
    return function(r) {
      return e === "media" ? `@media (prefers-color-scheme: ${r})` : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${r}"] &` : e === "class" ? `.${r} &` : e === "data" ? `[data-${r}] &` : `${e.replace("%s", r)} &` : "&";
    };
  }
  function lr() {
    return {
      text: {
        primary: "rgba(0, 0, 0, 0.87)",
        secondary: "rgba(0, 0, 0, 0.6)",
        disabled: "rgba(0, 0, 0, 0.38)"
      },
      divider: "rgba(0, 0, 0, 0.12)",
      background: {
        paper: Se.white,
        default: Se.white
      },
      action: {
        active: "rgba(0, 0, 0, 0.54)",
        hover: "rgba(0, 0, 0, 0.04)",
        hoverOpacity: 0.04,
        selected: "rgba(0, 0, 0, 0.08)",
        selectedOpacity: 0.08,
        disabled: "rgba(0, 0, 0, 0.26)",
        disabledBackground: "rgba(0, 0, 0, 0.12)",
        disabledOpacity: 0.38,
        focus: "rgba(0, 0, 0, 0.12)",
        focusOpacity: 0.12,
        activatedOpacity: 0.12
      }
    };
  }
  const ba = lr();
  function fr() {
    return {
      text: {
        primary: Se.white,
        secondary: "rgba(255, 255, 255, 0.7)",
        disabled: "rgba(255, 255, 255, 0.5)",
        icon: "rgba(255, 255, 255, 0.5)"
      },
      divider: "rgba(255, 255, 255, 0.12)",
      background: {
        paper: "#121212",
        default: "#121212"
      },
      action: {
        active: Se.white,
        hover: "rgba(255, 255, 255, 0.08)",
        hoverOpacity: 0.08,
        selected: "rgba(255, 255, 255, 0.16)",
        selectedOpacity: 0.16,
        disabled: "rgba(255, 255, 255, 0.3)",
        disabledBackground: "rgba(255, 255, 255, 0.12)",
        disabledOpacity: 0.38,
        focus: "rgba(255, 255, 255, 0.12)",
        focusOpacity: 0.12,
        activatedOpacity: 0.24
      }
    };
  }
  const Mt = fr();
  function Wt(e, t, r, n) {
    const a = n.light || n, o = n.dark || n * 1.5;
    e[t] || (e.hasOwnProperty(r) ? e[t] = e[r] : t === "light" ? e.light = $t(e.main, a) : t === "dark" && (e.dark = At(e.main, o)));
  }
  function Ca(e = "light") {
    return e === "dark" ? {
      main: ce[200],
      light: ce[50],
      dark: ce[400]
    } : {
      main: ce[700],
      light: ce[400],
      dark: ce[800]
    };
  }
  function Sa(e = "light") {
    return e === "dark" ? {
      main: se[200],
      light: se[50],
      dark: se[400]
    } : {
      main: se[500],
      light: se[300],
      dark: se[700]
    };
  }
  function wa(e = "light") {
    return e === "dark" ? {
      main: oe[500],
      light: oe[300],
      dark: oe[700]
    } : {
      main: oe[700],
      light: oe[400],
      dark: oe[800]
    };
  }
  function xa(e = "light") {
    return e === "dark" ? {
      main: le[400],
      light: le[300],
      dark: le[700]
    } : {
      main: le[700],
      light: le[500],
      dark: le[900]
    };
  }
  function Aa(e = "light") {
    return e === "dark" ? {
      main: fe[400],
      light: fe[300],
      dark: fe[700]
    } : {
      main: fe[800],
      light: fe[500],
      dark: fe[900]
    };
  }
  function $a(e = "light") {
    return e === "dark" ? {
      main: me[400],
      light: me[300],
      dark: me[700]
    } : {
      main: "#ed6c02",
      light: me[500],
      dark: me[900]
    };
  }
  function vt(e) {
    const { mode: t = "light", contrastThreshold: r = 3, tonalOffset: n = 0.2, ...a } = e, o = e.primary || Ca(t), s = e.secondary || Sa(t), c = e.error || wa(t), f = e.info || xa(t), u = e.success || Aa(t), h = e.warning || $a(t);
    function g(p) {
      return fa(p, Mt.text.primary) >= r ? Mt.text.primary : ba.text.primary;
    }
    const d = ({ color: p, name: v, mainShade: w = 500, lightShade: O = 300, darkShade: S = 700 }) => {
      if (p = {
        ...p
      }, !p.main && p[w] && (p.main = p[w]), !p.hasOwnProperty("main")) throw new Error(ie(11, v ? ` (${v})` : "", w));
      if (typeof p.main != "string") throw new Error(ie(12, v ? ` (${v})` : "", JSON.stringify(p.main)));
      return Wt(p, "light", O, n), Wt(p, "dark", S, n), p.contrastText || (p.contrastText = g(p.main)), p;
    };
    let b;
    return t === "light" ? b = lr() : t === "dark" && (b = fr()), K({
      common: {
        ...Se
      },
      mode: t,
      primary: d({
        color: o,
        name: "primary"
      }),
      secondary: d({
        color: s,
        name: "secondary",
        mainShade: "A400",
        lightShade: "A200",
        darkShade: "A700"
      }),
      error: d({
        color: c,
        name: "error"
      }),
      warning: d({
        color: h,
        name: "warning"
      }),
      info: d({
        color: f,
        name: "info"
      }),
      success: d({
        color: u,
        name: "success"
      }),
      grey: pr,
      contrastThreshold: r,
      getContrastText: g,
      augmentColor: d,
      tonalOffset: n,
      ...b
    }, a);
  }
  function va(e) {
    const t = {};
    return Object.entries(e).forEach((n) => {
      const [a, o] = n;
      typeof o == "object" && (t[a] = `${o.fontStyle ? `${o.fontStyle} ` : ""}${o.fontVariant ? `${o.fontVariant} ` : ""}${o.fontWeight ? `${o.fontWeight} ` : ""}${o.fontStretch ? `${o.fontStretch} ` : ""}${o.fontSize || ""}${o.lineHeight ? `/${o.lineHeight} ` : ""}${o.fontFamily || ""}`);
    }), t;
  }
  ka = function(e, t) {
    return {
      toolbar: {
        minHeight: 56,
        [e.up("xs")]: {
          "@media (orientation: landscape)": {
            minHeight: 48
          }
        },
        [e.up("sm")]: {
          minHeight: 64
        }
      },
      ...t
    };
  };
  function Ta(e) {
    return Math.round(e * 1e5) / 1e5;
  }
  const Dt = {
    textTransform: "uppercase"
  }, Nt = '"Roboto", "Helvetica", "Arial", sans-serif';
  Ea = function(e, t) {
    const { fontFamily: r = Nt, fontSize: n = 14, fontWeightLight: a = 300, fontWeightRegular: o = 400, fontWeightMedium: s = 500, fontWeightBold: c = 700, htmlFontSize: f = 16, allVariants: u, pxToRem: h, ...g } = typeof t == "function" ? t(e) : t, d = n / 14, b = h || ((v) => `${v / f * d}rem`), m = (v, w, O, S, C) => ({
      fontFamily: r,
      fontWeight: v,
      fontSize: b(w),
      lineHeight: O,
      ...r === Nt ? {
        letterSpacing: `${Ta(S / w)}em`
      } : {},
      ...C,
      ...u
    }), p = {
      h1: m(a, 96, 1.167, -1.5),
      h2: m(a, 60, 1.2, -0.5),
      h3: m(o, 48, 1.167, 0),
      h4: m(o, 34, 1.235, 0.25),
      h5: m(o, 24, 1.334, 0),
      h6: m(s, 20, 1.6, 0.15),
      subtitle1: m(o, 16, 1.75, 0.15),
      subtitle2: m(s, 14, 1.57, 0.1),
      body1: m(o, 16, 1.5, 0.15),
      body2: m(o, 14, 1.43, 0.15),
      button: m(s, 14, 1.75, 0.4, Dt),
      caption: m(o, 12, 1.66, 0.4),
      overline: m(o, 12, 2.66, 1, Dt),
      inherit: {
        fontFamily: "inherit",
        fontWeight: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
        letterSpacing: "inherit"
      }
    };
    return K({
      htmlFontSize: f,
      pxToRem: b,
      fontFamily: r,
      fontSize: n,
      fontWeightLight: a,
      fontWeightRegular: o,
      fontWeightMedium: s,
      fontWeightBold: c,
      ...p
    }, g, {
      clone: false
    });
  };
  const Oa = 0.2, Ba = 0.14, Pa = 0.12;
  function P(...e) {
    return [
      `${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${Oa})`,
      `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${Ba})`,
      `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${Pa})`
    ].join(",");
  }
  let Ra;
  Ra = [
    "none",
    P(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0),
    P(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0),
    P(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0),
    P(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0),
    P(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0),
    P(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0),
    P(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1),
    P(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2),
    P(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2),
    P(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3),
    P(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3),
    P(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4),
    P(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4),
    P(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4),
    P(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5),
    P(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5),
    P(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5),
    P(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6),
    P(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6),
    P(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7),
    P(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7),
    P(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7),
    P(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8),
    P(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)
  ];
  Ia = {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
  };
  _a = {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  };
  function jt(e) {
    return `${Math.round(e)}ms`;
  }
  function La(e) {
    if (!e) return 0;
    const t = e / 36;
    return Math.min(Math.round((4 + 15 * t ** 0.25 + t / 5) * 10), 3e3);
  }
  Fa = function(e) {
    const t = {
      ...Ia,
      ...e.easing
    }, r = {
      ..._a,
      ...e.duration
    };
    return {
      getAutoHeightDuration: La,
      create: (a = [
        "all"
      ], o = {}) => {
        const { duration: s = r.standard, easing: c = t.easeInOut, delay: f = 0, ...u } = o;
        return (Array.isArray(a) ? a : [
          a
        ]).map((h) => `${h} ${typeof s == "string" ? s : jt(s)} ${c} ${typeof f == "string" ? f : jt(f)}`).join(",");
      },
      ...e,
      easing: t,
      duration: r
    };
  };
  const Ma = {
    mobileStepper: 1e3,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500
  };
  function Wa(e) {
    return ae(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
  }
  function ur(e = {}) {
    const t = {
      ...e
    };
    function r(n) {
      const a = Object.entries(n);
      for (let o = 0; o < a.length; o++) {
        const [s, c] = a[o];
        !Wa(c) || s.startsWith("unstable_") ? delete n[s] : ae(c) && (n[s] = {
          ...c
        }, r(n[s]));
      }
    }
    return r(t), `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(t, null, 2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`;
  }
  function Le(e = {}, ...t) {
    const { breakpoints: r, mixins: n = {}, spacing: a, palette: o = {}, transitions: s = {}, typography: c = {}, shape: f, ...u } = e;
    if (e.vars && e.generateThemeVars === void 0) throw new Error(ie(20));
    const h = vt(o), g = ia(e);
    let d = K(g, {
      mixins: ka(g.breakpoints, n),
      palette: h,
      shadows: Ra.slice(),
      typography: Ea(h, c),
      transitions: Fa(s),
      zIndex: {
        ...Ma
      }
    });
    return d = K(d, u), d = t.reduce((b, m) => K(b, m), d), d.unstable_sxConfig = {
      ...rt,
      ...u == null ? void 0 : u.unstable_sxConfig
    }, d.unstable_sx = function(m) {
      return nt({
        sx: m,
        theme: this
      });
    }, d.toRuntimeSource = ur, d;
  }
  oi = function(...e) {
    return Le(...e);
  };
  Da = function(e) {
    let t;
    return e < 1 ? t = 5.11916 * e ** 2 : t = 4.5 * Math.log(e + 1) + 2, Math.round(t * 10) / 1e3;
  };
  const Na = [
    ...Array(25)
  ].map((e, t) => {
    if (t === 0) return "none";
    const r = Da(t);
    return `linear-gradient(rgba(255 255 255 / ${r}), rgba(255 255 255 / ${r}))`;
  });
  function dr(e) {
    return {
      inputPlaceholder: e === "dark" ? 0.5 : 0.42,
      inputUnderline: e === "dark" ? 0.7 : 0.42,
      switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
      switchTrack: e === "dark" ? 0.3 : 0.38
    };
  }
  function gr(e) {
    return e === "dark" ? Na : [];
  }
  ja = function(e) {
    const { palette: t = {
      mode: "light"
    }, opacity: r, overlays: n, ...a } = e, o = vt(t);
    return {
      palette: o,
      opacity: {
        ...dr(o.mode),
        ...r
      },
      overlays: n || gr(o.mode),
      ...a
    };
  };
  Ka = function(e) {
    var _a2;
    return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || e[0] === "palette" && !!((_a2 = e[1]) == null ? void 0 : _a2.match(/(mode|contrastThreshold|tonalOffset)/));
  };
  let Ga;
  za = (e) => [
    ...[
      ...Array(25)
    ].map((t, r) => `--${e ? `${e}-` : ""}overlays-${r}`),
    `--${e ? `${e}-` : ""}palette-AppBar-darkBg`,
    `--${e ? `${e}-` : ""}palette-AppBar-darkColor`
  ];
  Ga = (e) => (t, r) => {
    const n = e.rootSelector || ":root", a = e.colorSchemeSelector;
    let o = a;
    if (a === "class" && (o = ".%s"), a === "data" && (o = "[data-%s]"), (a == null ? void 0 : a.startsWith("data-")) && !a.includes("%s") && (o = `[${a}="%s"]`), e.defaultColorScheme === t) {
      if (t === "dark") {
        const s = {};
        return za(e.cssVarPrefix).forEach((c) => {
          s[c] = r[c], delete r[c];
        }), o === "media" ? {
          [n]: r,
          "@media (prefers-color-scheme: dark)": {
            [n]: s
          }
        } : o ? {
          [o.replace("%s", t)]: s,
          [`${n}, ${o.replace("%s", t)}`]: r
        } : {
          [n]: {
            ...r,
            ...s
          }
        };
      }
      if (o && o !== "media") return `${n}, ${o.replace("%s", String(t))}`;
    } else if (t) {
      if (o === "media") return {
        [`@media (prefers-color-scheme: ${String(t)})`]: {
          [n]: r
        }
      };
      if (o) return o.replace("%s", String(t));
    }
    return n;
  };
  function Ha(e, t) {
    t.forEach((r) => {
      e[r] || (e[r] = {});
    });
  }
  function l(e, t, r) {
    !e[t] && r && (e[t] = r);
  }
  function be(e) {
    return typeof e != "string" || !e.startsWith("hsl") ? e : cr(e);
  }
  function te(e, t) {
    `${t}Channel` in e || (e[`${t}Channel`] = ye(be(e[t])));
  }
  function Ya(e) {
    return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
  }
  const q = (e) => {
    try {
      return e();
    } catch {
    }
  }, Va = (e = "mui") => ga(e);
  function st(e, t, r, n) {
    if (!t) return;
    t = t === true ? {} : t;
    const a = n === "dark" ? "dark" : "light";
    if (!r) {
      e[n] = ja({
        ...t,
        palette: {
          mode: a,
          ...t == null ? void 0 : t.palette
        }
      });
      return;
    }
    const { palette: o, ...s } = Le({
      ...r,
      palette: {
        mode: a,
        ...t == null ? void 0 : t.palette
      }
    });
    return e[n] = {
      ...t,
      palette: o,
      opacity: {
        ...dr(a),
        ...t == null ? void 0 : t.opacity
      },
      overlays: (t == null ? void 0 : t.overlays) || gr(a)
    }, s;
  }
  Ua = function(e = {}, ...t) {
    const { colorSchemes: r = {
      light: true
    }, defaultColorScheme: n, disableCssColorScheme: a = false, cssVarPrefix: o = "mui", shouldSkipGeneratingVar: s = Ka, colorSchemeSelector: c = r.light && r.dark ? "media" : void 0, rootSelector: f = ":root", ...u } = e, h = Object.keys(r)[0], g = n || (r.light && h !== "light" ? "light" : h), d = Va(o), { [g]: b, light: m, dark: p, ...v } = r, w = {
      ...v
    };
    let O = b;
    if ((g === "dark" && !("dark" in r) || g === "light" && !("light" in r)) && (O = true), !O) throw new Error(ie(21, g));
    const S = st(w, O, u, g);
    m && !w.light && st(w, m, void 0, "light"), p && !w.dark && st(w, p, void 0, "dark");
    let C = {
      defaultColorScheme: g,
      ...S,
      cssVarPrefix: o,
      colorSchemeSelector: c,
      rootSelector: f,
      getCssVar: d,
      colorSchemes: w,
      font: {
        ...va(S.typography),
        ...S.font
      },
      spacing: Ya(u.spacing)
    };
    Object.keys(C.colorSchemes).forEach((D) => {
      const i = C.colorSchemes[D].palette, y = (_) => {
        const j = _.split("-"), hr = j[1], mr = j[2];
        return d(_, i[hr][mr]);
      };
      if (i.mode === "light" && (l(i.common, "background", "#fff"), l(i.common, "onBackground", "#000")), i.mode === "dark" && (l(i.common, "background", "#000"), l(i.common, "onBackground", "#fff")), Ha(i, [
        "Alert",
        "AppBar",
        "Avatar",
        "Button",
        "Chip",
        "FilledInput",
        "LinearProgress",
        "Skeleton",
        "Slider",
        "SnackbarContent",
        "SpeedDialAction",
        "StepConnector",
        "StepContent",
        "Switch",
        "TableCell",
        "Tooltip"
      ]), i.mode === "light") {
        l(i.Alert, "errorColor", k(i.error.light, 0.6)), l(i.Alert, "infoColor", k(i.info.light, 0.6)), l(i.Alert, "successColor", k(i.success.light, 0.6)), l(i.Alert, "warningColor", k(i.warning.light, 0.6)), l(i.Alert, "errorFilledBg", y("palette-error-main")), l(i.Alert, "infoFilledBg", y("palette-info-main")), l(i.Alert, "successFilledBg", y("palette-success-main")), l(i.Alert, "warningFilledBg", y("palette-warning-main")), l(i.Alert, "errorFilledColor", q(() => i.getContrastText(i.error.main))), l(i.Alert, "infoFilledColor", q(() => i.getContrastText(i.info.main))), l(i.Alert, "successFilledColor", q(() => i.getContrastText(i.success.main))), l(i.Alert, "warningFilledColor", q(() => i.getContrastText(i.warning.main))), l(i.Alert, "errorStandardBg", T(i.error.light, 0.9)), l(i.Alert, "infoStandardBg", T(i.info.light, 0.9)), l(i.Alert, "successStandardBg", T(i.success.light, 0.9)), l(i.Alert, "warningStandardBg", T(i.warning.light, 0.9)), l(i.Alert, "errorIconColor", y("palette-error-main")), l(i.Alert, "infoIconColor", y("palette-info-main")), l(i.Alert, "successIconColor", y("palette-success-main")), l(i.Alert, "warningIconColor", y("palette-warning-main")), l(i.AppBar, "defaultBg", y("palette-grey-100")), l(i.Avatar, "defaultBg", y("palette-grey-400")), l(i.Button, "inheritContainedBg", y("palette-grey-300")), l(i.Button, "inheritContainedHoverBg", y("palette-grey-A100")), l(i.Chip, "defaultBorder", y("palette-grey-400")), l(i.Chip, "defaultAvatarColor", y("palette-grey-700")), l(i.Chip, "defaultIconColor", y("palette-grey-700")), l(i.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), l(i.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), l(i.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), l(i.LinearProgress, "primaryBg", T(i.primary.main, 0.62)), l(i.LinearProgress, "secondaryBg", T(i.secondary.main, 0.62)), l(i.LinearProgress, "errorBg", T(i.error.main, 0.62)), l(i.LinearProgress, "infoBg", T(i.info.main, 0.62)), l(i.LinearProgress, "successBg", T(i.success.main, 0.62)), l(i.LinearProgress, "warningBg", T(i.warning.main, 0.62)), l(i.Skeleton, "bg", `rgba(${y("palette-text-primaryChannel")} / 0.11)`), l(i.Slider, "primaryTrack", T(i.primary.main, 0.62)), l(i.Slider, "secondaryTrack", T(i.secondary.main, 0.62)), l(i.Slider, "errorTrack", T(i.error.main, 0.62)), l(i.Slider, "infoTrack", T(i.info.main, 0.62)), l(i.Slider, "successTrack", T(i.success.main, 0.62)), l(i.Slider, "warningTrack", T(i.warning.main, 0.62));
        const _ = Oe(i.background.default, 0.8);
        l(i.SnackbarContent, "bg", _), l(i.SnackbarContent, "color", q(() => i.getContrastText(_))), l(i.SpeedDialAction, "fabHoverBg", Oe(i.background.paper, 0.15)), l(i.StepConnector, "border", y("palette-grey-400")), l(i.StepContent, "border", y("palette-grey-400")), l(i.Switch, "defaultColor", y("palette-common-white")), l(i.Switch, "defaultDisabledColor", y("palette-grey-100")), l(i.Switch, "primaryDisabledColor", T(i.primary.main, 0.62)), l(i.Switch, "secondaryDisabledColor", T(i.secondary.main, 0.62)), l(i.Switch, "errorDisabledColor", T(i.error.main, 0.62)), l(i.Switch, "infoDisabledColor", T(i.info.main, 0.62)), l(i.Switch, "successDisabledColor", T(i.success.main, 0.62)), l(i.Switch, "warningDisabledColor", T(i.warning.main, 0.62)), l(i.TableCell, "border", T(Ee(i.divider, 1), 0.88)), l(i.Tooltip, "bg", Ee(i.grey[700], 0.92));
      }
      if (i.mode === "dark") {
        l(i.Alert, "errorColor", T(i.error.light, 0.6)), l(i.Alert, "infoColor", T(i.info.light, 0.6)), l(i.Alert, "successColor", T(i.success.light, 0.6)), l(i.Alert, "warningColor", T(i.warning.light, 0.6)), l(i.Alert, "errorFilledBg", y("palette-error-dark")), l(i.Alert, "infoFilledBg", y("palette-info-dark")), l(i.Alert, "successFilledBg", y("palette-success-dark")), l(i.Alert, "warningFilledBg", y("palette-warning-dark")), l(i.Alert, "errorFilledColor", q(() => i.getContrastText(i.error.dark))), l(i.Alert, "infoFilledColor", q(() => i.getContrastText(i.info.dark))), l(i.Alert, "successFilledColor", q(() => i.getContrastText(i.success.dark))), l(i.Alert, "warningFilledColor", q(() => i.getContrastText(i.warning.dark))), l(i.Alert, "errorStandardBg", k(i.error.light, 0.9)), l(i.Alert, "infoStandardBg", k(i.info.light, 0.9)), l(i.Alert, "successStandardBg", k(i.success.light, 0.9)), l(i.Alert, "warningStandardBg", k(i.warning.light, 0.9)), l(i.Alert, "errorIconColor", y("palette-error-main")), l(i.Alert, "infoIconColor", y("palette-info-main")), l(i.Alert, "successIconColor", y("palette-success-main")), l(i.Alert, "warningIconColor", y("palette-warning-main")), l(i.AppBar, "defaultBg", y("palette-grey-900")), l(i.AppBar, "darkBg", y("palette-background-paper")), l(i.AppBar, "darkColor", y("palette-text-primary")), l(i.Avatar, "defaultBg", y("palette-grey-600")), l(i.Button, "inheritContainedBg", y("palette-grey-800")), l(i.Button, "inheritContainedHoverBg", y("palette-grey-700")), l(i.Chip, "defaultBorder", y("palette-grey-700")), l(i.Chip, "defaultAvatarColor", y("palette-grey-300")), l(i.Chip, "defaultIconColor", y("palette-grey-300")), l(i.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), l(i.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), l(i.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), l(i.LinearProgress, "primaryBg", k(i.primary.main, 0.5)), l(i.LinearProgress, "secondaryBg", k(i.secondary.main, 0.5)), l(i.LinearProgress, "errorBg", k(i.error.main, 0.5)), l(i.LinearProgress, "infoBg", k(i.info.main, 0.5)), l(i.LinearProgress, "successBg", k(i.success.main, 0.5)), l(i.LinearProgress, "warningBg", k(i.warning.main, 0.5)), l(i.Skeleton, "bg", `rgba(${y("palette-text-primaryChannel")} / 0.13)`), l(i.Slider, "primaryTrack", k(i.primary.main, 0.5)), l(i.Slider, "secondaryTrack", k(i.secondary.main, 0.5)), l(i.Slider, "errorTrack", k(i.error.main, 0.5)), l(i.Slider, "infoTrack", k(i.info.main, 0.5)), l(i.Slider, "successTrack", k(i.success.main, 0.5)), l(i.Slider, "warningTrack", k(i.warning.main, 0.5));
        const _ = Oe(i.background.default, 0.98);
        l(i.SnackbarContent, "bg", _), l(i.SnackbarContent, "color", q(() => i.getContrastText(_))), l(i.SpeedDialAction, "fabHoverBg", Oe(i.background.paper, 0.15)), l(i.StepConnector, "border", y("palette-grey-600")), l(i.StepContent, "border", y("palette-grey-600")), l(i.Switch, "defaultColor", y("palette-grey-300")), l(i.Switch, "defaultDisabledColor", y("palette-grey-600")), l(i.Switch, "primaryDisabledColor", k(i.primary.main, 0.55)), l(i.Switch, "secondaryDisabledColor", k(i.secondary.main, 0.55)), l(i.Switch, "errorDisabledColor", k(i.error.main, 0.55)), l(i.Switch, "infoDisabledColor", k(i.info.main, 0.55)), l(i.Switch, "successDisabledColor", k(i.success.main, 0.55)), l(i.Switch, "warningDisabledColor", k(i.warning.main, 0.55)), l(i.TableCell, "border", k(Ee(i.divider, 1), 0.68)), l(i.Tooltip, "bg", Ee(i.grey[700], 0.92));
      }
      te(i.background, "default"), te(i.background, "paper"), te(i.common, "background"), te(i.common, "onBackground"), te(i, "divider"), Object.keys(i).forEach((_) => {
        const j = i[_];
        _ !== "tonalOffset" && j && typeof j == "object" && (j.main && l(i[_], "mainChannel", ye(be(j.main))), j.light && l(i[_], "lightChannel", ye(be(j.light))), j.dark && l(i[_], "darkChannel", ye(be(j.dark))), j.contrastText && l(i[_], "contrastTextChannel", ye(be(j.contrastText))), _ === "text" && (te(i[_], "primary"), te(i[_], "secondary")), _ === "action" && (j.active && te(i[_], "active"), j.selected && te(i[_], "selected")));
      });
    }), C = t.reduce((D, i) => K(D, i), C);
    const B = {
      prefix: o,
      disableCssColorScheme: a,
      shouldSkipGeneratingVar: s,
      getSelector: Ga(C)
    }, { vars: M, generateThemeVars: x, generateStyleSheets: X } = pa(C, B);
    return C.vars = M, Object.entries(C.colorSchemes[C.defaultColorScheme]).forEach(([D, i]) => {
      C[D] = i;
    }), C.generateThemeVars = x, C.generateStyleSheets = X, C.generateSpacing = function() {
      return sr(u.spacing, St(this));
    }, C.getColorSchemeSelector = ya(c), C.spacing = C.generateSpacing(), C.shouldSkipGeneratingVar = s, C.unstable_sxConfig = {
      ...rt,
      ...u == null ? void 0 : u.unstable_sxConfig
    }, C.unstable_sx = function(i) {
      return nt({
        sx: i,
        theme: this
      });
    }, C.toRuntimeSource = ur, C;
  };
  function Kt(e, t, r) {
    e.colorSchemes && r && (e.colorSchemes[t] = {
      ...r !== true && r,
      palette: vt({
        ...r === true ? {} : r.palette,
        mode: t
      })
    });
  }
  Qa = function(e = {}, ...t) {
    const { palette: r, cssVariables: n = false, colorSchemes: a = r ? void 0 : {
      light: true
    }, defaultColorScheme: o = r == null ? void 0 : r.mode, ...s } = e, c = o || "light", f = a == null ? void 0 : a[c], u = {
      ...a,
      ...r ? {
        [c]: {
          ...typeof f != "boolean" && f,
          palette: r
        }
      } : void 0
    };
    if (n === false) {
      if (!("colorSchemes" in e)) return Le(e, ...t);
      let h = r;
      "palette" in e || u[c] && (u[c] !== true ? h = u[c].palette : c === "dark" && (h = {
        mode: "dark"
      }));
      const g = Le({
        ...e,
        palette: h
      }, ...t);
      return g.defaultColorScheme = c, g.colorSchemes = u, g.palette.mode === "light" && (g.colorSchemes.light = {
        ...u.light !== true && u.light,
        palette: g.palette
      }, Kt(g, "dark", u.dark)), g.palette.mode === "dark" && (g.colorSchemes.dark = {
        ...u.dark !== true && u.dark,
        palette: g.palette
      }, Kt(g, "light", u.light)), g;
    }
    return !r && !("light" in u) && c === "light" && (u.light = true), Ua({
      ...s,
      colorSchemes: u,
      defaultColorScheme: c,
      ...typeof n != "boolean" && n
    }, ...t);
  };
  si = Qa();
});
export {
  sa as $,
  ni as A,
  ke as B,
  ei as C,
  sr as D,
  ri as E,
  dn as F,
  ie as G,
  si as H,
  Za as I,
  Ea as J,
  Ua as K,
  _a as L,
  Da as M,
  At as N,
  $t as O,
  da as P,
  Xe as Q,
  oa as R,
  Cr as S,
  on as T,
  ja as U,
  oi as V,
  Fa as W,
  ne as X,
  Ia as Y,
  fa as Z,
  dt as _,
  __tla,
  ua as a,
  cr as a0,
  ka as a1,
  za as a2,
  at as a3,
  ii as a4,
  Ka as a5,
  Wr as a6,
  Ur as a7,
  Xt as a8,
  nn as a9,
  ce as b,
  Qa as c,
  Se as d,
  fe as e,
  ti as f,
  pr as g,
  er as h,
  Qr as i,
  Yr as j,
  ae as k,
  le as l,
  rt as m,
  nt as n,
  me as o,
  se as p,
  ir as q,
  oe as r,
  tn as s,
  ia as t,
  Ja as u,
  re as v,
  an as w,
  ai as x,
  St as y,
  K as z
};
