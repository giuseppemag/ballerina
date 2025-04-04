import { List } from "immutable";
import {
  BasicFun,
  Delta,
  ParsedType,
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
import { SecretFormState, SecretFormView } from "./state";

export const SecretForm = <Context extends FormLabel, ForeignMutationsExpected>(
  validation?: BasicFun<string, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context &
      Value<string> & {
        disabled: boolean;
        visible: boolean;
        type: ParsedType<any>;
      },
    SecretFormState,
    ForeignMutationsExpected & { onChange: OnChange<string> },
    SecretFormView<Context, ForeignMutationsExpected>
  >((props) => (
    <>
      <props.view
        {...props}
        foreignMutations={{
          ...props.foreignMutations,
          setNewValue: (_) => {
            const delta: Delta = {
              kind: "StringReplace",
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
      SecretFormState,
      ForeignMutationsExpected,
      string
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
