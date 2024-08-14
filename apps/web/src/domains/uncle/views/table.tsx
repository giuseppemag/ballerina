import { Uncle } from "@ballerina/playground-core";

export const UncleTable = (props: Uncle) =>
  <>
    <table>
      <tbody>
        <tr>
          <td>flag:</td>
          <td>{props.flag ? "✅" : "❌"}</td>
        </tr>
      </tbody>
    </table>
  </>
