import {
  Expr,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import { ParsedType } from "../../../../../../../types/state";
import { List } from "immutable";

import {
  PrimitiveRecordFieldRenderer,
  SerializedPrimitiveRecordFieldRenderer,
} from "./domains/primitive/state";
import {
  EnumRecordFieldRenderer,
  SerializedEnumRecordFieldRenderer,
} from "./domains/enum/state";
import {
  StreamRecordFieldRenderer,
  SerializedStreamRecordFieldRenderer,
} from "./domains/stream/state";
import {
  MapRecordFieldRenderer,
  SerializedMapRecordFieldRenderer,
} from "./domains/map/state";
import {
  SumRecordFieldRenderer,
  SerializedSumRecordFieldRenderer,
} from "./domains/sum/state";
import {
  TupleRecordFieldRenderer,
  SerializedTupleRecordFieldRenderer,
} from "./domains/tuple/state";
import {
  UnionRecordFieldRenderer,
  SerializedUnionRecordFieldRenderer,
} from "./domains/union/state";
import {
  LookUpRecordFieldRenderer,
  SerializedLookupRecordFieldRenderer,
} from "./domains/lookup/state";
import {
  ListRecordFieldRenderer,
  SerializedListRecordFieldRenderer,
} from "./domains/list/state";

export type BaseSerializedRecordFieldRenderer = {
  renderer?: unknown;
  label?: string;
  tooltip?: string;
  details?: string;
  visible?: unknown;
  disabled?: unknown;
};

export type SerializedRecordFieldRenderer =
  | SerializedPrimitiveRecordFieldRenderer
  | SerializedEnumRecordFieldRenderer
  | SerializedStreamRecordFieldRenderer
  | SerializedMapRecordFieldRenderer
  | SerializedSumRecordFieldRenderer
  | SerializedTupleRecordFieldRenderer
  | SerializedUnionRecordFieldRenderer
  | SerializedLookupRecordFieldRenderer
  | SerializedListRecordFieldRenderer;

export type BaseRecordFieldRenderer<T> = {
  fieldPath: List<string>;
  type: ParsedType<T>;
  renderer: string;
  visible: Expr;
  disabled: Expr;
  label?: string;
  tooltip?: string;
  details?: string;
};

export type RecordFieldRenderer<T> =
  | PrimitiveRecordFieldRenderer<T>
  | EnumRecordFieldRenderer<T>
  | StreamRecordFieldRenderer<T>
  | ListRecordFieldRenderer<T>
  | LookUpRecordFieldRenderer<T>
  | MapRecordFieldRenderer<T>
  | SumRecordFieldRenderer<T>
  | TupleRecordFieldRenderer<T>
  | UnionRecordFieldRenderer<T>;

export const RecordFieldRenderer = {
  Operations: {
    Deserialize: <T>(
      type: ParsedType<T>,
      fieldPath: List<string>,
      serialized: SerializedRecordFieldRenderer,
    ): ValueOrErrors<RecordFieldRenderer<T>, string> => {
      if (type.kind == "primitive") {
        return PrimitiveRecordFieldRenderer.Operations.Deserialize(
          type,
          fieldPath.push("primitiveRecordField"),
          serialized,
        );
      }
      if (
        type.kind == "application" &&
        type.value == "SingleSelection" &&
        "options" in serialized
      ) {
        return EnumRecordFieldRenderer.Operations.Deserialize(
          type,
          fieldPath.push("enumRecordField"),
          serialized,
        );
      }
      if (
        type.kind == "application" &&
        type.value == "SingleSelection" &&
        "stream" in serialized
      ) {
        return StreamRecordFieldRenderer.Operations.Deserialize(
          type,
          fieldPath.push("streamRecordField"),
          serialized,
        );
      }
      if (type.kind == "lookup") {
        return LookUpRecordFieldRenderer.Operations.Deserialize(
          type,
          fieldPath.push("lookupRecordField"),
          serialized,
        );
      }
      if (type.kind == "application" && type.value == "List") {
        return ListRecordFieldRenderer.Operations.Deserialize(
          type,
          fieldPath.push("listRecordField"),
          serialized,
        );
      }
      if (type.kind == "application" && type.value == "Map") {
        return MapRecordFieldRenderer.Operations.Deserialize(
          type,
          fieldPath.push("mapRecordField"),
          serialized,
        );
      }
      if (type.kind == "application" && type.value == "Sum") {
        return SumRecordFieldRenderer.Operations.Deserialize(
          type,
          fieldPath.push("sumRecordField"),
          serialized,
        );
      }
      if (type.kind == "application" && type.value == "Union") {
        return UnionRecordFieldRenderer.Operations.Deserialize(
          type,
          fieldPath.push("unionRecordField"),
          serialized,
        );
      }

      return ValueOrErrors.Default.throwOne(
        `Unknown nested renderer type: ${fieldPath.join(".")}`,
      );
    },
  },
};
