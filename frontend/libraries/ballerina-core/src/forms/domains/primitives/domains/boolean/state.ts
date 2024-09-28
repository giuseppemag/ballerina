import { SimpleCallback, Unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/template";


export type BooleanView<Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<boolean> & SharedFormState, 
    SharedFormState, 
    ForeignMutationsExpected & { onChange: OnChange<boolean>; setNewValue: SimpleCallback<boolean> }
  >;
