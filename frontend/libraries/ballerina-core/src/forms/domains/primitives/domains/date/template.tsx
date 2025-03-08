import { List } from "immutable";
import {
  BasicFun,
  id,
  Maybe,
  PredicateValue,
  replaceWith,
  ValidateRunner,
  Value,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { DateFormState, DateView } from "./state";

export const DateForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<Date, Promise<FieldValidation>>
) => {
  return Template.Default<
    Context & Value<Date> & { disabled: boolean },
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
                replaceWith(_)
              )
            );
            const newValue = _ == undefined ? _ : new Date(_);
            setTimeout(() => {
              props.foreignMutations.onChange(
                newValue == undefined ? id : replaceWith(newValue),
                List()
              );
            }, 0);
          },
        }}
      />
    </>
  )).any([
    ValidateRunner<
      Context & { disabled: boolean },
      DateFormState,
      ForeignMutationsExpected,
      Date
    >(
      validation
        ? (_) =>
            validation(_).then(
              FieldValidationWithPath.Default.fromFieldValidation
            )
        : undefined
    ),
  ]);
};
