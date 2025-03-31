import React from "react";

import { List } from "immutable";
import {
  Bindings,
  CommonFormState,
  DispatcherContext,
  Expr,
  FieldTemplates,
  FormLabel,
  ParsedType,
  PredicateValue,
  RecordFieldRenderer,
  Unit,
  Value,
  Template,
  ValueOrErrors,
  UnitFormState,
} from "../../../../../../../../../main";
import { MapForm } from "../../../../primitives/domains/map/template";
import { TupleForm } from "../../../../primitives/domains/tuple/template";
import { UnionForm } from "../../../../primitives/domains/union/template";
import { SumForm } from "../../../../primitives/domains/sum/template";
import { PrimitiveFieldDispatcher } from "./domains/primitiveFieldDispatcher/state";
import { NestedPrimitiveDispatcher } from "../../../nestedDispatcher/domains/nestedPrimitiveDispatcher/state";

export const RecordFieldDispatcher = {
  Operations: {
    ViewKindToForm: <T extends { [key in keyof T]: { type: any; state: any } }>(
      fieldPath: List<string>,
      value: PredicateValue,
      renderer: RecordFieldRenderer<T>,
      viewKind: string,
    ): ValueOrErrors<Template<any, any, any, any>, string> => {
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
        if (!PredicateValue.Operations.IsTuple(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected tuple but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(TupleForm());
      }
      if (viewKind == "map") {
        if (!PredicateValue.Operations.IsTuple(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected map but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(MapForm());
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
      fieldName: string,
      fieldPath: List<string>,
      type: ParsedType<T>,
      fieldRenderer: RecordFieldRenderer<T>,
      dispatcherContext: DispatcherContext<T>,
      value: PredicateValue,
      globalConfiguration: PredicateValue,
      state: any,
      bindings: Bindings,
    ): ValueOrErrors<Template<any, any, any, any>, string> => {
      return Expr.Operations.Evaluate(bindings)(fieldRenderer.visible).Then(
        (visiblity) => {
          if (visiblity == false) {
            return ValueOrErrors.Default.return(
              Template.Default<any, any, any, any>(() => <></>),
            );
          }
          return Expr.Operations.Evaluate(bindings)(
            fieldRenderer.disabled,
          ).Then((disabled) =>
            dispatcherContext
              .getViewKind(fieldRenderer.renderer)
              .Then((viewKind) => {
                if (type.kind == "primitive") {
                  return NestedPrimitiveDispatcher.Dispatch(
                    viewKind,
                    fieldRenderer,
                    fieldPath,
                    value,
                  );
                }
                return RecordFieldDispatcher.Operations.ViewKindToForm(
                  fieldPath,
                  value,
                  fieldRenderer,
                  viewKind,
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
                        disabled: disabled as boolean,
                        ...state,
                      })),
                  ),
                );
              }),
          );
        },
      );
    },
  },
};
