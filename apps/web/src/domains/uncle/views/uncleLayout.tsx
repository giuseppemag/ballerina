import { UncleView } from  "@ballerina/playground-core";

import { UncleTable } from "./table";

export const UncleLayout: UncleView = ((props) => (
  <>
    <h1>Uncle</h1>
    <UncleTable {...props.context} />
  </>
));
