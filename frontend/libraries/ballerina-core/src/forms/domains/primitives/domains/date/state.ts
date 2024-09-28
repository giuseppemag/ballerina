import { SimpleCallback, simpleUpdater } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/template";

export type DateFormState = SharedFormState & 
  { possiblyInvalidInput: string; };
export const DateFormState = {
  Default: (possiblyInvalidInput: string): DateFormState => ({
    ...SharedFormState.Default(),
    possiblyInvalidInput 
  }),
  Updaters: {
    ...simpleUpdater<DateFormState>()("possiblyInvalidInput")
  }
};
export type DateView<Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<Date> & DateFormState, 
    DateFormState, 
    ForeignMutationsExpected & { onChange: OnChange<Date>; setNewValue: SimpleCallback<string> }
  >;
