import { List, OrderedMap, Map } from "immutable";
import {
  FieldName,
  isObject,
  ParsedRecord,
  ParsedType,
} from "../../../../../types/state";
import { ValueOrErrors } from "../../../../../../../../../../../collections/domains/valueOrErrors/state";
import {
  SerializedRecordFieldRenderer,
  RecordFieldRenderer,
} from "./domains/recordFieldRenderer/state";

export type SerializedRecordFormRenderer = {
  fields?: unknown;
  tabs?: unknown;
  extends?: unknown;
};

export type FormLayout = OrderedMap<string, TabLayout>;
export type GroupLayout = Array<FieldName>;
export type ColumnLayout = {
  groups: OrderedMap<string, GroupLayout>;
};
export type TabLayout = {
  columns: OrderedMap<string, ColumnLayout>;
};

export type RecordFormRenderer<T> = {
  kind: "recordForm";
  type: ParsedType<T>;
  fields: Map<string, RecordFieldRenderer<T>>;
  tabs: FormLayout;
  extendsForms: string[];
};

export const RecordFormRenderer = {
  Default: <T>(
    type: ParsedType<T>,
    fields: Map<string, RecordFieldRenderer<T>>,
    tabs: FormLayout,
    extendsForms: string[],
  ): RecordFormRenderer<T> => ({
    kind: "recordForm",
    type,
    fields,
    tabs,
    extendsForms,
  }),
  Operations: {
    hasFields: (_: unknown): _ is { fields: object } =>
      isObject(_) && "fields" in _ && isObject(_.fields),
    hasTabs: (_: unknown): _ is { tabs: object } =>
      isObject(_) && "tabs" in _ && isObject(_.tabs),
    hasExtends: (_: unknown): _ is { extends: unknown } =>
      isObject(_) && "extends" in _ && isObject(_.extends),
    hasValidExtends: (_: unknown): _ is string[] =>
      Array.isArray(_) &&
      (_.length == 0 || _.every((e) => typeof e == "string")),
    tryAsValidRecordForm: <T>(
      _: SerializedRecordFormRenderer,
    ): ValueOrErrors<
      Omit<SerializedRecordFormRenderer, "fields" | "tabs" | "extends"> & {
        fields: Map<string, SerializedRecordFieldRenderer>;
        tabs: object;
        extends: string[];
      },
      string
    > => {
      if (!isObject(_)) {
        return ValueOrErrors.Default.throwOne("record form is not an object");
      }
      if (!RecordFormRenderer.Operations.hasFields(_)) {
        return ValueOrErrors.Default.throwOne(
          "record form is missing the required fields attribute",
        );
      }
      if (!RecordFormRenderer.Operations.hasTabs(_)) {
        return ValueOrErrors.Default.throwOne(
          "record form is missing the required tabs attribute",
        );
      }
      const extendedFields = RecordFormRenderer.Operations.hasExtends(_) ? _.extends : [];
      if (!RecordFormRenderer.Operations.hasValidExtends(extendedFields)) {
        return ValueOrErrors.Default.throwOne(
          "record form extends attribute is not an array of strings",
        );
      }

      return ValueOrErrors.Default.return({
        ..._,
        fields: Map<string, SerializedRecordFieldRenderer>(_.fields),
        tabs: _.tabs,
        extends: extendedFields,
      });
    },
    Deserialize: <T>(
      type: ParsedRecord<T>,
      fieldPath: List<string>,
      serialized: SerializedRecordFormRenderer,
    ): ValueOrErrors<RecordFormRenderer<T>, string> => {
      return RecordFormRenderer.Operations.tryAsValidRecordForm(
        serialized,
      ).Then((validRecordForm) =>
        ValueOrErrors.Operations.All(
          List<ValueOrErrors<[string, RecordFieldRenderer<T>], string>>(
            validRecordForm.fields
              .toArray()
              .map(
                ([fieldName, fieldRecordRenderer]: [
                  string,
                  SerializedRecordFieldRenderer,
                ]) => {
                  const fieldType = type.fields.get(fieldName);
                  if (!fieldType) {
                    return ValueOrErrors.Default.throwOne(
                      `Unknown field type ${fieldName}  in ${fieldPath.join(
                        ".",
                      )}`,
                    );
                  }
                  return RecordFieldRenderer.Operations.Deserialize(
                    fieldType,
                    fieldPath.push(fieldName),
                    fieldRecordRenderer,
                  ).Then((renderer) =>
                    ValueOrErrors.Default.return([fieldName, renderer]),
                  );
                },
              ),
          ),
        ).Then((fieldTuples) => {
          let tabs: FormLayout = OrderedMap();
          Object.entries(validRecordForm.tabs).forEach(
            ([tabName, tab]: [tabName: string, tab: any]) => {
              let cols: TabLayout = { columns: OrderedMap() };
              tabs = tabs.set(tabName, cols);
              Object.entries(tab.columns).forEach(
                ([colName, col]: [colName: string, col: any]) => {
                  let column: ColumnLayout = { groups: OrderedMap() };
                  cols.columns = cols.columns.set(colName, column);
                  Object.keys(col.groups).forEach((groupName) => {
                    const groupConfig = col.groups[groupName];
                    let group: GroupLayout = [];
                    column.groups = column.groups.set(groupName, group);
                    groupConfig.forEach((fieldName: any) => {
                      group.push(fieldName);
                    });
                  });
                },
              );
            },
          );

          const fields = Map(fieldTuples.toArray());

          return ValueOrErrors.Default.return(
            RecordFormRenderer.Default(
              type,
              fields,
              tabs,
              validRecordForm.extends,
            ),
          );
        }),
      );
    },
  },
};
