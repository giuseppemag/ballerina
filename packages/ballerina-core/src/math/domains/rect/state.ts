import { Visibility } from "../../../visibility/state";

export type Rect = { top: number; left: number; bottom: number; right: number; };
export const Rect = {
  Operations:{
    IsElementInViewport(rect: Rect, windowRect: Rect): Visibility {
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
    
  }
}