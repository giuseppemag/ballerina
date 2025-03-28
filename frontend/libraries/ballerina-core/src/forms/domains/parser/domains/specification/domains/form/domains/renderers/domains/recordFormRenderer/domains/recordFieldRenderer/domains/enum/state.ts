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
export type SerializedEnumRecordFieldRenderer = {
  options?: unknown;
} & BaseSerializedRecordFieldRenderer;

export type EnumRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "enumRecordField";
  options: string;
};

export const EnumRecordFieldRenderer = {
  Default: <T>(
    fieldPath: List<string>,
    type: ParsedType<T>,
    options: string,
    renderer: string,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): EnumRecordFieldRenderer<T> => ({
    kind: "enumRecordField",
    fieldPath,
    type,
    options,
    renderer,
    visible,
    disabled,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderer: (
      serialized: SerializedEnumRecordFieldRenderer,
    ): serialized is SerializedEnumRecordFieldRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    hasOptions: (
      serialized: SerializedEnumRecordFieldRenderer,
    ): serialized is SerializedEnumRecordFieldRenderer & {
      options: string;
    } => {
      return (
        serialized.options != undefined && typeof serialized.options == "string"
      );
    },
    tryAsValidEnumRecordField: (
      fieldPath: List<string>,
      serialized: SerializedEnumRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<SerializedEnumRecordFieldRenderer, "renderer" | "options"> & {
        renderer: string;
        options: string;
      },
      string
    > => {
      if (!EnumRecordFieldRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for field ${fieldPath.join(".")}`,
        );

      if (!EnumRecordFieldRenderer.Operations.hasOptions(serialized))
        return ValueOrErrors.Default.throwOne(
          `options are required for field ${fieldPath.join(".")}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      fieldPath: List<string>,
      serialized: SerializedEnumRecordFieldRenderer,
    ): ValueOrErrors<EnumRecordFieldRenderer<T>, string> => {
      return EnumRecordFieldRenderer.Operations.tryAsValidEnumRecordField(
        fieldPath,
        serialized,
      ).Then((enumRecordFieldRenderer) =>
        Expr.Operations.parse(
          enumRecordFieldRenderer.visible ?? true,
          fieldPath.push("visibilityPredicate"),
        ).Then((visibilityExpr) =>
          Expr.Operations.parse(
            enumRecordFieldRenderer.disabled ?? false,
            fieldPath.push("disabledPredicate"),
          ).Then((disabledExpr) => {
            return ValueOrErrors.Default.return(
              EnumRecordFieldRenderer.Default(
                fieldPath,
                type,
                enumRecordFieldRenderer.options,
                enumRecordFieldRenderer.renderer,
                visibilityExpr,
                disabledExpr,
                enumRecordFieldRenderer.label,
                enumRecordFieldRenderer.tooltip,
                enumRecordFieldRenderer.details,
              ),
            );
          }),
        ),
      );
    },
  },
};
