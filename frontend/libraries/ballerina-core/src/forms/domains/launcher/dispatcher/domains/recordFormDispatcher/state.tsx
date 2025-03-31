import React from "react";
import {
  DispatcherContext,
  RecordFieldRenderer,
  Template,
  ValueRecord,
} from "../../../../../../../main";
import { RecordFormRenderer } from "../../../../../../../main";

import { ValueOrErrors } from "../../../../../../collections/domains/valueOrErrors/state";

import { ParsedType } from "../../../../parser/domains/specification/domains/types/state";

import { List, Map } from "immutable";
import { RecordFieldDispatcher } from "./domains/recordFieldDispatcher/state";
import {
  Bindings,
  PredicateValue,
} from "../../../../parser/domains/predicates/state";

export const RecordFormDispatcher = {
  Operations: {
    Dispatch: <T extends { [key in keyof T]: { type: any; state: any } }>(
      fieldPath: List<string>,
      type: ParsedType<T>,
      renderer: RecordFormRenderer<T>,
      dispatcherContext: DispatcherContext<T>,
      entity: ValueRecord,
      globalConfiguration: PredicateValue,
      state: any,
    ): ValueOrErrors<Template<any, any, any, any>, string> => {
      if (type.kind == "record") {
        if (renderer.kind != "recordForm") {
          return ValueOrErrors.Default.throwOne(
            `When dispatching ${fieldPath.join(
              ".",
            )} expected recordForm but got ${renderer.kind}`,
          );
        }
        const bindings: Bindings = Map([
          ["globalConfiguration", globalConfiguration],
          ["root", entity],
          ["local", entity],
        ]);
        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<[string, Template<any, any, any, any>], string>>(
            renderer.fields
              .entrySeq()
              .toArray()
              .map(([fieldName, fieldRenderer]) => {
                const fieldType = type.fields.get(fieldName);
                if (fieldType == undefined) {
                  return ValueOrErrors.Default.throwOne(
                    `When dispatching ${fieldPath.join(
                      ".",
                    )} expected field ${fieldName} but got ${fieldType}`,
                  );
                }
                const fieldValue = entity.fields.get(fieldName);
                if (fieldValue == undefined) {
                  return ValueOrErrors.Default.throwOne(
                    `When dispatching ${fieldPath.join(
                      ".",
                    )} expected field ${fieldName} but got undefined`,
                  );
                }
                return RecordFieldDispatcher.Operations.Dispatch(
                  fieldName,
                  fieldPath.push(fieldName),
                  fieldType,
                  fieldRenderer,
                  dispatcherContext,
                  fieldValue,
                  globalConfiguration,
                  state,
                  bindings
                ).Then((template) => {
                  return ValueOrErrors.Default.return([fieldName, template]);
                });
              }),
          ),
        ).Then((fieldTemplates) => {
          return ValueOrErrors.Default.return(
            Template.Default<any, any, any, any>((props) => (
              <>
                <props.view {...props} EmbeddedFields={fieldTemplates} />
              </>
            )).withView(dispatcherContext.containerFormView),
          );
        });
      }
      return ValueOrErrors.Default.throwOne(
        `When dispatching ${fieldPath.join(".")} expected record type but got ${
          type.kind
        }`,
      );
    },
  },
};
