import {
  ParsedType,
  SumType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import {
  NestedRenderer,
  BaseSerializedNestedRenderer,
  SerializedNestedRenderer,
  BaseNestedRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedNestedSumRenderer = {
  leftRenderer?: unknown;
  rightRenderer?: unknown;
} & BaseSerializedNestedRenderer;

export type NestedSumRenderer<T> = BaseNestedRenderer & {
  kind: "nestedSumRenderer";
  leftRenderer: NestedRenderer<T>;
  rightRenderer: NestedRenderer<T>;
  type: SumType<T>;
};

export const NestedSumRenderer = {
  Default: <T>(
    type: SumType<T>,
    rendererPath: List<string>,
    renderer: string,
    leftRenderer: NestedRenderer<T>,
    rightRenderer: NestedRenderer<T>,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedSumRenderer<T> => ({
    kind: "nestedSumRenderer",
    type,
    rendererPath,
    renderer,
    leftRenderer,
    rightRenderer,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedNestedSumRenderer,
    ): serialized is SerializedNestedSumRenderer & {
      renderer: string;
      leftRenderer: SerializedNestedRenderer;
      rightRenderer: SerializedNestedRenderer;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.leftRenderer != undefined &&
      serialized.rightRenderer != undefined,
    tryAsValidNestedSumRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedSumRenderer,
    ): ValueOrErrors<
      Omit<
        SerializedNestedSumRenderer,
        "renderer" | "leftRenderer" | "rightRenderer"
      > & {
        renderer: string;
        leftRenderer: SerializedNestedRenderer;
        rightRenderer: SerializedNestedRenderer;
      },
      string
    > => {
      if (!NestedSumRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer, leftRenderer and rightRenderer are required for renderer ${rendererPath.join(
            ".",
          )}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: SumType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedSumRenderer,
    ): ValueOrErrors<NestedSumRenderer<T>, string> => {
      return NestedSumRenderer.Operations.tryAsValidNestedSumRenderer(
        rendererPath,
        serialized,
      ).Then((serializedNestedSumRenderer) =>
        NestedRenderer.Operations.Deserialize(
          type.args[0],
          rendererPath.push("leftRenderer"),
          serializedNestedSumRenderer.leftRenderer,
        ).Then((deserializedLeftRenderer) =>
          NestedRenderer.Operations.Deserialize(
            type.args[1],
            rendererPath.push("rightRenderer"),
            serializedNestedSumRenderer.rightRenderer,
          ).Then((deserializedRightRenderer) => {
            return ValueOrErrors.Default.return(
              NestedSumRenderer.Default(
                type,
                rendererPath,
                serializedNestedSumRenderer.renderer,
                deserializedLeftRenderer,
                deserializedRightRenderer,
                serializedNestedSumRenderer.label,
                serializedNestedSumRenderer.tooltip,
                serializedNestedSumRenderer.details,
              ),
            );
          }),
        ),
      );
    },
  },
};
