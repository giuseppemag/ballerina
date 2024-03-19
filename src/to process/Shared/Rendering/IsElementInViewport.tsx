export type Visibility =
  | "fully-visible"
  | "fully-invisible"
  | "partially-visible";
export type Rect = { top: number; left: number; bottom: number; right: number };
export function IsElementInViewport(rect: Rect, windowRect: Rect): Visibility {
  return rect.top >= 0 &&
    // rect.left >= 0 &&
    rect.bottom <= windowRect.bottom // &&
    ? // rect.right <= windowRect.right
      "fully-visible"
    : !(
          //windowRect.left > rect.right ||
          // windowRect.right < rect.left ||
          (windowRect.top > rect.bottom || windowRect.bottom < rect.top)
        )
      ? "partially-visible"
      : "fully-invisible";
}
