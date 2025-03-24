import { SimpleCallback, Unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type Base64FileFormState = {
  commonFormState: CommonFormState;
  customFormState: Unit;
};

export const Base64FileFormState = {
  Default: (): Base64FileFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {},
  }),
};

export type Base64FileFormView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<string> & { commonFormState: CommonFormState } & {
      disabled: boolean;
      visible: boolean;
    },
  Base64FileFormState,
  ForeignMutationsExpected & {
    onChange: OnChange<string>;
    setNewValue: SimpleCallback<string>;
  }
>;
