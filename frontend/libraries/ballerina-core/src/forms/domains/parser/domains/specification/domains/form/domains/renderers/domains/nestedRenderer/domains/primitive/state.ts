import {
  ParsedType,
  PrimitiveType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import { NestedRenderer, BaseSerializedNestedRenderer, BaseNestedRenderer } from "../../state";
import { List } from "immutable";

export type SerializedNestedPrimitiveRenderer = BaseSerializedNestedRenderer;

export type NestedPrimitiveRenderer<T> = BaseNestedRenderer & {
  kind: "nestedPrimitiveRenderer";
  type: PrimitiveType<T>;
};

export const NestedPrimitiveRenderer = {
  Default: <T>(
    type: PrimitiveType<T>,
    rendererPath: List<string>,
    renderer: string,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedPrimitiveRenderer<T> => ({
    kind: "nestedPrimitiveRenderer",
    type,
    rendererPath,
    renderer,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderer: (
      serialized: SerializedNestedPrimitiveRenderer,
    ): serialized is SerializedNestedPrimitiveRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    tryAsValidNestedPrimitiveRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedPrimitiveRenderer,
    ): ValueOrErrors<
      Omit<SerializedNestedPrimitiveRenderer, "renderer"> & {
        renderer: string;
      },
      string
    > => {
      if (!NestedPrimitiveRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for nested renderer ${rendererPath.join(".")}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: PrimitiveType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedPrimitiveRenderer,
    ): ValueOrErrors<NestedPrimitiveRenderer<T>, string> => {
      return NestedPrimitiveRenderer.Operations.tryAsValidNestedPrimitiveRenderer(
        rendererPath,
        serialized,
      ).Then((primitiveRenderer) => {
        return ValueOrErrors.Default.return(
          NestedPrimitiveRenderer.Default(  
            type,
            rendererPath,
            primitiveRenderer.renderer,
            primitiveRenderer.label,
            primitiveRenderer.tooltip,
            primitiveRenderer.details,
          ),
        );
      });
    },
  },
};
