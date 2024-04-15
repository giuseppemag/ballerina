import { Unit } from "../core/fun/domains/unit/state";
import { Template } from "../core/template/state";
import { Parent } from "./state";

export type ParentWritableState = Parent
export type ParentReadonlyContext = Unit

export const ParentTemplate = 
	Template.Default<
		ParentReadonlyContext & ParentWritableState, ParentWritableState, Unit>(props =>
			<>
				{
					JSON.stringify(props)
				}
			</>
	)
