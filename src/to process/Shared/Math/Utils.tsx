export const lerp = (a: number, min: number, max: number) =>
  min + (max - min) * a;
export const clamp = (a: number, min: number, max: number) =>
  Math.max(Math.min(a, max), min);
