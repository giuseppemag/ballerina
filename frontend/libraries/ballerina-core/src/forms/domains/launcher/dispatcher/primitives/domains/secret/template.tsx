import { List } from "immutable";

import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { SecretFormState, SecretFormView } from "./state";
import React from "react";
import { replaceWith } from "../../../../../../../../main";
import { BasicFun } from "../../../../../../../fun/state";
import { Template } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { ValidateRunner } from "../../../singleton/template";

export const SecretForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<string, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<string> & { disabled: boolean; visible: boolean },
    SecretFormState,
    ForeignMutationsExpected & { onChange: OnChange<string> },
    SecretFormView<Context, ForeignMutationsExpected>
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
      SecretFormState,
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
