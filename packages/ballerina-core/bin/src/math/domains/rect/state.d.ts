import { Visibility } from "../../../visibility/state";
export type Rect = {
    top: number;
    left: number;
    bottom: number;
    right: number;
};
export declare const Rect: {
    Operations: {
        IsElementInViewport(rect: Rect, windowRect: Rect): Visibility;
    };
};
//# sourceMappingURL=state.d.ts.map