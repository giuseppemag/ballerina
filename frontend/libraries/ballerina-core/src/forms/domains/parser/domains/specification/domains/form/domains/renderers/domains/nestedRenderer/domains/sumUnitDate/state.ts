import {
  SumUnitDateType,
  ValueOrErrors,
} from "../../../../../../../../../../../../../../main";
import {
  BaseSerializedNestedRenderer,
  BaseNestedRenderer,
} from "../../state";
import { List } from "immutable";

export type SerializedNestedSumUnitDateRenderer = BaseSerializedNestedRenderer;

export type NestedSumUnitDateRenderer<T> = BaseNestedRenderer & {
  kind: "nestedSumUnitDateRenderer";
  type: SumUnitDateType;
};

export const NestedSumUnitDateRenderer = {
  Default: <T>(
    type: SumUnitDateType,
    rendererPath: List<string>,
    renderer: string,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedSumUnitDateRenderer<T> => ({
    kind: "nestedSumUnitDateRenderer",
    type,
    rendererPath,
    renderer,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderer: (
      serialized: SerializedNestedSumUnitDateRenderer,
    ): serialized is SerializedNestedSumUnitDateRenderer & {
      renderer: string;
    } => {
      return (
        serialized.renderer != undefined &&
        typeof serialized.renderer == "string"
      );
    },
    tryAsValidNestedSumUnitDateRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedSumUnitDateRenderer,
    ): ValueOrErrors<
      Omit<SerializedNestedSumUnitDateRenderer, "renderer"> & {
        renderer: string;
      },
      string
    > => {
      if (!NestedSumUnitDateRenderer.Operations.hasRenderer(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer is required for nested renderer ${rendererPath.join(".")}`,
        );

      return ValueOrErrors.Default.return(serialized);
    },
    Deserialize: <T>(
      type: SumUnitDateType,
      rendererPath: List<string>,
      serialized: SerializedNestedSumUnitDateRenderer,
    ): ValueOrErrors<NestedSumUnitDateRenderer<T>, string> => {
      return NestedSumUnitDateRenderer.Operations.tryAsValidNestedSumUnitDateRenderer(
        rendererPath,
        serialized,
      ).Then((sumUnitDateRenderer) => {
        return ValueOrErrors.Default.return(
          NestedSumUnitDateRenderer.Default(
            type,
            rendererPath,
            sumUnitDateRenderer.renderer,
            sumUnitDateRenderer.label,
            sumUnitDateRenderer.tooltip,
            sumUnitDateRenderer.details,
          ),
        );
      });
    },
  },
};
