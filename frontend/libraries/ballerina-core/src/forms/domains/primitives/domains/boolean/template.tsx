import { List } from "immutable";
import {
  BasicFun,
  BooleanView,
  replaceWith,
  ValidateRunner,
  BooleanFormState,
  ParsedType,
  Delta,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";

export const BooleanForm = <
  Context extends FormLabel,
  ForeignMutationsExpected,
>(
  validation?: BasicFun<boolean, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context &
      Value<boolean> & {
        disabled: boolean;
        visible: boolean;
        type: ParsedType<any>;
      },
    BooleanFormState,
    ForeignMutationsExpected & { onChange: OnChange<boolean> },
    BooleanView<Context, ForeignMutationsExpected>
  >((props) => (
    <>
      <props.view
        {...props}
        foreignMutations={{
          ...props.foreignMutations,
          setNewValue: (_) => {
            const delta: Delta = {
              kind: "BoolReplace",
              replace: _,
              state: {
                commonFormState: props.context.commonFormState,
                customFormState: props.context.customFormState,
              },
              type: props.context.type,
            };
            props.foreignMutations.onChange(replaceWith(_), delta);
          },
        }}
      />
    </>
  )).any([
    ValidateRunner<
      Context &
        Value<boolean> & {
          disabled: boolean;
          visible: boolean;
          type: ParsedType<any>;
        },
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
