import { List } from "immutable";
import {
  BasicFun,
  BooleanView,
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
  CommonFormState,
} from "../../../singleton/state";

export const BooleanForm = <
  Context extends FormLabel,
  ForeignMutationsExpected,
>(
  validation?: BasicFun<boolean, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context & Value<boolean> & { disabled: boolean },
    { commonFormState: CommonFormState },
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
      Context & { disabled: boolean },
      { commonFormState: CommonFormState },
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
