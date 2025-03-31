
import { Unit, SimpleCallback } from "../../../../../../../../main";
import { View } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type SumUnitDateFormState = {
  commonFormState: CommonFormState;
  customFormState: Unit;
};

export const SumUnitDateFormState = {
  Default: (): SumUnitDateFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {},
  }),
};

export type SumUnitDateFormView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<string> & {
      commonFormState: CommonFormState;
      customFormState: Unit;
    } & { disabled: boolean },
  { commonFormState: CommonFormState; customFormState: Unit },
  ForeignMutationsExpected & {
    onChange: OnChange<string>;
    setNewValue: SimpleCallback<string>;
  }
>;
