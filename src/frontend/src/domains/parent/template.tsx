import { Unit } from "../core/fun/domains/unit/state";
import { Template } from "../core/template/state";
import { ParentCoroutinesRunner } from "./coroutines/runner";
import { ParentReadonlyContext, ParentWritableState } from "./state";

export const ParentTemplate = 
	Template.Default<
		ParentReadonlyContext & ParentWritableState, ParentWritableState, Unit>(props =>
			<>
				{
					JSON.stringify(props)
				}
			</>
	).any([
		ParentCoroutinesRunner.mapContext(c => ({...c, events:[]}))
	])
