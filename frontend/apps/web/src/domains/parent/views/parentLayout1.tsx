import { ParentView1 } from "playground-core";
import { Child2Layout } from "../domains/child2/views/child2View";

export const ParentLayout1: ParentView1 = ((props) => (
  <>
    <h1>Parent</h1>
    <props.Child2 {...props} view={Child2Layout}/>
  </>
));