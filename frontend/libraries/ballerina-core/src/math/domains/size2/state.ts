export type Size2 = { readonly width: number; readonly height: number };
export const Size2 = {
  Default: Object.assign(
    (width: number, height: number): Size2 => ({ width, height }),
    {
      zero: (): Size2 => Size2.Default(0, 0),
    },
  ),
  Updaters: {},
  Operations: {},
};
