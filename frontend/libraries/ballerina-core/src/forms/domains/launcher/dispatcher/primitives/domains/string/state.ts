import { SimpleCallback, Unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type StringFormState = {
  commonFormState: CommonFormState;
  customFormState: Unit;
};

export const StringFormState = {
  Default: (): StringFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {},
  }),
};

export type StringFormView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<string> & {
      commonFormState: CommonFormState;
      customFormState: Unit;
    } & { disabled: boolean; visible: boolean },
  { commonFormState: CommonFormState; customFormState: Unit },
  ForeignMutationsExpected & {
    onChange: OnChange<string>;
    setNewValue: SimpleCallback<string>;
  }
>;
