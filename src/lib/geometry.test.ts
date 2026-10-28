import { describe, it, expect } from 'vitest'
import { normalizeRect, toImageRect, isSelectionTooSmall } from './geometry'

describe('normalizeRect', () => {
    it('keeps a top-left to bottom-right drag unchanged', () => {
    expect(normalizeRect({ x: 10, y: 20 }, { x: 110, y: 70 }))
        .toEqual({ x: 10, y: 20, width: 100, height: 50 });
    });
    it('Test from bottom-right to top-left drag', () => {
    expect(normalizeRect({ x: 110, y: 70 }, { x: 10, y: 20 }))
        .toEqual({ x: 10, y: 20, width: 100, height: 50 });
    });
    it('Test from bottom-left to top-right drag', () => {
    expect(normalizeRect({ x: 10, y: 70 }, { x: 110, y: 20 }))
        .toEqual({ x: 10, y: 20, width: 100, height: 50 });
    })
    it('Returns zero width and height for a point', () => {
        expect(normalizeRect({ x: 50, y: 50 }, { x: 50, y: 50 }))
        .toEqual({ x: 50, y: 50, width: 0, height: 0 });
    });
});

describe('toImageRect', () => {
    it('Converts a rectangle to an image rectangle with dpr = 1', () => {
        expect(toImageRect({x: 10, y: 20, width: 10, height: 20}, 1, {width: 100, height: 100})).toEqual({x: 10, y: 20, width: 10, height: 20});
    });
    it('Converts a rectangle to an image rectangle with dpr = 2', () => {
        expect(toImageRect({x: 10, y: 20, width: 10, height: 20}, 2, {width: 100, height: 100})).toEqual({x: 20, y: 40, width: 20, height: 40});
    });
    it('Converts a rectangle to an image rectangle with dpr has decimal point', () => {
        expect(toImageRect({x: 1, y: 1, width: 3, height: 3}, 1.5, {width: 10, height: 10})).toEqual({x: 1, y: 1, width: 5, height: 5});
    });
    it('Converts a rectangle to an image rectangle with expanding', () => {
        expect(toImageRect({x: 1, y: 1, width: 2, height: 2}, 1.5, {width: 10, height: 10})).toEqual({x: 1, y: 1, width: 4, height: 4});
    });
    it('Handle case that the selected rectangle exceed left top of image', () => {
        expect(toImageRect({x: -2, y: -1, width: 5, height: 5}, 2, {width: 20, height: 20})).toEqual({x: 0, y: 0, width: 6, height: 8});
    });
    it('Handle case that the selected rectangle exceed image size', () => {
        expect(toImageRect({x: 3, y: 5, width: 10, height: 10}, 2, {width: 20, height: 20})).toEqual({x: 6, y: 10, width: 14, height: 10});
    });
    it('Handle case that totally out of the image size', () => {
        expect(toImageRect({x: 15, y: 4, width: 5, height: 5}, 2, {width: 20, height: 20})).toEqual({x: 20, y: 8, width: 0, height: 10});
    });
});

describe('isSelectionTooSmall', () => {
    it('Should return true for height < 5 or width < 5', () => {
        expect(isSelectionTooSmall({width: 4, height: 5, x: 1, y: 1})).toBe(true);
    });
    it('Should return true for height < 5 or width < 5', () => {
        expect(isSelectionTooSmall({width: 5, height: 4, x: 1, y: 1})).toBe(true);
    });
    it('Should return false for height and width >= 5', () => {
        expect(isSelectionTooSmall({width: 5, height: 5, x: 1, y: 1})).toBe(false);
    });
})