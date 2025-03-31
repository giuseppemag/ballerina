import { List } from "immutable";
import {
  DispatcherContext,
  ParsedType,
  RecordFieldRenderer,
  Template,
  ValueOrErrors,
} from "../../../../../../../../../main";
import {
  Bindings,
  PredicateValue,
} from "../../../../../../parser/domains/predicates/state";
import { SumForm } from "../../../../primitives/domains/sum/template";
import { NestedRenderer } from "../../../../../../parser/domains/specification/domains/form/domains/renderers/domains/nestedRenderer/state";
import { NestedDispatcher } from "../../state";

export const NestedSumDispatcher = {
  Dispatch: <T extends { [key in keyof T]: { type: any; state: any } }>(
    type: ParsedType<T>,
    viewKind: string,
    sumRenderer: RecordFieldRenderer<T> | NestedRenderer<T>,
    fieldPath: List<string>,
    value: PredicateValue,
    dispatcherContext: DispatcherContext<T>,
    globalConfiguration: PredicateValue,
    state: any,
    bindings: Bindings,
    disabled: boolean,
  ): ValueOrErrors<Template<any, any, any, any>, string> => {
    if (type.kind != "sum") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(".")} expected sum but got ${
          type.kind
        }`,
      );
    }
    if (
      sumRenderer.kind != "sumRecordField" &&
      sumRenderer.kind != "nestedSumRenderer"
    ) {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected sumRecordField or nestedSumRenderer but got ${
          sumRenderer.kind
        }`,
      );
    }
    if (viewKind != "sum") {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected sum but got ${viewKind}`,
      );
    }
    if (!PredicateValue.Operations.IsSum(value)) {
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} expected sum but got ${typeof value}`,
      );
    }
    return NestedDispatcher.Operations.Dispatch(
      fieldPath.push("left"),
      type.args[0],
      sumRenderer.leftRenderer,
      dispatcherContext,
      value,
      globalConfiguration,
      state,
      bindings,
      disabled,
    ).Then((leftForm) => {
      return NestedDispatcher.Operations.Dispatch(
        fieldPath.push("right"),
        type.args[1],
        sumRenderer.rightRenderer,
        dispatcherContext,
        value,
        globalConfiguration,
        state,
        bindings,
        disabled,
      ).Then((rightForm) => {
        return ValueOrErrors.Default.return(
          SumForm(
            dispatcherContext.defaultValue(type.args[0]),
            dispatcherContext.defaultValue(type.args[1]),
            leftForm,
            rightForm,
          ),
        );
      });
    });
  },
};
