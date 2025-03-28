import {
  Expr,
  ParsedPrimitiveType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";
import {
  BaseRecordFieldRenderer,
  BaseSerializedRecordFieldRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedPrimitiveRecordFieldRenderer =
  BaseSerializedRecordFieldRenderer;

export type PrimitiveRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "primitiveRecordField";
  type: ParsedPrimitiveType<T>;
};

export const PrimitiveRecordFieldRenderer = {
  Default: <T>(
    type: ParsedPrimitiveType<T>,
    fieldPath: List<string>,
    renderer: string,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): PrimitiveRecordFieldRenderer<T> => ({
    kind: "primitiveRecordField",
    type,
    fieldPath,
    renderer,
    visible,
    disabled,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderer: (
      serialized: SerializedPrimitiveRecordFieldRenderer,
    ): serialized is SerializedPrimitiveRecordFieldRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    tryAsValidPrimitiveRecordField: (
      fieldPath: List<string>,
      serialized: SerializedPrimitiveRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<SerializedPrimitiveRecordFieldRenderer, "renderer"> & {
        renderer: string;
      },
      string
    > => {
      if (!PrimitiveRecordFieldRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for field ${fieldPath.join(".")}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: ParsedPrimitiveType<T>,
      fieldPath: List<string>,
      serialized: SerializedPrimitiveRecordFieldRenderer,
    ): ValueOrErrors<PrimitiveRecordFieldRenderer<T>, string> => {
      return PrimitiveRecordFieldRenderer.Operations.tryAsValidPrimitiveRecordField(
        fieldPath,
        serialized,
      ).Then((primitiveRecordFieldRenderer) =>
        Expr.Operations.parse(
          primitiveRecordFieldRenderer.visible ?? true,
          fieldPath.push("visibilityPredicate"),
        ).Then((visibilityExpr) =>
          Expr.Operations.parse(
            primitiveRecordFieldRenderer.disabled ?? false,
            fieldPath.push("disabledPredicate"),
          ).Then((disabledExpr) => {
            return ValueOrErrors.Default.return(
              PrimitiveRecordFieldRenderer.Default(
                type,
                fieldPath,
                primitiveRecordFieldRenderer.renderer,
                visibilityExpr,
                disabledExpr,
                primitiveRecordFieldRenderer.label,
                primitiveRecordFieldRenderer.tooltip,
                primitiveRecordFieldRenderer.details,
              ),
            );
          }),
        ),
      );
    },
  },
};
