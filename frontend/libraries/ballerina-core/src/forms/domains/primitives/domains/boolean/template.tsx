import { List } from "immutable";
import { BasicFun, BooleanView, CoTypedFactory, Debounce, Debounced, replaceWith, Synchronize, Unit } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, SharedFormState, ValidateRunner, ValidationError } from "../../../singleton/template";


export const BooleanForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation: BasicFun<boolean, Promise<FieldValidation>>
) => {
  return Template.Default<Context & Value<boolean>, SharedFormState, ForeignMutationsExpected & { onChange: OnChange<boolean>; }, BooleanView<Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props}
      foreignMutations={{
        ...props.foreignMutations,
        setNewValue: (_) => props.foreignMutations.onChange(replaceWith(_), List())
      }} />
  </>
  ).any([
    ValidateRunner<Context, SharedFormState, ForeignMutationsExpected, boolean>(
      _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation)
    ),
  ]);
}
