import { replaceWith } from "ballerina-core";
import { Child2 } from "../state";
import { Co } from "./builder";
import { Range } from "immutable";

export const Child2Animation = Co.Any([
  Co.Repeat(
    Co.Seq([
      Co.SetState(Child2.Updaters.Core.a(replaceWith(1)).then(Child2.Updaters.Core.b(replaceWith("")))),
      Co.For(Range(0, 3))(
        _ =>
          Co.Seq([
            Co.SetState(Child2.Updaters.Core.a(_ => _ * 2)),
            Co.Wait(250),
            Co.SetState(Child2.Updaters.Core.b(_ => _ + ".")),
            Co.Wait(250),
          ])
      )
    ])
  ),
]);
