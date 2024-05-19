import { Uncle } from "../state";

export const UncleTable = (props: Uncle) =>
  <>
    <h1>Uncle</h1>
    <table>
      <tbody>
        <tr>
          <td>flag:</td>
          <td>{props.flag ? "✅" : "❌"}</td>
        </tr>
      </tbody>
    </table>
  </>
