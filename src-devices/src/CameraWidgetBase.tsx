/**
 * Shared base for both camera widgets in ioBroker.devices.
 *
 * The base owns everything that is identical for both: the settings schema, resolving the
 * picked state id to instance + camera name, the tile chrome for the three sizes, and the
 * fullscreen dialog. Subclasses only have to deliver frames by calling `setFrame()` — how
 * they obtain them (polling a message vs. subscribing to a stream) is the whole difference.
 */
import WidgetGeneric, {
    React,
    MuiMaterial,
    MuiIcons,
    getTileStyles,
    isNeumorphicTheme,
    type WidgetGenericProps,
    type WidgetGenericState,
    type CustomWidgetPlugin,
} from '@iobroker/dm-widgets';
import type {
    BoxProps,
    TypographyProps,
    DialogProps,
    DialogContentProps,
    IconButtonProps,
} from '@mui/material';
import type { ConfigItemPanel, ConfigItemTabs } from '@iobroker/dm-utils';

import { parseCameraId, toDataUrl, type CameraRef } from './cameraCommon';

const Box: React.ComponentType<BoxProps> = MuiMaterial?.Box;
const Typography: React.ComponentType<TypographyProps> = MuiMaterial?.Typography;
const Dialog: React.ComponentType<DialogProps> = MuiMaterial?.Dialog;
const DialogContent: React.ComponentType<DialogContentProps> = MuiMaterial?.DialogContent;
const IconButton: React.ComponentType<IconButtonProps> = MuiMaterial?.IconButton;
const CloseIcon: React.ComponentType<any> = MuiIcons?.Close;

export interface CameraWidgetSettings extends CustomWidgetPlugin {
    /** State below the `cameras` namespace, e.g. `cameras.0.cam1.running` */
    cameraStateId?: string;
    /** Rotation applied by the adapter, in degrees */
    rotate?: number;
}

export interface CameraWidgetState extends WidgetGenericState {
    dialogOpen: boolean;
    /** Base64 JPEG of the newest frame */
    frame: string;
    error: string;
}

/** Settings items both widgets share. Subclasses spread this into their own schema. */
export const commonConfigItems = {
    size: {
        type: 'select',
        label: 'wm_Size',
        options: [
            { value: '1x1', label: '1×1' },
            { value: '2x1', label: '2×1' },
            { value: '2x2', label: '2×2' },
        ],
        default: '1x1',
        format: 'radio',
        horizontal: true,
        noTranslation: true,
    },
    cameraStateId: {
        type: 'objectId',
        label: 'cameras_cameraStateId',
        help: 'cameras_cameraStateId_help',
        root: 'cameras',
        sm: 12,
    },
    rotate: {
        type: 'select',
        label: 'cameras_rotate',
        noTranslation: true,
        options: [
            { value: 0, label: '0°' },
            { value: 90, label: '90°' },
            { value: 180, label: '180°' },
            { value: 270, label: '270°' },
        ],
        default: 0,
        sm: 12,
        md: 6,
    },
};

export abstract class CameraWidgetBase<
    TSettings extends CameraWidgetSettings = CameraWidgetSettings,
    TState extends CameraWidgetState = CameraWidgetState,
> extends WidgetGeneric<TState, TSettings> {
    protected camera: CameraRef | null = null;

    constructor(props: WidgetGenericProps<TSettings>) {
        super(props);
        this.state = {
            ...this.state,
            dialogOpen: false,
            frame: '',
            error: '',
        };
        this.camera = parseCameraId(props.settings.cameraStateId);
    }

    /** Start delivering frames. Called once the camera reference is known. */
    protected abstract startCamera(): void;

    /** Stop delivering frames and release every subscription/timer. */
    protected abstract stopCamera(): void;

    componentDidMount(): void {
        if (this.camera) {
            this.startCamera();
        }
    }

    componentWillUnmount(): void {
        this.stopCamera();
    }

    componentDidUpdate(prevProps: WidgetGenericProps<TSettings>): void {
        if (prevProps.settings.cameraStateId !== this.props.settings.cameraStateId) {
            this.stopCamera();
            this.camera = parseCameraId(this.props.settings.cameraStateId);
            this.setState({ frame: '', error: '' } as Partial<TState> as TState);
            if (this.camera) {
                this.startCamera();
            }
        }
    }

    protected setFrame(base64: string): void {
        this.setState({ frame: base64, error: '' } as Partial<TState> as TState);
    }

    protected setError(error: string): void {
        this.setState({ error } as Partial<TState> as TState);
    }

    /** Width the adapter should deliver. Bigger tiles ask for a bigger picture. */
    protected getRequestedWidth(full?: boolean): number {
        if (full) {
            return 1280;
        }
        return this.props.settings.size === '1x1' ? 320 : 640;
    }

    /** The picture itself - identical in the tile and in the dialog */
    protected renderPicture(full?: boolean): React.JSX.Element {
        if (!this.camera) {
            return (
                <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', p: 1 }}
                >
                    {CameraWidgetBase.t('cameras_no_camera')}
                </Typography>
            );
        }

        if (this.state.error) {
            return (
                <Typography
                    variant="caption"
                    sx={{ color: 'error.main', p: 1, overflow: 'hidden' }}
                >
                    {this.state.error}
                </Typography>
            );
        }

        if (!this.state.frame) {
            return (
                <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', p: 1 }}
                >
                    {CameraWidgetBase.t('cameras_loading')}
                </Typography>
            );
        }

        return (
            <img
                src={toDataUrl(this.state.frame)}
                alt={this.camera.name}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                }}
            />
        );
    }

    /** Minimal translation helper - the host installs the bundle's translations globally */
    static t(word: string): string {
        const i18n = (window as any).systemDictionary || (window as any).translations;
        const lang: string = (window as any).sysLang || 'en';
        return i18n?.[word]?.[lang] || word;
    }

    protected renderDialog(): React.JSX.Element | null {
        if (!this.state.dialogOpen) {
            return null;
        }

        return (
            <Dialog
                open={!0}
                fullWidth
                maxWidth="lg"
                onClose={() => this.setState({ dialogOpen: false } as Partial<TState> as TState)}
            >
                <DialogContent sx={{ position: 'relative', p: 1 }}>
                    <IconButton
                        onClick={() => this.setState({ dialogOpen: false } as Partial<TState> as TState)}
                        sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                    {this.renderPicture(true)}
                </DialogContent>
            </Dialog>
        );
    }

    /** Tile body shared by all three sizes */
    private renderTile(aspectRatio: string, styleFn: (theme: any) => React.CSSProperties): React.JSX.Element {
        const isActive = this.isTileActive();
        const accent = this.getAccentColor();
        const settingsButton = this.renderSettingsButton();
        const indicators = this.renderIndicators(settingsButton);
        const label = this.props.settings.name || this.camera?.name || '';

        return (
            <Box
                id={String(this.props.widget.id)}
                className={this.getWidgetClass()}
                sx={(theme: any) => styleFn(theme)}
            >
                <Box
                    onClick={() => this.setState({ dialogOpen: true } as Partial<TState> as TState)}
                    sx={(theme: any) => ({
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        aspectRatio,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        ...(getTileStyles(theme, isActive, accent) as any),
                        padding: isNeumorphicTheme(theme) ? '4px' : '6px',
                    })}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ display: 'contents' }}
                    >
                        {indicators}
                    </div>
                    {label ? (
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                color: 'text.secondary',
                                px: 0.5,
                                pb: 0.25,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {label}
                        </Typography>
                    ) : null}
                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{this.renderPicture()}</Box>
                </Box>
                {this.renderDialog()}
            </Box>
        );
    }

    override renderCompact(): React.JSX.Element {
        return this.renderTile('1', theme => WidgetGeneric.getStyleCompact(theme));
    }

    override renderWide(): React.JSX.Element {
        return this.renderTile('2', theme => WidgetGeneric.getStyleWide(theme));
    }

    override renderWideTall(): React.JSX.Element {
        return this.renderTile('1', theme => WidgetGeneric.getStyleWideTall(theme));
    }

    /** Both widgets share the base fields; subclasses add their own on top */
    static buildConfigSchema(
        name: string,
        extraItems: Record<string, unknown>,
    ): { name: string; schema: ConfigItemPanel | ConfigItemTabs } {
        return {
            name,
            schema: {
                type: 'panel',
                items: {
                    ...commonConfigItems,
                    ...extraItems,
                },
            } as ConfigItemPanel,
        };
    }
}

export default CameraWidgetBase;
