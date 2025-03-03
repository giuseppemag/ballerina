import { Template } from "ballerina-core";
import {
  ParentCoroutinesRunner,
  ParentDebouncerRunner,
} from "./coroutines/runner";
import { Child1Template } from "./domains/child1/template";
import { Child2Template } from "./domains/child2/template";
import {
  Parent,
  ParentForeignMutationsExpected,
  ParentReadonlyContext,
  ParentView1,
  ParentView2,
  ParentWritableState,
} from "./state";

export const Child1TemplateEmbedded = Child1Template.mapContext<
  ParentReadonlyContext & ParentWritableState
>((p) => p.child1).mapState(Parent.Updaters.Core.child1);

export const Child2TemplateEmbedded = Child2Template.mapContext<
  ParentReadonlyContext & ParentWritableState
>((p) => p.child2).mapState(Parent.Updaters.Core.child2);

export const ParentTemplate1 = Template.Default<
  ParentReadonlyContext,
  ParentWritableState,
  ParentForeignMutationsExpected,
  ParentView1
>((props) => (
  <>
    <props.view {...props} Child2={Child2TemplateEmbedded} />
  </>
));

export const ParentTemplate2 = Template.Default<
  ParentReadonlyContext,
  ParentWritableState,
  ParentForeignMutationsExpected,
  ParentView2
>((props) => (
  <>
    <props.view
      {...props}
      Child1={Child1TemplateEmbedded}
      Child2={Child2TemplateEmbedded}
    />
    {/* <ParentCoroutinesRunner {...props} />
				<ParentDebouncerRunner {...props} /> */}
  </>
)).any([ParentCoroutinesRunner, ParentDebouncerRunner]);
