import { Child1View } from "@ballerina/playground-core";
import { Child1Table } from "./table";

export const Child1Layout: Child1View = (props) => {
  return (
    <>
      <h2>Child 1</h2>
      <Child1Table {...props.context} />
    </>
  );
};
