import { autoTickCounter } from "./autoTickCounter";
import { Co } from "./builder";

export const ParentCoroutinesRunner = 
  Co.Template(
    Co.Any([
      autoTickCounter
    ])
  )
