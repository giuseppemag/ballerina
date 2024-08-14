import { Child1 } from "../state";
import { Co } from "./builder";
export const animateValues = Co.Any([
    Co.Repeat(Co.Seq([
        Co.SetState(Child1.Updaters.Core.x(_ => _ + 1)),
        Co.Wait(250)
    ])),
    Co.Repeat(Co.Seq([
        Co.SetState(Child1.Updaters.Core.y(_ => _ + "!")),
        Co.Wait(2500)
    ]))
]);
//# sourceMappingURL=animateValues.js.map