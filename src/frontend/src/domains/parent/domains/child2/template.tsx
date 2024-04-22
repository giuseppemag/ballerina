import { Template } from "../../../core/template/state";
import { Child2CoroutinesRunner } from "./coroutines/runner";
import { Child2ForeignMutations, Child2ReadonlyContext, Child2WritableState } from "./state";
import { Child2Input } from "./views/input";
import { Child2Table } from "./views/table";

export const Child2Template =
	Template.Default<Child2ReadonlyContext, Child2WritableState, Child2ForeignMutations>(props =>
		<>
			<Child2Table {...props.context} />
			<Child2Input onClick={() => props.foreignMutations.Uncle.setFlag(true)} />
		</>).any([
			Child2CoroutinesRunner.mapContext(_ => ({ ..._, events: [] }))
		])


