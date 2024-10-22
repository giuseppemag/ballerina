import { ParentView1 } from "playground-core";
import { ChildrenWrapper, ChildWrapper } from "./wrappers";
import { Child2Layout } from "../domains/child2/views/child2Layout";

export const Parent1Layout: ParentView1 = (props) => (
  <>
    <ChildrenWrapper>
      <ChildWrapper>
        <props.Child2 {...props} view={Child2Layout} />
      </ChildWrapper>
    </ChildrenWrapper>
  </>
);
