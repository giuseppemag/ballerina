
import { Maybe, simpleUpdater, simpleUpdaterWithChildren, SimpleCallback } from "../../../../../../../../main";
import { View } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type DateFormState = {
  commonFormState: CommonFormState;
  customFormState: { possiblyInvalidInput: Maybe<string> };
};
export const DateFormState = {
  Default: (): DateFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: { possiblyInvalidInput: Maybe.Default(undefined) },
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<DateFormState>()("commonFormState"),
      ...simpleUpdaterWithChildren<DateFormState>()({
        ...simpleUpdater<DateFormState["customFormState"]>()(
          "possiblyInvalidInput",
        ),
      })("customFormState"),
    },
  },
};
export type DateView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<Maybe<Date>> &
    DateFormState & { disabled: boolean; visible: boolean },
  DateFormState,
  ForeignMutationsExpected & {
    onChange: OnChange<Date>;
    setNewValue: SimpleCallback<Maybe<string>>;
  }
>;
