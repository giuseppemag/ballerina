import { List, Map } from "immutable";
import {
  FieldName,
  isObject,
  RecordType,
  ParsedType,
  UnionType,
} from "../types/state";
import {
  RecordFormRenderer,
  SerializedRecordFormRenderer,
} from "./domains/renderers/domains/recordFormRenderer/state";
import {
  SerializedUnionFormRenderer,
  UnionFormRenderer,
} from "./domains/renderers/domains/unionFormRenderer/state";
import { ValueOrErrors } from "../../../../../../../../main";

export type SerializedForm = {
  type?: any;
  renderer?: any;
  fields?: any;
  cases?: any;
  tabs?: any;
  header?: any;
  extends?: any;
};
export const SerializedForm = {
  Operations: {
    withType: <T>(
      _: SerializedForm,
      types: Map<string, ParsedType<T>>,
    ): ValueOrErrors<
      | { kind: "recordForm"; renderer: SerializedRecordFormRenderer; type: RecordType<T> }
      | { kind: "unionForm"; renderer: SerializedUnionFormRenderer; type: UnionType<T> },
      string
    > => {
      if (isObject(_) && "type" in _ && typeof _.type == "string") {
        const formType = types.get(_.type);
        if (formType == undefined)
          return ValueOrErrors.Default.throwOne(
            `form type ${_.type} is not supported`,
          );
        if (formType.kind == "record") {
          return ValueOrErrors.Default.return({
            kind: "recordForm",
            renderer: _,
            type: formType,
          });
        }
        if (formType.kind == "union") {
          return ValueOrErrors.Default.return({
            kind: "unionForm",
            renderer: _,
            type: formType,
          });
        }
        return ValueOrErrors.Default.throwOne("form type is not supported");
      }
      return ValueOrErrors.Default.throwOne(
        "form is missing the required type attribute",
      );
    },
    hasRenderer: (_: any): _ is { renderer: any } =>
      isObject(_) && "renderer" in _,
    hasCases: (_: any): _ is { cases: any } => isObject(_) && "cases" in _,
    hasFields: (_: any): _ is { fields: any } => isObject(_) && "fields" in _,
    hasTabs: (_: any): _ is { tabs: any } => isObject(_) && "tabs" in _,
    hasHeader: (_: any): _ is { header: any } => isObject(_) && "header" in _,
    hasExtends: (_: any): _ is { extends: any } =>
      isObject(_) && "extends" in _ && Array.isArray(_.extends),
  },
};

export type Form<T> = RecordFormRenderer<T> | UnionFormRenderer<T>;

export const Form = <T>() => ({
  Operations: {
    Deserialize: (
      types: Map<string, ParsedType<T>>,
      fieldPath: List<string>,
      serialized: SerializedForm,
    ): ValueOrErrors<Form<T>, string> => {
      return SerializedForm.Operations.withType(serialized, types).Then(
        (serializedWithType) => {
          if (serializedWithType.kind == "recordForm") {
            return RecordFormRenderer.Operations.Deserialize(
              serializedWithType.type,
              fieldPath,
              serializedWithType.renderer,
            );
          }
          if (serializedWithType.kind == "unionForm") {
            return UnionFormRenderer.Operations.Deserialize(
              serializedWithType.type,
              fieldPath,
              serializedWithType.renderer,
            );
          }
          return ValueOrErrors.Default.throwOne("form type is not supported");
        },
      );
    },
  },
});
