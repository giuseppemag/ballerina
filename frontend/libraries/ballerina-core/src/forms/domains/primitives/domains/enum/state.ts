import { OrderedMap } from "immutable";
import {
  Guid,
  SimpleCallback,
  Synchronized,
  Unit,
  unit,
  ValueOption,
  PredicateValue,
  ValueRecord,
} from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type BaseEnumContext = {
  getOptions: () => Promise<OrderedMap<Guid, ValueRecord>>;
};
export type EnumFormState = {
  commonFormState: CommonFormState;
  customFormState: {
    options: Synchronized<Unit, OrderedMap<Guid, ValueRecord>>;
  };
};
export const EnumFormState = () => ({
  Default: (): EnumFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: { options: Synchronized.Default(unit) },
  }),
});
export type EnumView<
  Context extends FormLabel & BaseEnumContext,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<ValueOption> &
    EnumFormState & {
      activeOptions: "loading" | Array<ValueRecord>;
      visible: boolean;
    } & { disabled: boolean },
  EnumFormState,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueOption>;
    setNewValue: SimpleCallback<Guid>;
  }
>;
