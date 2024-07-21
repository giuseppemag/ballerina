import { Template } from "ballerina-core";
import { Child1CoroutinesRunner } from "./coroutines/runner";
import {
  Child1ForeignMutationsExpected,
  Child1ReadonlyContext,
  Child1View,
  Child1WritableState,
} from "./state";

export const Child1Template = Template.Default<
  Child1ReadonlyContext,
  Child1WritableState,
  Child1ForeignMutationsExpected,
  Child1View
>((props) => <props.view {...props} />).any([Child1CoroutinesRunner]);
