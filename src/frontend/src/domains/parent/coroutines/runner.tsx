import { Debounced } from "../../core/debounced/state";
import { ParentForeignMutationsExpected } from "../state";
import { autoTickCounter } from "./autoTickCounter";
import { Co } from "./builder";
import { debouncedInputSynchronizer } from "./debouncedInputSynchronizer";

export const ParentDebouncerRunner = 
  Co.Template<ParentForeignMutationsExpected>(
    debouncedInputSynchronizer,
    { runFilter:props => Debounced.Operations.shouldCoroutineRun(props.context.inputString) }
  )

  export const ParentCoroutinesRunner =
  Co.Template<ParentForeignMutationsExpected>(
    autoTickCounter,
  )
