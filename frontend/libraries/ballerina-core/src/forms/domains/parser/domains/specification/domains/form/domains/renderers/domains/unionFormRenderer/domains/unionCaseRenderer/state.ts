import { ValueOrErrors } from "../../../../../../../../../../../../../../main";
import { isObject, ParsedType } from "../../../../../../../types/state";
import { List, Map } from "immutable";
import { NestedRenderer } from "../../../nestedRenderer/state";

export type SerializedUnionCaseRenderer = {
  renderer?: any;
};

export type UnionCaseRenderer<T> = {
  kind: "unionCase";
  type: ParsedType<T>;
  caseName: string;
  casePath: List<string>;
  renderer: NestedRenderer<T>;
};

export const UnionCaseRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    caseName: string,
    casePath: List<string>,
    renderer: NestedRenderer<T>,
  ): UnionCaseRenderer<T> => ({ kind: "unionCase", type, caseName, casePath, renderer }),
  Operations: {
    tryAsValidUnionCase: <T>(
      caseName: string,
      casePath: List<string>,
      serialized: any,
      caseTypes: Map<string, ParsedType<T>>,
    ): ValueOrErrors<
      SerializedUnionCaseRenderer & {
        casePath: List<string>;
        type: ParsedType<T>;
        renderer: any;
      },
      string
    > => {
      if (!isObject(serialized)) {
        return ValueOrErrors.Default.throwOne(`When deserializing ${casePath.join(".")} union case is not an object`);
      }
      if (!("renderer" in serialized)) {
        return ValueOrErrors.Default.throwOne(
          `When deserializing case ${casePath.join(".")} union case is missing the required renderer attribute`,
        );
      }
      const caseType = caseTypes.get(caseName);
      if (caseType == undefined) {
        return ValueOrErrors.Default.throwOne(
          `When deserializing case ${casePath.join(".")} union case type ${caseName} is not supported`,
        );
      }
      return ValueOrErrors.Default.return({
        casePath,
        type: caseType,
        renderer: serialized.renderer,
      });
    },
    Deserialize: <T>(
      caseName: string,
      casePath: List<string>,
      serialized: SerializedUnionCaseRenderer,
      caseTypes: Map<string, ParsedType<T>>,
    ): ValueOrErrors<UnionCaseRenderer<T>, string> => {
      return UnionCaseRenderer.Operations.tryAsValidUnionCase(
        caseName,
        casePath,
        serialized,
        caseTypes,
      ).Then((validUnionCase) =>
        NestedRenderer.Operations.Deserialize(
          validUnionCase.type,
          validUnionCase.casePath,
          validUnionCase.renderer,
        ).Then((renderer) =>
          ValueOrErrors.Default.return(
            UnionCaseRenderer.Default(validUnionCase.type, caseName, casePath, renderer),
          ),
        ),
      );
    },
  },
};
