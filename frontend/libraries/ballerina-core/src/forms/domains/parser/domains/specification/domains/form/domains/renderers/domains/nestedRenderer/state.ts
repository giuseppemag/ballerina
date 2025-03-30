import {
  ParsedType,
  ValueOrErrors,
} from "../../../../../../../../../../../../main";
import {
  NestedLookupRenderer,
  SerializedNestedLookupRenderer,
} from "./domains/lookup/state";
import {
  NestedEnumRenderer,
  SerializedNestedEnumRenderer,
} from "./domains/enum/state";
import {
  NestedPrimitiveRenderer,
  SerializedNestedPrimitiveRenderer,
} from "./domains/primitive/state";
import {
  NestedStreamRenderer,
  SerializedNestedStreamRenderer,
} from "./domains/stream/state";
import { List } from "immutable";
import {
  NestedListRenderer,
  SerializedNestedListRenderer,
} from "./domains/list/state";
import {
  NestedMapRenderer,
  SerializedNestedMapRenderer,
} from "./domains/map/state";
import {
  NestedSumRenderer,
  SerializedNestedSumRenderer,
} from "./domains/sum/state";
import {
  NestedUnionRenderer,
  SerializedNestedUnionRenderer,
} from "./domains/union/state";
import {
  NestedTupleRenderer,
  SerializedNestedTupleRenderer,
} from "./domains/tuple/state";

export type BaseSerializedNestedRenderer = {
  renderer?: unknown;
  label?: string;
  tooltip?: string;
  details?: string;
};

export type SerializedNestedRenderer =
  | SerializedNestedPrimitiveRenderer
  | SerializedNestedEnumRenderer
  | SerializedNestedStreamRenderer
  | SerializedNestedLookupRenderer
  | SerializedNestedListRenderer
  | SerializedNestedMapRenderer
  | SerializedNestedSumRenderer
  | SerializedNestedUnionRenderer
  | SerializedNestedTupleRenderer;

export type BaseNestedRenderer = {
  rendererPath: List<string>;
  renderer: string;
  label?: string;
  tooltip?: string;
  details?: string;
};

export type NestedRenderer<T> =
  | NestedPrimitiveRenderer<T>
  | NestedEnumRenderer<T>
  | NestedStreamRenderer<T>
  | NestedLookupRenderer<T>
  | NestedListRenderer<T>
  | NestedMapRenderer<T>
  | NestedSumRenderer<T>
  | NestedUnionRenderer<T>
  | NestedTupleRenderer<T>;

export const NestedRenderer = {
  Operations: {
    Deserialize: <T>(
      type: ParsedType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedRenderer,
    ): ValueOrErrors<NestedRenderer<T>, string> => {
      if (type.kind == "primitive") {
        return NestedPrimitiveRenderer.Operations.Deserialize(
          type,
          rendererPath.push("nestedPrimitiveRenderer"),
          serialized,
        );
      }
      if (
        (type.kind == "singleSelection" || type.kind == "multiSelection") &&
        "options" in serialized
      ) {
        return NestedEnumRenderer.Operations.Deserialize(
          type,
          rendererPath.push("nestedEnumRenderer"),
          serialized,
        );
      }
      if (
        (type.kind == "singleSelection" || type.kind == "multiSelection") &&
        "stream" in serialized
      ) {
        return NestedStreamRenderer.Operations.Deserialize(
          type,
          rendererPath.push("nestedStreamRenderer"),
          serialized,
        );
      }
      if (type.kind == "lookup") {
        return NestedLookupRenderer.Operations.Deserialize(
          type,
          rendererPath.push("nestedLookupRenderer"),
          serialized,
        );
      }
      if (type.kind == "list") {
        return NestedListRenderer.Operations.Deserialize(
          type,
          rendererPath.push("nestedListRenderer"),
          serialized,
        );
      }
      if (type.kind == "map") {
        return NestedMapRenderer.Operations.Deserialize(
          type,
          rendererPath.push("nestedMapRenderer"),
          serialized,
        );
      }
      if (type.kind == "sum") {
        return NestedSumRenderer.Operations.Deserialize(
          type,
          rendererPath.push("nestedSumRenderer"),
          serialized,
        );
      }
      if (type.kind == "union") {
        return NestedUnionRenderer.Operations.Deserialize(
          type,
          rendererPath.push("nestedUnionRenderer"),
          serialized,
        );
      }
      // if (type.kind == "unionCase") {
      //   return NestedUnionCaseRenderer.Operations.Deserialize(
      //     type,
      //     rendererPath.push("nestedUnionRenderer"),
      //     serialized,
      //   );
      // }

      return ValueOrErrors.Default.throwOne(
        `Unknown nested renderer type at ${rendererPath.join(
          ".",
        )} : ${JSON.stringify(type)}`,
      );
    },
  },
};
