var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
import { importShared, __tla as __tla_0 } from "./__federation_fn_import-BINF-Dl9.js";
import { j as jsxRuntimeExports } from "./jsx-runtime-XyhW1nAj.js";
import { V as VisRxWidget, CameraField, TRANSLATION_PREFIX, __tla as __tla_1 } from "./__federation_expose_RtspCamera-DEDIMDIg.js";
let SnapshotCamera;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch (e) {
    }
  })(),
  (() => {
    try {
      return __tla_1;
    } catch (e) {
    }
  })()
]).then(() => __async(void 0, null, function* () {
  const React = yield importShared("react");
  const { Button, Dialog, DialogActions, DialogContent, DialogTitle } = yield importShared("@mui/material");
  const { Close } = yield importShared("@mui/icons-material");
  const { I18n } = yield importShared("@iobroker/adapter-react-v5");
  const styles = {
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
  SnapshotCamera = class extends VisRxWidget {
    constructor(props) {
      super(props);
      __publicField(this, "videoRef");
      __publicField(this, "fullVideoRef");
      __publicField(this, "loading", false);
      __publicField(this, "subscribedOnAlive", "");
      __publicField(this, "pollingInterval", null);
      __publicField(this, "updateImage", () => {
        if (!this.loading) {
          this.loading = true;
          if (this.videoRef.current) {
            this.videoRef.current.src = this.getUrl();
            this.videoRef.current.onload = (e) => {
              const image = e.currentTarget;
              if (image && image.style.opacity !== "1") {
                image.style.opacity = "1";
              }
              this.state.error && this.setState({
                error: false
              });
              this.loading = false;
            };
            this.videoRef.current.onerror = (e) => {
              const image = e.target;
              if (image && image.style.opacity !== "0") {
                image.style.opacity = "0";
              }
              !this.state.error && this.setState({
                error: true
              });
              this.loading = false;
            };
          }
          if (this.fullVideoRef.current && this.state.full) {
            this.fullVideoRef.current.src = this.getUrl(true);
          }
        }
      });
      __publicField(this, "onAliveChanged", (id, state) => {
        const data = SnapshotCamera.getNameAndInstance(this.state.rxData.camera);
        if (data && id === `system.adapter.cameras.${data.instanceId}.alive`) {
          const alive = !!(state == null ? void 0 : state.val);
          if (alive !== this.state.alive) {
            this.setState({
              alive
            }, () => this.restartPollingInterval());
          }
        }
      });
      this.videoRef = React.createRef();
      this.fullVideoRef = React.createRef();
      Object.assign(this.state, {
        full: false,
        alive: false,
        error: false
      });
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
                component: (field, data, onDataChange, props) => jsxRuntimeExports.jsx(CameraField, {
                  field,
                  data,
                  onDataChange,
                  context: props.context,
                  t: (word) => I18n.t(TRANSLATION_PREFIX + word)
                })
              },
              {
                label: "camera_in_dialog",
                name: "bigCamera",
                type: "custom",
                component: (field, data, onDataChange, props) => jsxRuntimeExports.jsx(CameraField, {
                  field,
                  data,
                  onDataChange,
                  context: props.context,
                  t: (word) => I18n.t(TRANSLATION_PREFIX + word)
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
      return SnapshotCamera.getWidgetInfo();
    }
    static getNameAndInstance(value) {
      if (!value) {
        return null;
      }
      const pos = value.indexOf("/");
      if (pos === -1) {
        return null;
      }
      return {
        instanceId: value.substring(0, pos),
        name: value.substring(pos + 1)
      };
    }
    getImageWidth(isFull) {
      var _a, _b, _c, _d;
      isFull = isFull === void 0 ? this.state.full : isFull;
      if (isFull && this.fullVideoRef.current) {
        return ((_b = (_a = this.fullVideoRef.current) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.clientWidth) || 0;
      }
      return ((_d = (_c = this.videoRef.current) == null ? void 0 : _c.parentElement) == null ? void 0 : _d.clientWidth) || 0;
    }
    subscribeOnAlive() {
      const data = SnapshotCamera.getNameAndInstance(this.state.rxData.camera);
      if (this.subscribedOnAlive !== (data ? data.instanceId : null)) {
        if (this.subscribedOnAlive) {
          this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subscribedOnAlive}.alive`, this.onAliveChanged);
          this.subscribedOnAlive = "";
        }
        if (data) {
          this.props.context.socket.subscribeState(`system.adapter.cameras.${data.instanceId}.alive`, this.onAliveChanged);
          this.subscribedOnAlive = data.instanceId;
        }
      }
    }
    restartPollingInterval() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      if (this.state.alive) {
        this.pollingInterval = setInterval(this.updateImage, parseInt(this.state.full ? this.state.rxData.pollingIntervalFull : this.state.rxData.pollingInterval, 10) || 500);
      }
    }
    componentDidMount() {
      super.componentDidMount();
      this.subscribeOnAlive();
    }
    onRxDataChanged() {
      this.subscribeOnAlive();
    }
    componentWillUnmount() {
      super.componentWillUnmount();
      this.pollingInterval && clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      if (this.subscribedOnAlive) {
        this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subscribedOnAlive}.alive`, this.onAliveChanged);
        this.subscribedOnAlive = "";
      }
    }
    renderDialog(url) {
      if (this.state.full && this.state.rxData.bigCamera) {
        url = this.getUrl(true) || url;
      }
      return this.state.full ? jsxRuntimeExports.jsxs(Dialog, {
        fullWidth: true,
        maxWidth: "lg",
        open: true,
        onClose: () => this.setState({
          full: false
        }, () => this.restartPollingInterval()),
        children: [
          jsxRuntimeExports.jsx(DialogTitle, {
            children: this.state.rxData.widgetTitle
          }),
          jsxRuntimeExports.jsx(DialogContent, {
            children: jsxRuntimeExports.jsx("div", {
              style: styles.imageContainer,
              children: jsxRuntimeExports.jsx("img", {
                src: url,
                ref: this.fullVideoRef,
                style: styles.fullCamera,
                alt: this.state.rxData.camera
              })
            })
          }),
          jsxRuntimeExports.jsx(DialogActions, {
            children: jsxRuntimeExports.jsx(Button, {
              onClick: (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({
                  full: false
                }, () => this.restartPollingInterval());
              },
              startIcon: jsxRuntimeExports.jsx(Close, {}),
              color: "primary",
              variant: "contained",
              children: I18n.t(`${TRANSLATION_PREFIX}Close`)
            })
          })
        ]
      }) : null;
    }
    getUrl(isFull) {
      if (isFull && !this.state.rxData.bigCamera) {
        const url = `../cameras.${this.state.rxData.bigCamera}?`;
        const params = [
          `ts=${Date.now()}`,
          `w=${this.getImageWidth(true)}`,
          `noCache=${this.state.rxData.noCacheByFull}`,
          this.state.rxData.rotate ? `angle=${this.state.rxData.rotate}` : ""
        ];
        return url + params.filter((p) => p).join("&");
      }
      if (this.state.rxData.camera) {
        const url = `../cameras.${this.state.rxData.camera}?`;
        const params = [
          `ts=${Date.now()}`,
          `w=${this.getImageWidth(isFull)}`,
          `noCache=${isFull ? this.state.rxData.noCacheByFull : false}`,
          this.state.rxData.rotate ? `angle=${this.state.rxData.rotate}` : ""
        ];
        return url + params.filter((p) => p).join("&");
      }
      return "";
    }
    renderWidgetBody(props) {
      super.renderWidgetBody(props);
      const url = this.getUrl();
      const content = jsxRuntimeExports.jsxs("div", {
        style: styles.imageContainer,
        onClick: () => !this.state.error && this.setState({
          full: true
        }, () => this.restartPollingInterval()),
        children: [
          !this.state.alive ? jsxRuntimeExports.jsx("div", {
            style: {
              position: "absolute",
              top: 20,
              left: 0
            },
            children: I18n.t(`${TRANSLATION_PREFIX}Camera instance %s inactive`, (this.state.rxData.camera || "").split("/")[0])
          }) : null,
          url ? jsxRuntimeExports.jsx("img", {
            src: url,
            ref: this.videoRef,
            style: styles.camera,
            alt: this.state.rxData.camera
          }) : I18n.t(`${TRANSLATION_PREFIX}No camera selected`),
          this.state.alive && this.state.error ? jsxRuntimeExports.jsxs("div", {
            style: {
              position: "absolute",
              top: 20,
              left: 0
            },
            children: [
              jsxRuntimeExports.jsxs("div", {
                style: {
                  color: "red"
                },
                children: [
                  I18n.t(`${TRANSLATION_PREFIX}Cannot load URL`),
                  ":"
                ]
              }),
              jsxRuntimeExports.jsx("div", {
                children: this.getUrl(true)
              })
            ]
          }) : null,
          this.renderDialog(url)
        ]
      });
      if (this.state.rxData.noCard || props.widget.usedInWidget) {
        return content;
      }
      return this.wrapContent(content, null, {
        boxSizing: "border-box",
        paddingBottom: 10,
        height: "100%"
      });
    }
  };
}));
export {
  __tla,
  SnapshotCamera as default
};
