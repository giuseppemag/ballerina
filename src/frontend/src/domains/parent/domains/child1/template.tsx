import { Unit } from "../../../core/fun/domains/unit/state";
import { Template } from "../../../core/template/state";
import { Child1CoroutinesRunner } from "./coroutines/runner";
import { Child1ReadonlyState, Child1WritableState } from "./state";

export const Child1Template = 
	Template.Default<Child1ReadonlyState & Child1WritableState, Child1WritableState, Unit>(props =>
    <>
      Child1: {JSON.stringify(props)}
    </>
  ).any([
    Child1CoroutinesRunner.mapContext(c => ({ ...c, events: [] })),
  ])
  