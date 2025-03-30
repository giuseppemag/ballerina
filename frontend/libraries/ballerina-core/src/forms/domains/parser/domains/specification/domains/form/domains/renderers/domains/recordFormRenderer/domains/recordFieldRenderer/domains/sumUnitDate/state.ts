import { Expr } from "../../../../../../../../../../../../../../../../main";
import {
  SumUnitDateType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";
import {
  BaseSerializedRecordFieldRenderer,
  BaseRecordFieldRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedSumUnitDateFieldRenderer =
  BaseSerializedRecordFieldRenderer;

export type SumUnitDateFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "sumUnitDateFieldRenderer";
  type: SumUnitDateType;
};

export const SumUnitDateFieldRenderer = {
  Default: <T>(
    type: SumUnitDateType,
    fieldPath: List<string>,
    renderer: string,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): SumUnitDateFieldRenderer<T> => ({
    kind: "sumUnitDateFieldRenderer",
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
      serialized: SerializedSumUnitDateFieldRenderer,
    ): serialized is SerializedSumUnitDateFieldRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    tryAsValidSumUnitDateFieldRenderer: (
      fieldPath: List<string>,
      serialized: SerializedSumUnitDateFieldRenderer,
    ): ValueOrErrors<
      Omit<SerializedSumUnitDateFieldRenderer, "renderer"> & {
        renderer: string;
      },
      string
    > => {
      if (!SumUnitDateFieldRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for sum unit date field renderer ${fieldPath.join(
            ".",
          )}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: SumUnitDateType,
      fieldPath: List<string>,
      serialized: SerializedSumUnitDateFieldRenderer,
    ): ValueOrErrors<SumUnitDateFieldRenderer<T>, string> => {
      return SumUnitDateFieldRenderer.Operations.tryAsValidSumUnitDateFieldRenderer(
        fieldPath,
        serialized,
      ).Then((sumUnitDateRenderer) => {
        return Expr.Operations.parse(
          sumUnitDateRenderer.visible,
          fieldPath,
        ).Then((visible) => {
          return Expr.Operations.parse(
            sumUnitDateRenderer.disabled,
            fieldPath,
          ).Then((disabled) => {
            return ValueOrErrors.Default.return(
              SumUnitDateFieldRenderer.Default(
                type,
                fieldPath,
                sumUnitDateRenderer.renderer,
                visible,
                disabled,
                sumUnitDateRenderer.label,
                sumUnitDateRenderer.tooltip,
                sumUnitDateRenderer.details,
              ),
            );
          });
        });
      });
    },
  },
};
