/**
 * The manifests of the web components. Read by the build only (`vite.config.ts`), which writes each as
 * `<file>.json` next to its module - a host reads that file for its palette and its settings without loading the
 * module.
 */
import type { WebComponentManifest, WebComponentSetting, WebComponentSettingsPanel } from '@iobroker/web-components';

// with the extension: `vite.config.ts` imports this file, and Vite may load its config natively
import {
    COMPONENTS,
    DEFAULT_WIDTH,
    MIN_INTERVAL,
    SNAPSHOT_INTERVAL,
    SNAPSHOT_INTERVAL_FULL,
    type ComponentKey,
} from './constants.ts';
import { getTexts, inAllLanguages } from './manifestWords.ts';

/** An entry of `common.deviceWidgets.components` of io-package.json */
export interface DeviceWidget {
    name: string;
    label: ioBroker.StringOrTranslated;
    description?: ioBroker.StringOrTranslated;
}

/** The objects below `cameras`: every camera has the states `<name>.running` and `<name>.stream` */
function cameraSetting(): WebComponentSetting {
    return {
        type: 'objectId',
        types: 'state',
        root: 'cameras',
        label: getTexts('camera'),
        help: getTexts('cameraHelp'),
    };
}

/** The settings both components have, after the camera */
function pictureSettings(): Record<string, WebComponentSetting> {
    return {
        title: { type: 'text', label: getTexts('title'), help: getTexts('titleHelp') },
        width: {
            type: 'number',
            label: getTexts('width'),
            help: getTexts('widthHelp'),
            min: 0,
            max: 4096,
            step: 1,
            default: DEFAULT_WIDTH,
        },
        rotate: {
            type: 'select',
            label: getTexts('rotate'),
            default: '0',
            options: [
                { value: '0', label: '0°' },
                { value: '90', label: '90°' },
                { value: '180', label: '180°' },
                { value: '270', label: '270°' },
            ],
        },
    };
}

/** The settings of each component: those that matter for what the native widgets show and do */
function getSettings(key: ComponentKey): WebComponentSettingsPanel {
    if (key === 'rtsp') {
        return { type: 'panel', items: { camera: cameraSetting(), ...pictureSettings() } };
    }
    return {
        type: 'panel',
        items: {
            camera: cameraSetting(),
            ...pictureSettings(),
            pollingInterval: {
                type: 'number',
                label: getTexts('pollingInterval'),
                help: getTexts('pollingIntervalHelp'),
                min: MIN_INTERVAL,
                max: 600000,
                step: 100,
                default: SNAPSHOT_INTERVAL,
            },
            noCache: { type: 'checkbox', label: getTexts('noCache'), default: false },
            bigCamera: {
                ...cameraSetting(),
                label: getTexts('bigCamera'),
                help: getTexts('bigCameraHelp'),
                hidden: '!data.camera',
            },
            pollingIntervalFull: {
                type: 'number',
                label: getTexts('pollingIntervalFull'),
                min: MIN_INTERVAL,
                max: 600000,
                step: 100,
                default: SNAPSHOT_INTERVAL_FULL,
            },
        },
    };
}

/**
 * The manifest of a component
 *
 * Its name is the label of the native ioBroker.devices widget of the same adapter, in every language: vis-2 and
 * devices then hide the web component where the native widget exists, and Aura and admin show it.
 *
 * @param key the component
 * @param deviceWidgets `common.deviceWidgets.components` of io-package.json
 */
export function buildManifest(key: ComponentKey, deviceWidgets: DeviceWidget[]): WebComponentManifest {
    const component = COMPONENTS[key];
    const native = deviceWidgets.find(widget => widget.name === component.deviceWidget);
    if (!native?.label) {
        throw new Error(`io-package.json has no device widget "${component.deviceWidget}" with a label`);
    }
    if (!native.description) {
        throw new Error(`io-package.json has no description of the device widget "${component.deviceWidget}"`);
    }
    return {
        $schema: 'https://raw.githubusercontent.com/ioBroker/web-components/main/schemas/manifest.json',
        manifestVersion: 1,
        tag: component.tag,
        name: inAllLanguages(native.label),
        description: inAllLanguages(native.description),
        // relative to this file: /adapter/cameras/cameras.png
        icon: '../cameras.png',
        module: `${component.file}.js`,
        // as the native vis-2 widgets are placed: 240 px high, 4:3
        size: { width: 320, height: 240 },
        settings: getSettings(key),
    };
}
