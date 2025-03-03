import { UncleView } from "playground-core";

import { UncleTable } from "./table";

export const UncleLayout: UncleView = (props) => (
  <>
    <h1>Uncle</h1>
    <UncleTable {...props.context} />
  </>
);
