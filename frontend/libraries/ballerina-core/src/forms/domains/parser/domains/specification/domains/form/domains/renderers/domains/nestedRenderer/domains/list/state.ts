import {
  ParsedType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import {
  NestedRenderer,
  BaseSerializedNestedRenderer,
  BaseNestedRenderer,
  SerializedNestedRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedNestedListRenderer = {
  elementRenderer?: unknown;
  elementLabel?: string;
  elementTooltip?: string;
  elementDetails?: string;
} & BaseSerializedNestedRenderer;

export type NestedListRenderer<T> = BaseNestedRenderer<T> & {
  kind: "nestedListRenderer";
  elementRenderer: NestedRenderer<T>;
};

export const NestedListRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    rendererPath: List<string>,
    renderer: string,
    elementRenderer: NestedRenderer<T>,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedListRenderer<T> => ({
    kind: "nestedListRenderer",
    type,
    rendererPath,
    renderer,
    elementRenderer,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedNestedListRenderer,
    ): serialized is SerializedNestedListRenderer & {
      renderer: string;
      elementRenderer: string | object;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.elementRenderer != undefined,
    tryAsValidNestedListRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedListRenderer,
    ): ValueOrErrors<
      Omit<SerializedNestedListRenderer, "renderer" | "elementRenderer"> & {
        renderer: string;
        elementRenderer: SerializedNestedRenderer;
      },
      string
    > => {
      if (!NestedListRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer and elementRenderer are required for renderer ${rendererPath.join(
            ".",
          )}`,
        );
      const elementRenderer = serialized.elementRenderer;
      // Backwards compatability
      if (typeof elementRenderer == "string") {
        return ValueOrErrors.Default.return({
          renderer: serialized.renderer,
          label: serialized?.label,
          details: serialized?.details,
          elementRenderer: {
            renderer: elementRenderer,
            label: serialized?.elementLabel,
            tooltip: serialized?.elementTooltip,
            details: serialized?.elementDetails,
          },
        });
      }
      return ValueOrErrors.Default.return({
        ...serialized,
        elementRenderer: elementRenderer,
      });
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedListRenderer,
    ): ValueOrErrors<NestedListRenderer<T>, string> => {
      return NestedListRenderer.Operations.tryAsValidNestedListRenderer(
        rendererPath,
        serialized,
      ).Then((serializedNestedListRenderer) =>
        NestedRenderer.Operations.Deserialize(
          type,
          rendererPath.push("elementRenderer"),
          serializedNestedListRenderer.elementRenderer,
        ).Then((deserializedElementRenderer) => {
          return ValueOrErrors.Default.return(
            NestedListRenderer.Default(
              type,
              rendererPath,
              serializedNestedListRenderer.renderer,
              deserializedElementRenderer,
              serializedNestedListRenderer.label,
              serializedNestedListRenderer.tooltip,
              serializedNestedListRenderer.details,
            ),
          );
        }),
      );
    },
  },
};
