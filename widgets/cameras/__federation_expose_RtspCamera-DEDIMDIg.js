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
let CameraField, TRANSLATION_PREFIX, VisRxWidget, RtspCamera;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch (e) {
    }
  })()
]).then(() => __async(void 0, null, function* () {
  var _a;
  const { Component } = yield importShared("react");
  VisRxWidget = (_a = class extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    componentDidMount() {
    }
    componentWillUnmount() {
    }
    static findField(_widgetInfo, _name) {
      return null;
    }
    static getI18nPrefix() {
      return "";
    }
    static getText(_text) {
      return "";
    }
    static t(_key, ..._args) {
      return "";
    }
    static getLanguage() {
      return "en";
    }
    onCommand(_command, _option) {
      return false;
    }
    onStateUpdated(_id, _state) {
    }
    onIoBrokerStateChanged(_id, _state) {
    }
    onStateChanged(_id, _state, _doNotApplyState) {
      return {};
    }
    applyBinding(_stateId, _newState) {
    }
    onRxDataChanged(_prevRxData) {
    }
    onRxStyleChanged(_prevRxStyle) {
    }
    onPropertiesUpdated() {
      return Promise.resolve();
    }
    formatValue(value, _round) {
      return value.toString();
    }
    wrapContent(_content, _addToHeader, _cardContentStyle, _headerStyle, _onCardClick, _components) {
      return jsxRuntimeExports.jsx("div", {});
    }
    renderWidgetBody(_props) {
      return jsxRuntimeExports.jsx("div", {});
    }
    getWidgetView(_view, _props) {
      return jsxRuntimeExports.jsx("div", {});
    }
    getWidgetInWidget(_view, _wid, _props) {
      return jsxRuntimeExports.jsx("div", {});
    }
    getWidgetInfo() {
      return {};
    }
  }, __publicField(_a, "POSSIBLE_MUI_STYLES"), _a);
  const React = yield importShared("react");
  const { useEffect } = React;
  const { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select } = yield importShared("@mui/material");
  const { Close } = yield importShared("@mui/icons-material");
  const { I18n } = yield importShared("@iobroker/adapter-react-v5");
  TRANSLATION_PREFIX = "cameras_";
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
  CameraField = (props) => {
    const [cameras, setCameras] = React.useState(null);
    const [camera, setCamera] = React.useState(props.data[props.field.name] || "");
    useEffect(() => {
      void (() => __async(void 0, null, function* () {
        const _cameras = [];
        const instances = yield props.context.socket.getAdapterInstances("cameras");
        instances.forEach((instance) => {
          const instanceId = instance._id.split(".").pop();
          instance.native.cameras.filter((iCamera) => !props.rtsp || iCamera.type === "rtsp" || iCamera.rtsp).forEach((iCamera) => {
            _cameras.push({
              enabled: iCamera.enabled !== false,
              value: `${instanceId}/${iCamera.name}`,
              label: `cameras.${instanceId}/${iCamera.name}`,
              subLabel: iCamera.desc ? `${iCamera.desc}/${iCamera.ip}` : iCamera.ip || ""
            });
          });
        });
        setCameras(_cameras);
      }))();
    }, [
      props.context.socket,
      props.rtsp
    ]);
    return cameras ? jsxRuntimeExports.jsx(Select, {
      fullWidth: true,
      variant: "standard",
      value: camera,
      onChange: (e) => {
        props.onDataChange({
          [props.field.name]: e.target.value
        });
        setCamera(e.target.value);
      },
      children: cameras.map((iCamera) => jsxRuntimeExports.jsxs(MenuItem, {
        value: iCamera.value,
        style: {
          display: "block",
          opacity: iCamera.enabled ? 1 : 0.5
        },
        children: [
          jsxRuntimeExports.jsx("div", {
            children: iCamera.label
          }),
          jsxRuntimeExports.jsx("div", {
            style: {
              fontSize: 10,
              fontStyle: "italic",
              opacity: 0.7
            },
            children: iCamera.subLabel
          }),
          !iCamera.enabled ? jsxRuntimeExports.jsx("div", {
            style: {
              fontSize: 10,
              fontStyle: "italic",
              opacity: 0.7,
              color: "red"
            },
            children: props.t("disabled")
          }) : null
        ]
      }, iCamera.value))
    }) : jsxRuntimeExports.jsx(CircularProgress, {});
  };
  RtspCamera = class extends VisRxWidget {
    constructor(props) {
      super(props);
      __publicField(this, "videoInterval", null);
      __publicField(this, "videoRef");
      __publicField(this, "fullVideoRef");
      __publicField(this, "currentCam", null);
      __publicField(this, "useMessages");
      __publicField(this, "subscribedOnAlive", "");
      __publicField(this, "updateStream", (_id, state) => {
        if (state == null ? void 0 : state.val) {
          if (this.state.loading) {
            this.setState({
              loading: false
            });
          }
          RtspCamera.drawCamera(this.videoRef, state.val);
          if (this.state.full) {
            RtspCamera.drawCamera(this.fullVideoRef, state.val);
          }
        }
      });
      __publicField(this, "onCameras", (data) => {
        if (data) {
          if (typeof data === "object" && (data.accepted || data.error)) {
            if (data.error) {
              console.error(data.error);
            }
            return;
          }
          if (this.state.loading) {
            this.setState({
              loading: false
            });
          }
          RtspCamera.drawCamera(this.videoRef, data);
          if (this.state.full) {
            RtspCamera.drawCamera(this.fullVideoRef, data);
          }
        }
      });
      __publicField(this, "onAliveChanged", (id, state) => {
        const data = RtspCamera.getNameAndInstance(this.state.rxData.camera);
        if (data && id === `system.adapter.cameras.${data.instanceId}.alive`) {
          const alive = !!(state == null ? void 0 : state.val);
          if (alive !== this.state.alive) {
            this.setState({
              alive
            }, () => this.propertiesUpdate());
          }
        }
      });
      this.videoRef = React.createRef();
      this.fullVideoRef = React.createRef();
      Object.assign(this.state, {
        full: false,
        alive: false
      });
    }
    static getI18nPrefix() {
      return TRANSLATION_PREFIX;
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
                component: (field, data, onDataChange, props) => jsxRuntimeExports.jsx(CameraField, {
                  field,
                  rtsp: true,
                  data,
                  onDataChange,
                  context: props.context,
                  t: (word) => I18n.t(TRANSLATION_PREFIX + word)
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
      return RtspCamera.getWidgetInfo();
    }
    static drawCamera(ref, data) {
      const canvas = ref.current;
      if (!canvas) {
        return;
      }
      const context = canvas.getContext("2d");
      if (context) {
        try {
          const imageObj = new Image();
          imageObj.src = `data:image/jpeg;base64,${data}`;
          imageObj.onload = () => {
            canvas.width = imageObj.width;
            canvas.height = imageObj.height;
            context.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);
          };
          imageObj.onerror = (e) => {
            console.error(e);
          };
        } catch (e) {
          console.error(e);
        }
      }
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
    propertiesUpdate() {
      return __async(this, null, function* () {
        if (this.useMessages === void 0) {
          this.useMessages = yield this.props.context.socket.checkFeatureSupported("INSTANCE_MESSAGES");
        }
        if (this.state.rxData.camera !== this.currentCam) {
          if (this.state.alive) {
            if (this.currentCam) {
              const result = RtspCamera.getNameAndInstance(this.currentCam);
              if (result) {
                const { instanceId, name } = result;
                if (this.useMessages) {
                  yield this.props.context.socket.unsubscribeFromInstance(`cameras.${instanceId}`, `startCamera/${name}`, this.onCameras);
                } else {
                  yield this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                    val: false
                  });
                  yield this.props.context.socket.unsubscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
                }
              }
            }
            if (this.state.rxData.camera) {
              this.setState({
                loading: true
              });
              const result = RtspCamera.getNameAndInstance(this.state.rxData.camera);
              if (result) {
                const { instanceId, name } = result;
                if (this.useMessages) {
                  yield this.props.context.socket.subscribeOnInstance(`cameras.${instanceId}`, `startCamera/${name}`, {
                    width: this.getImageWidth()
                  }, this.onCameras);
                } else {
                  yield this.props.context.socket.subscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
                }
              }
            } else {
              const canvas = this.videoRef.current;
              if (canvas) {
                const context = canvas.getContext("2d");
                context == null ? void 0 : context.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
            this.currentCam = this.state.rxData.camera;
          } else if (this.currentCam) {
            const result = RtspCamera.getNameAndInstance(this.currentCam);
            if (result) {
              const { instanceId, name } = result;
              if (!this.useMessages) {
                yield this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                  val: false
                });
                yield this.props.context.socket.unsubscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
              }
            }
            this.currentCam = null;
          }
        } else if (this.currentCam && this.state.alive) {
          const result = RtspCamera.getNameAndInstance(this.currentCam);
          if (result) {
            const { instanceId, name } = result;
            if (this.useMessages) {
              yield this.props.context.socket.subscribeOnInstance(`cameras.${instanceId}`, `startCamera/${name}`, {
                width: this.getImageWidth()
              }, this.onCameras);
            } else {
              yield this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                val: true,
                expire: 30
              });
            }
          }
        } else if (this.currentCam && !this.state.alive) {
          const result = RtspCamera.getNameAndInstance(this.currentCam);
          if (result) {
            const { instanceId, name } = result;
            if (!this.useMessages) {
              yield this.props.context.socket.setState(`cameras.${instanceId}.${name}.running`, {
                val: false
              });
              yield this.props.context.socket.unsubscribeState(`cameras.${instanceId}.${name}.stream`, this.updateStream);
            }
          }
          this.currentCam = null;
        }
      });
    }
    getImageWidth(isFull) {
      var _a2, _b, _c;
      isFull = isFull === void 0 ? this.state.full : isFull;
      if (isFull && this.fullVideoRef.current) {
        return ((_a2 = this.fullVideoRef.current.parentElement) == null ? void 0 : _a2.clientWidth) || 0;
      }
      return ((_c = (_b = this.videoRef.current) == null ? void 0 : _b.parentElement) == null ? void 0 : _c.clientWidth) || 0;
    }
    subscribeOnAlive() {
      const data = RtspCamera.getNameAndInstance(this.state.rxData.camera);
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
    componentDidMount() {
      super.componentDidMount();
      setTimeout(() => this.propertiesUpdate(), 100);
      this.subscribeOnAlive();
      this.videoInterval = setInterval(() => this.propertiesUpdate(), 14e3);
    }
    onRxDataChanged() {
      return __async(this, null, function* () {
        this.subscribeOnAlive();
        yield this.propertiesUpdate();
      });
    }
    componentWillUnmount() {
      super.componentWillUnmount();
      this.videoInterval && clearInterval(this.videoInterval);
      this.videoInterval = null;
      if (this.subscribedOnAlive) {
        this.props.context.socket.unsubscribeState(`system.adapter.cameras.${this.subscribedOnAlive}.alive`, this.onAliveChanged);
        this.subscribedOnAlive = "";
      }
      if (this.currentCam) {
        const result = RtspCamera.getNameAndInstance(this.currentCam);
        if (result) {
          const { instanceId, name } = result;
          if (this.useMessages) {
            this.props.context.socket.unsubscribeFromInstance(`cameras.${instanceId}`, `startCamera/${name}`, this.onCameras).catch((e) => console.error(e));
          }
        }
      }
    }
    renderDialog() {
      return this.state.full ? jsxRuntimeExports.jsxs(Dialog, {
        fullWidth: true,
        maxWidth: "lg",
        open: true,
        onClose: () => this.setState({
          full: false
        }),
        children: [
          jsxRuntimeExports.jsx(DialogTitle, {
            children: this.state.rxData.widgetTitle
          }),
          jsxRuntimeExports.jsx(DialogContent, {
            children: jsxRuntimeExports.jsx("div", {
              style: styles.imageContainer,
              children: jsxRuntimeExports.jsx("canvas", {
                ref: this.fullVideoRef,
                style: styles.fullCamera
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
                });
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
    renderWidgetBody(props) {
      super.renderWidgetBody(props);
      const content = jsxRuntimeExports.jsxs("div", {
        style: styles.imageContainer,
        onClick: () => this.setState({
          full: true
        }),
        children: [
          this.state.loading && this.state.alive && jsxRuntimeExports.jsx(CircularProgress, {
            style: styles.progress
          }),
          !this.state.alive ? jsxRuntimeExports.jsx("div", {
            style: {
              position: "absolute",
              top: 0,
              left: 0
            },
            children: I18n.t(`${TRANSLATION_PREFIX}Camera instance %s inactive`, (this.state.rxData.camera || "").split("/")[0])
          }) : null,
          jsxRuntimeExports.jsx("canvas", {
            ref: this.videoRef,
            style: styles.camera
          }),
          this.renderDialog()
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
  CameraField,
  TRANSLATION_PREFIX,
  VisRxWidget as V,
  __tla,
  RtspCamera as default
};
