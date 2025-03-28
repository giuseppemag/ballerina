import {
  ParsedType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import {
  BaseSerializedNestedRenderer,
  NestedRenderer,
  SerializedNestedRenderer,
  BaseNestedRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedNestedTupleRenderer = {
  itemRenderers?: unknown;
} & BaseSerializedNestedRenderer;

export type NestedTupleRenderer<T> = BaseNestedRenderer<T> & {
  kind: "nestedTupleRenderer";
  itemRenderers: Array<NestedRenderer<T>>;
};

export const NestedTupleRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    rendererPath: List<string>,
    renderer: string,
    itemRenderers: Array<NestedRenderer<T>>,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedTupleRenderer<T> => ({
    kind: "nestedTupleRenderer",
    type,
    rendererPath,
    renderer,
    itemRenderers,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedNestedTupleRenderer,
    ): serialized is SerializedNestedTupleRenderer & {
      renderer: string;
      cases: Record<string, SerializedNestedRenderer>;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.itemRenderers != undefined,
    tryAsValidNestedTupleRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedTupleRenderer,
    ): ValueOrErrors<
      Omit<SerializedNestedTupleRenderer, "renderer" | "itemRenderers"> & {
        renderer: string;
        itemRenderers: Array<SerializedNestedRenderer>;
      },
      string
    > => {
      if (!NestedTupleRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer and itemRenderers are required for renderer ${rendererPath.join(
            ".",
          )}`,
        );
      if (!Array.isArray(serialized.itemRenderers)) {
        return ValueOrErrors.Default.throwOne(
          `itemRenderers must be an array for renderer ${rendererPath.join(
            ".",
          )}`,
        );
      }
      if (serialized.itemRenderers.length == 0) {
        return ValueOrErrors.Default.throwOne(
          `itemRenderers must have at least one item for renderer ${rendererPath.join(
            ".",
          )}`,
        );
      }
      if (
        serialized.itemRenderers.some(
          (itemRenderer) => typeof itemRenderer != "object",
        )
      ) {
        return ValueOrErrors.Default.throwOne(
          `itemRenderers must be objects for renderer ${rendererPath.join(
            ".",
          )}`,
        );
      }
      const itemRenderers =
        serialized.itemRenderers as Array<SerializedNestedRenderer>;

      return ValueOrErrors.Default.return({
        ...serialized,
        itemRenderers: itemRenderers,
      });
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedTupleRenderer,
    ): ValueOrErrors<NestedTupleRenderer<T>, string> => {
      return NestedTupleRenderer.Operations.tryAsValidNestedTupleRenderer(
        rendererPath,
        serialized,
      ).Then((serializedNestedTupleRenderer) =>
        ValueOrErrors.Operations.All(
          List<ValueOrErrors<NestedRenderer<T>, string>>(
            serializedNestedTupleRenderer.itemRenderers.map(
              (itemRenderer, index) =>
                NestedRenderer.Operations.Deserialize(
                  type,
                  rendererPath.push((index + 1).toString()),
                  itemRenderer,
                ).Then((deserializedItemRenderer) => {
                  return ValueOrErrors.Default.return(deserializedItemRenderer);
                }),
            ),
          ),
        ).Then((deserializedItemRenderers) => {
          return ValueOrErrors.Default.return(
            NestedTupleRenderer.Default(
              type,
              rendererPath,
              serializedNestedTupleRenderer.renderer,
              deserializedItemRenderers.toArray(),
              serializedNestedTupleRenderer.label,
              serializedNestedTupleRenderer.tooltip,
              serializedNestedTupleRenderer.details,
            ),
          );
        }),
      );
    },
  },
};
