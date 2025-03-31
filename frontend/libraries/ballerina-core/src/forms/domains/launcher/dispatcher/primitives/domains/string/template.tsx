import { List } from "immutable";
import React from "react";

import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { StringFormState, StringFormView } from "./state";
import { Template } from "../../../../../../../template/state";
import { BasicFun } from "../../../../../../../fun/state";
import { replaceWith } from "../../../../../../../../main";
import { Value } from "../../../../../../../value/state";
import { ValidateRunner } from "../../../singleton/template";

export const StringForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<string, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<string> & { disabled: boolean },
    StringFormState,
    ForeignMutationsExpected & { onChange: OnChange<string> },
    StringFormView<Context, ForeignMutationsExpected>
  >((props) => (
    <>
      <props.view
        {...props}
        foreignMutations={{
          ...props.foreignMutations,
          setNewValue: (_) =>
            props.foreignMutations.onChange(replaceWith(_), List()),
        }}
      />
    </>
  )).any([
    ValidateRunner<
      Context & { disabled: boolean; visible: boolean },
      StringFormState,
      ForeignMutationsExpected,
      string
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
