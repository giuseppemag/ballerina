
import { Unit, SimpleCallback } from "../../../../../../../../main";
import { View } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { CommonFormState, OnChange } from "../../../singleton/state";

export type NumberFormState = {
  commonFormState: CommonFormState;
  customFormState: Unit;
};

export const NumberFormState = {
  Default: (): NumberFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {},
  }),
};

export type NumberView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<number> & { commonFormState: CommonFormState } & {
      disabled: boolean;
      visible: boolean;
    },
  NumberFormState,
  ForeignMutationsExpected & {
    onChange: OnChange<number>;
    setNewValue: SimpleCallback<number>;
  }
>;
