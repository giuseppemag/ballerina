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

export type SumFieldState<LeftFormState, RightFormState> = {
  commonFormState: CommonFormState;
} & {
  customFormState: {
    left: LeftFormState;
    right: RightFormState;
  };
};

export const SumFieldState = <LeftFormState, RightFormState>() => ({
  Default: (
    customFormState: SumFieldState<
      LeftFormState,
      RightFormState
    >["customFormState"],
  ): SumFieldState<LeftFormState, RightFormState> => ({
    commonFormState: CommonFormState.Default(),
    customFormState,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<SumFieldState<LeftFormState, RightFormState>>()(
        "customFormState",
      ),
    },
    Template: {},
  },
});
export type SumFieldView<
  LeftFormState,
  RightFormState,
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueSum> & SumFieldState<LeftFormState, RightFormState>,
  SumFieldState<LeftFormState, RightFormState>,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueSum>;
    onSwitch: SimpleCallback;
  },
  {
    embeddedLeftTemplate: BasicFun<
      void,
      Template<
        Context &
          Value<ValueSum> &
          SumFieldState<LeftFormState, RightFormState>,
        SumFieldState<LeftFormState, RightFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueSum>;
        }
      >
    >;
    embeddedRightTemplate: BasicFun<
      void,
      Template<
        Context &
          Value<ValueSum> &
          SumFieldState<LeftFormState, RightFormState>,
        SumFieldState<LeftFormState, RightFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueSum>;
        }
      >
    >;
  }
>;
