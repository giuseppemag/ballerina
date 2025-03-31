import { List, Map } from "immutable";

import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";
import { simpleUpdater, SimpleCallback, Unit } from "../../../../../../../../main";
import { BasicFun } from "../../../../../../../fun/state";
import { View, Template } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { ValueTuple } from "../../../../../parser/domains/predicates/state";

export type MapFieldState<KeyFormState, ValueFormState> = {
  commonFormState: CommonFormState;
} & {
  elementFormStates: Map<
    number,
    { KeyFormState: KeyFormState; ValueFormState: ValueFormState }
  >;
};
export const MapFieldState = <KeyFormState, ValueFormState>() => ({
  zero: () => ({
    commonFormState: CommonFormState.Default(),
    elementFormStates: Map(),
  }),
  Default: (
    elementFormStates: MapFieldState<
      KeyFormState,
      ValueFormState
    >["elementFormStates"],
  ): MapFieldState<KeyFormState, ValueFormState> => ({
    commonFormState: CommonFormState.Default(),
    elementFormStates,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<MapFieldState<KeyFormState, ValueFormState>>()(
        "elementFormStates",
      ),
    },
    Template: {},
  },
});
export type MapFieldView<
  KeyFormState,
  ValueFormState,
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueTuple> & MapFieldState<KeyFormState, ValueFormState>,
  MapFieldState<KeyFormState, ValueFormState>,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueTuple>;
    add: SimpleCallback<Unit>;
    remove: SimpleCallback<number>;
  },
  {
    embeddedKeyTemplate: BasicFun<
      number,
      Template<
        Context &
          Value<ValueTuple> &
          MapFieldState<KeyFormState, ValueFormState>,
        MapFieldState<KeyFormState, ValueFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
        }
      >
    >;
    embeddedValueTemplate: BasicFun<
      number,
      Template<
        Context &
          Value<ValueTuple> &
          MapFieldState<KeyFormState, ValueFormState>,
        MapFieldState<KeyFormState, ValueFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
        }
      >
    >;
  }
>;
