import { List } from "immutable";
import { BasicFun, CoTypedFactory, Debounce, Debounced, replaceWith, Synchronize, Unit } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, SharedFormState, ValidateRunner, ValidationError } from "../../../singleton/template";
import { DateFormState, DateView } from "./state";

export const DateForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation: BasicFun<Date, Promise<FieldValidation>>
) => {
  return Template.Default<Context & Value<Date>, DateFormState, ForeignMutationsExpected & { onChange: OnChange<Date>; }, DateView<Context, ForeignMutationsExpected>>(props => <>
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
    ValidateRunner<Context, DateFormState, ForeignMutationsExpected, Date>(
      _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation)
    ),
  ]);
}