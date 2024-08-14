import { Template, Unit } from "@ballerina/core";
import { Child2CoroutinesRunner } from "./coroutines/runner";
import {
  Child2ForeignMutationsExpected,
  Child2ReadonlyContext,
  Child2View,
  Child2WritableState,
} from "./state";

export const Child2Template = Template.Default<
  Child2ReadonlyContext,
  Child2WritableState,
  Child2ForeignMutationsExpected,
  Child2View
>((props) => <props.view {...props} />).any([Child2CoroutinesRunner]);
