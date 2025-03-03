import { SimpleCallback } from "ballerina-core";
import { Button, Text, TextInput, View } from "react-native";

export const ParentInputs = (props: {
  counter: number;
  onIncrement: SimpleCallback;
  onDoubleIncrement: SimpleCallback;
  inputString: string;
  onChangeInputString: SimpleCallback<string>;
}) => (
  <View>
    <Text>The counter is {props.counter}</Text>
    <Button onPress={() => props.onIncrement()} title="+1" />
    <Button onPress={() => props.onDoubleIncrement()} title="+2" />
    <Text>The input string is {props.inputString}</Text>
    <TextInput
      value={props.inputString}
      onChangeText={props.onChangeInputString}
    />
  </View>
);
