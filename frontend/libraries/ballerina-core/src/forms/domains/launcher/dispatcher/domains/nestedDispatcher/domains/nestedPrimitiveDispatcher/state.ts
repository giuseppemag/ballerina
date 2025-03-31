import { List } from "immutable";
import {
    ParsedType,
  RecordFieldRenderer,
  ValueOrErrors,
} from "../../../../../../../../../main";
import { Template } from "../../../../../../../../template/state";
import { PredicateValue } from "../../../../../../parser/domains/predicates/state";
import { Base64FileForm } from "../../../../primitives/domains/base-64-file/template";
import { BooleanForm } from "../../../../primitives/domains/boolean/template";
import { DateForm } from "../../../../primitives/domains/date/template";
import { EnumMultiselectForm } from "../../../../primitives/domains/enum-multiselect/template";
import { EnumForm } from "../../../../primitives/domains/enum/template";
import { NumberForm } from "../../../../primitives/domains/number/template";
import { InfiniteMultiselectDropdownForm } from "../../../../primitives/domains/searchable-infinite-stream-multiselect/template";
import { SearchableInfiniteStreamForm } from "../../../../primitives/domains/searchable-infinite-stream/template";
import { SecretForm } from "../../../../primitives/domains/secret/template";
import { StringForm } from "../../../../primitives/domains/string/template";
import { UnitForm } from "../../../../primitives/domains/unit/template";
import { NestedRenderer } from "../../../../../../parser/domains/specification/domains/form/domains/renderers/domains/nestedRenderer/state";

export const NestedPrimitiveDispatcher = {
  Dispatch: <T extends { [key in keyof T]: { type: any; state: any } }>(
    type: ParsedType<T>,
    viewKind: string,
    fieldRenderer: RecordFieldRenderer<T> | NestedRenderer<T>,
    fieldPath: List<string>,
    value: PredicateValue,
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
    if (
      viewKind == "enumSingleSelection" &&
      (fieldRenderer.kind == "enumRecordField" ||
        fieldRenderer.kind == "nestedEnumRenderer")
    ) {
      if (!PredicateValue.Operations.IsOption(value)) {
        return ValueOrErrors.Default.throwOne(
          `When dispatching ${fieldPath.join(
            ".",
          )} expected enum but got ${typeof value}`,
        );
      }
      return ValueOrErrors.Default.return(EnumForm());
    }
    if (
      viewKind == "enumMultiSelection" &&
      (fieldRenderer.kind == "enumRecordField" ||
        fieldRenderer.kind == "nestedEnumRenderer")
    ) {
      if (!PredicateValue.Operations.IsTuple(value)) {
        return ValueOrErrors.Default.throwOne(
          `When dispatching ${fieldPath.join(
            ".",
          )} expected enum but got ${typeof value}`,
        );
      }
      return ValueOrErrors.Default.return(EnumMultiselectForm());
    }
    if (
      viewKind == "enumSingleSelection" &&
      (fieldRenderer.kind == "streamRecordField" ||
        fieldRenderer.kind == "nestedStreamRenderer")
    ) {
      if (!PredicateValue.Operations.IsOption(value)) {
        return ValueOrErrors.Default.throwOne(
          `When dispatching ${fieldPath.join(
            ".",
          )} expected enum but got ${typeof value}`,
        );
      }
      return ValueOrErrors.Default.return(SearchableInfiniteStreamForm());
    }
    if (
      viewKind == "enumMultiSelection" &&
      (fieldRenderer.kind == "streamRecordField" ||
        fieldRenderer.kind == "nestedStreamRenderer")
    ) {
      if (!PredicateValue.Operations.IsTuple(value)) {
        return ValueOrErrors.Default.throwOne(
          `When dispatching ${fieldPath.join(
            ".",
          )} expected enum but got ${typeof value}`,
        );
      }
      return ValueOrErrors.Default.return(InfiniteMultiselectDropdownForm());
    }
    return ValueOrErrors.Default.throwOne(
      `When dispatching ${fieldPath.join(
        ".",
      )} could not resolve primitive view for ${viewKind}`,
    );
  },
};
