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
import { NestedDispatcher } from "../../state";
import { MapForm } from "../../../../primitives/domains/map/template";

export const NestedMapDispatcher = {
  Dispatch: <T extends { [key in keyof T]: { type: any; state: any } }>(
    type: ParsedType<T>,
    viewKind: string,
    mapRenderer: RecordFieldRenderer<T> | NestedRenderer<T>,
    fieldPath: List<string>,
    value: PredicateValue,
    dispatcherContext: DispatcherContext<T>,
    globalConfiguration: PredicateValue,
    state: any,
    bindings: Bindings,
    disabled: boolean,
  ): ValueOrErrors<Template<any, any, any, any>, string> => {
    if (type.kind != "map") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(".")} expected map but got ${
          type.kind
        }`,
      );
    }
    if (viewKind != "map") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected map but got ${viewKind}`,
      );
    }
    if (
      mapRenderer.kind != "mapRecordField" &&
      mapRenderer.kind != "nestedMapRenderer"
    ) {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected map renderer but got ${mapRenderer.kind}`,
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
      fieldPath.push("key"),
      type.args[0],
      mapRenderer.keyRenderer,
      dispatcherContext,
      value,
      globalConfiguration,
      state,
      bindings,
      disabled,
    ).Then((keyTemplate) => {
      return NestedDispatcher.Operations.Dispatch(
        fieldPath.push("value"),
        type.args[1],
        mapRenderer.valueRenderer,
        dispatcherContext,
        value,
        globalConfiguration,
        state,
        bindings,
        disabled,
      ).Then((valueTemplate) => {
        return ValueOrErrors.Default.return(
          MapForm(
            dispatcherContext.defaultState(type.args[0]),
            dispatcherContext.defaultState(type.args[1]),
            dispatcherContext.defaultValue(type.args[0]),
            dispatcherContext.defaultValue(type.args[1]),
            keyTemplate,
            valueTemplate,
          ),
        );
      });
    });
  },
};
