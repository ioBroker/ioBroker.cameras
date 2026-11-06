/**
 * What both camera components share: the picture of a camera of the adapter in the box of the host, and a click on
 * it opens it big in a dialog of the host.
 *
 * The picture comes from the message `image` of the adapter (`sendTo`), the same the snapshot widget of
 * ioBroker.devices polls - one of the socket methods every host has (`WebComponentSocket`). The other ways of the
 * native widgets are not open to a web component:
 * - the vis-2 snapshot widget loads `../cameras.0/<camera>`, a route of the web extension: it exists only in
 *   pages that ioBroker.web serves, not in admin, devices or the own server of Aura;
 * - the live widgets subscribe to instance messages (`subscribeOnInstance`), which `WebComponentSocket` does not
 *   have; the old way of writing `<camera>.running` and reading `<camera>.stream` would restart the stream of
 *   every other viewer at another size, is fed only while no native widget watches, and keeps ffmpeg running
 *   after the page is closed.
 *
 * Without the socket, without settings or while the instance is not running, the element shows a hint. It asks
 * for pictures only while it is on the page, visible and not covered by its own dialog. `image` changes nothing,
 * so the picture is shown in the edit mode of the host too; clicks are not taken there.
 */
import { DIALOG_CLOSE_EVENT, type WebComponentSocket } from '@iobroker/web-components';
import { getThemeCssVariables, IobWebComponent } from '@iobroker/web-components/element';

import { parseCameraId, toDataUrl, type CameraRef } from '../../src-devices/src/cameraCommon';
import type { CameraSettings } from './constants';
import { getWord, type WordKey } from './i18n';
import { CAMERA_ICON, DIALOG_STYLES, STYLES } from './styles';

/**
 * A click on the picture, before the element opens its dialog. `detail`: `{ instance: 'cameras.0', camera: 'cam1' }`.
 * A host that shows the camera itself calls `preventDefault()`.
 */
export const CLICK_EVENT = 'cameras-picture-click';

/** An answer later than this counts as lost, and the next picture is asked for */
const ANSWER_TIMEOUT = 15000;

/** Width of the dialog in px; the host gives less on a small screen */
const DIALOG_WIDTH = 1000;

/** The answer of the message `image` */
interface ImageAnswer {
    /** The picture, base64 */
    data?: string;
    contentType?: string;
    /** A text, or an empty object for an exception of the adapter */
    error?: unknown;
}

/** How a picture is asked for */
export interface PictureRequest {
    camera: CameraRef;
    /** In px; 0: as the camera sends it */
    width: number;
    /** 0, 90, 180 or 270 */
    angle: number;
    /** The adapter takes a new picture even if it has one in its cache */
    noCache: boolean;
    /** Ms from the answer to the next request */
    interval: number;
}

/** A picture as a data URL, or the reason why there is none (empty: no reason given) */
type PictureAnswer = { picture: string; error?: undefined } | { picture?: undefined; error: string };

/**
 * One picture of a camera
 *
 * @param socket the connection of the host
 * @param request what to ask for
 * @returns the picture as a data URL
 */
async function requestPicture(socket: WebComponentSocket, request: PictureRequest): Promise<string> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error('')), ANSWER_TIMEOUT);
    });
    try {
        const answer = await Promise.race([
            socket.sendTo<ImageAnswer | null | undefined>(request.camera.instance, 'image', {
                name: request.camera.name,
                width: request.width,
                angle: request.angle,
                noCache: request.noCache,
                // as the web extension does: a browser asking again and again does not rewrite <camera>.jpg each time
                noFileWrite: true,
            }),
            timeout,
        ]);
        if (answer?.data) {
            return toDataUrl(answer.data, answer.contentType || 'image/jpeg');
        }
        throw new Error(typeof answer?.error === 'string' ? answer.error : '');
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Asks for one picture after the other while it runs: the next request goes out `interval` ms after the answer to
 * the last one, so a slow camera lowers the rate instead of piling up requests.
 */
class PicturePoller {
    readonly #socket: WebComponentSocket;

    readonly #request: PictureRequest;

    readonly #onAnswer: (answer: PictureAnswer) => void;

    #timer: ReturnType<typeof setTimeout> | undefined;

    #stopped = false;

    constructor(socket: WebComponentSocket, request: PictureRequest, onAnswer: (answer: PictureAnswer) => void) {
        this.#socket = socket;
        this.#request = request;
        this.#onAnswer = onAnswer;
        void this.#poll();
    }

    stop(): void {
        this.#stopped = true;
        clearTimeout(this.#timer);
    }

    async #poll(): Promise<void> {
        let answer: PictureAnswer;
        try {
            answer = { picture: await requestPicture(this.#socket, this.#request) };
        } catch (e) {
            answer = { error: e instanceof Error ? e.message : String(e) };
        }
        if (!this.#stopped) {
            this.#onAnswer(answer);
        }
        // the answer may have stopped it
        if (!this.#stopped) {
            this.#timer = setTimeout(() => void this.#poll(), this.#request.interval);
        }
    }
}

/**
 * A new element with a class
 *
 * @param tag the tag
 * @param className its class
 * @param parent where to append it
 */
function create<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string,
    parent: Node,
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    parent.appendChild(element);
    return element;
}

/** The state that tells whether the instance of a camera runs */
function getAliveId(camera: CameraRef): string {
    return `system.adapter.${camera.instance}.alive`;
}

function isSameCamera(a: CameraRef, b: CameraRef): boolean {
    return a.instance === b.instance && a.name === b.name;
}

export abstract class CameraElement<
    TSettings extends CameraSettings = CameraSettings,
> extends IobWebComponent<TSettings> {
    readonly #title: HTMLDivElement;

    readonly #view: HTMLDivElement;

    readonly #image: HTMLImageElement;

    readonly #hint: HTMLDivElement;

    readonly #hintText: HTMLSpanElement;

    #poller: PicturePoller | null = null;

    /** What the running poller asks for: it is started anew only when that changes */
    #pollerKey = '';

    #pollerSocket: WebComponentSocket | null = null;

    /** The newest picture as a data URL, and the camera it shows */
    #picture = '';

    #pictureOf = '';

    /** The picture the `<img>` shows */
    #shown = '';

    /** Why the last request brought no picture */
    #error = '';

    /** The content of the open dialog */
    #dialog: HTMLElement | null = null;

    #onScreen = true;

    #observer: IntersectionObserver | null = null;

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        create('style', '', shadow).textContent = STYLES;
        const box = create('div', 'box', shadow);
        this.#title = create('div', 'title', box);
        this.#title.hidden = true;
        this.#view = create('div', 'picture', box);
        this.#image = create('img', '', this.#view);
        this.#image.alt = '';
        this.#image.hidden = true;
        this.#hint = create('div', 'hint', this.#view);
        this.#hint.hidden = true;
        create('span', '', this.#hint).innerHTML = CAMERA_ICON;
        this.#hintText = create('span', '', this.#hint);

        this.#view.addEventListener('click', () => this.#openFullView());
        this.#view.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.#openFullView();
            }
        });
    }

    /**
     * How the picture is asked for
     *
     * @param camera the camera
     * @param settings the settings of the element
     * @param full for the dialog, else for the box
     */
    protected abstract getRequest(camera: CameraRef, settings: TSettings, full: boolean): PictureRequest;

    /**
     * The camera the dialog shows: the one of the box, unless the component has another for it
     *
     * @param camera the camera of the box
     * @param _settings the settings of the element
     */
    protected getDialogCamera(camera: CameraRef, _settings: TSettings): CameraRef {
        return camera;
    }

    override connectedCallback(): void {
        super.connectedCallback();
        document.addEventListener('visibilitychange', this.#onVisibilityChange);
        // a picture scrolled out of view or on a hidden page of the host is not asked for
        if (typeof IntersectionObserver !== 'undefined') {
            this.#observer = new IntersectionObserver(entries => {
                const onScreen = entries.some(entry => entry.isIntersecting);
                if (onScreen !== this.#onScreen) {
                    this.#onScreen = onScreen;
                    this.render();
                }
            });
            this.#observer.observe(this);
        }
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        document.removeEventListener('visibilitychange', this.#onVisibilityChange);
        this.#observer?.disconnect();
        this.#observer = null;
        this.#onScreen = true;
        this.#stopPoller();
        // a host that only moves the element connects it again in the same task: the dialog stays open then
        queueMicrotask(() => {
            if (!this.isConnected && this.#dialog) {
                this.#dialog.dispatchEvent(
                    new CustomEvent(DIALOG_CLOSE_EVENT, { detail: null, bubbles: true, composed: true }),
                );
            }
        });
    }

    protected override getStateIds(settings: TSettings): string[] {
        const camera = parseCameraId(settings.camera);
        return camera ? [getAliveId(camera)] : [];
    }

    protected override render(): void {
        if (!this.isConnected) {
            return;
        }
        const settings = this.settings;
        const camera = parseCameraId(settings.camera);
        const word = (key: WordKey): string => getWord(this.systemLang, key);

        // the picture of another camera is not shown, not even for a moment
        const cameraKey = camera ? `${camera.instance}.${camera.name}` : '';
        if (cameraKey !== this.#pictureOf) {
            this.#picture = '';
            this.#error = '';
            this.#pictureOf = cameraKey;
        }

        // undefined until it arrives; a host that does not deliver it does not stop the picture
        const alive = camera ? this.states[getAliveId(camera)] : undefined;

        let hint = '';
        let isError = false;
        let request: PictureRequest | null = null;
        if (!settings.camera) {
            hint = word('chooseCamera');
        } else if (!camera) {
            hint = word('notCamera');
        } else if (alive !== undefined && !alive?.val) {
            // a stopped instance answers no message
            hint = word('inactive');
        } else {
            request = this.getRequest(camera, settings, false);
            if (this.#error) {
                hint = this.#error;
                isError = true;
            } else if (!this.#picture) {
                hint = word('loading');
            }
        }
        this.#syncPoller(request);

        this.#title.textContent = settings.title || '';
        this.#title.hidden = !settings.title;

        const clickable = !!camera && !this.editMode;
        this.#view.classList.toggle('clickable', clickable);
        this.#view.classList.toggle('edit', this.editMode);
        this.#view.classList.toggle('has-picture', !!this.#picture);
        if (clickable) {
            this.#view.setAttribute('role', 'button');
            this.#view.tabIndex = 0;
            this.#view.setAttribute('aria-label', settings.title || camera.name);
        } else {
            this.#view.removeAttribute('role');
            this.#view.removeAttribute('tabindex');
            this.#view.removeAttribute('aria-label');
        }

        if (this.#picture !== this.#shown) {
            this.#shown = this.#picture;
            if (this.#picture) {
                this.#image.src = this.#picture;
            } else {
                this.#image.removeAttribute('src');
            }
        }
        this.#image.hidden = !this.#picture;
        this.#image.alt = camera?.name || '';

        this.#hint.hidden = !hint;
        this.#hintText.textContent = hint;
        this.#hint.classList.toggle('over', !!hint && !!this.#picture);
        this.#hint.classList.toggle('error', isError);
    }

    #onVisibilityChange = (): void => this.render();

    /** Starts the poller for this request, or stops it - only if something changed */
    #syncPoller(request: PictureRequest | null): void {
        const socket = this.socket;
        const run =
            !!request &&
            !!socket &&
            this.#onScreen &&
            document.visibilityState !== 'hidden' &&
            // the dialog asks for the big picture meanwhile
            !this.#dialog;
        const key = run ? JSON.stringify(request) : '';
        if (key === this.#pollerKey && (!key || socket === this.#pollerSocket)) {
            return;
        }
        this.#stopPoller();
        if (run && request && socket) {
            this.#pollerKey = key;
            this.#pollerSocket = socket;
            this.#poller = new PicturePoller(socket, request, answer => {
                if (answer.picture !== undefined) {
                    this.#picture = answer.picture;
                    this.#error = '';
                } else {
                    this.#error = answer.error || getWord(this.systemLang, 'noPicture');
                }
                this.render();
            });
        }
    }

    #stopPoller(): void {
        this.#poller?.stop();
        this.#poller = null;
        this.#pollerKey = '';
        this.#pollerSocket = null;
    }

    /** The picture big, in a dialog of the host - or of the browser, if the host has none */
    #openFullView(): void {
        const settings = this.settings;
        const camera = parseCameraId(settings.camera);
        const socket = this.socket;
        if (!camera || !socket || this.editMode || this.#dialog) {
            return;
        }
        const dialogCamera = this.getDialogCamera(camera, settings);
        if (!this.emit(CLICK_EVENT, { instance: dialogCamera.instance, camera: dialogCamera.name })) {
            return;
        }

        const content = document.createElement('div');
        // the host moves the content into its dialog, away from the theme variables of this element
        for (const [name, value] of Object.entries(getThemeCssVariables(this.theme))) {
            content.style.setProperty(name, value);
        }
        const shadow = content.attachShadow({ mode: 'open' });
        create('style', '', shadow).textContent = DIALOG_STYLES;
        const full = create('div', 'full', shadow);
        const image = create('img', '', full);
        image.alt = dialogCamera.name;
        const hint = create('div', 'hint', full);
        const sameCamera = isSameCamera(camera, dialogCamera);
        let picture = '';
        const show = (text: string, isError: boolean): void => {
            if (picture && image.getAttribute('src') !== picture) {
                image.src = picture;
            }
            image.hidden = !picture;
            hint.textContent = text;
            hint.hidden = !text;
            hint.classList.toggle('over', !!text && !!picture);
            hint.classList.toggle('error', isError);
        };
        // until the first big picture arrives: the one of the box
        picture = sameCamera ? this.#picture : '';
        show(picture ? '' : getWord(this.systemLang, 'loading'), false);

        this.#dialog = content;
        // stops the poller of the box
        this.render();

        const poller = new PicturePoller(socket, this.getRequest(dialogCamera, settings, true), answer => {
            if (answer.picture !== undefined) {
                picture = answer.picture;
                if (sameCamera) {
                    // the box shows it too when the dialog is closed, until its own next picture
                    this.#picture = answer.picture;
                    this.#error = '';
                }
                show('', false);
            } else {
                show(answer.error || getWord(this.systemLang, 'noPicture'), true);
            }
        });

        this.openDialog({ title: settings.title || dialogCamera.name, element: content, width: DIALOG_WIDTH })
            .catch(() => null)
            .finally(() => {
                poller.stop();
                if (this.#dialog === content) {
                    this.#dialog = null;
                }
                this.render();
            });
    }
}
