import "react-native-get-random-values"; // polyfill uuid -- must be before other imports
import { useState } from "react";
import { Text, View } from "react-native";
import {
  UncleTemplate,
  ParentTemplate1,
  Uncle,
  Parent,
} from "playground-core";
import { UncleLayout } from "@/domains/uncle/views/uncleLayout";
import { Parent1Layout } from "@/domains/parent/views/parent1Layout";

export default function Ballerina() {
  const [uncle, setUncle] = useState(Uncle.Default());
  const [parent, setParent] = useState(Parent.Default());
  const uncleForeignMutations = Uncle.ForeignMutations({
    context: uncle,
    setState: setUncle,
  });

  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "space-around",
        alignContent: "space-between",
        alignItems: "center",
        paddingTop: 80,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          marginBottom: 80,
        }}
      >
        Ballerina 🩰
      </Text>

      <View style={{display: "flex", gap: 40}}>
        <UncleTemplate
          context={uncle}
          setState={setUncle}
          foreignMutations={{}}
          view={UncleLayout}
        />
        <ParentTemplate1
          context={parent}
          setState={setParent}
          foreignMutations={{
            setFlag: uncleForeignMutations.overrideFlag,
          }}
          view={Parent1Layout}
        />
      </View>
    </View>
  );
}
