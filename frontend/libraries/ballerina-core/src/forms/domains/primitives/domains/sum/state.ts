import {
  BasicFun,
  FormLabel,
  OnChange,
  SimpleCallback,
  simpleUpdater,
  Sum,
  Template,
  Unit,
  Value,
  ValueSum,
  View,
} from "../../../../../../main";
import { CommonFormState } from "../../../singleton/state";

export type SumFormState<LeftFormState, RightFormState> = {
  commonFormState: CommonFormState;
} & {
  customFormState: {
    left: LeftFormState;
    right: RightFormState;
  };
};

export const SumFormState = <LeftFormState, RightFormState>() => ({
  Default: (
    customFormState: SumFormState<
      LeftFormState,
      RightFormState
    >["customFormState"],
  ): SumFormState<LeftFormState, RightFormState> => ({
    commonFormState: CommonFormState.Default(),
    customFormState,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<SumFormState<LeftFormState, RightFormState>>()(
        "customFormState",
      ),
    },
    Template: {},
  },
});
export type SumFormView<
  LeftFormState,
  RightFormState,
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueSum> & SumFormState<LeftFormState, RightFormState>,
  SumFormState<LeftFormState, RightFormState>,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueSum>;
  },
  {
    embeddedLeftTemplate?: BasicFun<
      void,
      Template<
        Context & Value<ValueSum> & SumFormState<LeftFormState, RightFormState>,
        SumFormState<LeftFormState, RightFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueSum>;
        }
      >
    >;
    embeddedRightTemplate?: BasicFun<
      void,
      Template<
        Context & Value<ValueSum> & SumFormState<LeftFormState, RightFormState>,
        SumFormState<LeftFormState, RightFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueSum>;
        }
      >
    >;
  }
>;
