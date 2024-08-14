import { Parent, ParentView2 } from "@ballerina/playground-core";
import { ParentTable } from "./table";
import { ParentInputs } from "./inputs";
import { replaceWith } from "@ballerina/core";
import { ChildWrapper, ChildrenWrapper } from "./wrappers";
import { Child1Layout } from "../domains/child1/views/child1View";
import { Child2Layout } from "../domains/child2/views/child2View";

export const ParentLayout2: ParentView2 = (props) => {
  return (
    <>
    	<h1>Parent</h1>
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
          <props.Child1 {...props} view={Child1Layout}/>
        </ChildWrapper>
        <ChildWrapper>
          <props.Child2 {...props} view={Child2Layout}/>
        </ChildWrapper>
      </ChildrenWrapper>
    </>
  );
};
