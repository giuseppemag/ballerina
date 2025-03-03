import { List, Map } from "immutable";
import {
  simpleUpdater,
  Updater,
  SimpleCallback,
  Unit,
} from "../../../../../../main";
import { BasicFun } from "../../../../../fun/state";
import { Template, View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type MapFieldState<K, V, KeyFormState, ValueFormState> = {
  commonFormState: CommonFormState;
} & {
  elementFormStates: Map<
    number,
    { KeyFormState: KeyFormState; ValueFormState: ValueFormState }
  >;
};
export const MapFieldState = <K, V, KeyFormState, ValueFormState>() => ({
  Default: (
    elementFormStates: MapFieldState<
      K,
      V,
      KeyFormState,
      ValueFormState
    >["elementFormStates"],
  ): MapFieldState<K, V, KeyFormState, ValueFormState> => ({
    commonFormState: CommonFormState.Default(),
    elementFormStates,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<MapFieldState<K, V, KeyFormState, ValueFormState>>()(
        "elementFormStates",
      ),
    },
    Template: {},
  },
});
export type MapFieldView<
  K,
  V,
  KeyFormState,
  ValueFormState,
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<List<[K, V]>> &
    MapFieldState<K, V, KeyFormState, ValueFormState>,
  MapFieldState<K, V, KeyFormState, ValueFormState>,
  ForeignMutationsExpected & {
    onChange: OnChange<List<[K, V]>>;
    add: SimpleCallback<Unit>;
    remove: SimpleCallback<number>;
  },
  {
    embeddedKeyTemplate: BasicFun<
      number,
      Template<
        Context &
          Value<List<[K, V]>> &
          MapFieldState<K, V, KeyFormState, ValueFormState>,
        MapFieldState<K, V, KeyFormState, ValueFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<List<[K, V]>>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
        }
      >
    >;
    embeddedValueTemplate: BasicFun<
      number,
      Template<
        Context &
          Value<List<[K, V]>> &
          MapFieldState<K, V, KeyFormState, ValueFormState>,
        MapFieldState<K, V, KeyFormState, ValueFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<List<[K, V]>>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
        }
      >
    >;
  }
>;
