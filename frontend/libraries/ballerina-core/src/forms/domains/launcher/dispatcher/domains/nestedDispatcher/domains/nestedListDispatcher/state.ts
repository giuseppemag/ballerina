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
import { ListForm } from "../../../../primitives/domains/list/template";

export const NestedListDispatcher = {
  Dispatch: <T extends { [key in keyof T]: { type: any; state: any } }>(
    type: ParsedType<T>,
    viewKind: string,
    listRenderer: RecordFieldRenderer<T> | NestedRenderer<T>,
    fieldPath: List<string>,
    value: PredicateValue,
    dispatcherContext: DispatcherContext<T>,
    globalConfiguration: PredicateValue,
    state: any,
    bindings: Bindings,
    disabled: boolean,
  ): ValueOrErrors<Template<any, any, any, any>, string> => {
    if (type.kind != "list") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(".")} expected list but got ${
          type.kind
        }`,
      );
    }
    if (viewKind != "list") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected list but got ${viewKind}`,
      );
    }
    if(listRenderer.kind != "listRecordField" && listRenderer.kind != "nestedListRenderer") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected list renderer but got ${listRenderer.kind}`,
      );
    }
    if (!PredicateValue.Operations.IsTuple(value)) {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected tuple value but got ${typeof value}`,
      );
    }
    return NestedDispatcher.Operations.Dispatch(
      fieldPath.push("element"),
      type.args[0],
      listRenderer.elementRenderer,
      dispatcherContext,
      value,
      globalConfiguration,
      state,
      bindings,
      disabled,
    ).Then((elementTemplate) => {
      return ValueOrErrors.Default.return(
        ListForm(
          dispatcherContext.defaultState(type.args[0]),
          dispatcherContext.defaultValue(type.args[0]),
          elementTemplate,
        ),
      );
    });
  },
};
