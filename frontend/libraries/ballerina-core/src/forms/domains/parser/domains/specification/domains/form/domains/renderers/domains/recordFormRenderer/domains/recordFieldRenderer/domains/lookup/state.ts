import { List } from "immutable";
import {
  BoolExpr,
  Expr,
  ParsedType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";
import {
  BaseRecordFieldRenderer,
  BaseSerializedRecordFieldRenderer,
} from "../../state";

export type SerializedLookupRecordFieldRenderer =
  BaseSerializedRecordFieldRenderer;

export type LookUpRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "lookupRecordField";
};

export const LookUpRecordFieldRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    fieldPath: List<string>,
    renderer: string,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): LookUpRecordFieldRenderer<T> => ({
    kind: "lookupRecordField",
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
      serialized: SerializedLookupRecordFieldRenderer,
    ): serialized is SerializedLookupRecordFieldRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    tryAsValidLookupRecordField: (
      fieldPath: List<string>,
      serialized: SerializedLookupRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<SerializedLookupRecordFieldRenderer, "renderer"> & {
        renderer: string;
      },
      string
    > => {
      if (!LookUpRecordFieldRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for field ${fieldPath.join(".")}`,
        );
      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      fieldPath: List<string>,
      serialized: SerializedLookupRecordFieldRenderer,
    ): ValueOrErrors<LookUpRecordFieldRenderer<T>, string> => {
      return LookUpRecordFieldRenderer.Operations.tryAsValidLookupRecordField(
        fieldPath,
        serialized,
      ).Then((lookupRecordFieldRenderer) =>
        Expr.Operations.parse(
          lookupRecordFieldRenderer.visible ?? true,
          fieldPath.push("visibilityPredicate"),
        ).Then((visibilityExpr) =>
          Expr.Operations.parse(
            lookupRecordFieldRenderer.disabled ?? false,
            fieldPath.push("disabledPredicate"),
          ).Then((disabledExpr) => {
            return ValueOrErrors.Default.return(
              LookUpRecordFieldRenderer.Default(
                type,
                fieldPath,
                lookupRecordFieldRenderer.renderer,
                visibilityExpr,
                disabledExpr,
                lookupRecordFieldRenderer.label,
                lookupRecordFieldRenderer.tooltip,
                lookupRecordFieldRenderer.details,
              ),
            );
          }),
        ),
      );
    },
  },
};
