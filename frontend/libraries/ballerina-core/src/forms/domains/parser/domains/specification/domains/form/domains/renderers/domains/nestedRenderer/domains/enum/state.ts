import {
  SingleSelectionType,
  MultiSelectionType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import { BaseNestedRenderer, BaseSerializedNestedRenderer } from "../../state";
import { List } from "immutable";

export type SerializedNestedEnumRenderer = {
  options?: string;
} & BaseSerializedNestedRenderer;

export type NestedEnumRenderer<T> = BaseNestedRenderer & {
  kind: "nestedEnumRenderer";
  options: string;
  type: SingleSelectionType<T> | MultiSelectionType<T>;
};

export const NestedEnumRenderer = {
  Default: <T>(
    type: SingleSelectionType<T> | MultiSelectionType<T>,
    rendererPath: List<string>,
    options: string,
    renderer: string,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedEnumRenderer<T> => ({
    kind: "nestedEnumRenderer",
    type,
    rendererPath,
    options,
    renderer,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderer: (
      serialized: SerializedNestedEnumRenderer,
    ): serialized is SerializedNestedEnumRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    hasOptions: (
      serialized: SerializedNestedEnumRenderer,
    ): serialized is SerializedNestedEnumRenderer & {
      options: string;
    } => {
      return (
        serialized.options != undefined && typeof serialized.options == "string"
      );
    },
    tryAsValidNestedEnumRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedEnumRenderer,
    ): ValueOrErrors<
      Omit<SerializedNestedEnumRenderer, "renderer" | "options"> & {
        renderer: string;
        options: string;
      },
      string
    > => {
      if (!NestedEnumRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for nested renderer ${rendererPath.join(".")}`,
        );

      if (!NestedEnumRenderer.Operations.hasOptions(serialized))
        return ValueOrErrors.Default.throwOne(
          `options are required for nested renderer ${rendererPath.join(".")}`,
        );

      if (typeof serialized.options != "string")
        return ValueOrErrors.Default.throwOne(
          `options must be a string for nested renderer ${rendererPath.join(
            ".",
          )}`,
        );

      if (serialized.label && typeof serialized.label != "string")
        return ValueOrErrors.Default.throwOne(
          `label must be a string for nested renderer ${rendererPath.join(
            ".",
          )}`,
        );

      if (serialized.tooltip && typeof serialized.tooltip != "string")
        return ValueOrErrors.Default.throwOne(
          `tooltip must be a string for nested renderer ${rendererPath.join(
            ".",
          )}`,
        );

      if (serialized.details && typeof serialized.details != "string")
        return ValueOrErrors.Default.throwOne(
          `details must be a string for nested renderer ${rendererPath.join(
            ".",
          )}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: SingleSelectionType<T> | MultiSelectionType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedEnumRenderer,
    ): ValueOrErrors<NestedEnumRenderer<T>, string> => {
      return NestedEnumRenderer.Operations.tryAsValidNestedEnumRenderer(
        rendererPath,
        serialized,
      ).Then((nestedEnumRenderer) => {
        return ValueOrErrors.Default.return(
          NestedEnumRenderer.Default(
            type,
            rendererPath,
            nestedEnumRenderer.options,
            nestedEnumRenderer.renderer,
            nestedEnumRenderer.label,
            nestedEnumRenderer.tooltip,
            nestedEnumRenderer.details,
          ),
        );
      });
    },
  },
};
