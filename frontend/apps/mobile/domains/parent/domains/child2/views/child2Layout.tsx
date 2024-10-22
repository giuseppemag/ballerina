import { Child2View } from "playground-core";
import { Text, View } from "react-native";

import { Child2Table } from "./table";
import { Child2Input } from "./input";

export const Child2Layout: Child2View = (props) => (
  <View
    style={{
      display: "flex",
      alignItems: "center",
    }}
  >
    <Text
      style={{
        fontSize: 24,
      }}
    >
      Child 2
    </Text>

    <Child2Table {...props.context} />
    <Child2Input
      onClick={() => props.foreignMutations.setFlag(true)}
      on={true}
    />
    <Child2Input
      onClick={() => props.foreignMutations.setFlag(false)}
      on={false}
    />
  </View>
);
