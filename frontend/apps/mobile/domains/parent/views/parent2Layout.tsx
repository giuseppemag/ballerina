import { Parent, ParentView2 } from "playground-core";
import { ParentTable } from "./table";
import { ParentInputs } from "./inputs";
import { ChildrenWrapper, ChildWrapper } from "./wrappers";
import { replaceWith } from "ballerina-core";
import { Child2Layout } from "../domains/child2/views/child2Layout";
import { Child1Layout } from "../domains/child1/views/child1Layout";

export const Parent2Layout: ParentView2 = (props) => (
  <>
    <ParentTable {...props.context} />
    <ParentInputs
      counter={props.context.counter}
      onIncrement={() => props.setState(Parent.Updaters.Template.tick())}
      onDoubleIncrement={() =>
        props.setState(Parent.Updaters.Template.doubleTick())
      }
      inputString={props.context.inputString.value}
      onChangeInputString={(_) =>
        props.setState(Parent.Updaters.Template.inputString(replaceWith(_)))
      }
    />
    <ChildrenWrapper>
      <ChildWrapper>
        <props.Child1 {...props} view={Child1Layout} />
      </ChildWrapper>
      <ChildWrapper>
        <props.Child2 {...props} view={Child2Layout} />
      </ChildWrapper>
    </ChildrenWrapper>
  </>
);
