export type RGBAColor = {
  Readonly r: number;
  Readonly g: number;
  Readonly b: number;
  Readonly a: number;
};
export const RGBAColor = {
  Default: Object.assign(
    (r: number, g: number, b: number, a: number): RGBAColor => ({ r, g, b, a }),
    {
      zero: (): RGBAColor => RGBAColor.Default(0, 0, 0, 0),
      fromHSL: (hue: number, sat: number, light: number): RGBAColor => {
        let t2;
        hue = hue / 60;
        if (light <= 0.5) {
          t2 = light * (sat + 1);
        } else {
          t2 = light + sat - light * sat;
        }
        const t1 = light * 2 - t2;
        const r = RGBAColor.Operations.hueToRgb(t1, t2, hue + 2) * 255;
        const g = RGBAColor.Operations.hueToRgb(t1, t2, hue) * 255;
        const b = RGBAColor.Operations.hueToRgb(t1, t2, hue - 2) * 255;
        return { r: r, g: g, b: b, a: 1.0 };
      },
    },
  ),

  Updaters: {},
  Operations: {
    toHsl: ({ r, g, b }: RGBAColor) => {
      let min,
        max,
        i,
        s,
        maxcolor,
        h = 0;
      const rgb = [r / 255, g / 255, b / 255];
      min = rgb[0];
      max = rgb[0];
      maxcolor = 0;
      for (i = 0; i < rgb.length - 1; i++) {
        if (rgb[i + 1] <= min) {
          min = rgb[i + 1];
        }
        if (rgb[i + 1] >= max) {
          max = rgb[i + 1];
          maxcolor = i + 1;
        }
      }
      if (maxcolor == 0) {
        h = (rgb[1] - rgb[2]) / (max - min);
      }
      if (maxcolor == 1) {
        h = 2 + (rgb[2] - rgb[0]) / (max - min);
      }
      if (maxcolor == 2) {
        h = 4 + (rgb[0] - rgb[1]) / (max - min);
      }
      if (isNaN(h)) {
        h = 0;
      }
      h = h * 60;
      if (h < 0) {
        h = h + 360;
      }
      const l = (min + max) / 2;
      if (min == max) {
        s = 0;
      } else {
        if (l < 0.5) {
          s = (max - min) / (max + min);
        } else {
          s = (max - min) / (2 - max - min);
        }
      }
      s = s;
      return { h: h, s: s, l: l };
    },

    hueToRgb: (t1: number, t2: number, hue: number) => {
      if (hue < 0) hue += 6;
      if (hue >= 6) hue -= 6;
      if (hue < 1) return (t2 - t1) * hue + t1;
      else if (hue < 3) return t2;
      else if (hue < 4) return (t2 - t1) * (4 - hue) + t1;
      else return t1;
    },
  },
};
