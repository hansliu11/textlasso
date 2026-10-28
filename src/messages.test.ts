import { describe, it, expect } from 'vitest'
import type { SelectionDoneMessage, OcrRequestMessage, CaptureDoneMessage } from './messages';
import { isExtensionMessage } from './messages';

describe('isExtensionMessage', () => {
    it('Should return true for SelectionDoneMessage', () => {
        const message: SelectionDoneMessage = {
            type: 'selection-done',
            rect: { x: 0, y: 0, width: 100, height: 100 },
            devicePixelRatio: 1
        };
        expect(isExtensionMessage(message)).toBe(true);
    });
    it('Should return true for OcrRequestMessage', () => {
        const message: OcrRequestMessage = {
            type: 'ocr-request',
            screenshotDataUrl: 'data:image/png;base64,...',
            rect: { x: 0, y: 0, width: 100, height: 100 },
            devicePixelRatio: 1
        };
        expect(isExtensionMessage(message)).toBe(true);
    });
    it('Should return true for CaptureDoneMessage', () => {
        const message: CaptureDoneMessage = {
            type: 'capture-done',
        };
        expect(isExtensionMessage(message)).toBe(true);
    });
    it('Should return false for obejct with type is other string', () => {
        const message = {
            str: 'not-an-extension-message',
            type: 'random-type',
            value: 1
        };
        expect(isExtensionMessage(message)).toBe(false);
    });
    it('Should return false for string', () => {
        const message = 'not-an-extension-message';
        expect(isExtensionMessage(message)).toBe(false);
    });
    it('Should return false for number', () => {
        const message = 12;
        expect(isExtensionMessage(message)).toBe(false);
    });
    it('Should return false for obeject without type', () => {
        const message = {
            val: 2,
            str: 'not-an-extension-message'
        };
        expect(isExtensionMessage(message)).toBe(false);
    });
    it('Should return false for null', () => {
        expect(isExtensionMessage(null)).toBe(false);
    });
})