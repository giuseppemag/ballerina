import { List } from "immutable";
import { BasicFun, CoTypedFactory, Debounce, Debounced, NumberView, replaceWith, Synchronize, Unit } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, SharedFormState, ValidateRunner, ValidationError } from "../../../singleton/template";


export const NumberForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation:BasicFun<number, Promise<FieldValidation>>
) => {
  const Co = CoTypedFactory<Context & Value<number> & SharedFormState, SharedFormState>()
  return Template.Default<Context & Value<number>, SharedFormState, ForeignMutationsExpected & { onChange: OnChange<number>; },
  NumberView<Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props} 
    foreignMutations={{
      ...props.foreignMutations,
      setNewValue:(_) => props.foreignMutations.onChange(replaceWith(_), List())
    }} />
  </>
  ).any([
    ValidateRunner<Context, SharedFormState, ForeignMutationsExpected, number>(
      _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation)
    ),
  ]);
}
