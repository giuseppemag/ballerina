import { Guid, SimpleCallback, ValueRecord } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange } from "../../../singleton/state";
import { BaseEnumContext, EnumFormState } from "../enum/state";

export type EnumMultiselectView<
  Context extends FormLabel & BaseEnumContext,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<ValueRecord> &
    EnumFormState & {
      selectedIds: Array<Guid>;
      activeOptions: "loading" | Array<ValueRecord>;
      disabled: boolean;
      visible: boolean;
    },
  EnumFormState,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueRecord>;
    setNewValue: SimpleCallback<Array<Guid>>;
  }
>;
