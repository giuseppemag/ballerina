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
				<table style={{ width:"1000px" }}>
					<tr>
						<td>Value:</td>
						<td>{props.context.inputString.value}</td>
					</tr>
					<tr>
						<td>Last updated:</td>
						<td>{props.context.inputString.lastUpdated}</td>
					</tr>
					<tr>
						<td>DeltaT:</td>
						<td>{Date.now() - props.context.inputString.lastUpdated}</td>
					</tr>
					<tr>
						<td>Dirty:</td>
						<td>{props.context.inputString.dirty}</td>
					</tr>
					<tr>
						<td>Status:</td>
						<td style={{ width:"800px" }}>{props.context.inputString.status}</td>
					</tr>
				</table>
				<ParentInputs
					counter={props.context.counter}
					onIncrement={() => props.setState(Parent.Updaters.Template.tick())}
					onDoubleIncrement={() => props.setState(Parent.Updaters.Template.doubleTick())}
					inputString={props.context.inputString.value}
					onChangeInputString={_ => props.setState(Parent.Updaters.Template.inputString(replaceWith(_)))}
				/>
			</>
		).any([
			ParentCoroutinesRunner.mapContext(c => ({ ...c, events: [] }))
		]).mapView(
			ParentWrapper
		)