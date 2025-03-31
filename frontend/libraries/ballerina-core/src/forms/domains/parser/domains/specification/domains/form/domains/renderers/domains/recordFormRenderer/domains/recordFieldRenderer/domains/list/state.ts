import { List } from "immutable";
import {
  Expr,
  ListType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";
import {
  BaseRecordFieldRenderer,
  BaseSerializedRecordFieldRenderer,
  RecordFieldRenderer,
} from "../../state";

export type SerializedListRecordFieldRenderer = {
  elementRenderer?: unknown;
  elementLabel?: string;
  elementTooltip?: string;
} & BaseSerializedRecordFieldRenderer;

export type ListRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "listRecordField";
  elementRenderer: RecordFieldRenderer<T>;
  type: ListType<T>;
};

export const ListRecordFieldRenderer = {
  Default: <T>(
    type: ListType<T>,
    fieldPath: List<string>,
    renderer: string,
    elementRenderer: RecordFieldRenderer<T>,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): ListRecordFieldRenderer<T> => ({
    kind: "listRecordField",
    type,
    fieldPath,
    renderer,
    elementRenderer,
    visible,
    disabled,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedListRecordFieldRenderer,
    ): serialized is SerializedListRecordFieldRenderer & {
      renderer: string;
      elementRenderer: string | object;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string" &&
        serialized.elementRenderer != undefined
      );
    },
    tryAsValidListRecordField: (
      fieldPath: List<string>,
      serialized: SerializedListRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<
        SerializedListRecordFieldRenderer,
        "renderer" | "elementRenderer"
      > & {
        renderer: string;
        elementRenderer: object;
      },
      string
    > => {
      if (!ListRecordFieldRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer and elementRenderer are required for field ${fieldPath.join(
            ".",
          )}`,
        );
      const elementRenderer = serialized.elementRenderer;
      // Backwards compatability
      if (typeof elementRenderer == "string") {
        return ValueOrErrors.Default.return({
          renderer: serialized.renderer,
          label: serialized?.label,
          visible: serialized.visible,
          disabled: serialized?.disabled,
          details: serialized?.details,
          elementRenderer: {
            renderer: serialized.elementRenderer,
            label: serialized?.elementLabel,
            tooltip: serialized?.elementTooltip,
          },
        });
      }
      return ValueOrErrors.Default.return({
        ...serialized,
        elementRenderer: elementRenderer,
      });
    },
    Deserialize: <T>(
      type: ListType<T>,
      fieldPath: List<string>,
      serialized: SerializedListRecordFieldRenderer,
    ): ValueOrErrors<ListRecordFieldRenderer<T>, string> => {
      return ListRecordFieldRenderer.Operations.tryAsValidListRecordField(
        fieldPath,
        serialized,
      ).Then((serializedListRecordFieldRenderer) =>
        Expr.Operations.parse(
          serializedListRecordFieldRenderer.visible ?? true,
          fieldPath.push("visibilityPredicate"),
        ).Then((visibilityExpr) =>
          Expr.Operations.parse(
            serializedListRecordFieldRenderer.disabled ?? false,
            fieldPath.push("disabledPredicate"),
          ).Then((disabledExpr) =>
            RecordFieldRenderer.Operations.Deserialize(
              type.args[0],
              fieldPath.push("elementRenderer"),
              serializedListRecordFieldRenderer.elementRenderer,
            ).Then((elementRenderer) =>
              ValueOrErrors.Default.return(
                ListRecordFieldRenderer.Default(
                  type,
                  fieldPath,
                  serializedListRecordFieldRenderer.renderer,
                  elementRenderer,
                  visibilityExpr,
                  disabledExpr,
                  serializedListRecordFieldRenderer.label,
                  serializedListRecordFieldRenderer.tooltip,
                  serializedListRecordFieldRenderer.details,
                ),
              ),
            ),
          ),
        ),
      );
    },
  },
};
