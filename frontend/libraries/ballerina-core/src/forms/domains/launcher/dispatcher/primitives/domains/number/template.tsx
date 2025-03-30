import { List } from "immutable";

import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
  CommonFormState,
} from "../../../singleton/state";
import React from "react";
import { replaceWith } from "../../../../../../../../main";
import { BasicFun } from "../../../../../../../fun/state";
import { Template } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { ValidateRunner } from "../../../singleton/template";
import { NumberFormState, NumberView } from "./state";

export const NumberForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<number, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<number> & { disabled: boolean; visible: boolean },
    NumberFormState,
    ForeignMutationsExpected & { onChange: OnChange<number> },
    NumberView<Context, ForeignMutationsExpected>
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
      NumberFormState,
      ForeignMutationsExpected,
      number
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
