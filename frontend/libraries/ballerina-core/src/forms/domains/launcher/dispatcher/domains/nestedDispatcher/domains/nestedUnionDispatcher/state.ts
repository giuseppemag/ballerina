import { List } from "immutable";
import { NestedRenderer } from "../../../../../../parser/domains/specification/domains/form/domains/renderers/domains/nestedRenderer/state";

import {
  Bindings,
  DispatcherContext,
  PredicateValue,
  RecordFieldRenderer,
  Template,
  ValueOrErrors,
} from "../../../../../../../../../main";

import { ParsedType } from "../../../../../../parser/domains/specification/domains/types/state";
import { TupleForm } from "../../../../primitives/domains/tuple/template";
import { NestedDispatcher } from "../../state";
import { UnionForm } from "../../../../primitives/domains/union/template";

export const NestedUnionDispatcher = {
  Dispatch: <T extends { [key in keyof T]: { type: any; state: any } }>(
    type: ParsedType<T>,
    viewKind: string,
    unionRenderer: RecordFieldRenderer<T> | NestedRenderer<T>,
    fieldPath: List<string>,
    value: PredicateValue,
    dispatcherContext: DispatcherContext<T>,
    globalConfiguration: PredicateValue,
    state: any,
    bindings: Bindings,
    disabled: boolean,
  ): ValueOrErrors<Template<any, any, any, any>, string> => {
    if (type.kind != "union") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(".")} expected union but got ${
          type.kind
        }`,
      );
    }
    if (viewKind != "union") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected union but got ${viewKind}`,
      );
    }
    if (!PredicateValue.Operations.IsUnionCase(value)) {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected union case but got ${typeof value}`,
      );
    }

    const caseName = value.caseName;
    const caseType = type.args.get(caseName);
    if (caseType == undefined) {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(".")} expected union case but got ${caseName}`,
      );
    }

    return NestedDispatcher.Operations.Dispatch(
      fieldPath.push("case"),
      caseType,
      unionRenderer,
      dispatcherContext,
      value.fields,
      globalConfiguration,
      state,
      bindings,
      disabled,
    ).Then((template) => {
      return ValueOrErrors.Default.return(
        UnionForm(
          dispatcherContext.defaultState(caseType),
          dispatcherContext.defaultValue(caseType),
          template,
        ),
      );
    });
  },
};
