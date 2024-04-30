import { Debounced } from "../../core/debounced/state";
import { Template } from "../../core/template/state";
import { Parent, ParentForeignMutations, ParentReadonlyContext } from "../state";
import { autoTickCounter } from "./autoTickCounter";
import { Co } from "./builder";
import { debouncedInputSynchronizer } from "./debouncedInputSynchronizer";

export const ParentDebouncerRunner = 
  Template.Default<ParentReadonlyContext & { events: Array<never> }, Parent, ParentForeignMutations>(props =>
    Debounced.Operations.shouldCoroutineRun(props.context.inputString) ?
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
    autoTickCounter,
  )
