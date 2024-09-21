import React, { Component, type JSX } from 'react';
import type {
    AnyWidgetId,
    ResizeHandler,
    RxRenderWidgetProps,
    RxWidgetInfo,
    RxWidgetInfoAttributesField,
    RxWidgetInfoWriteable,
    StateID,
    VisViewProps,
    VisWidgetCommand,
    WidgetStyle,
    Writeable,
} from '@iobroker/types-vis-2';
import type { VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2/visRxWidget';
import type { WidgetDataState } from '@iobroker/types-vis-2/visBaseWidget';

export interface WidgetStyleState extends WidgetStyle {
    bindings?: string[];
    _originalData?: string;
}
export interface VisBaseWidgetState {
    applyBindings?:
        | false
        | true
        | {
              top: string | number;
              left: string | number;
          };
    data: WidgetDataState;
    draggable?: boolean;
    editMode: boolean;
    gap?: number;
    hideHelper?: boolean;
    isHidden?: boolean;
    multiViewWidget?: boolean;
    resizable?: boolean;
    resizeHandles?: ResizeHandler[];
    rxStyle?: WidgetStyleState;
    selected?: boolean;
    selectedOne?: boolean;
    showRelativeMoveMenu?: boolean;
    style: WidgetStyleState;
    usedInWidget: boolean;
    widgetHint?: 'light' | 'dark' | 'hide';
}

class VisRxWidget<
    TRxData extends Record<string, any>,
    TState extends Partial<VisRxWidgetState> = VisRxWidgetState,
> extends Component<VisRxWidgetProps, TState & VisBaseWidgetState & { rxData: TRxData }> {
    static POSSIBLE_MUI_STYLES: string[];
    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = {} as TState & VisBaseWidgetState & { rxData: TRxData };
    }
    // eslint-disable-next-line class-methods-use-this
    componentDidMount(): void {}

    // eslint-disable-next-line class-methods-use-this
    componentWillUnmount(): void {}

    static findField(
        _widgetInfo: RxWidgetInfo | RxWidgetInfoWriteable,
        _name: string,
    ): Writeable<RxWidgetInfoAttributesField> | null {
        return null;
    }
    static getI18nPrefix(): string {
        return '';
    }
    static getText(_text: string | ioBroker.Translated): string {
        return '';
    }
    static t(_key: string, ..._args: string[]): string {
        return '';
    }
    static getLanguage(): ioBroker.Languages {
        return 'en';
    }
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    onCommand(_command: VisWidgetCommand, _option?: any): boolean {
        return false;
    }
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    onStateUpdated(_id: string, _state: ioBroker.State): void {}
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    onIoBrokerStateChanged(_id: StateID, _state: ioBroker.State | null | undefined): void {}
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    onStateChanged(
        /** state object */
        _id?: StateID | null,
        /** state value */
        _state?: ioBroker.State | null,
        /** if state should not be set */
        _doNotApplyState?: boolean,
    ): Partial<
        VisRxWidgetState &
            TState & {
                rxData: TRxData;
            }
    > {
        return {};
    }
    // eslint-disable-next-line react/no-unused-class-component-methods
    applyBinding(_stateId: string, _newState: typeof this.state): void {}
    // eslint-disable-next-line react/no-unused-class-component-methods
    onRxDataChanged(_prevRxData: typeof this.state.rxData): void {}
    // eslint-disable-next-line react/no-unused-class-component-methods
    onRxStyleChanged(_prevRxStyle: typeof this.state.rxStyle): void {}

    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    onPropertiesUpdated(): Promise<void> {
        return Promise.resolve();
    }
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    formatValue(value: number | string, _round: number): string {
        return value.toString();
    }
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    wrapContent(
        _content: React.JSX.Element | React.JSX.Element[],
        _addToHeader?: React.JSX.Element | null | React.JSX.Element[],
        _cardContentStyle?: React.CSSProperties,
        _headerStyle?: React.CSSProperties,
        _onCardClick?: (e?: React.MouseEvent<HTMLDivElement>) => void,
        _components?: Record<string, Component<any>>,
    ): JSX.Element {
        return <div />;
    }
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    renderWidgetBody(_props: RxRenderWidgetProps): React.JSX.Element | null {
        return <div />;
    }
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    getWidgetView(_view: string, _props?: Partial<VisViewProps>): JSX.Element {
        return <div />;
    }
    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    getWidgetInWidget(
        _view: string,
        _wid: AnyWidgetId,
        _props?: {
            index?: number;
            refParent?: React.RefObject<HTMLDivElement>;
            isRelative?: boolean;
        },
    ): JSX.Element {
        return <div />;
    }

    // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
    getWidgetInfo(): Readonly<RxWidgetInfo> {
        return {} as Readonly<RxWidgetInfo>;
    }
}
export default VisRxWidget;
