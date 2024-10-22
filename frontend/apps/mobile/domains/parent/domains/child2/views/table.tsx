import { Child2WritableState } from "playground-core";
import { DataTable } from "react-native-paper";

export const Child2Table = (props: Child2WritableState) => (
  <DataTable>
    <DataTable.Row>
      <DataTable.Cell
        style={{ justifyContent: "center" }}
        textStyle={{ fontSize: 20 }}
      >
        a:
      </DataTable.Cell>
      <DataTable.Cell
        style={{ justifyContent: "center" }}
        textStyle={{ fontSize: 20 }}
      >
        {props.a}
      </DataTable.Cell>
    </DataTable.Row>
    <DataTable.Row>
      <DataTable.Cell
        style={{ justifyContent: "center" }}
        textStyle={{ fontSize: 20 }}
      >
        b:
      </DataTable.Cell>
      <DataTable.Cell
        style={{ justifyContent: "center" }}
        textStyle={{ fontSize: 20 }}
      >
        {props.b}
      </DataTable.Cell>
    </DataTable.Row>
  </DataTable>
);
