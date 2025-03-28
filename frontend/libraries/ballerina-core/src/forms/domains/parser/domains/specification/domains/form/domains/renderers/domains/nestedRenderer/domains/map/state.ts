import {
  ParsedType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import {
  NestedRenderer,
  BaseSerializedNestedRenderer,
  SerializedNestedRenderer,
  BaseNestedRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedNestedMapRenderer = {
  keyRenderer?: unknown;
  valueRenderer?: unknown;
} & BaseSerializedNestedRenderer;

export type NestedMapRenderer<T> = BaseNestedRenderer<T> & {
  kind: "nestedMapRenderer";
  keyRenderer: NestedRenderer<T>;
  valueRenderer: NestedRenderer<T>;
};

export const NestedMapRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    rendererPath: List<string>,
    renderer: string,
    keyRenderer: NestedRenderer<T>,
    valueRenderer: NestedRenderer<T>,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedMapRenderer<T> => ({
    kind: "nestedMapRenderer",
    type,
    rendererPath,
    renderer,
    keyRenderer,
    valueRenderer,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedNestedMapRenderer,
    ): serialized is SerializedNestedMapRenderer & {
      renderer: string;
      keyRenderer: SerializedNestedRenderer;
      valueRenderer: SerializedNestedRenderer;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.keyRenderer != undefined &&
      serialized.valueRenderer != undefined,
    tryAsValidNestedMapRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedMapRenderer,
    ): ValueOrErrors<
      Omit<
        SerializedNestedMapRenderer,
        "renderer" | "keyRenderer" | "valueRenderer"
      > & {
        renderer: string;
        keyRenderer: SerializedNestedRenderer;
        valueRenderer: SerializedNestedRenderer;
      },
      string
    > => {
      if (!NestedMapRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer, keyRenderer and valueRenderer are required for renderer ${rendererPath.join(
            ".",
          )}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedMapRenderer,
    ): ValueOrErrors<NestedMapRenderer<T>, string> => {
      return NestedMapRenderer.Operations.tryAsValidNestedMapRenderer(
        rendererPath,
        serialized,
      ).Then((serializedNestedMapRenderer) =>
        NestedRenderer.Operations.Deserialize(
          type,
          rendererPath.push("keyRenderer"),
          serializedNestedMapRenderer.keyRenderer,
        ).Then((deserializedKeyRenderer) =>
          NestedRenderer.Operations.Deserialize(
            type,
            rendererPath.push("valueRenderer"),
            serializedNestedMapRenderer.valueRenderer,
          ).Then((deserializedValueRenderer) => {
            return ValueOrErrors.Default.return(
              NestedMapRenderer.Default(
                type,
                rendererPath,
                serializedNestedMapRenderer.renderer,
                deserializedKeyRenderer,
                deserializedValueRenderer,
                serializedNestedMapRenderer.label,
                serializedNestedMapRenderer.tooltip,
                serializedNestedMapRenderer.details,
              ),
            );
          }),
        ),
      );
    },
  },
};
