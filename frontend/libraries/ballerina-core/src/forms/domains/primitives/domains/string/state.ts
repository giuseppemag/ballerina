import { SimpleCallback, Unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/state";

export type StringView<Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<string> & SharedFormState, 
    SharedFormState, 
    ForeignMutationsExpected & { onChange: OnChange<string>; setNewValue: SimpleCallback<string> }
  >;
