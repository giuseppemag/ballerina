
import { Unit, SimpleCallback } from "../../../../../../../../main";
import { View } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type SecretFormState = {
  commonFormState: CommonFormState;
  customFormState: Unit;
};

export const SecretFormState = {
  Default: (): SecretFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {},
  }),
};

export type SecretFormView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<string> & { commonFormState: CommonFormState } & {
      disabled: boolean;
      visible: boolean;
    },
  SecretFormState,
  ForeignMutationsExpected & {
    onChange: OnChange<string>;
    setNewValue: SimpleCallback<string>;
  }
>;
