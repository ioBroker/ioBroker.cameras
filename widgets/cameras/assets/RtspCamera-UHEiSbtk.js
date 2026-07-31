import { j as i, __tla as __tla_0 } from "./jsx-runtime-BYVC9zzc.js";
import { a as d, _ as p, __tla as __tla_1 } from "./__mfe_internal__vis2CameraWidgets__loadShare__react__loadShare__.js-Bg5qCBt3.js";
import { _ as g, a as v, b, c as x, d as I, e as f, f as w, g as S, __tla as __tla_2 } from "./__mfe_internal__vis2CameraWidgets__loadShare___mf_0_mui_mf_1_material__loadShare__.js-CxGMuS2e.js";
import { _ as y, __tla as __tla_3 } from "./__mfe_internal__vis2CameraWidgets__loadShare___mf_0_mui_mf_1_icons_mf_2_material__loadShare__.js-B3pkeIjn.js";
import { __tla as __tla_4 } from "./__mfe_internal__vis2CameraWidgets__loadShare__react__loadShare__.js_commonjs-proxy-M-PPg5DN.js";
let $, n;
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
  })()
]).then(async () => {
  let l;
  l = {
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
    const [e, t] = d.useState(null), [s, c] = d.useState(o.data[o.field.name || "camera"] || "");
    return p(() => {
      (async () => {
        const a = [];
        (await o.context.socket.getAdapterInstances("cameras")).forEach((u) => {
          const m = u._id.split(".").pop();
          u.native.cameras.filter((r) => !o.rtsp || r.type === "rtsp" || r.rtsp).forEach((r) => {
            a.push({
              enabled: r.enabled !== false,
              value: `${m}/${r.name}`,
              label: `cameras.${m}/${r.name}`,
              subLabel: r.desc ? `${r.desc}/${r.ip || r.type || ""}` : r.ip || r.type || ""
            });
          });
        }), t(a);
      })();
    }, [
      o.context.socket,
      o.rtsp
    ]), e ? i.jsx(w, {
      fullWidth: true,
      variant: "standard",
      value: s,
      onChange: (a) => {
        o.setData({
          [o.field.name || "camera"]: a.target.value
        }), c(a.target.value);
      },
      children: e.map((a) => i.jsxs(S, {
        value: a.value,
        style: {
          display: "block",
          opacity: a.enabled ? 1 : 0.5
        },
        children: [
          i.jsx("div", {
            children: a.label
          }),
          i.jsx("div", {
            style: {
              fontSize: 10,
              fontStyle: "italic",
              opacity: 0.7
            },
            children: a.subLabel
          }),
          a.enabled ? null : i.jsx("div", {
            style: {
              fontSize: 10,
              fontStyle: "italic",
              opacity: 0.7,
              color: "red"
            },
            children: n.t("disabled")
          })
        ]
      }, a.value))
    }) : i.jsx(f, {});
  };
  n = class extends window.visRxWidget {
    videoInterval = null;
    videoRef;
    fullVideoRef;
    currentCam = null;
    subscribedOnAlive = null;
    useMessages;
    constructor(e) {
      super(e), this.videoRef = d.createRef(), this.fullVideoRef = d.createRef(), this.state = {
        ...this.state,
        full: false,
        alive: false,
        loading: false
      };
    }
    static getI18nPrefix() {
      return "cameras_";
    }
    static getWidgetInfo() {
      return {
        id: "tplCameras2RtspCamera",
        visSet: "cameras",
        visName: "RTSP Camera",
        visWidgetLabel: "RTSP Camera",
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
                component: (e, t, s, c) => i.jsx($, {
                  field: e,
                  rtsp: true,
                  data: t,
                  setData: s,
                  context: c.context
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
      return n.getWidgetInfo();
    }
    static drawCamera(e, t) {
      const s = e.current;
      if (!s) return;
      const c = s.getContext("2d");
      try {
        const a = new Image();
        a.src = `data:image/jpeg;base64,${t}`, a.onload = () => {
          s.width = a.width, s.height = a.height, c == null ? void 0 : c.drawImage(a, 0, 0, a.width, a.height);
        }, a.onerror = (h) => console.error(h);
      } catch (a) {
        console.error(a);
      }
    }
    updateStream = (e, t) => {
      (t == null ? void 0 : t.val) && (this.state.loading && this.setState({
        loading: false
      }), n.drawCamera(this.videoRef, t.val), this.state.full && n.drawCamera(this.fullVideoRef, t.val));
    };
    static getNameAndInstance(e) {
      if (!e) return null;
      const t = e.indexOf("/");
      return t === -1 ? null : {
        instanceId: e.substring(0, t),
        name: e.substring(t + 1)
      };
    }
    onCameras = (e) => {
      if (e) {
        if (typeof e == "object" && (e.accepted || e.error)) {
          e.error && console.error(e.error);
          return;
        }
        this.state.loading && this.setState({
          loading: false
        }), typeof e == "string" && (n.drawCamera(this.videoRef, e), this.state.full && n.drawCamera(this.fullVideoRef, e));
      }
    };
    async propertiesUpdate() {
      var _a;
      if (this.useMessages === void 0 && (this.useMessages = await this.props.context.socket.checkFeatureSupported("INSTANCE_MESSAGES")), this.state.rxData.camera !== this.currentCam) {
        if (this.state.alive) {
          if (this.currentCam) {
            const e = n.getNameAndInstance(this.currentCam);
            if (!e) return;
            const { instanceId: t, name: s } = e;
            this.useMessages ? await this.props.context.socket.unsubscribeFromInstance(`cameras.${t}`, `startCamera/${s}`, this.onCameras) : (await this.props.context.socket.setState(`cameras.${t}.${s}.running`, {
              val: false
            }), this.props.context.socket.unsubscribeState(`cameras.${t}.${s}.stream`, this.updateStream));
          }
          if (this.state.rxData.camera) {
            this.setState({
              loading: true
            });
            const e = n.getNameAndInstance(this.state.rxData.camera);
            if (!e) return;
            const { instanceId: t, name: s } = e;
            this.useMessages ? await this.props.context.socket.subscribeOnInstance(`cameras.${t}`, `startCamera/${s}`, {
              width: this.getImageWidth()
            }, this.onCameras) : await this.props.context.socket.subscribeState(`cameras.${t}.${s}.stream`, this.updateStream);
          } else {
            const e = this.videoRef.current;
            e && ((_a = e.getContext("2d")) == null ? void 0 : _a.clearRect(0, 0, e.width, e.height));
          }
          this.currentCam = this.state.rxData.camera;
        } else if (this.currentCam) {
          const e = n.getNameAndInstance(this.currentCam);
          if (!e) return;
          const { instanceId: t, name: s } = e;
          this.useMessages || (await this.props.context.socket.setState(`cameras.${t}.${s}.running`, {
            val: false
          }), this.props.context.socket.unsubscribeState(`cameras.${t}.${s}.stream`, this.updateStream)), this.currentCam = null;
        }
      } else if (this.currentCam && this.state.alive) {
        const e = n.getNameAndInstance(this.currentCam);
        if (!e) return;
        const { instanceId: t, name: s } = e;
        this.useMessages ? await this.props.context.socket.subscribeOnInstance(`cameras.${t}`, `startCamera/${s}`, {
          width: this.getImageWidth()
        }, this.onCameras) : await this.props.context.socket.setState(`cameras.${t}.${s}.running`, {
          val: true,
          expire: 30
        });
      } else if (this.currentCam && !this.state.alive) {
        const e = n.getNameAndInstance(this.currentCam);
        if (!e) return;
        const { instanceId: t, name: s } = e;
        this.useMessages || (await this.props.context.socket.setState(`cameras.${t}.${s}.running`, {
          val: false
        }), this.props.context.socket.unsubscribeState(`cameras.${t}.${s}.stream`, this.updateStream)), this.currentCam = null;
      }
    }
    getImageWidth(e) {
      var _a, _b, _c;
      return e = e === void 0 ? this.state.full : e, e && ((_a = this.fullVideoRef.current) == null ? void 0 : _a.parentElement) ? this.fullVideoRef.current.parentElement.clientWidth || 0 : ((_c = (_b = this.videoRef.current) == null ? void 0 : _b.parentElement) == null ? void 0 : _c.clientWidth) || 0;
    }
    async subscribeOnAlive() {
      const e = n.getNameAndInstance(this.state.rxData.camera);
      this.subscribedOnAlive !== (e ? e.instanceId : null) && (this.subscribedOnAlive && (this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subscribedOnAlive}.alive`, this.onAliveChanged), this.subscribedOnAlive = ""), e && (await this.props.context.socket.subscribeState(`system.adapter.cameras.${e.instanceId}.alive`, this.onAliveChanged), this.subscribedOnAlive = e.instanceId));
    }
    onAliveChanged = (e, t) => {
      const s = n.getNameAndInstance(this.state.rxData.camera);
      if (s && e === `system.adapter.cameras.${s.instanceId}.alive`) {
        const c = !!(t == null ? void 0 : t.val);
        c !== this.state.alive && this.setState({
          alive: c
        }, () => this.propertiesUpdate());
      }
    };
    async componentDidMount() {
      super.componentDidMount(), setTimeout(() => this.propertiesUpdate(), 100), await this.subscribeOnAlive(), this.videoInterval = setInterval(() => this.propertiesUpdate(), 14e3);
    }
    async onRxDataChanged() {
      await this.subscribeOnAlive(), await this.propertiesUpdate();
    }
    async componentWillUnmount() {
      if (super.componentWillUnmount(), this.videoInterval && (clearInterval(this.videoInterval), this.videoInterval = null), this.subscribedOnAlive && (this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subscribedOnAlive}.alive`, this.onAliveChanged), this.subscribedOnAlive = null), this.currentCam) {
        const e = n.getNameAndInstance(this.currentCam);
        if (!e) return;
        const { instanceId: t, name: s } = e;
        this.useMessages && this.props.context.socket.unsubscribeFromInstance(`cameras.${t}`, `startCamera/${s}`, this.onCameras).catch((c) => console.error(c));
      }
    }
    renderDialog() {
      return this.state.full ? i.jsxs(g, {
        fullWidth: true,
        maxWidth: "lg",
        open: true,
        onClose: () => this.setState({
          full: false
        }),
        children: [
          i.jsx(v, {
            children: this.state.rxData.widgetTitle
          }),
          i.jsx(b, {
            children: i.jsx("div", {
              style: l.imageContainer,
              children: i.jsx("canvas", {
                ref: this.fullVideoRef,
                style: l.fullCamera
              })
            })
          }),
          i.jsx(x, {
            children: i.jsx(I, {
              onClick: (e) => {
                e.stopPropagation(), e.preventDefault(), this.setState({
                  full: false
                });
              },
              startIcon: i.jsx(y, {}),
              color: "primary",
              variant: "contained",
              children: n.t("Close")
            })
          })
        ]
      }) : null;
    }
    renderWidgetBody(e) {
      super.renderWidgetBody(e);
      const t = i.jsxs("div", {
        style: l.imageContainer,
        onClick: () => this.setState({
          full: true
        }),
        children: [
          this.state.loading && this.state.alive && i.jsx(f, {
            style: l.progress
          }),
          this.state.alive ? null : i.jsx("div", {
            style: {
              position: "absolute",
              top: 0,
              left: 0
            },
            children: n.t("Camera instance %s inactive", (this.state.rxData.camera || "").split("/")[0])
          }),
          i.jsx("canvas", {
            ref: this.videoRef,
            style: l.camera
          }),
          this.renderDialog()
        ]
      });
      return this.state.rxData.noCard || e.widget.usedInWidget ? t : this.wrapContent(t, null, {
        boxSizing: "border-box",
        paddingBottom: 10,
        height: "100%"
      });
    }
  };
});
export {
  $ as CameraField,
  __tla,
  n as default
};
