import { List } from "immutable";
import {
  SerializedRecordFieldRenderer,
  BaseSerializedRecordFieldRenderer,
  RecordFieldRenderer,
  BaseRecordFieldRenderer,
} from "../../state";
import {
  ParsedType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";
import { Expr } from "../../../../../../../../../../../../../../../../main";

export type SerializedSumRecordFieldRenderer = {
  leftRenderer?: unknown;
  rightRenderer?: unknown;
} & BaseSerializedRecordFieldRenderer;

export type SumRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "sumRecordField";
  leftRenderer: RecordFieldRenderer<T>;
  rightRenderer: RecordFieldRenderer<T>;
};

export const SumRecordFieldRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    fieldPath: List<string>,
    renderer: string,
    leftRenderer: RecordFieldRenderer<T>,
    rightRenderer: RecordFieldRenderer<T>,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): SumRecordFieldRenderer<T> => ({
    kind: "sumRecordField",
    type,
    fieldPath,
    renderer,
    leftRenderer,
    rightRenderer,
    visible,
    disabled,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedSumRecordFieldRenderer,
    ): serialized is SerializedSumRecordFieldRenderer & {
      renderer: string;
      leftRenderer: SerializedRecordFieldRenderer;
      rightRenderer: SerializedRecordFieldRenderer;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.leftRenderer != undefined &&
      serialized.rightRenderer != undefined,
    tryAsValidSumRecordFieldRenderer: (
      rendererPath: List<string>,
      serialized: SerializedSumRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<
        SerializedSumRecordFieldRenderer,
        "renderer" | "leftRenderer" | "rightRenderer"
      > & {
        renderer: string;
        leftRenderer: SerializedRecordFieldRenderer;
        rightRenderer: SerializedRecordFieldRenderer;
      },
      string
    > => {
      if (!SumRecordFieldRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer, leftRenderer and rightRenderer are required for renderer ${rendererPath.join(
            ".",
          )}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      rendererPath: List<string>,
      serialized: SerializedSumRecordFieldRenderer,
    ): ValueOrErrors<SumRecordFieldRenderer<T>, string> => {
      return SumRecordFieldRenderer.Operations.tryAsValidSumRecordFieldRenderer(
        rendererPath,
        serialized,
      ).Then((serializedSumRecordFieldRenderer) =>
        Expr.Operations.parse(
          serializedSumRecordFieldRenderer.visible ?? true,
          rendererPath.push("visible"),
        ).Then((visibleExpr) =>
          Expr.Operations.parse(
            serializedSumRecordFieldRenderer.disabled ?? false,
            rendererPath.push("disabled"),
          ).Then((disabledExpr) =>
            RecordFieldRenderer.Operations.Deserialize(
              type,
              rendererPath.push("leftRenderer"),
              serializedSumRecordFieldRenderer.leftRenderer,
            ).Then((deserializedLeftRenderer) =>
              RecordFieldRenderer.Operations.Deserialize(
                type,
                rendererPath.push("rightRenderer"),
                serializedSumRecordFieldRenderer.rightRenderer,
              ).Then((deserializedRightRenderer) => {
                return ValueOrErrors.Default.return(
                  SumRecordFieldRenderer.Default(
                    type,
                    rendererPath,
                    serializedSumRecordFieldRenderer.renderer,
                    deserializedLeftRenderer,
                    deserializedRightRenderer,
                    visibleExpr,
                    disabledExpr,
                    serializedSumRecordFieldRenderer.label,
                    serializedSumRecordFieldRenderer.tooltip,
                    serializedSumRecordFieldRenderer.details,
                  ),
                );
              }),
            ),
          ),
        ),
      );
    },
  },
};
