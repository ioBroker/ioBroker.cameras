import React from 'react';

import { Autocomplete, Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Tune as IconGeneric } from '@mui/icons-material';

import { I18n } from '@iobroker/gui-components';
import type { CameraConfig, CameraConfigUniversal, CameraType } from '../types';

/**
 * The dialog asks for the manufacturer first and only then for the way to connect. Both answers are
 * mapped to the existing camera types, so the stored configuration keeps its format: a camera is
 * still `{ type: 'universal', manufacturer: 'hikvision' }` or `{ type: 'eufy' }` as before.
 */

export type ManufacturerItem = {
    /** File name of the data file in ./data/, e.g. "hikvision" */
    id: string;
    /** Label shown in the dropdown, e.g. "Hikvision" */
    name: string;
};

/** Pseudo manufacturer for the types that are not bound to one: plain URL and RTSP */
export const GENERIC = '_generic';

export interface Variant {
    type: CameraType;
    /** Not translated */
    label: string;
    /** Still works, but is not offered for new cameras */
    deprecated?: boolean;
}

const GENERIC_VARIANTS: Variant[] = [
    { type: 'url', label: 'Snapshot URL' },
    { type: 'urlBasicAuth', label: 'Snapshot URL with basic auth' },
    { type: 'rtsp', label: 'RTSP stream' },
];

/** The model list of ./data/<manufacturer>.json, handled by the type "universal" */
const CATALOG_VARIANT: Variant = { type: 'universal', label: 'Model list' };

/**
 * Manufacturers with an own implementation. It is offered in front of the model list, as it
 * usually knows more about the camera than a bare URL path.
 */
const DEDICATED: Record<string, { name: string; variants: Variant[] }> = {
    eufy: { name: 'Eufy', variants: [{ type: 'eufy', label: 'Eufy Security (local or via eusec adapter)' }] },
    hikam: { name: 'HiKam / WiWiCam', variants: [{ type: 'hikam', label: 'HiKam / WiWiCam' }] },
    instar: { name: 'INSTAR', variants: [{ type: 'instar', label: 'Snapshot (HTTP)' }] },
    // reolink.json covers the E1 models with the same URL paths
    reolink: { name: 'Reolink', variants: [{ type: 'reolinkE1', label: 'Reolink E1 Snapshot', deprecated: true }] },
    ubiquiti: { name: 'Ubiquiti', variants: [{ type: 'unifi', label: 'UniFi Protect' }] },
};

/** Manufacturer a stored camera belongs to. Empty for a "universal" camera without one */
export function getManufacturerOfCamera(cam: CameraConfig): string {
    switch (cam.type) {
        case 'url':
        case 'urlBasicAuth':
        case 'rtsp':
            return GENERIC;
        case 'universal':
            return (cam as CameraConfigUniversal).manufacturer || '';
        case 'unifi':
            return 'ubiquiti';
        case 'reolinkE1':
            return 'reolink';
        default:
            // eufy, hikam, instar
            return cam.type || '';
    }
}

/**
 * Ways to connect a camera of this manufacturer.
 *
 * @param manufacturer id of the manufacturer
 * @param manufacturers the model lists that exist
 * @param currentType a deprecated type is only listed while the camera still uses it
 */
export function getVariants(manufacturer: string, manufacturers: ManufacturerItem[], currentType?: string): Variant[] {
    if (manufacturer === GENERIC) {
        return GENERIC_VARIANTS;
    }
    const variants = (DEDICATED[manufacturer]?.variants || []).filter(v => !v.deprecated || v.type === currentType);
    if (manufacturers.find(m => m.id === manufacturer)) {
        variants.push(CATALOG_VARIANT);
    }
    return variants;
}

/** All manufacturers of the dropdown: the model lists plus the ones with only an own implementation */
export function getManufacturerOptions(manufacturers: ManufacturerItem[]): ManufacturerItem[] {
    const list = [...manufacturers];
    Object.keys(DEDICATED).forEach(id => {
        if (!list.find(m => m.id === id)) {
            list.push({ id, name: DEDICATED[id].name });
        }
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    return [{ id: GENERIC, name: I18n.t('Universal (custom URL / RTSP)') }, ...list];
}

export function isDeprecatedType(type: CameraType): boolean {
    return !!Object.values(DEDICATED).find(d => d.variants.find(v => v.type === type && v.deprecated));
}

/** Text for the list of cameras, like "Hikvision" or "Universal (custom URL / RTSP) - RTSP stream" */
export function getCameraTypeLabel(cam: CameraConfig, manufacturers: ManufacturerItem[]): string {
    const manufacturer = getManufacturerOfCamera(cam);
    if (!manufacturer) {
        return I18n.t('Select a manufacturer');
    }
    const name =
        manufacturer === GENERIC
            ? I18n.t('Universal (custom URL / RTSP)')
            : manufacturers.find(m => m.id === manufacturer)?.name || DEDICATED[manufacturer]?.name || manufacturer;
    const variants = getVariants(manufacturer, manufacturers, cam.type);
    const variant = variants.find(v => v.type === cam.type);
    if (variants.length > 1 && variant) {
        return `${name} - ${I18n.t(variant.label)}${variant.deprecated ? ` (${I18n.t('deprecated')})` : ''}`;
    }
    return name;
}

export function ManufacturerIcon(props: { manufacturer: string; size?: number }): React.JSX.Element | null {
    const size = props.size || 24;
    if (!props.manufacturer) {
        return null;
    }
    if (props.manufacturer === GENERIC) {
        return <IconGeneric style={{ width: size, height: size, flexShrink: 0 }} />;
    }
    return (
        <img
            // The <img> is reused for the next manufacturer - it must not stay hidden after an error
            key={props.manufacturer}
            src={`./data/${props.manufacturer}.svg`}
            alt=""
            style={{ width: size, height: size, flexShrink: 0, objectFit: 'contain' }}
            // Not every manufacturer has a logo - do not show a broken image
            onError={e => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
        />
    );
}

interface TypeSelectorProps {
    cam: CameraConfig;
    manufacturers: ManufacturerItem[];
    onChange: (manufacturer: string, type: CameraType) => void;
}

export default function TypeSelector(props: TypeSelectorProps): React.JSX.Element {
    // Stable references: the Autocomplete and the input adornment run effects on every new object,
    // and the dialog renders again on each keystroke in the form below
    const options = React.useMemo(() => getManufacturerOptions(props.manufacturers), [props.manufacturers]);
    const manufacturer = getManufacturerOfCamera(props.cam);
    const selected = options.find(m => m.id === manufacturer) || null;
    const adornment = React.useMemo(
        () =>
            selected ? (
                <ManufacturerIcon
                    manufacturer={selected.id}
                    size={20}
                />
            ) : null,
        [selected],
    );
    const variants = manufacturer ? getVariants(manufacturer, props.manufacturers, props.cam.type) : [];

    return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
            <Autocomplete
                autoHighlight
                style={{ flex: 1, minWidth: 250 }}
                value={selected}
                options={options}
                getOptionLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(optionProps, option) => {
                    const { key, ...rest } = optionProps;
                    return (
                        <Box
                            component="li"
                            key={option.id}
                            {...rest}
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <ManufacturerIcon manufacturer={option.id} />
                            <span>{option.name}</span>
                        </Box>
                    );
                }}
                onChange={(_event, value) => {
                    if (value) {
                        // The first way is the recommended one
                        props.onChange(value.id, getVariants(value.id, props.manufacturers)[0].type);
                    }
                }}
                renderInput={params => (
                    <TextField
                        {...params}
                        variant="standard"
                        label={I18n.t('Manufacturer')}
                        helperText={selected ? '' : I18n.t('Select a manufacturer')}
                        slotProps={{
                            ...params.slotProps,
                            input: {
                                ...params.slotProps.input,
                                startAdornment: adornment,
                            },
                        }}
                    />
                )}
            />
            {variants.length > 1 ? (
                <FormControl
                    variant="standard"
                    style={{ flex: 1, minWidth: 250 }}
                >
                    <InputLabel>{I18n.t('Connection')}</InputLabel>
                    <Select
                        variant="standard"
                        value={props.cam.type}
                        onChange={e => props.onChange(manufacturer, e.target.value)}
                    >
                        {variants.map(v => (
                            <MenuItem
                                key={v.type}
                                value={v.type}
                            >
                                {I18n.t(v.label)}
                                {v.deprecated ? ` (${I18n.t('deprecated')})` : ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : null}
        </div>
    );
}
