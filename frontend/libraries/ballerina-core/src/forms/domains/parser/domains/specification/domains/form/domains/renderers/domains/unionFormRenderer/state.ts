import { ValueOrErrors } from "../../../../../../../../../../../../main";
import { isObject, ParsedType, ParsedUnion } from "../../../../../types/state";
import {
  SerializedUnionCaseRenderer,
  UnionCaseRenderer,
} from "./domains/unionCaseRenderer/state";
import { List, Map } from "immutable";
import {
  NestedRenderer,
  SerializedNestedRenderer,
} from "../nestedRenderer/state";

export type SerializedUnionFormRenderer<T> = {
  type: ParsedUnion<T>;
  renderer?: unknown;
  cases?: unknown;
};

export type UnionFormRenderer<T> = {
  kind: "unionForm";
  renderer?: NestedRenderer<T>;
  type: ParsedType<T>;
  cases: Map<string, UnionCaseRenderer<T>>;
};

export const UnionFormRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    cases: Map<string, UnionCaseRenderer<T>>,
    renderer?: NestedRenderer<T>,
  ): UnionFormRenderer<T> => ({ kind: "unionForm", type, renderer, cases }),
  Operations: {
    hasCases: (_: unknown): _ is { cases: Record<string, unknown> } =>
      isObject(_) && "cases" in _ && isObject(_.cases),
    hasValidRenderer: (_: unknown): _ is SerializedNestedRenderer =>
      isObject(_) && "renderer" in _ && isObject(_.renderer),
    tryAsValidUnionForm: <T>(
      serialized: SerializedUnionFormRenderer<T>,
    ): ValueOrErrors<
      Omit<SerializedUnionFormRenderer<T>, "cases" | "renderer"> & {
        renderer?: SerializedNestedRenderer;
        cases: Map<string, SerializedUnionCaseRenderer>;
      },
      string
    > => {
      const cases = serialized.cases;
      if (!UnionFormRenderer.Operations.hasCases(cases))
        return ValueOrErrors.Default.throwOne(
          "union form is missing the required cases attribute",
        );

      const renderer = serialized.renderer;
      if (
        renderer === null ||
        (renderer !== undefined &&
          !UnionFormRenderer.Operations.hasValidRenderer(renderer))
      )
        return ValueOrErrors.Default.throwOne(
          "union form is missing the required renderer attribute",
        );

      if (!isObject(serialized.cases)) {
        return ValueOrErrors.Default.throwOne(
          "union form cases attribute is not an object",
        );
      }

      return ValueOrErrors.Default.return({
        ...serialized,
        cases: Map<string, SerializedUnionCaseRenderer>(cases),
        renderer,
      });
    },
    Deserialize: <T>(
      fieldPath: List<string>,
      serialized: SerializedUnionFormRenderer<T>,
      types: Map<string, ParsedType<T>>,
    ): ValueOrErrors<UnionFormRenderer<T>, string> =>
      UnionFormRenderer.Operations.tryAsValidUnionForm(serialized).Then(
        (validUnionForm) =>
          ValueOrErrors.Operations.All(
            List<ValueOrErrors<[string, UnionCaseRenderer<T>], string>>(
              validUnionForm.cases
                .entrySeq()
                .toArray()
                .map(([caseName, caseRenderer]) => {
                  return UnionCaseRenderer.Operations.Deserialize(
                    caseName,
                    fieldPath.push(caseName),
                    caseRenderer,
                    validUnionForm.type.args,
                    types,
                  ).Then((caseRenderer) =>
                    ValueOrErrors.Default.return([caseName, caseRenderer]),
                  );
                }),
            ),
          ).Then((caseTuples) => {
            const cases = Map(caseTuples);
            if (validUnionForm.renderer != undefined) {
              return NestedRenderer.Operations.Deserialize(
                validUnionForm.type,
                fieldPath,
                validUnionForm.renderer,
              ).Then((renderer) => {
                return ValueOrErrors.Default.return(
                  UnionFormRenderer.Default(serialized.type, cases, renderer),
                );
              });
            }
            return ValueOrErrors.Default.return(
              UnionFormRenderer.Default(serialized.type, cases),
            );
          }),
      ),
  },
};
