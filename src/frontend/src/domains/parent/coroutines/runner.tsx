import { Template } from "../../core/template/state";
import { Parent, ParentForeignMutations, ParentReadonlyContext } from "../state";
import { autoTickCounter } from "./autoTickCounter";
import { Co } from "./builder";
import { debouncedInputSynchronizer } from "./debouncedInputSynchronizer";

export const ParentDebouncerRunner = 
  Template.Default<ParentReadonlyContext & { events: Array<never> }, Parent, ParentForeignMutations>(props =>
    props.context.inputString.dirty != "not dirty" ?
      <>
        {
          Co.Template(
            debouncedInputSynchronizer
          )(props)
        }
      </>
      : <></>
    )

export const ParentCoroutinesRunner =
  Co.Template<ParentForeignMutations>(
    Co.Any([
      autoTickCounter,
    ])
  )
