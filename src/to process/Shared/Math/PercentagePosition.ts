import { simpleUpdater } from "../widgets-library/widgets-main";

export type Vector2 = { X: number; Y: number };
export const Vector2 = {
  Default: (): Vector2 => ({
    X: 0,
    Y: 0,
  }),
  Updaters: {
    ...simpleUpdater<Vector2>()("X"),
    ...simpleUpdater<Vector2>()("Y"),
  },
};

export type Size2 = { Width: number; Height: number };
