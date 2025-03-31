import React from "react";

import { List } from "immutable";
import {
  RecordFieldRenderer,
  ValueOrErrors,
  ParsedType,
  Unit,
} from "../../../../../../../main";
import { Template } from "../../../../../../template/state";
import { Value } from "../../../../../../value/state";
import {
  PredicateValue,
  Bindings,
  Expr,
} from "../../../../parser/domains/predicates/state";
import { DispatcherContext } from "../../../../parser/state";
import { MapForm } from "../../primitives/domains/map/template";
import { TupleForm } from "../../primitives/domains/tuple/template";
import { UnionForm } from "../../primitives/domains/union/template";
import { CommonFormState } from "../../singleton/state";
import { RecordFieldDispatcher } from "../recordFormDispatcher/domains/recordFieldDispatcher/state";
import { NestedPrimitiveDispatcher } from "./domains/nestedPrimitiveDispatcher/state";
import { NestedRenderer } from "../../../../parser/domains/specification/domains/form/domains/renderers/domains/nestedRenderer/state";
import { NestedSumDispatcher } from "./domains/nestedSumDispatcher/state";
import { NestedTupleDispatcher } from "./domains/nestedTupleDispatcher/state";
import { NestedListDispatcher } from "./domains/nestedListDispatcher/state";
import { NestedMapDispatcher } from "./domains/nestedMapDispatcher/state";
export const NestedDispatcher = {
  Operations: {
    ViewKindToForm: <T extends { [key in keyof T]: { type: any; state: any } }>(
      fieldPath: List<string>,
      value: PredicateValue,
      renderer: RecordFieldRenderer<T> | NestedRenderer<T>,
      viewKind: string,
      type: ParsedType<T>,
      dispatcherContext: DispatcherContext<T>,
      globalConfiguration: PredicateValue,
      state: any,
      bindings: Bindings,
      disabled: boolean,
    ): ValueOrErrors<Template<any, any, any, any>, string> => {
      if (viewKind == "primitive") {
        return NestedPrimitiveDispatcher.Dispatch(
          type,
          viewKind,
          renderer,
          fieldPath,
          value,
        );
      }
      if (viewKind == "sum") {
        return NestedSumDispatcher.Dispatch(
          type,
          viewKind,
          renderer,
          fieldPath,
          value,
          dispatcherContext,
          globalConfiguration,
          state,
          bindings,
          disabled,
        );
      }
      if (viewKind == "sumUnitDate") {
        if (!PredicateValue.Operations.IsSum(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected sumUnitDate but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(SumUnitDateForm());
      }

      if (viewKind == "tuple") {
        return NestedTupleDispatcher.Dispatch(
          type,
          viewKind,
          renderer,
          fieldPath,
          value,
          dispatcherContext,
          globalConfiguration,
          state,
          bindings,
          disabled,
        );
      }

      if(viewKind == "list") {
        return NestedListDispatcher.Dispatch(
          type,
          viewKind,
          renderer,
          fieldPath,
          value,
          dispatcherContext,
          globalConfiguration,
          state,
          bindings,
          disabled,
        );
      }

      if (viewKind == "map") {
        return NestedMapDispatcher.Dispatch(
          type,
          viewKind,
          renderer,
          fieldPath,
          value,
          dispatcherContext,
          globalConfiguration,
          state,
          bindings,
          disabled,
        );
      }

      if (viewKind == "union") {
        if (!PredicateValue.Operations.IsUnionCase(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected union but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(UnionForm());
      }
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(
          ".",
        )} could not resolve view for ${viewKind}`,
      );
    },
    Dispatch: <T extends { [key in keyof T]: { type: any; state: any } }>(
      fieldPath: List<string>,
      type: ParsedType<T>,
      fieldRenderer: RecordFieldRenderer<T> | NestedRenderer<T>,
      dispatcherContext: DispatcherContext<T>,
      value: PredicateValue,
      globalConfiguration: PredicateValue,
      state: any,
      bindings: Bindings,
      disabled: boolean,
    ): ValueOrErrors<Template<any, any, any, any>, string> => {
      return dispatcherContext
        .getViewKind(fieldRenderer.renderer)
        .Then((viewKind) => {
          return NestedDispatcher.Operations.ViewKindToForm(
            fieldPath,
            value,
            fieldRenderer,
            viewKind,
            type,
            dispatcherContext,
            globalConfiguration,
            state,
            bindings,
            disabled,
          ).Then((form) =>
            ValueOrErrors.Default.return(
              form
                .withView(dispatcherContext.fieldViews[viewKind]())
                .mapContext<any & CommonFormState & Value<Unit>>((_) => ({
                  ..._,
                  value: value,
                  label: fieldRenderer.label,
                  tooltip: fieldRenderer.tooltip,
                  details: fieldRenderer.details,
                  disabled,
                  ...state,
                })),
            ),
          );
        });
    },
  },
};
