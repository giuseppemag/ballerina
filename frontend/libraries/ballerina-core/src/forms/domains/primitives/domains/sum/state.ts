import { BasicFun, FormLabel, OnChange, SimpleCallback, simpleUpdater, Sum, Template, Value, View } from "../../../../../../main";
import { CommonFormState } from "../../../singleton/state";

export type SumFieldState<L, R, LeftFormState, RightFormState> =
  { commonFormState: CommonFormState } &
  {
    sumFormState: Sum<LeftFormState, RightFormState>,
  };

export const SumFieldState = <L, R, LeftFormState, RightFormState>() => ({
  Default: (
    sumFormState: SumFieldState<L, R, LeftFormState, RightFormState>["sumFormState"],
  ): SumFieldState<L, R, LeftFormState, RightFormState> => ({
    commonFormState: CommonFormState.Default(),
    sumFormState
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<SumFieldState<L, R, LeftFormState, RightFormState>>()("sumFormState"),
    },
    Template: {
    }
  }
});
export type SumFieldView<L, R, LeftFormState, RightFormState, Context extends FormLabel, ForeignMutationsExpected> =
  View<
    Context & Value<Sum<L, R>> & SumFieldState<L, R, LeftFormState, RightFormState>,
    SumFieldState<L, R, LeftFormState, RightFormState>,
    ForeignMutationsExpected & {
      onChange: OnChange<Sum<L, R>>;
      switch: SimpleCallback<Sum<L, R>>;
    }, {
      embeddedLeftTemplate: BasicFun<void, Template<
      Context & Value<Sum<L, R>> & SumFieldState<L, R, LeftFormState, RightFormState>,
      SumFieldState<L, R, LeftFormState, RightFormState>,
      ForeignMutationsExpected & {
        onChange: OnChange<Sum<L, R>>;
      }>>
      embeddedRightTemplate: BasicFun<void, Template<
      Context & Value<Sum<L, R>> & SumFieldState<L, R, LeftFormState, RightFormState>,
      SumFieldState<L, R, LeftFormState, RightFormState>,
      ForeignMutationsExpected & {
        onChange: OnChange<Sum<L, R>>;
      }>>
    }>;