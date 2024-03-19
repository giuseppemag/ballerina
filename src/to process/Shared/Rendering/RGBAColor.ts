export type RGBAColor = { r: number; g: number; b: number; a: number };
export const RGBAColor = {
  Default: {
    toString: (c: RGBAColor): string =>
      `rgba(${c.r * 255},${c.g * 255},${c.b * 255},${c.a})`,
  },
};
