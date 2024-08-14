export const Rect = {
    Operations: {
        IsElementInViewport(rect, windowRect) {
            return rect.top >= 0 &&
                // rect.left >= 0 &&
                rect.bottom <= windowRect.bottom // &&
                ? // rect.right <= windowRect.right
                    "fully-visible"
                : !(
                //windowRect.left > rect.right ||
                // windowRect.right < rect.left ||
                (windowRect.top > rect.bottom || windowRect.bottom < rect.top))
                    ? "partially-visible"
                    : "fully-invisible";
        }
    }
};
//# sourceMappingURL=state.js.map