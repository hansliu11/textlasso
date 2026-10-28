import type { Rect } from './lib/geometry';
type SelectionDoneMessage = {
    readonly type: 'selection-done',
    readonly rect: Rect,
    readonly devicePixelRatio: number
};

type OcrRequestMessage = {
    readonly type: 'ocr-request',
    readonly screenshotDataUrl: string,
    readonly rect: Rect,
    readonly devicePixelRatio: number
};

type CaptureDoneMessage = { readonly type: 'capture-done' };

type ExtensionMessage = SelectionDoneMessage | OcrRequestMessage | CaptureDoneMessage;

type OcrResult = {readonly ok: true, readonly text: string}| {readonly ok: false, readonly error: string};

function isExtensionMessage(value: unknown): value is ExtensionMessage {
    return value !== null && typeof value === 'object' && ("type" in value) && (value .type === 'selection-done' || value.type === 'ocr-request' || value.type === 'capture-done');
}

export type { ExtensionMessage, SelectionDoneMessage, OcrRequestMessage, CaptureDoneMessage, OcrResult };
export { isExtensionMessage };
