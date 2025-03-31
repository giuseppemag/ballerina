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

export const NestedTupleDispatcher = {
  Dispatch: <T extends { [key in keyof T]: { type: any; state: any } }>(
    type: ParsedType<T>,
    viewKind: string,
    tupleRenderer: RecordFieldRenderer<T> | NestedRenderer<T>,
    fieldPath: List<string>,
    value: PredicateValue,
    dispatcherContext: DispatcherContext<T>,
    globalConfiguration: PredicateValue,
    state: any,
    bindings: Bindings,
    disabled: boolean,
  ): ValueOrErrors<Template<any, any, any, any>, string> => {
    if (type.kind != "tuple") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(".")} expected tuple but got ${
          type.kind
        }`,
      );
    }
    if (viewKind != "tuple") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected tuple but got ${viewKind}`,
      );
    }
    if (!PredicateValue.Operations.IsTuple(value)) {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected tuple but got ${typeof value}`,
      );
    }
    return ValueOrErrors.Operations.All(
      List<ValueOrErrors<Template<any, any, any, any>, string>>(
        value.values.map((value, index) => {
          return NestedDispatcher.Operations.Dispatch(
            fieldPath.push(index.toString()),
            type.args[index],
            tupleRenderer,
            dispatcherContext,
            value,
            globalConfiguration,
            state,
            bindings,
            disabled,
          );
        }),
      ),
    ).Then((templates) => {
      return ValueOrErrors.Default.return(
        TupleForm(
          List(type.args.map(arg => dispatcherContext.defaultState(arg))),
          templates,
        ),
      );
    });
  },
};
