import { Unit } from "../../../core/fun/domains/unit/state";
import { Template } from "../../../core/template/state";
import { Child2CoroutinesRunner } from "./coroutines/runner";
import { Child2ReadonlyContext, Child2WritableState } from "./state";
import { Child2Table } from "./views/table";

export const Child2Template =
	Template.Default<Child2ReadonlyContext, Child2WritableState, Unit>(props =>
		<>
			<Child2Table {...props.context} />
		</>).any([
			Child2CoroutinesRunner.mapContext(_ => ({ ..._, events: [] }))
		])
