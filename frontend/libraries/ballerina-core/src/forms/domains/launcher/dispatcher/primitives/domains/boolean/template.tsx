import { List } from "immutable";

import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import React from "react";
import { replaceWith } from "../../../../../../../../main";
import { BasicFun } from "../../../../../../../fun/state";
import { Template } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { ValidateRunner } from "../../../singleton/template";
import { BooleanFormState, BooleanView } from "./state";

export const BooleanForm = <
  Context extends FormLabel,
  ForeignMutationsExpected,
>(
  validation?: BasicFun<boolean, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<boolean> & { disabled: boolean; visible: boolean },
    BooleanFormState,
    ForeignMutationsExpected & { onChange: OnChange<boolean> },
    BooleanView<Context, ForeignMutationsExpected>
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
      BooleanFormState,
      ForeignMutationsExpected,
      boolean
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
