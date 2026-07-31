import { j as a, __tla as __tla_0 } from "./jsx-runtime-BYVC9zzc.js";
import { a as n, __tla as __tla_1 } from "./__mfe_internal__vis2CameraWidgets__loadShare__react__loadShare__.js-Bg5qCBt3.js";
import { _ as c, a as h, b as d, c as u, d as m, __tla as __tla_2 } from "./__mfe_internal__vis2CameraWidgets__loadShare___mf_0_mui_mf_1_material__loadShare__.js-CxGMuS2e.js";
import { _ as f, __tla as __tla_3 } from "./__mfe_internal__vis2CameraWidgets__loadShare___mf_0_mui_mf_1_icons_mf_2_material__loadShare__.js-B3pkeIjn.js";
import { CameraField as o, __tla as __tla_4 } from "./RtspCamera-UHEiSbtk.js";
import { __tla as __tla_5 } from "./__mfe_internal__vis2CameraWidgets__loadShare__react__loadShare__.js_commonjs-proxy-M-PPg5DN.js";
let l;
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
  })(),
  (() => {
    try {
      return __tla_4;
    } catch {
    }
  })(),
  (() => {
    try {
      return __tla_5;
    } catch {
    }
  })()
]).then(async () => {
  const r = {
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
  l = class extends window.visRxWidget {
    pollingInterval = null;
    videoRef;
    fullVideoRef;
    subscribedOnAlive = null;
    loading = false;
    constructor(t) {
      super(t), this.videoRef = n.createRef(), this.fullVideoRef = n.createRef(), this.state = {
        ...this.state,
        full: false,
        alive: false,
        error: false
      };
    }
    static getI18nPrefix() {
      return "cameras_";
    }
    static getWidgetInfo() {
      return {
        id: "tplCameras2SnapshotCamera",
        visSet: "cameras",
        visName: "Polling Camera",
        visWidgetLabel: "Polling Camera",
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
                name: "pollingInterval",
                label: "pollingInterval",
                tooltip: "tooltip_ms",
                type: "number",
                default: 500
              },
              {
                name: "pollingIntervalFull",
                label: "pollingIntervalFull",
                tooltip: "tooltip_ms",
                type: "number",
                default: 300
              },
              {
                name: "noCacheByFull",
                label: "noCacheByFull",
                type: "checkbox"
              },
              {
                name: "rotate",
                label: "rotate",
                type: "select",
                noTranslation: true,
                options: [
                  {
                    value: 0,
                    label: "0\xB0"
                  },
                  {
                    value: 90,
                    label: "90\xB0"
                  },
                  {
                    value: 180,
                    label: "180\xB0"
                  },
                  {
                    value: 270,
                    label: "270\xB0"
                  }
                ]
              },
              {
                label: "Camera",
                name: "camera",
                type: "custom",
                component: (t, e, i, s) => a.jsx(o, {
                  field: t,
                  data: e,
                  setData: i,
                  context: s.context
                })
              },
              {
                label: "camera_in_dialog",
                name: "bigCamera",
                type: "custom",
                component: (t, e, i, s) => a.jsx(o, {
                  field: t,
                  data: e,
                  setData: i,
                  context: s.context
                }),
                hidden: "!data.camera"
              }
            ]
          }
        ],
        visDefaultStyle: {
          width: "100%",
          height: 240,
          position: "relative"
        },
        visPrev: "widgets/cameras/img/prev_snapshot.png"
      };
    }
    getWidgetInfo() {
      return l.getWidgetInfo();
    }
    static getNameAndInstance(t) {
      if (!t) return null;
      const e = t.indexOf("/");
      return e === -1 ? null : {
        instanceId: t.substring(0, e),
        name: t.substring(e + 1)
      };
    }
    getImageWidth(t) {
      var _a, _b, _c;
      return t = t === void 0 ? this.state.full : t, t && ((_a = this.fullVideoRef.current) == null ? void 0 : _a.parentElement) ? this.fullVideoRef.current.parentElement.clientWidth || 0 : ((_c = (_b = this.videoRef.current) == null ? void 0 : _b.parentElement) == null ? void 0 : _c.clientWidth) || 0;
    }
    async subscribeOnAlive() {
      const t = l.getNameAndInstance(this.state.rxData.camera);
      this.subscribedOnAlive !== (t ? t.instanceId : null) && (this.subscribedOnAlive && (this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subscribedOnAlive}.alive`, this.onAliveChanged), this.subscribedOnAlive = ""), t && (await this.props.context.socket.subscribeState(`system.adapter.cameras.${t.instanceId}.alive`, this.onAliveChanged), this.subscribedOnAlive = t.instanceId));
    }
    updateImage = () => {
      if (this.loading) return;
      this.loading = true;
      const t = this.videoRef.current;
      t && (t.src = this.getUrl(), t.onload = () => {
        t.style.opacity !== "1" && (t.style.opacity = "1"), this.state.error && this.setState({
          error: false
        }), this.loading = false;
      }, t.onerror = () => {
        t.style.opacity !== "0" && (t.style.opacity = "0"), this.state.error || this.setState({
          error: true
        }), this.loading = false;
      }), this.fullVideoRef.current && this.state.full && (this.fullVideoRef.current.src = this.getUrl(true));
    };
    restartPollingInterval() {
      if (this.pollingInterval && (clearInterval(this.pollingInterval), this.pollingInterval = null), this.state.alive) {
        const t = this.state.full ? this.state.rxData.pollingIntervalFull : this.state.rxData.pollingInterval;
        this.pollingInterval = setInterval(this.updateImage, parseInt(String(t), 10) || 500);
      }
    }
    onAliveChanged = (t, e) => {
      const i = l.getNameAndInstance(this.state.rxData.camera);
      if (i && t === `system.adapter.cameras.${i.instanceId}.alive`) {
        const s = !!(e == null ? void 0 : e.val);
        s !== this.state.alive && this.setState({
          alive: s
        }, () => this.restartPollingInterval());
      }
    };
    async componentDidMount() {
      super.componentDidMount(), await this.subscribeOnAlive();
    }
    async onRxDataChanged() {
      await this.subscribeOnAlive();
    }
    componentWillUnmount() {
      super.componentWillUnmount(), this.pollingInterval && (clearInterval(this.pollingInterval), this.pollingInterval = null), this.subscribedOnAlive && (this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subscribedOnAlive}.alive`, this.onAliveChanged), this.subscribedOnAlive = null);
    }
    renderDialog(t) {
      return this.state.full && this.state.rxData.bigCamera && (t = this.getUrl(true) || t), this.state.full ? a.jsxs(c, {
        fullWidth: true,
        maxWidth: "lg",
        open: true,
        onClose: () => this.setState({
          full: false
        }, () => this.restartPollingInterval()),
        children: [
          a.jsx(h, {
            children: this.state.rxData.widgetTitle
          }),
          a.jsx(d, {
            children: a.jsx("div", {
              style: r.imageContainer,
              children: a.jsx("img", {
                src: t,
                ref: this.fullVideoRef,
                style: r.fullCamera,
                alt: this.state.rxData.camera
              })
            })
          }),
          a.jsx(u, {
            children: a.jsx(m, {
              onClick: (e) => {
                e.stopPropagation(), e.preventDefault(), this.setState({
                  full: false
                }, () => this.restartPollingInterval());
              },
              startIcon: a.jsx(f, {}),
              color: "primary",
              variant: "contained",
              children: l.t("Close")
            })
          })
        ]
      }) : null;
    }
    getUrl(t) {
      if (t && !this.state.rxData.bigCamera) {
        const e = `../cameras.${this.state.rxData.bigCamera}?`, i = [
          `ts=${Date.now()}`,
          `w=${this.getImageWidth(true)}`,
          `noCache=${this.state.rxData.noCacheByFull}`,
          this.state.rxData.rotate ? `angle=${this.state.rxData.rotate}` : ""
        ];
        return e + i.filter((s) => s).join("&");
      }
      if (this.state.rxData.camera) {
        const e = `../cameras.${this.state.rxData.camera}?`, i = [
          `ts=${Date.now()}`,
          `w=${this.getImageWidth(t)}`,
          `noCache=${t ? this.state.rxData.noCacheByFull : false}`,
          this.state.rxData.rotate ? `angle=${this.state.rxData.rotate}` : ""
        ];
        return e + i.filter((s) => s).join("&");
      }
      return "";
    }
    renderWidgetBody(t) {
      super.renderWidgetBody(t);
      const e = this.getUrl(), i = a.jsxs("div", {
        style: r.imageContainer,
        onClick: () => !this.state.error && this.setState({
          full: true
        }, () => this.restartPollingInterval()),
        children: [
          this.state.alive ? null : a.jsx("div", {
            style: {
              position: "absolute",
              top: 20,
              left: 0
            },
            children: l.t("Camera instance %s inactive", (this.state.rxData.camera || "").split("/")[0])
          }),
          e ? a.jsx("img", {
            src: e,
            ref: this.videoRef,
            style: r.camera,
            alt: this.state.rxData.camera
          }) : l.t("No camera selected"),
          this.state.alive && this.state.error ? a.jsxs("div", {
            style: {
              position: "absolute",
              top: 20,
              left: 0
            },
            children: [
              a.jsxs("div", {
                style: {
                  color: "red"
                },
                children: [
                  l.t("Cannot load URL"),
                  ":"
                ]
              }),
              a.jsx("div", {
                children: this.getUrl(true)
              })
            ]
          }) : null,
          this.renderDialog(e)
        ]
      });
      return this.state.rxData.noCard || t.widget.usedInWidget ? i : this.wrapContent(i, null, {
        boxSizing: "border-box",
        paddingBottom: 10,
        height: "100%"
      });
    }
  };
});
export {
  __tla,
  l as default
};
