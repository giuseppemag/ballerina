import {
  ParsedType,
  SingleSelectionType,
  MultiSelectionType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import { BaseSerializedNestedRenderer, BaseNestedRenderer } from "../../state";
import { List } from "immutable";

export type SerializedNestedStreamRenderer = {
  stream?: string;
} & BaseSerializedNestedRenderer;

export type NestedStreamRenderer<T> = BaseNestedRenderer & {
  kind: "nestedStreamRenderer";
  stream: string;
  type: SingleSelectionType<T> | MultiSelectionType<T>;
};

export const NestedStreamRenderer = {
  Default: <T>(
    rendererPath: List<string>,
    type: SingleSelectionType<T> | MultiSelectionType<T>,
    stream: string,
    renderer: string,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedStreamRenderer<T> => ({
    kind: "nestedStreamRenderer",
    rendererPath,
    type,
    stream,
    renderer,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderer: (
      serialized: SerializedNestedStreamRenderer,
    ): serialized is SerializedNestedStreamRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    hasStream: (
      serialized: SerializedNestedStreamRenderer,
    ): serialized is SerializedNestedStreamRenderer & {
      stream: string;
    } => {
      return (
        serialized.stream != undefined && typeof serialized.stream == "string"
      );
    },
    tryAsValidNestedStreamRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedStreamRenderer,
    ): ValueOrErrors<
      Omit<SerializedNestedStreamRenderer, "renderer" | "stream"> & {
        renderer: string;
        stream: string;
      },
      string
    > => {
      if (!NestedStreamRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for nested renderer ${rendererPath.join(".")}`,
        );

      if (!NestedStreamRenderer.Operations.hasStream(serialized))
        return ValueOrErrors.Default.throwOne(
          `stream is required for nested renderer ${rendererPath.join(".")}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: SingleSelectionType<T> | MultiSelectionType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedStreamRenderer,
    ): ValueOrErrors<NestedStreamRenderer<T>, string> => {
      return NestedStreamRenderer.Operations.tryAsValidNestedStreamRenderer(
        rendererPath,
        serialized,
      ).Then((streamRecordFieldRenderer) => {
        return ValueOrErrors.Default.return(
          NestedStreamRenderer.Default(
            rendererPath,
            type,
            streamRecordFieldRenderer.stream,
            streamRecordFieldRenderer.renderer,
            streamRecordFieldRenderer.label,
            streamRecordFieldRenderer.tooltip,
            streamRecordFieldRenderer.details,
          ),
        );
      });
    },
  },
};
