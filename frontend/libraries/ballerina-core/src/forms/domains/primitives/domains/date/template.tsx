import { List } from "immutable";
import {
  BasicFun,
  Delta,
  id,
  Maybe,
  ParsedType,
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
  validation?: BasicFun<Date, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context &
      Value<Date> & {
        disabled: boolean;
        visible: boolean;
        type: ParsedType<any>;
      },
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
                replaceWith(_),
              ),
            );
            const newValue = _ == undefined ? _ : new Date(_);

            if (!(newValue == undefined || isNaN(newValue.getTime()))) {
              const delta: Delta = {
                kind: "TimeReplace",
                replace: newValue.toISOString(),
                state: {
                  commonFormState: props.context.commonFormState,
                  customFormState: props.context.customFormState,
                },
                type: props.context.type,
              };
              setTimeout(() => {
                props.foreignMutations.onChange(replaceWith(newValue), delta);
              }, 0);
            }
          },
        }}
      />
    </>
  )).any([
    ValidateRunner<
      Context &
        Value<Date> & {
          disabled: boolean;
          visible: boolean;
          type: ParsedType<any>;
        },
      DateFormState,
      ForeignMutationsExpected,
      Date
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
