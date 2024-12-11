import { Parent } from "playground-core";
import { View, Text } from "react-native";

export const ParentTable = (props: Parent) => (
  <View>
    <Text>Parent</Text>
    <Text>Value</Text>
    <Text>{props.inputString.value}</Text>

    <Text>Last updated:</Text>
    <Text>{props.inputString.lastUpdated}</Text>

    <Text>DeltaT:</Text>
    <Text>{Date.now() - props.inputString.lastUpdated}</Text>

    <Text>Dirty:</Text>
    <Text>{props.inputString.dirty}</Text>

    <Text>Status</Text>
    <Text>{props.inputString.status.value}</Text>
  </View>
);

