/**
 * The words of the manifests in the languages of ioBroker. `camera`, `cameraHelp`, `rotate`, `pollingInterval`,
 * `pollingIntervalHelp` and `noCache` are the ones of the native ioBroker.devices widgets (`src-devices/src/i18n/`).
 *
 * Read by the build only (`manifest.ts`), so its imports carry their extension.
 */
import type { WebComponentText } from '@iobroker/web-components';

import { LANGUAGES, type Language } from './i18n.ts';

const EN = {
    camera: 'Camera',
    cameraHelp: 'Select a state of the camera, e.g. cameras.0.cam1.running',
    title: 'Name',
    titleHelp: 'Shown above the picture; empty: no title',
    width: 'Picture width (px)',
    widthHelp: 'The adapter scales the picture to it, the dialog to at least 1280. 0: as the camera sends it',
    rotate: 'Rotation',
    pollingInterval: 'Polling interval (ms)',
    pollingIntervalHelp: 'How often a new picture is requested',
    pollingIntervalFull: 'Polling interval in the dialog (ms)',
    noCache: 'Bypass cache',
    bigCamera: 'Camera in the dialog',
    bigCameraHelp:
        'Another camera for the big picture, e.g. the same one in a higher resolution; empty: the camera above',
};

export type ManifestWordKey = keyof typeof EN;

const WORDS: Record<Language, Record<ManifestWordKey, string>> = {
    en: EN,
    de: {
        camera: 'Kamera',
        cameraHelp: 'Zustand der Kamera auswählen, z. B. cameras.0.cam1.running',
        title: 'Name',
        titleHelp: 'Wird über dem Bild angezeigt; leer: kein Titel',
        width: 'Bildbreite (px)',
        widthHelp: 'Der Adapter skaliert das Bild darauf, im Dialog auf mindestens 1280. 0: wie die Kamera es liefert',
        rotate: 'Drehung',
        pollingInterval: 'Abrufintervall (ms)',
        pollingIntervalHelp: 'Wie oft ein neues Bild angefordert wird',
        pollingIntervalFull: 'Abrufintervall im Dialog (ms)',
        noCache: 'Cache umgehen',
        bigCamera: 'Kamera im Dialog',
        bigCameraHelp:
            'Eine andere Kamera für das große Bild, z. B. dieselbe in höherer Auflösung; leer: die Kamera oben',
    },
    ru: {
        camera: 'Камера',
        cameraHelp: 'Выберите состояние камеры, например cameras.0.cam1.running',
        title: 'Название',
        titleHelp: 'Показывается над изображением; пусто: без заголовка',
        width: 'Ширина изображения (px)',
        widthHelp: 'Адаптер масштабирует изображение до этой ширины, в диалоге — минимум до 1280. 0: как отдаёт камера',
        rotate: 'Поворот',
        pollingInterval: 'Интервал опроса (мс)',
        pollingIntervalHelp: 'Как часто запрашивается новое изображение',
        pollingIntervalFull: 'Интервал опроса в диалоге (мс)',
        noCache: 'Обходить кэш',
        bigCamera: 'Камера в диалоге',
        bigCameraHelp:
            'Другая камера для большого изображения, например та же в более высоком разрешении; пусто: камера выше',
    },
    pt: {
        camera: 'Câmera',
        cameraHelp: 'Selecione um estado da câmera, ex. cameras.0.cam1.running',
        title: 'Nome',
        titleHelp: 'Mostrado acima da imagem; vazio: sem título',
        width: 'Largura da imagem (px)',
        widthHelp:
            'O adaptador dimensiona a imagem para essa largura, no diálogo para pelo menos 1280. 0: como a câmera a envia',
        rotate: 'Rotação',
        pollingInterval: 'Intervalo de consulta (ms)',
        pollingIntervalHelp: 'Com que frequência uma nova imagem é solicitada',
        pollingIntervalFull: 'Intervalo de consulta no diálogo (ms)',
        noCache: 'Ignorar cache',
        bigCamera: 'Câmera no diálogo',
        bigCameraHelp: 'Outra câmera para a imagem grande, p. ex. a mesma em resolução maior; vazio: a câmera acima',
    },
    nl: {
        camera: 'Camera',
        cameraHelp: 'Kies een state van de camera, bijv. cameras.0.cam1.running',
        title: 'Naam',
        titleHelp: 'Wordt boven de afbeelding getoond; leeg: geen titel',
        width: 'Afbeeldingsbreedte (px)',
        widthHelp:
            'De adapter schaalt de afbeelding naar deze breedte, in het dialoogvenster naar minstens 1280. 0: zoals de camera hem levert',
        rotate: 'Rotatie',
        pollingInterval: 'Pollinginterval (ms)',
        pollingIntervalHelp: 'Hoe vaak een nieuwe afbeelding wordt opgevraagd',
        pollingIntervalFull: 'Pollinginterval in het dialoogvenster (ms)',
        noCache: 'Cache omzeilen',
        bigCamera: 'Camera in het dialoogvenster',
        bigCameraHelp:
            'Een andere camera voor het grote beeld, bijv. dezelfde in een hogere resolutie; leeg: de camera hierboven',
    },
    fr: {
        camera: 'Caméra',
        cameraHelp: 'Sélectionnez un état de la caméra, p. ex. cameras.0.cam1.running',
        title: 'Nom',
        titleHelp: "Affiché au-dessus de l'image ; vide : pas de titre",
        width: "Largeur de l'image (px)",
        widthHelp:
            "L'adaptateur met l'image à cette largeur, dans la boîte de dialogue à au moins 1280. 0 : telle que la caméra l'envoie",
        rotate: 'Rotation',
        pollingInterval: 'Intervalle de scrutation (ms)',
        pollingIntervalHelp: 'À quelle fréquence une nouvelle image est demandée',
        pollingIntervalFull: 'Intervalle de scrutation dans la boîte de dialogue (ms)',
        noCache: 'Contourner le cache',
        bigCamera: 'Caméra dans la boîte de dialogue',
        bigCameraHelp:
            'Une autre caméra pour la grande image, p. ex. la même en plus haute résolution ; vide : la caméra ci-dessus',
    },
    it: {
        camera: 'Telecamera',
        cameraHelp: 'Seleziona uno stato della telecamera, es. cameras.0.cam1.running',
        title: 'Nome',
        titleHelp: "Mostrato sopra l'immagine; vuoto: nessun titolo",
        width: "Larghezza dell'immagine (px)",
        widthHelp:
            "L'adattatore scala l'immagine a questa larghezza, nella finestra di dialogo ad almeno 1280. 0: come la invia la telecamera",
        rotate: 'Rotazione',
        pollingInterval: 'Intervallo di polling (ms)',
        pollingIntervalHelp: 'Ogni quanto viene richiesta una nuova immagine',
        pollingIntervalFull: 'Intervallo di polling nella finestra di dialogo (ms)',
        noCache: 'Ignora la cache',
        bigCamera: 'Telecamera nella finestra di dialogo',
        bigCameraHelp:
            "Un'altra telecamera per l'immagine grande, ad es. la stessa a risoluzione più alta; vuoto: la telecamera sopra",
    },
    es: {
        camera: 'Cámara',
        cameraHelp: 'Seleccione un estado de la cámara, p. ej. cameras.0.cam1.running',
        title: 'Nombre',
        titleHelp: 'Se muestra encima de la imagen; vacío: sin título',
        width: 'Ancho de la imagen (px)',
        widthHelp:
            'El adaptador escala la imagen a este ancho, en el diálogo a al menos 1280. 0: tal como la envía la cámara',
        rotate: 'Rotación',
        pollingInterval: 'Intervalo de sondeo (ms)',
        pollingIntervalHelp: 'Con qué frecuencia se solicita una nueva imagen',
        pollingIntervalFull: 'Intervalo de sondeo en el diálogo (ms)',
        noCache: 'Omitir caché',
        bigCamera: 'Cámara en el diálogo',
        bigCameraHelp:
            'Otra cámara para la imagen grande, p. ej. la misma en mayor resolución; vacío: la cámara de arriba',
    },
    pl: {
        camera: 'Kamera',
        cameraHelp: 'Wybierz stan kamery, np. cameras.0.cam1.running',
        title: 'Nazwa',
        titleHelp: 'Wyświetlana nad obrazem; puste: bez tytułu',
        width: 'Szerokość obrazu (px)',
        widthHelp:
            'Adapter skaluje obraz do tej szerokości, w oknie dialogowym do co najmniej 1280. 0: tak, jak wysyła kamera',
        rotate: 'Obrót',
        pollingInterval: 'Interwał odpytywania (ms)',
        pollingIntervalHelp: 'Jak często pobierany jest nowy obraz',
        pollingIntervalFull: 'Interwał odpytywania w oknie dialogowym (ms)',
        noCache: 'Pomiń pamięć podręczną',
        bigCamera: 'Kamera w oknie dialogowym',
        bigCameraHelp: 'Inna kamera dla dużego obrazu, np. ta sama w wyższej rozdzielczości; puste: kamera powyżej',
    },
    uk: {
        camera: 'Камера',
        cameraHelp: 'Виберіть стан камери, напр. cameras.0.cam1.running',
        title: 'Назва',
        titleHelp: 'Показується над зображенням; порожньо: без заголовка',
        width: 'Ширина зображення (px)',
        widthHelp: 'Адаптер масштабує зображення до цієї ширини, у діалозі — щонайменше до 1280. 0: як надсилає камера',
        rotate: 'Обертання',
        pollingInterval: 'Інтервал опитування (мс)',
        pollingIntervalHelp: 'Як часто запитується нове зображення',
        pollingIntervalFull: 'Інтервал опитування в діалозі (мс)',
        noCache: 'Обходити кеш',
        bigCamera: 'Камера в діалозі',
        bigCameraHelp: 'Інша камера для великого зображення, напр. та сама у вищій роздільності; порожньо: камера вище',
    },
    'zh-cn': {
        camera: '摄像机',
        cameraHelp: '选择摄像机的状态，例如 cameras.0.cam1.running',
        title: '名称',
        titleHelp: '显示在图像上方；为空时不显示标题',
        width: '图像宽度 (px)',
        widthHelp: '适配器将图像缩放到此宽度，对话框中至少为 1280。0：保持摄像机发送的尺寸',
        rotate: '旋转',
        pollingInterval: '轮询间隔 (毫秒)',
        pollingIntervalHelp: '请求新图像的频率',
        pollingIntervalFull: '对话框中的轮询间隔 (毫秒)',
        noCache: '绕过缓存',
        bigCamera: '对话框中的摄像机',
        bigCameraHelp: '用于大图的另一台摄像机，例如同一台的高分辨率画面；为空时使用上面的摄像机',
    },
};

/**
 * A word in every language
 *
 * @param key the word
 */
export function getTexts(key: ManifestWordKey): WebComponentText {
    return Object.fromEntries(LANGUAGES.map(lang => [lang, WORDS[lang][key]])) as WebComponentText;
}

/**
 * A text of io-package.json in every language: a plain string is taken for each of them, a missing language gets
 * the English text - in every language it reads as the original does
 *
 * @param text a string or `{ en, de, ... }`
 */
export function inAllLanguages(text: ioBroker.StringOrTranslated): WebComponentText {
    return Object.fromEntries(
        LANGUAGES.map(lang => [lang, typeof text === 'string' ? text : text[lang] || text.en]),
    ) as WebComponentText;
}
