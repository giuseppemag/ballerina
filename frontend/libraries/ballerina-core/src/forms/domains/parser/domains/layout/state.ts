import { OrderedMap } from "immutable";
import { FieldName } from "../types/state";
import { Expr } from "../predicates/state";
import { ValueOrErrors } from "../../../../../../main";

export type FormLayout = OrderedMap<string, TabLayout>;

export type TabLayout = {
  columns: OrderedMap<string, ColumnLayout>;
};

export const RawTabLayout = {
  isTabLayout: (rawTabLayout: unknown): rawTabLayout is object =>
    typeof rawTabLayout == "object" &&
    rawTabLayout != null &&
    Object.keys(rawTabLayout).length > 0,
};

export type ColumnLayout = {
  groups: OrderedMap<string, GroupLayout>;
};

export const RawColumnLayout = {
  isColumnLayout: (rawColumnLayout: unknown): rawColumnLayout is object =>
    typeof rawColumnLayout == "object" &&
    rawColumnLayout != null &&
    Object.keys(rawColumnLayout).length > 0,
};
export type GroupLayout =
  | { kind: "Inlined"; fields: Array<FieldName> }
  | { kind: "Computed"; fields: Expr };

export const RawGroupLayout = {
  isInlined: (rawGroupLayout: unknown): rawGroupLayout is Array<FieldName> =>
    Array.isArray(rawGroupLayout) &&
    rawGroupLayout.every((field) => typeof field == "string"),
};

export const FormLayout = {
  Default: (): FormLayout => OrderedMap(),
  Operations: {
    ParseGroupLayout: (
      rawGroupLayout: unknown,
    ): ValueOrErrors<GroupLayout, string> => {
      if (RawGroupLayout.isInlined(rawGroupLayout)) {
        return ValueOrErrors.Default.return({
          kind: "Inlined",
          fields: rawGroupLayout,
        });
      }
      Expr.Operations.parse(rawGroupLayout).Then((expr) =>
        ValueOrErrors.Default.return({
          kind: "Computed",
          fields: expr,
        }),
      );

      return ValueOrErrors.Default.throwOne(
        `Invalid group layout: ${JSON.stringify(rawGroupLayout)}`,
      );
    },
    ParseLayout: (rawLayout: unknown): ValueOrErrors<FormLayout, string> => {},
  },
};
