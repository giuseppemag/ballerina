import {
  Expr,
  ParsedType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";

import {
  BaseRecordFieldRenderer,
  BaseSerializedRecordFieldRenderer,
  RecordFieldRenderer,
  SerializedRecordFieldRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedTupleRecordFieldRenderer = {
  itemRenderers?: unknown;
} & BaseSerializedRecordFieldRenderer;

export type TupleRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "tupleRecordField";
  itemRenderers: Array<RecordFieldRenderer<T>>;
};

export const TupleRecordFieldRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    fieldPath: List<string>,
    renderer: string,
    itemRenderers: Array<RecordFieldRenderer<T>>,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): TupleRecordFieldRenderer<T> => ({
    kind: "tupleRecordField",
    type,
    fieldPath,
    renderer,
    itemRenderers,
    visible,
    disabled,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedTupleRecordFieldRenderer,
    ): serialized is SerializedTupleRecordFieldRenderer & {
      renderer: string;
      itemRenderers: Array<SerializedRecordFieldRenderer>;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.itemRenderers != undefined,
    tryAsValidTupleRecordFieldRenderer: (
      fieldPath: List<string>,
      serialized: SerializedTupleRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<SerializedTupleRecordFieldRenderer, "renderer" | "itemRenderers"> & {
        renderer: string;
        itemRenderers: Array<SerializedRecordFieldRenderer>;
      },
      string
    > => {
      if (!TupleRecordFieldRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer and itemRenderers are required for renderer ${fieldPath.join(
            ".",
          )}`,
        );
      if (!Array.isArray(serialized.itemRenderers)) {
        return ValueOrErrors.Default.throwOne(
          `itemRenderers must be an array for renderer ${fieldPath.join(".")}`,
        );
      }
      if (serialized.itemRenderers.length == 0) {
        return ValueOrErrors.Default.throwOne(
          `itemRenderers must have at least one item for renderer ${fieldPath.join(
            ".",
          )}`,
        );
      }
      if (
        serialized.itemRenderers.some(
          (itemRenderer) => typeof itemRenderer != "object",
        )
      ) {
        return ValueOrErrors.Default.throwOne(
          `itemRenderers must be objects for renderer ${fieldPath.join(".")}`,
        );
      }
      const itemRenderers =
        serialized.itemRenderers as Array<SerializedRecordFieldRenderer>;

      return ValueOrErrors.Default.return({
        ...serialized,
        itemRenderers: itemRenderers,
      });
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      fieldPath: List<string>,
      serialized: SerializedTupleRecordFieldRenderer,
    ): ValueOrErrors<TupleRecordFieldRenderer<T>, string> => {
      return TupleRecordFieldRenderer.Operations.tryAsValidTupleRecordFieldRenderer(
        fieldPath,
        serialized,
      ).Then((serializedTupleRecordFieldRenderer) =>
        Expr.Operations.parse(
          serializedTupleRecordFieldRenderer.visible ?? true,
          fieldPath.push("visible"),
        ).Then((visibleExpr) =>
          Expr.Operations.parse(
            serializedTupleRecordFieldRenderer.disabled ?? false,
            fieldPath.push("disabled"),
          ).Then((disabledExpr) =>
            ValueOrErrors.Operations.All(
              List<ValueOrErrors<RecordFieldRenderer<T>, string>>(
                serializedTupleRecordFieldRenderer.itemRenderers.map(
                  (itemRenderer, index) =>
                    RecordFieldRenderer.Operations.Deserialize(
                      type,
                      fieldPath.push((index + 1).toString()),
                      itemRenderer,
                    ).Then((deserializedItemRenderer) => {
                      return ValueOrErrors.Default.return(
                        deserializedItemRenderer,
                      );
                    }),
                ),
              ),
            ).Then((deserializedItemRenderers) => {
              return ValueOrErrors.Default.return(
                TupleRecordFieldRenderer.Default(
                  type,
                  fieldPath,
                  serializedTupleRecordFieldRenderer.renderer,
                  deserializedItemRenderers.toArray(),
                  visibleExpr,
                  disabledExpr,
                  serializedTupleRecordFieldRenderer.label,
                  serializedTupleRecordFieldRenderer.tooltip,
                  serializedTupleRecordFieldRenderer.details,
                ),
              );
            }),
          ),
        ),
      );
    },
  },
};
