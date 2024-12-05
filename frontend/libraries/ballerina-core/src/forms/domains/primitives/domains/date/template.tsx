import { List } from "immutable";
import { BasicFun, CoTypedFactory, Debounce, Debounced, replaceWith, Synchronize, Unit, ValidateRunner } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, SharedFormState, ValidationError } from "../../../singleton/state";
import { DateFormState, DateView } from "./state";

export const DateForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<Date, Promise<FieldValidation>>
) => {
  return Template.Default<Context & Value<Date> & { disabled:boolean }, DateFormState, ForeignMutationsExpected & { onChange: OnChange<Date>; }, DateView<Context, ForeignMutationsExpected>>(props => <>
    <props.view {...props}
      foreignMutations={{
        ...props.foreignMutations,
        setNewValue: (_) => {
          props.setState(DateFormState.Updaters.possiblyInvalidInput(replaceWith(_)))
          const newDate = new Date(_)
          setTimeout(() => {
            props.foreignMutations.onChange(replaceWith(newDate), List())
          }, 0)

        }
      }} />
  </>
  ).any([
    ValidateRunner<Context & { disabled:boolean }, DateFormState, ForeignMutationsExpected, Date>(
      validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
    ),
  ]);
}