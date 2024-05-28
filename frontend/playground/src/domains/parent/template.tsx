import { replaceWith } from "ballerina-core";
import { Template } from "ballerina-core";
import { ParentCoroutinesRunner, ParentDebouncerRunner } from "./coroutines/runner";
import { Child1Template } from "./domains/child1/template";
import { Child2Template } from "./domains/child2/template";
import { Parent, ParentForeignMutationsExpected, ParentReadonlyContext, ParentWritableState } from "./state";
import { ParentInputs } from "./views/inputs";
import { ParentTable } from "./views/table";
import { ChildrenWrapper, ChildWrapper, ParentWrapper } from "./views/wrappers";

const Child1TemplateEmbedded = Child1Template
	// NARROWING
	// how to go from the Parent context and state
	// (ie the stuff Parent can _read_)
	// down to the stuff the Child1 needs to be able to read
	.mapContext<ParentReadonlyContext & ParentWritableState>(p => p.child1)
	// WIDENING
	// how we an Updater<Child1> is transformed
	// into an Updater<Parent>
	.mapState(Parent.Updaters.Core.child1)

export const ParentTemplate =
	Template.Default<ParentReadonlyContext, ParentWritableState, ParentForeignMutationsExpected>(props =>
			<>
				{/* now the Child2TemplateEmbedded just accepts the same props from the Parent  */}
				<Child2TemplateEmbedded {...props} />
			</>
		)



const Child2TemplateEmbedded = Child2Template
	.mapContext<ParentReadonlyContext & ParentWritableState>(p => p.child2)
	.mapState(Parent.Updaters.Core.child2)

export const ParentTemplate2 =
	Template.Default<
		ParentReadonlyContext, ParentWritableState, ParentForeignMutationsExpected>(props =>
			<>
				<ParentTable {...props.context} />
				<ParentInputs
					counter={props.context.counter}
					onIncrement={() => props.setState(Parent.Updaters.Template.tick())}
					onDoubleIncrement={() => props.setState(Parent.Updaters.Template.doubleTick())}
					inputString={props.context.inputString.value}
					onChangeInputString={_ => props.setState(Parent.Updaters.Template.inputString(replaceWith(_)))}
				/>
				<ChildrenWrapper>
					<ChildWrapper>
						<Child1TemplateEmbedded {...props} />
					</ChildWrapper>
					<ChildWrapper>
						<Child2TemplateEmbedded {...props} />
					</ChildWrapper>
				</ChildrenWrapper>
				{/* <ParentCoroutinesRunner {...props} />
				<ParentDebouncerRunner {...props} /> */}
			</>
		).any([
			ParentCoroutinesRunner,
			ParentDebouncerRunner,
		]).mapView(
			ParentWrapper
		)
