type Point = { readonly x: number; readonly y: number }
type Size  = { readonly width: number; readonly height: number }
type Rect  = { readonly x: number; readonly y: number; readonly width: number; readonly height: number }

/**
 * @param start drag start point 
 * @param end   drag end point
 * @returns     normalized rectangle (x, y is top-left corner, width and height are positive)
 */
function normalizeRect(start: Point, end: Point): Rect {
    return {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y)
    };

}

/**
 * @param rect             rectangle in CSS pixels
 * @param devicePixelRatio device pixel ratio
 * @param imageSize        image size in physical pixels
 * @returns                rectangle in physical pixels, clamped to image size
 */
function toImageRect(rect: Rect, devicePixelRatio: number, imageSize: Size): Rect {
    const leftX = Math.floor(rect.x * devicePixelRatio);
    const rightX = Math.ceil((rect.x + rect.width) * devicePixelRatio);
    const topY = Math.floor(rect.y * devicePixelRatio);
    const bottomY = Math.ceil((rect.y + rect.height) * devicePixelRatio);

    const clampedLeftX = Math.max(0, Math.min(leftX, imageSize.width));
    const clampedRightX = Math.max(0, Math.min(rightX, imageSize.width));
    const clampedTopY = Math.max(0, Math.min(topY, imageSize.height));
    const clampedBottomY = Math.max(0, Math.min(bottomY, imageSize.height));

    return {
        x: clampedLeftX,
        y: clampedTopY,
        width: clampedRightX - clampedLeftX,
        height: clampedBottomY - clampedTopY
    };
}
/**
 * @param rect         rectangle in CSS pixels
 * @returns            true: rectangle is too small (width or height < 5); false: rectangle is valid
 */
function isSelectionTooSmall(rect: Rect): boolean {
    return rect.height < 5 || rect.width < 5;
}

export type { Point, Size, Rect };
export { normalizeRect, toImageRect, isSelectionTooSmall };