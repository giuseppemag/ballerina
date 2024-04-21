import { Child1WritableState } from "../state";

export const Child1Table = (props: Child1WritableState): JSX.Element => <>
  <h2>Child 1</h2>
  <table style={{ width: "500px" }}>
    <tr>
      <td>x: </td>
      <td>{props.x}</td>
    </tr>
    <tr>
      <td>y: </td>
      <td>{props.y}</td>
    </tr>
  </table>
</>;
