/**
 * The words the elements show, in the languages of ioBroker. `loading` and `inactive` are the ones of the native
 * ioBroker.devices widgets (`src-devices/src/i18n/`). The words of the manifests are in `manifestWords.ts`: they
 * are not needed in the modules.
 */
export const LANGUAGES = ['en', 'de', 'ru', 'pt', 'nl', 'fr', 'it', 'es', 'pl', 'uk', 'zh-cn'] as const;

export type Language = (typeof LANGUAGES)[number];

const EN = {
    chooseCamera: 'Choose a camera in the settings',
    notCamera: 'Not a camera of the cameras adapter',
    loading: 'Loading…',
    inactive: 'Camera instance is not running',
    noPicture: 'Cannot get the picture',
};

export type WordKey = keyof typeof EN;

const WORDS: Record<Language, Record<WordKey, string>> = {
    en: EN,
    de: {
        chooseCamera: 'Kamera in den Einstellungen wählen',
        notCamera: 'Keine Kamera des Adapters cameras',
        loading: 'Wird geladen…',
        inactive: 'Kamera-Instanz läuft nicht',
        noPicture: 'Bild kann nicht geladen werden',
    },
    ru: {
        chooseCamera: 'Выберите камеру в настройках',
        notCamera: 'Это не камера адаптера cameras',
        loading: 'Загрузка…',
        inactive: 'Экземпляр камеры не запущен',
        noPicture: 'Не удаётся получить изображение',
    },
    pt: {
        chooseCamera: 'Escolha uma câmera nas configurações',
        notCamera: 'Não é uma câmera do adaptador cameras',
        loading: 'Carregando…',
        inactive: 'A instância da câmera não está em execução',
        noPicture: 'Não é possível obter a imagem',
    },
    nl: {
        chooseCamera: 'Kies een camera in de instellingen',
        notCamera: 'Geen camera van de adapter cameras',
        loading: 'Laden…',
        inactive: 'Camera-instantie draait niet',
        noPicture: 'Kan de afbeelding niet ophalen',
    },
    fr: {
        chooseCamera: 'Choisissez une caméra dans les paramètres',
        notCamera: "Pas une caméra de l'adaptateur cameras",
        loading: 'Chargement…',
        inactive: 'L’instance de la caméra ne fonctionne pas',
        noPicture: "Impossible d'obtenir l'image",
    },
    it: {
        chooseCamera: 'Scegli una telecamera nelle impostazioni',
        notCamera: "Non è una telecamera dell'adattatore cameras",
        loading: 'Caricamento…',
        inactive: 'L’istanza della telecamera non è in esecuzione',
        noPicture: "Impossibile ottenere l'immagine",
    },
    es: {
        chooseCamera: 'Elija una cámara en la configuración',
        notCamera: 'No es una cámara del adaptador cameras',
        loading: 'Cargando…',
        inactive: 'La instancia de la cámara no se está ejecutando',
        noPicture: 'No se puede obtener la imagen',
    },
    pl: {
        chooseCamera: 'Wybierz kamerę w ustawieniach',
        notCamera: 'To nie jest kamera adaptera cameras',
        loading: 'Ładowanie…',
        inactive: 'Instancja kamery nie działa',
        noPicture: 'Nie można pobrać obrazu',
    },
    uk: {
        chooseCamera: 'Виберіть камеру в налаштуваннях',
        notCamera: 'Це не камера адаптера cameras',
        loading: 'Завантаження…',
        inactive: 'Екземпляр камери не запущено',
        noPicture: 'Не вдається отримати зображення',
    },
    'zh-cn': {
        chooseCamera: '请在设置中选择摄像机',
        notCamera: '不是 cameras 适配器的摄像机',
        loading: '加载中…',
        inactive: '摄像机实例未运行',
        noPicture: '无法获取图像',
    },
};

/**
 * A word in the language of the system, English if there is none in it
 *
 * @param lang the language of the ioBroker system
 * @param key the word
 */
export function getWord(lang: string, key: WordKey): string {
    return WORDS[lang as Language]?.[key] || EN[key];
}
