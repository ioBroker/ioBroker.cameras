import { j as a, __tla as __tla_0 } from "./jsx-runtime-jrwWgduE.js";
import { v as C, R as h, __tla as __tla_1 } from "./vis2CameraWidgets__loadShare__react__loadShare__-DWj90Mgy.js";
import { v as u, a as W, __tla as __tla_2 } from "./vis2CameraWidgets__loadShare___mf_0_mui_mf_1_icons_mf_2_material__loadShare__-SliNyVJX.js";
import { P as _, __tla as __tla_3 } from "./vis2CameraWidgets__loadShare__prop_mf_2_types__loadShare__-B_JDuqzl.js";
import { v as O } from "./vis2CameraWidgets__mf_v__runtimeInit__mf_v__-B3P0TTkl.js";
let $, b, U;
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
  })(),
  (() => {
    try {
      return __tla_2;
    } catch {
    }
  })(),
  (() => {
    try {
      return __tla_3;
    } catch {
    }
  })()
]).then(async () => {
  const { initPromise: D } = O, A = D.then((o) => o.loadShare("@iobroker/adapter-react-v5", {
    customShareInfo: {
      shareConfig: {
        singleton: true,
        strictVersion: false,
        requiredVersion: "*"
      }
    }
  })), E = await A.then((o) => o());
  var S = E, w = function(o, t, e, s) {
    function n(i) {
      return i instanceof e ? i : new e(function(r) {
        r(i);
      });
    }
    return new (e || (e = Promise))(function(i, r) {
      function d(m) {
        try {
          c(s.next(m));
        } catch (g) {
          r(g);
        }
      }
      function f(m) {
        try {
          c(s.throw(m));
        } catch (g) {
          r(g);
        }
      }
      function c(m) {
        m.done ? i(m.value) : n(m.value).then(d, f);
      }
      c((s = s.apply(o, t || [])).next());
    });
  };
  const I = [
    "background-color",
    "border",
    "background",
    "background-image",
    "background-position",
    "background-repeat",
    "background-size",
    "background-clip",
    "background-origin",
    "color",
    "box-sizing",
    "border-width",
    "border-style",
    "border-color",
    "border-radius",
    "box-shadow",
    "text-align",
    "text-shadow",
    "font-family",
    "font-size",
    "font-weight",
    "line-height",
    "font-style",
    "font-variant",
    "letter-spacing",
    "word-spacing"
  ];
  class k extends C.Component {
    constructor(t) {
      super(t), this.refService = h.createRef(), this.getIdSubscribeState = (s, n) => w(this, void 0, void 0, function* () {
        const i = yield this.props.context.socket.getState(s);
        this.props.context.socket.subscribeState(s, () => n(s, i));
      }), this.onStateChanged = this.onStateChanged.bind(this);
      const e = this.props.context.views[this.props.view].widgets[this.props.id];
      this.state = {
        values: {},
        data: JSON.parse(JSON.stringify(e.data || {})),
        style: JSON.parse(JSON.stringify(e.style || {})),
        rxData: JSON.parse(JSON.stringify(e.data || {})),
        rxStyle: JSON.parse(JSON.stringify(e.style || {}))
      }, this.linkContext = {
        IDs: [],
        bindings: {},
        visibility: {},
        lastChanges: {},
        signals: {},
        widgetAttrInfo: {}
      };
    }
    getWidgetInfo() {
      throw new Error("not implemented");
    }
    static getI18nPrefix() {
      return "";
    }
    static getText(t) {
      return t ? typeof t == "object" ? t[S.I18n.getLanguage()] || t.en : t : "";
    }
    static t(t, ...e) {
      return S.I18n.t(`${this.getI18nPrefix()}${t}`, ...e);
    }
    static getLanguage() {
      return S.I18n.getLanguage();
    }
    renderWidgetBody(t) {
      return null;
    }
    onStateUpdated(t, e) {
    }
    formatValue(t, e) {
      var s;
      return typeof t == "number" && (e === 0 ? t = Math.round(t) : t = Math.round(t * 100) / 100, !((s = this.props.context.systemConfig) === null || s === void 0) && s.common && this.props.context.systemConfig.common.isFloatComma && (t = t.toString().replace(".", ","))), t == null ? "" : t.toString();
    }
    wrapContent(t, e, s, n, i, r) {
      var d, f;
      const c = (r == null ? void 0 : r.Card) || u.Card, m = (r == null ? void 0 : r.CardContent) || u.CardContent, g = Object.assign({
        width: "calc(100% - 8px)",
        height: "calc(100% - 8px)",
        margin: 4
      }, (f = (d = this.props.customSettings) === null || d === void 0 ? void 0 : d.viewStyle) === null || f === void 0 ? void 0 : f.visCard);
      Object.keys(this.state.rxStyle).forEach((p) => {
        const x = this.state.rxStyle[p];
        x != null && I.includes(p) && (p = p.replace(/(-\w)/g, (j) => j[1].toUpperCase()), g[p] = x);
      }), this.wrappedContent = true;
      const y = this.state.rxData.widgetTitle;
      return h.createElement(c, {
        className: "vis_rx_widget_card",
        style: g,
        onClick: i
      }, h.createElement(m, {
        className: "vis_rx_widget_card_content",
        style: Object.assign({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "calc(100% - 32px)",
          paddingBottom: 16,
          position: "relative"
        }, s)
      }, y ? h.createElement("div", {
        className: "vis_rx_widget_card_name",
        style: {
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          alignItems: "center"
        }
      }, h.createElement("div", {
        className: "vis_rx_widget_card_name_div",
        style: Object.assign({
          fontSize: 24,
          paddingTop: 0,
          paddingBottom: 4
        }, n)
      }, y), e || null) : e || null, t));
    }
    onStateChanged(t, e) {
      if (!e) return;
      const s = JSON.parse(JSON.stringify(this.state.values));
      e.val !== void 0 && (s[`${t}.val`] = e.val), e.ts !== void 0 && (s[`${t}.ts`] = e.ts), e.from !== void 0 && (s[`${t}.from`] = e.from), e.lc !== void 0 && (s[`${t}.lc`] = e.lc), e.ts !== void 0 && (s[`${t}.ts`] = e.ts), this.onStateUpdated(t, e), this.setState({
        values: s
      });
    }
    componentDidMount() {
      return w(this, void 0, void 0, function* () {
        var t, e;
        (e = (t = this.getWidgetInfo()) === null || t === void 0 ? void 0 : t.visAttrs) === null || e === void 0 || e.forEach((s) => {
          var n;
          return (n = s == null ? void 0 : s.fields) === null || n === void 0 ? void 0 : n.forEach((i) => {
            (i == null ? void 0 : i.type) === "id" && Object.keys(this.state.data).forEach((r) => {
              if (r.match(new RegExp(`^${i.name}[0-9]*$`))) {
                const d = this.state.data[r];
                this.linkContext.IDs.includes(d) || this.linkContext.IDs.push(d);
              }
            });
          });
        });
        for (let s = 0; s < this.linkContext.IDs.length; s++) yield this.getIdSubscribeState(this.linkContext.IDs[s], this.onStateChanged);
      });
    }
    componentWillUnmount() {
      this.linkContext.IDs.forEach((t) => this.props.context.socket.unsubscribeState(t, this.onStateChanged));
    }
    getWidgetView(t, e) {
      return h.createElement("div", {
        style: {
          width: "100%",
          height: "100%"
        }
      }, "DEMO VIEW");
    }
    getWidgetInWidget(t, e, s) {
      return null;
    }
    render() {
      var t, e;
      return h.createElement("div", {
        ref: this.refService,
        style: {
          width: (t = this.state.style) === null || t === void 0 ? void 0 : t.width,
          height: (e = this.state.style) === null || e === void 0 ? void 0 : e.height
        }
      }, this.renderWidgetBody({
        className: "",
        overlayClassNames: [],
        style: {},
        id: "defaultID",
        refService: this.refService,
        widget: {
          tpl: "tplDemo",
          data: {},
          style: {},
          widgetSet: "demoSet"
        }
      }));
    }
  }
  k.POSSIBLE_MUI_STYLES = I;
  b = class extends (window.visRxWidget || k) {
    static getI18nPrefix() {
      return "cameras_";
    }
  };
  b.propTypes = {
    context: _.object,
    themeType: _.string,
    style: _.object,
    data: _.object
  };
  let v;
  v = {
    camera: {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      cursor: "pointer"
    },
    fullCamera: {
      width: "100%",
      height: "100%",
      objectFit: "contain"
    },
    imageContainer: {
      flex: 1,
      overflow: "hidden",
      position: "relative",
      width: "100%",
      height: "100%"
    }
  };
  $ = (o) => {
    const [t, e] = h.useState(null), [s, n] = h.useState(o.data[o.field.name] || "");
    return C.useEffect(() => {
      (async () => {
        const i = [];
        (await o.context.socket.getAdapterInstances("cameras")).forEach((d) => {
          const f = d._id.split(".").pop();
          d.native.cameras.filter((c) => !o.rtsp || c.type === "rtsp" || c.rtsp).forEach((c) => {
            i.push({
              enabled: c.enabled !== false,
              value: `${f}/${c.name}`,
              label: `cameras.${f}/${c.name}`,
              subLabel: c.desc ? `${c.desc}/${c.ip}` : c.ip || ""
            });
          });
        }), e(i);
      })();
    }, [
      o.context.socket,
      o.rtsp
    ]), t ? a.jsx(u.Select, {
      fullWidth: true,
      variant: "standard",
      value: s,
      onChange: (i) => {
        o.setData({
          [o.field.name]: i.target.value
        }), n(i.target.value);
      },
      children: t.map((i) => a.jsxs(u.MenuItem, {
        value: i.value,
        style: {
          display: "block",
          opacity: i.enabled ? 1 : 0.5
        },
        children: [
          a.jsx("div", {
            children: i.label
          }),
          a.jsx("div", {
            style: {
              fontSize: 10,
              fontStyle: "italic",
              opacity: 0.7
            },
            children: i.subLabel
          }),
          i.enabled ? null : a.jsx("div", {
            style: {
              fontSize: 10,
              fontStyle: "italic",
              opacity: 0.7,
              color: "red"
            },
            children: b.t("disabled")
          })
        ]
      }, i.value))
    }) : a.jsx(u.CircularProgress, {});
  };
  class l extends b {
    constructor(t) {
      super(t), this.videoInterval = null, this.videoRef = h.createRef(), this.fullVideoRef = h.createRef(), this.currentCam = null, this.state.full = false, this.state.alive = false;
    }
    static getWidgetInfo() {
      return {
        id: "tplCameras2RtspCamera",
        visSet: "cameras",
        visName: "RTSP Camera",
        visWidgetLabel: "RTSP Camera",
        visWidgetSetLabel: "Cameras",
        visSetLabel: "Cameras",
        visSetColor: "#9f0026",
        visAttrs: [
          {
            name: "common",
            fields: [
              {
                name: "noCard",
                label: "without_card",
                type: "checkbox"
              },
              {
                name: "widgetTitle",
                label: "name",
                hidden: "!!data.noCard"
              },
              {
                name: "width",
                label: "videoWidth",
                type: "number",
                tooltip: "tooltip_videoWidth"
              },
              {
                label: "Camera",
                name: "camera",
                type: "custom",
                component: (t, e, s, n) => a.jsx($, {
                  field: t,
                  rtsp: true,
                  data: e,
                  setData: s,
                  context: n.context
                })
              }
            ]
          }
        ],
        visDefaultStyle: {
          width: "100%",
          height: 240,
          position: "relative"
        },
        visPrev: "widgets/cameras/img/prev_camera.png"
      };
    }
    getWidgetInfo() {
      return l.getWidgetInfo();
    }
    static drawCamera(t, e) {
      const s = t.current;
      if (!s) return;
      const n = s.getContext("2d");
      try {
        const i = new Image();
        i.src = `data:image/jpeg;base64,${e}`, i.onload = () => {
          s.width = i.width, s.height = i.height, n.drawImage(i, 0, 0, i.width, i.height);
        }, i.onerror = (r) => {
          console.error(r);
        };
      } catch (i) {
        console.error(i);
      }
    }
    updateStream = (t, e) => {
      (e == null ? void 0 : e.val) && (this.state.loading && this.setState({
        loading: false
      }), l.drawCamera(this.videoRef, e.val), this.state.full && l.drawCamera(this.fullVideoRef, e.val));
    };
    static getNameAndInstance(t) {
      if (!t) return null;
      const e = t.indexOf("/");
      return e === -1 ? null : {
        instanceId: t.substring(0, e),
        name: t.substring(e + 1)
      };
    }
    onCameras = (t) => {
      if (t) {
        if (typeof t == "object" && (t.accepted || t.error)) {
          t.error && console.error(t.error);
          return;
        }
        this.state.loading && this.setState({
          loading: false
        }), l.drawCamera(this.videoRef, t), this.state.full && l.drawCamera(this.fullVideoRef, t);
      }
    };
    async propertiesUpdate() {
      if (this.useMessages === void 0 && (this.useMessages = await this.props.context.socket.checkFeatureSupported("INSTANCE_MESSAGES")), this.state.rxData.camera !== this.currentCam) {
        if (this.state.alive) {
          if (this.currentCam) {
            const { instanceId: t, name: e } = l.getNameAndInstance(this.currentCam);
            this.useMessages ? await this.props.context.socket.unsubscribeFromInstance(`cameras.${t}`, `startCamera/${e}`, this.onCameras) : (await this.props.context.socket.setState(`cameras.${t}.${e}.running`, {
              val: false
            }), await this.props.context.socket.unsubscribeState(`cameras.${t}.${e}.stream`, this.updateStream));
          }
          if (this.state.rxData.camera) {
            this.setState({
              loading: true
            });
            const { instanceId: t, name: e } = l.getNameAndInstance(this.state.rxData.camera);
            this.useMessages ? await this.props.context.socket.subscribeOnInstance(`cameras.${t}`, `startCamera/${e}`, {
              width: this.getImageWidth()
            }, this.onCameras) : await this.props.context.socket.subscribeState(`cameras.${t}.${e}.stream`, this.updateStream);
          } else {
            const t = this.videoRef.current;
            t && t.getContext("2d").clearRect(0, 0, t.width, t.height);
          }
          this.currentCam = this.state.rxData.camera;
        } else if (this.currentCam) {
          const { instanceId: t, name: e } = l.getNameAndInstance(this.currentCam);
          this.useMessages || (await this.props.context.socket.setState(`cameras.${t}.${e}.running`, {
            val: false
          }), await this.props.context.socket.unsubscribeState(`cameras.${t}.${e}.stream`, this.updateStream)), this.currentCam = null;
        }
      } else if (this.currentCam && this.state.alive) {
        const { instanceId: t, name: e } = l.getNameAndInstance(this.currentCam);
        this.useMessages ? await this.props.context.socket.subscribeOnInstance(`cameras.${t}`, `startCamera/${e}`, {
          width: this.getImageWidth()
        }, this.onCameras) : await this.props.context.socket.setState(`cameras.${t}.${e}.running`, {
          val: true,
          expire: 30
        });
      } else if (this.currentCam && !this.state.alive) {
        const { instanceId: t, name: e } = l.getNameAndInstance(this.currentCam);
        this.useMessages || (await this.props.context.socket.setState(`cameras.${t}.${e}.running`, {
          val: false
        }), await this.props.context.socket.unsubscribeState(`cameras.${t}.${e}.stream`, this.updateStream)), this.currentCam = null;
      }
    }
    getImageWidth(t) {
      var _a;
      return t = t === void 0 ? this.state.full : t, t && this.fullVideoRef.current ? this.fullVideoRef.current.parentElement.clientWidth || 0 : ((_a = this.videoRef.current) == null ? void 0 : _a.parentElement.clientWidth) || 0;
    }
    async subscribeOnAlive() {
      const t = l.getNameAndInstance(this.state.rxData.camera);
      this.subsribedOnAlive !== (t ? t.instanceId : null) && (this.subsribedOnAlive && (this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subsribedOnAlive}.alive`, this.onAliveChanged), this.subsribedOnAlive = ""), t && (this.props.context.socket.subscribeState(`system.adapter.cameras.${t.instanceId}.alive`, this.onAliveChanged), this.subsribedOnAlive = t.instanceId));
    }
    onAliveChanged = (t, e) => {
      const s = l.getNameAndInstance(this.state.rxData.camera);
      if (s && t === `system.adapter.cameras.${s.instanceId}.alive`) {
        const n = !!(e == null ? void 0 : e.val);
        n !== this.state.alive && this.setState({
          alive: n
        }, () => this.propertiesUpdate());
      }
    };
    componentDidMount() {
      super.componentDidMount(), setTimeout(() => this.propertiesUpdate(), 100), this.subscribeOnAlive(), this.videoInterval = setInterval(() => this.propertiesUpdate(), 14e3);
    }
    async onRxDataChanged() {
      await this.subscribeOnAlive(), await this.propertiesUpdate();
    }
    componentWillUnmount() {
      if (super.componentWillUnmount(), this.videoInterval && clearInterval(this.videoInterval), this.videoInterval = null, this.subsribedOnAlive && (this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subsribedOnAlive}.alive`, this.onAliveChanged), this.subsribedOnAlive = null), this.currentCam) {
        const { instanceId: t, name: e } = l.getNameAndInstance(this.currentCam);
        this.useMessages && this.props.context.socket.unsubscribeFromInstance(`cameras.${t}`, `startCamera/${e}`, this.onCameras).catch((s) => console.error(s));
      }
    }
    renderDialog() {
      return this.state.full ? a.jsxs(u.Dialog, {
        fullWidth: true,
        maxWidth: "lg",
        open: true,
        onClose: () => this.setState({
          full: false
        }),
        children: [
          a.jsx(u.DialogTitle, {
            children: this.state.rxData.widgetTitle
          }),
          a.jsx(u.DialogContent, {
            children: a.jsx("div", {
              style: v.imageContainer,
              children: a.jsx("canvas", {
                ref: this.fullVideoRef,
                style: v.fullCamera
              })
            })
          }),
          a.jsx(u.DialogActions, {
            children: a.jsx(u.Button, {
              onClick: (t) => {
                t.stopPropagation(), t.preventDefault(), this.setState({
                  full: false
                });
              },
              startIcon: a.jsx(W.Close, {}),
              color: "primary",
              variant: "contained",
              children: b.t("Close")
            })
          })
        ]
      }) : null;
    }
    renderWidgetBody(t) {
      super.renderWidgetBody(t);
      const e = a.jsxs("div", {
        style: v.imageContainer,
        onClick: () => this.setState({
          full: true
        }),
        children: [
          this.state.loading && this.state.alive && a.jsx(u.CircularProgress, {
            style: v.progress
          }),
          this.state.alive ? null : a.jsx("div", {
            style: {
              position: "absolute",
              top: 0,
              left: 0
            },
            children: b.t("Camera instance %s inactive", (this.state.rxData.camera || "").split("/")[0])
          }),
          a.jsx("canvas", {
            ref: this.videoRef,
            style: v.camera
          }),
          this.renderDialog()
        ]
      });
      return this.state.rxData.noCard || t.widget.usedInWidget ? e : this.wrapContent(e, null, {
        boxSizing: "border-box",
        paddingBottom: 10,
        height: "100%"
      });
    }
  }
  U = Object.freeze(Object.defineProperty({
    __proto__: null,
    CameraField: $,
    default: l
  }, Symbol.toStringTag, {
    value: "Module"
  }));
});
export {
  $ as C,
  b as G,
  U as R,
  __tla
};
