import { Unit } from "../core/fun/domains/unit/state";
import { replaceWith } from "../core/fun/domains/updater/domains/replaceWith/state";
import { Template } from "../core/template/state";
import { ParentCoroutinesRunner } from "./coroutines/runner";
import { Parent, ParentReadonlyContext, ParentWritableState } from "./state";
import { ParentInputs } from "./views/inputs";
import { ParentWrapper } from "./views/wrapper";

export const ParentTemplate = 
	Template.Default<
		ParentReadonlyContext & ParentWritableState, ParentWritableState, Unit>(props =>
			<>
				{
					JSON.stringify(props)
				}
				<ParentInputs 
					counter={props.context.counter}
					onIncrement={() => props.setState(Parent.Updaters.Template.tick())}
					onDoubleIncrement={() => props.setState(Parent.Updaters.Template.doubleTick())}
					inputString={props.context.inputString}
					onChangeInputString={_ => props.setState(Parent.Updaters.Template.inputString(replaceWith(_))) }
				/>
			</>
	).any([
		ParentCoroutinesRunner.mapContext(c => ({...c, events:[]}))
	]).mapView(
		ParentWrapper
	)
