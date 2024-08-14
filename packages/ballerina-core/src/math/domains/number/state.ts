export const numberRepo = {
  Operations:
  {
    lerp: (a: number, min: number, max: number) =>
      min + (max - min) * a,
    clamp: (a: number, min: number, max: number) =>
      Math.max(Math.min(a, max), min),
  }
}
