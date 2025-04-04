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
import { Base64FileFormState, Base64FileFormView } from "./state";

export const Base64FileForm = <
  Context extends FormLabel,
  ForeignMutationsExpected,
>(
  validation?: BasicFun<string, Promise<FieldValidation>>,
) => {
  return Template.Default<
    Context &
      Value<string> & {
        disabled: boolean;
        visible: boolean;
        type: ParsedType<any>;
      },
    Base64FileFormState,
    ForeignMutationsExpected & { onChange: OnChange<string> },
    Base64FileFormView<Context, ForeignMutationsExpected>
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
      Context &
        Value<string> & {
          disabled: boolean;
          visible: boolean;
          type: ParsedType<any>;
        },
      Base64FileFormState,
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
