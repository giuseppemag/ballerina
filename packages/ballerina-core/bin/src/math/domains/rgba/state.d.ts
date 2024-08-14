export type RGBAColor = {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
};
export declare const RGBAColor: {
    Default: ((r: number, g: number, b: number, a: number) => RGBAColor) & {
        zero: () => RGBAColor;
        fromHSL: (hue: number, sat: number, light: number) => RGBAColor;
    };
    Updaters: {};
    Operations: {
        toHsl: ({ r, g, b }: RGBAColor) => {
            h: number;
            s: number;
            l: number;
        };
        hueToRgb: (t1: number, t2: number, hue: number) => number;
    };
};
//# sourceMappingURL=state.d.ts.map