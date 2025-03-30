import { SimpleCallback, Unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type BooleanFormState = {
  commonFormState: CommonFormState;
  customFormState: Unit;
};

export const BooleanFormState = {
  Default: (): BooleanFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {},
  }),
};

export type BooleanView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<boolean> & { commonFormState: CommonFormState } & {
      disabled: boolean;
      visible: boolean;
    },
  BooleanFormState,
  ForeignMutationsExpected & {
    onChange: OnChange<boolean>;
    setNewValue: SimpleCallback<boolean>;
  }
>;
