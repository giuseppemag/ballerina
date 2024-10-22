import { Child1View } from "playground-core";
import { Text } from "react-native";

export const Child1Layout: Child1View = (props) => (
  <>
    <Text>Child 1</Text>

    <Text>x: </Text>
    <Text>{props.context.x}</Text>

    <Text>y: </Text>
    <Text>{props.context.y}</Text>
  </>
);
