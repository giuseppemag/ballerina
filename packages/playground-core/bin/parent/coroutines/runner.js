import { Debounced } from "@ballerina/core";
import { autoTickCounter } from "./autoTickCounter";
import { Co } from "./builder";
import { debouncedInputSynchronizer } from "./debouncedInputSynchronizer";
export const ParentDebouncerRunner = Co.Template(debouncedInputSynchronizer, { runFilter: props => Debounced.Operations.shouldCoroutineRun(props.context.inputString) });
export const ParentCoroutinesRunner = Co.Template(autoTickCounter);
//# sourceMappingURL=runner.js.map