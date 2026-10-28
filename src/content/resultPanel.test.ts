import type { PanelState } from './resultPanel';
import { describe, it, expect } from 'vitest'
import { toPanelState } from './resultPanel'

describe('toPanelState', () => {
    it('Should return error for ok in OrcResult is false', () => {
        const res: PanelState = toPanelState({ok: false, error: "error message"});
        expect(res.kind).toBe('error');
    });
    it('Should return empty for ok in OrcResult is true and text is empty', () => {
        const res: PanelState = toPanelState({ok: true, text: ""});
        expect(res.kind).toBe('empty');
    });
    it('Should return empty for ok in OrcResult is true and text is normal', () => {
        const res: PanelState = toPanelState({ok: true, text: "Hello World"});
        expect(res.kind).toBe('success');
    });
});