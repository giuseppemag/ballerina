import {
  ParsedType,
  LookupType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import { BaseSerializedNestedRenderer, BaseNestedRenderer } from "../../state";
import { List } from "immutable";

export type SerializedNestedLookupRenderer = BaseSerializedNestedRenderer;

export type NestedLookupRenderer<T> = BaseNestedRenderer & {
  kind: "lookupRecordField";
  type: LookupType;
};

export const NestedLookupRenderer = {
  Default: <T>(
    type: LookupType,
    rendererPath: List<string>,
    renderer: string,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedLookupRenderer<T> => ({
    kind: "lookupRecordField",
    rendererPath,
    type,
    renderer,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderer: (
      serialized: SerializedNestedLookupRenderer,
    ): serialized is SerializedNestedLookupRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    tryAsValidNestedLookupRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedLookupRenderer,
    ): ValueOrErrors<
      Omit<SerializedNestedLookupRenderer, "renderer"> & {
        renderer: string;
      },
      string
    > => {
      if (!NestedLookupRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for nested renderer ${rendererPath.join(".")}`,
        );
      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: LookupType,
      rendererPath: List<string>,
      serialized: SerializedNestedLookupRenderer,
    ): ValueOrErrors<NestedLookupRenderer<T>, string> => {
      return NestedLookupRenderer.Operations.tryAsValidNestedLookupRenderer(
        rendererPath,
        serialized,
      ).Then((nestedLookupRenderer) => {
        return ValueOrErrors.Default.return(
          NestedLookupRenderer.Default(
            type,
            rendererPath,
            nestedLookupRenderer.renderer,
            nestedLookupRenderer.label,
            nestedLookupRenderer.tooltip,
            nestedLookupRenderer.details,
          ),
        );
      });
    },
  },
};
