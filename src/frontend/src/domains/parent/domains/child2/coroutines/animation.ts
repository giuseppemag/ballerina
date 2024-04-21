import { Child2 } from "../state";
import { Co } from "./builder";

export const Child2Animation = Co.Any([
  Co.Repeat(
    Co.Seq([
      Co.SetState(Child2.Updaters.Core.a(_ => _ * 2)),
      Co.Wait(500),
    ])
  ),
  Co.Repeat(
    Co.Seq([
      Co.SetState(Child2.Updaters.Core.b(_ => _ + ".")),
      Co.Wait(1500),
    ])
  ),
]);
