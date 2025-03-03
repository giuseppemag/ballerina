import { List } from "immutable";
import {
  BasicFun,
  Maybe,
  replaceWith,
  ValidateRunner,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { DateFormState, DateView } from "./state";

export const DateForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<Maybe<Date>, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<Maybe<Date>> & { disabled: boolean },
    DateFormState,
    ForeignMutationsExpected & { onChange: OnChange<Maybe<Date>> },
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
            const newValue = _ == undefined ? _ : new Date(_);
            setTimeout(() => {
              props.foreignMutations.onChange(replaceWith(newValue), List());
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
      Maybe<Date>
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
