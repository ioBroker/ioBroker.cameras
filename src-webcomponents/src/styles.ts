/**
 * The styles of the shadow roots. The element fills the box of the host, has a transparent background and inherits
 * `color` and `font`; what it colors itself comes from the theme variables of the host (`--iob-*`). Sizes follow
 * the box through container queries, nothing is measured.
 */
export const STYLES = `
:host {
    display: block;
    width: 100%;
    height: 100%;
}
.box {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* the size of the box does not depend on what is in it */
    container-type: size;
}
.title {
    flex: none;
    padding: 0 0.4em 0.3em;
    font-size: clamp(11px, 7cqmin, 18px);
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.title[hidden] {
    display: none;
}
.picture {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border-radius: calc(var(--iob-border-radius, 4px) * 2);
    background: color-mix(in srgb, currentColor 6%, transparent);
    -webkit-tap-highlight-color: transparent;
}
.picture.has-picture {
    background: transparent;
}
.picture.clickable {
    cursor: zoom-in;
}
.picture.edit {
    pointer-events: none;
}
.picture:focus-visible {
    outline: 2px solid var(--iob-primary, currentColor);
    outline-offset: -2px;
}
img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}
img[hidden] {
    display: none;
}
.hint {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    padding: 0.6em;
    text-align: center;
    font-size: clamp(11px, 5.5cqmin, 15px);
    color: var(--iob-text-secondary, inherit);
    overflow: hidden;
    overflow-wrap: anywhere;
}
.hint[hidden] {
    display: none;
}
/* over a picture that is not current any more */
.hint.over {
    background: color-mix(in srgb, var(--iob-paper, #fff) 72%, transparent);
    color: var(--iob-text, inherit);
}
.hint.error {
    color: var(--iob-error, #f44336);
}
.hint svg {
    width: clamp(20px, 14cqmin, 44px);
    height: clamp(20px, 14cqmin, 44px);
    fill: currentColor;
    opacity: 0.6;
    flex: none;
}
`;

/** The content of the dialog: the host frames it, so it brings its own styles */
export const DIALOG_STYLES = `
:host {
    display: block;
}
.full {
    position: relative;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--iob-text, inherit);
}
img {
    display: block;
    max-width: 100%;
    max-height: 75vh;
    margin: 0 auto;
    object-fit: contain;
}
img[hidden] {
    display: none;
}
.hint {
    padding: 1em;
    text-align: center;
    color: var(--iob-text-secondary, inherit);
}
.hint[hidden] {
    display: none;
}
.hint.over {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--iob-paper, #fff) 72%, transparent);
    color: var(--iob-text, inherit);
}
.hint.error {
    color: var(--iob-error, #f44336);
}
`;

/** Videocam of the Material icons (Apache License 2.0) */
export const CAMERA_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>';
