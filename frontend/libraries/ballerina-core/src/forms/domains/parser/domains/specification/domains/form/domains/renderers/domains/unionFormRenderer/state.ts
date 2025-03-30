import { ValueOrErrors } from "../../../../../../../../../../../../main";
import {
  isObject,
  isString,
  ParsedType,
  UnionType,
} from "../../../../../types/state";
import { NestedRenderer } from "../nestedRenderer/state";
import { List, Map } from "immutable";

export type SerializedUnionFormRenderer = {
  renderer?: unknown;
  cases?: unknown;
};

export type UnionFormRenderer<T> = {
  kind: "unionForm";
  renderer?: string;
  type: ParsedType<T>;
  cases: Map<string, NestedRenderer<T>>;
};

export const UnionFormRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    cases: Map<string, NestedRenderer<T>>,
    renderer?: string,
  ): UnionFormRenderer<T> => ({ kind: "unionForm", type, renderer, cases }),
  Operations: {
    hasCases: (
      _: unknown,
    ): _ is { cases: Record<string, object>; renderer?: unknown } =>
      isObject(_) &&
      "cases" in _ &&
      isObject(_.cases) &&
      Object.values(_.cases).every((caseRenderer) => isObject(caseRenderer)),
    isValidRenderer: (_: unknown): _ is string => isString(_),
    tryAsValidUnionForm: <T>(
      rendererPath: List<string>,
      serialized: SerializedUnionFormRenderer,
    ): ValueOrErrors<
      Omit<SerializedUnionFormRenderer, "cases" | "renderer"> & {
        renderer?: string;
        cases: Map<string, object>;
      },
      string
    > => {
      if (!UnionFormRenderer.Operations.hasCases(serialized))
        return ValueOrErrors.Default.throwOne(
          `union form ${rendererPath.join(
            ".",
          )} is missing the required cases attribute`,
        );

      const renderer = serialized.renderer;
      if (
        renderer !== undefined &&
        !UnionFormRenderer.Operations.isValidRenderer(renderer)
      )
        return ValueOrErrors.Default.throwOne(
          `union form ${rendererPath.join(
            ".",
          )} has an invalid renderer attribute, ${JSON.stringify(renderer)}`,
        );

      return ValueOrErrors.Default.return({
        ...serialized,
        cases: Map(serialized.cases),
        renderer,
      });
    },
    Deserialize: <T>(
      type: UnionType<T>,
      formPath: List<string>,
      serialized: SerializedUnionFormRenderer,
    ): ValueOrErrors<UnionFormRenderer<T>, string> =>
      UnionFormRenderer.Operations.tryAsValidUnionForm(
        formPath,
        serialized,
      ).Then((validUnionForm) =>
        ValueOrErrors.Operations.All(
          List<ValueOrErrors<[string, NestedRenderer<T>], string>>(
            validUnionForm.cases
              .entrySeq()
              .toArray()
              .map(([caseName, caseRenderer]) => {
                const caseType = type.args.get(caseName);
                if (caseType == undefined) {
                  return ValueOrErrors.Default.throwOne(
                    `When deserializing union form ${formPath.join(
                      ".",
                    )} case ${caseName} is not supported`,
                  );
                }
                return NestedRenderer.Operations.Deserialize(
                  caseType,
                  formPath.push(caseName),
                  caseRenderer,
                ).Then((caseRenderer) =>
                  ValueOrErrors.Default.return([caseName, caseRenderer]),
                );
              }),
          ),
        ).Then((caseTuples) =>
          ValueOrErrors.Default.return(
            UnionFormRenderer.Default(
              type,
              Map(caseTuples),
              validUnionForm.renderer,
            ),
          ),
        ),
      ),
  },
};
