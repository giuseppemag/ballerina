import { Maybe, SimpleCallback, simpleUpdater } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/state";

export type DateFormState = SharedFormState & 
  { possiblyInvalidInput: Maybe<string>; };
export const DateFormState = {
  Default: (): DateFormState => ({
    ...SharedFormState.Default(),
    possiblyInvalidInput: Maybe.Default(undefined)
  }),
  Updaters: {
    ...simpleUpdater<DateFormState>()("possiblyInvalidInput")
  }
};
export type DateView<Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<Maybe<Date>> & DateFormState & { disabled:boolean }, 
    DateFormState, 
    ForeignMutationsExpected & { onChange: OnChange<Maybe<Date>>; setNewValue: SimpleCallback<Maybe<string>> }
  >;
