import { List } from "immutable";

import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { DateFormState, DateView } from "./state";
import React from "react";
import { replaceWith, id } from "../../../../../../../../main";
import { BasicFun } from "../../../../../../../fun/state";
import { Template } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { ValidateRunner } from "../../../singleton/template";

export const DateForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<Date, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<Date> & { disabled: boolean; visible: boolean },
    DateFormState,
    ForeignMutationsExpected & { onChange: OnChange<Date> },
    DateView<Context, ForeignMutationsExpected>
  >((props) => (
    <>
      <props.view
        {...props}
        foreignMutations={{
          ...props.foreignMutations,
          setNewValue: (_) => {
            props.setState(
              DateFormState.Updaters.Core.customFormState.children.possiblyInvalidInput(
                replaceWith(_),
              ),
            );
            const newValue = _ == undefined ? _ : new Date(_);
            setTimeout(() => {
              props.foreignMutations.onChange(
                newValue == undefined || isNaN(newValue.getTime())
                  ? id
                  : replaceWith(newValue),
                List(),
              );
            }, 0);
          },
        }}
      />
    </>
  )).any([
    ValidateRunner<
      Context & { disabled: boolean; visible: boolean },
      DateFormState,
      ForeignMutationsExpected,
      Date
    >(
      validation
        ? (_) =>
            validation(_).then(
              FieldValidationWithPath.Default.fromFieldValidation,
            )
        : undefined,
    ),
  ]);
};
