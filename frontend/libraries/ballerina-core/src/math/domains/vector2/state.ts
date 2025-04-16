export type Vector2 = { readonly x: number; readonly y: number };
export const Vector2 = {
  Default: Object.assign((x: number, y: number): Vector2 => ({ x, y }), {
    zero: (): Vector2 => Vector2.Default(0, 0),
    one_x: (): Vector2 => Vector2.Default(1, 0),
    one_y: (): Vector2 => Vector2.Default(0, 1),
  }),
  Updaters: {},
  Operations: {},
};
