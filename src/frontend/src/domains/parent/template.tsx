import { replaceWith } from "../core/fun/domains/updater/domains/replaceWith/state";
import { Template } from "../core/template/state";
import { ParentCoroutinesRunner, ParentDebouncerRunner } from "./coroutines/runner";
import { Child1Template } from "./domains/child1/template";
import { Child2Template } from "./domains/child2/template";
import { Parent, ParentForeignMutationsExpected, ParentReadonlyContext, ParentWritableState } from "./state";
import { ParentInputs } from "./views/inputs";
import { ParentTable } from "./views/table";
import { ChildrenWrapper, ChildWrapper, ParentWrapper } from "./views/wrappers";

const Child1TemplateEmbedded = Child1Template
	.mapContext<Parent>(p => p.child1)
	.mapState(Parent.Updaters.Core.child1)

const Child2TemplateEmbedded = Child2Template
	.mapContext<Parent>(p => p.child2)
	.mapState(Parent.Updaters.Core.child2)

export const ParentTemplate =
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
			</>
		).any([
			ParentCoroutinesRunner.mapContext(c => ({ ...c, events: [] })),
			ParentDebouncerRunner.mapContext(c => ({ ...c, events: [] })),
		]).mapView(
			ParentWrapper
		)
