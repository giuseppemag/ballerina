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
import { UnitForm } from "../../../../primitives/domains/unit/template";
import { StringForm } from "../../../../primitives/domains/string/template";
import { NumberForm } from "../../../../primitives/domains/number/template";
import { BooleanForm } from "../../../../primitives/domains/boolean/template";
import { SecretForm } from "../../../../primitives/domains/secret/template";
import { MapForm } from "../../../../primitives/domains/map/template";
import { ListForm } from "../../../../primitives/domains/list/template";
import { TupleForm } from "../../../../primitives/domains/tuple/template";
import { UnionForm } from "../../../../primitives/domains/union/template";
import { Base64FileForm } from "../../../../primitives/domains/base-64-file/template";
import { DateForm } from "../../../../primitives/domains/date/template";
import { EnumForm } from "../../../../primitives/domains/enum/template";
import { EnumMultiselectForm } from "../../../../primitives/domains/enum-multiselect/template";
import { SearchableInfiniteStreamForm } from "../../../../primitives/domains/searchable-infinite-stream/template";
import { InfiniteMultiselectDropdownForm } from "../../../../primitives/domains/searchable-infinite-stream-multiselect/template";
import { SumForm } from "../../../../primitives/domains/sum/template";

export const RecordFieldDispatcher = {
  Operations: {
    ViewKindToForm: <T extends { [key in keyof T]: { type: any; state: any } }>(
      fieldPath: List<string>,
      value: PredicateValue,
      renderer: RecordFieldRenderer<T>,
      viewKind: string,
    ): ValueOrErrors<Template<any, any, any, any>, string> => {
      if (viewKind == "unit") {
        return ValueOrErrors.Default.return(UnitForm());
      }
      if (viewKind == "string") {
        if (!PredicateValue.Operations.IsString(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected string but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(StringForm());
      }
      if (viewKind == "number") {
        if (!PredicateValue.Operations.IsNumber(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected number but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(NumberForm());
      }
      if (viewKind == "boolean") {
        if (!PredicateValue.Operations.IsBoolean(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected boolean but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(BooleanForm());
      }
      if (viewKind == "secret") {
        if (!PredicateValue.Operations.IsString(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected secret but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(SecretForm());
      }
      if (viewKind == "base64File") {
        if (!PredicateValue.Operations.IsString(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected base64File but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(Base64FileForm());
      }
      if (viewKind == "date") {
        if (!PredicateValue.Operations.IsDate(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected date but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(DateForm());
      }
      if(viewKind == "enumSingleSelection" && renderer.kind == "enumRecordField"){
        if (!PredicateValue.Operations.IsOption(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected enum but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(EnumForm());
      }
      if(viewKind == "enumMultiSelection" && renderer.kind == "enumRecordField"){
        if (!PredicateValue.Operations.IsTuple(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected enum but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(EnumMultiselectForm());
      }
      if(viewKind == "enumSingleSelection" && renderer.kind == "streamRecordField"){
        if (!PredicateValue.Operations.IsOption(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected enum but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(SearchableInfiniteStreamForm());
      }
      if(viewKind == "enumMultiSelection" && renderer.kind == "streamRecordField"){
        if (!PredicateValue.Operations.IsTuple(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected enum but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(InfiniteMultiselectDropdownForm());
      }
      if(viewKind == "sumUnitDate"){
        if (!PredicateValue.Operations.IsSum(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected sumUnitDate but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(SumUnitDateForm());
      }
      if(viewKind == "sum"){
        if (!PredicateValue.Operations.IsSum(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected sum but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(SumForm());
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
      if (viewKind == "list") {
        if (!PredicateValue.Operations.IsTuple(value)) {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected list but got ${typeof value}`,
          );
        }
        return ValueOrErrors.Default.return(ListForm());
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
