import { SimpleCallback } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/state";

export type Base64FileView<Context extends FormLabel, ForeignMutationsExpected> =
  View<
    Context & Value<string> & SharedFormState & { disabled:boolean },
    SharedFormState,
    ForeignMutationsExpected & { onChange: OnChange<string>; setNewValue: SimpleCallback<string> }
  >;
