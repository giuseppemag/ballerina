import { SimpleCallback, SharedFormState } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange } from "../../../singleton/template";


export type NumberView<Context extends FormLabel, ForeignMutationsExpected> = View<Context & Value<number> & SharedFormState, SharedFormState, ForeignMutationsExpected & { onChange: OnChange<number>; setNewValue: SimpleCallback<number> }>;
