
import { Child2View } from "playground-core"
import { Child2Input } from "./input";
import { Child2Table } from "./table";

export const Child2Layout: Child2View = ((props) => (
  <>
    <h2>Child 2</h2>
    <Child2Table {...props.context} />
    <Child2Input onClick={() => props.foreignMutations.setFlag(true)}/>
  </>
));
