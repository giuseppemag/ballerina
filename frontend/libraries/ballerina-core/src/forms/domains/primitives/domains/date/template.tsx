import { List } from "immutable";
import {
  BasicFun,
  Maybe,
  PredicateValue,
  replaceWith,
  ValidateRunner,
  Value,
  ValueDate,
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
  validation?: BasicFun<ValueDate, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<ValueDate> & { disabled: boolean },
    DateFormState,
    ForeignMutationsExpected & { onChange: OnChange<ValueDate> },
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
            const newValue = _ == undefined ? _ : PredicateValue.Default.date(new Date(_));
            setTimeout(() => {
              if(newValue != undefined) {
                props.foreignMutations.onChange(replaceWith(newValue), List());
              }
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
      ValueDate
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
