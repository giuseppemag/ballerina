import { UncleView } from "playground-core";
import { Text, View } from "react-native";
import { DataTable } from "react-native-paper";

export const UncleLayout: UncleView = (props) => (
  <View
    style={{
      display: "flex",
      alignItems: "center",
    }}
  >
    <Text style={{ fontSize: 24 }}>Uncle</Text>

    <View
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <DataTable>
        <DataTable.Row>
          <DataTable.Cell
            style={{ justifyContent: "center" }}
            textStyle={{ fontSize: 20 }}
          >
            flag:
          </DataTable.Cell>
          <DataTable.Cell
            style={{ justifyContent: "center" }}
            textStyle={{ fontSize: 20 }}
          >
            {props.context.flag ? "✅" : "❌"}
          </DataTable.Cell>
        </DataTable.Row>
      </DataTable>
    </View>
  </View>
);
