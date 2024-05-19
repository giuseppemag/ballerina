import { Template } from "ballerina-core";
import { Child2CoroutinesRunner } from "./coroutines/runner";
import { Child2ForeignMutationsExpected, Child2ReadonlyContext, Child2WritableState } from "./state";
import { Child2Input } from "./views/input";
import { Child2Table } from "./views/table";

export const Child2Template =
	Template.Default<Child2ReadonlyContext, Child2WritableState, Child2ForeignMutationsExpected>(props =>
		<>
			<Child2Table {...props.context} />
			<Child2Input onClick={() => props.foreignMutations.setFlag(true)} />
		</>).any([
			Child2CoroutinesRunner.mapContext(_ => ({ ..._, events: [] }))
		])


