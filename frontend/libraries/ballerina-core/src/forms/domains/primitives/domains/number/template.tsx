import { List } from "immutable";
import {
  BasicFun,
  NumberView,
  replaceWith,
  ValidateRunner,
  NumberFormState,
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
  CommonFormState,
} from "../../../singleton/state";

export const NumberForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<number, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context &
      Value<number> & {
        disabled: boolean;
        visible: boolean;
        type: ParsedType<any>;
      },
    NumberFormState,
    ForeignMutationsExpected & { onChange: OnChange<number> },
    NumberView<Context, ForeignMutationsExpected>
  >((props) => (
    <>
      <props.view
        {...props}
        foreignMutations={{
          ...props.foreignMutations,
          setNewValue: (_) => {
            const delta: Delta = {
              kind: "NumberReplace",
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
      Context & { disabled: boolean; visible: boolean; type: ParsedType<any> },
      NumberFormState,
      ForeignMutationsExpected,
      number
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
