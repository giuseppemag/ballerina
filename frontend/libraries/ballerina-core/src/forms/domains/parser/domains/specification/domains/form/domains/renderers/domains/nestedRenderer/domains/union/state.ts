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
import { List, Map } from "immutable";

export type SerializedNestedUnionRenderer = {
  cases?: unknown;
} & BaseSerializedNestedRenderer;

export type NestedUnionRenderer<T> = BaseNestedRenderer<T> & {
  kind: "nestedUnionRenderer";
  cases: Map<string, NestedRenderer<T>>;
};

export const NestedUnionRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    rendererPath: List<string>,
    renderer: string,
    cases: Map<string, NestedRenderer<T>>,
    label?: string,
    tooltip?: string,
    details?: string,
  ): NestedUnionRenderer<T> => ({
    kind: "nestedUnionRenderer",
    type,
    rendererPath,
    renderer,
    cases,
    label,
    tooltip,
    details,
  }),
  Operations: {
    hasRenderers: (
      serialized: SerializedNestedUnionRenderer,
    ): serialized is SerializedNestedUnionRenderer & {
      renderer: string;
      cases: Record<string, SerializedNestedRenderer>;
    } =>
      serialized.renderer != undefined &&
      typeof serialized.renderer == "string" &&
      serialized.cases != undefined,
    tryAsValidNestedUnionRenderer: (
      rendererPath: List<string>,
      serialized: SerializedNestedUnionRenderer,
    ): ValueOrErrors<
      Omit<SerializedNestedUnionRenderer, "renderer" | "cases"> & {
        renderer: string;
        cases: Record<string, SerializedNestedRenderer>;
      },
      string
    > => {
      if (!NestedUnionRenderer.Operations.hasRenderers(serialized))
        return ValueOrErrors.Default.throwOne(
          `renderer and cases are required for renderer ${rendererPath.join(
            ".",
          )}`,
        );
      if (typeof serialized.cases != "object") {
        return ValueOrErrors.Default.throwOne(
          `cases must be an object for renderer ${rendererPath.join(".")}`,
        );
      }
      if (Object.keys(serialized.cases).length == 0) {
        return ValueOrErrors.Default.throwOne(
          `cases must have at least one case for renderer ${rendererPath.join(
            ".",
          )}`,
        );
      }
      if (
        Object.values(serialized.cases).some(
          (caseProp) => typeof caseProp != "object",
        )
      ) {
        return ValueOrErrors.Default.throwOne(
          `cases must be objects for renderer ${rendererPath.join(".")}`,
        );
      }
      const cases = serialized.cases as Record<
        string,
        SerializedNestedRenderer
      >;

      return ValueOrErrors.Default.return({
        ...serialized,
        cases: cases,
      });
    },
    Deserialize: <T>(
      type: ParsedType<T>,
      rendererPath: List<string>,
      serialized: SerializedNestedUnionRenderer,
    ): ValueOrErrors<NestedUnionRenderer<T>, string> => {
      return NestedUnionRenderer.Operations.tryAsValidNestedUnionRenderer(
        rendererPath,
        serialized,
      ).Then((serializedNestedUnionRenderer) =>
        ValueOrErrors.Operations.All(
          List<ValueOrErrors<[string, NestedRenderer<T>], string>>(
            Object.entries(serializedNestedUnionRenderer.cases).map(
              ([caseName, caseProp]) =>
                NestedRenderer.Operations.Deserialize(
                  type,
                  rendererPath.push(caseName),
                  caseProp,
                ).Then((deserializedCase) => {
                  return ValueOrErrors.Default.return([
                    caseName,
                    deserializedCase,
                  ]);
                }),
            ),
          ),
        ).Then((deserializedCases) => {
          return ValueOrErrors.Default.return(
            NestedUnionRenderer.Default(
              type,
              rendererPath,
              serializedNestedUnionRenderer.renderer,
              Map<string, NestedRenderer<T>>(deserializedCases),
              serializedNestedUnionRenderer.label,
              serializedNestedUnionRenderer.tooltip,
              serializedNestedUnionRenderer.details,
            ),
          );
        }),
      );
    },
  },
};
