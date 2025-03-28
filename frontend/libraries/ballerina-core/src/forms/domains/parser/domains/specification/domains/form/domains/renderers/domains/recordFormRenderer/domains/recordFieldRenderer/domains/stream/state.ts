import { List } from "immutable";
import {
  Expr,
  ParsedApplicationType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../../../main";
import {
  BaseRecordFieldRenderer,
  BaseSerializedRecordFieldRenderer,
} from "../../state";
export type SerializedStreamRecordFieldRenderer = {
  stream?: string;
} & BaseSerializedRecordFieldRenderer;

export type StreamRecordFieldRenderer<T> = BaseRecordFieldRenderer<T> & {
  kind: "streamRecordField";
  stream: string;
  type: ParsedApplicationType<T>;
};

export const StreamRecordFieldRenderer = {
  Default: <T>(
    type: ParsedApplicationType<T>,
    fieldPath: List<string>,
    stream: string,
    renderer: string,
    visible: Expr,
    disabled: Expr,
    label?: string,
    tooltip?: string,
    details?: string,
  ): StreamRecordFieldRenderer<T> => ({
    kind: "streamRecordField",
    fieldPath,
    type,
    stream,
    renderer,
    visible,
    disabled,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderer: (
      serialized: SerializedStreamRecordFieldRenderer,
    ): serialized is SerializedStreamRecordFieldRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    hasStream: (
      serialized: SerializedStreamRecordFieldRenderer,
    ): serialized is SerializedStreamRecordFieldRenderer & {
      stream: string;
    } => {
      return (
        serialized.stream != undefined && typeof serialized.stream == "string"
      );
    },
    tryAsValidStreamRecordField: (
      fieldPath: List<string>,
      serialized: SerializedStreamRecordFieldRenderer,
    ): ValueOrErrors<
      Omit<SerializedStreamRecordFieldRenderer, "renderer" | "stream"> & {
        renderer: string;
        stream: string;
      },
      string
    > => {
      if (!StreamRecordFieldRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for field ${fieldPath.join(".")}`,
        );

      if (!StreamRecordFieldRenderer.Operations.hasStream(serialized))
        return ValueOrErrors.Default.throwOne(
          `stream is required for field ${fieldPath.join(".")}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: ParsedApplicationType<T>,
      fieldPath: List<string>,

      serialized: SerializedStreamRecordFieldRenderer,
    ): ValueOrErrors<StreamRecordFieldRenderer<T>, string> => {
      return StreamRecordFieldRenderer.Operations.tryAsValidStreamRecordField(
        fieldPath,
        serialized,
      ).Then((streamRecordFieldRenderer) =>
        Expr.Operations.parse(
          streamRecordFieldRenderer.visible ?? true,
          fieldPath.push("visibilityPredicate"),
        ).Then((visibilityExpr) =>
          Expr.Operations.parse(
            streamRecordFieldRenderer.disabled ?? false,
            fieldPath.push("disabledPredicate"),
          ).Then((disabledExpr) => {
            return ValueOrErrors.Default.return(
              StreamRecordFieldRenderer.Default(
                type,
                fieldPath,
                streamRecordFieldRenderer.stream,
                streamRecordFieldRenderer.renderer,
                visibilityExpr,
                disabledExpr,
                streamRecordFieldRenderer.label,
                streamRecordFieldRenderer.tooltip,
                streamRecordFieldRenderer.details,
              ),
            );
          }),
        ),
      );
    },
  },
};
