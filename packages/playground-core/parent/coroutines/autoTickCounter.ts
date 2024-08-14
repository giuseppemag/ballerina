import { Parent } from "../state";
import { Co } from "./builder";

export const autoTickCounter = 
  Co.Repeat(
    Co.Seq([
      Co.SetState(Parent.Updaters.Coroutine.tick()),
      Co.Wait(2500),
    ])
  )
