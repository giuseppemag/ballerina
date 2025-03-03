import { SimpleCallback, Unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type BooleanView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<boolean> & { commonFormState: CommonFormState } & {
      disabled: boolean;
    },
  { commonFormState: CommonFormState },
  ForeignMutationsExpected & {
    onChange: OnChange<boolean>;
    setNewValue: SimpleCallback<boolean>;
  }
>;

export type MaybeBooleanView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<boolean | undefined> & { commonFormState: CommonFormState } & {
      disabled: boolean;
    },
  { commonFormState: CommonFormState },
  ForeignMutationsExpected & {
    onChange: OnChange<boolean | undefined>;
    setNewValue: SimpleCallback<boolean | undefined>;
  }
>;
