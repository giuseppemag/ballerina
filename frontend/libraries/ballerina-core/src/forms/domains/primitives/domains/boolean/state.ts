import { SimpleCallback, Unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/state";


export type BooleanView<Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<boolean> & SharedFormState & { disabled:boolean }, 
    SharedFormState, 
    ForeignMutationsExpected & { onChange: OnChange<boolean>; setNewValue: SimpleCallback<boolean> }
  >;

export type MaybeBooleanView<Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<boolean | undefined> & SharedFormState & { disabled:boolean }, 
    SharedFormState, 
    ForeignMutationsExpected & { onChange: OnChange<boolean | undefined>; setNewValue: SimpleCallback<boolean | undefined> }
  >;
