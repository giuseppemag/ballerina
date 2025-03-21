import { SimpleCallback } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type SecretView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<string> & { commonFormState: CommonFormState } & {
      disabled: boolean;
      visible: boolean;
    },
  { commonFormState: CommonFormState },
  ForeignMutationsExpected & {
    onChange: OnChange<string>;
    setNewValue: SimpleCallback<string>;
  }
>;
