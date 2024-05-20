import { Unit } from "ballerina-core";
import { Template } from "ballerina-core";
import { Child1CoroutinesRunner } from "./coroutines/runner";
import { Child1ForeignMutationsExpected, Child1ReadonlyContext, Child1WritableState } from "./state";
import { Child1Table } from "./views/table";

export const Child1Template = 
	Template.Default<Child1ReadonlyContext, Child1WritableState, Child1ForeignMutationsExpected>(props =>
    <>
      <Child1Table {...props.context} />
    </>
  ).any([
    Child1CoroutinesRunner
  ])
  