import { List, Map } from "immutable";
import {
  simpleUpdater,
  Updater,
  SimpleCallback,
  Unit,
  PredicateValue,
  ValueTuple,
} from "../../../../../../main";
import { BasicFun } from "../../../../../fun/state";
import { Template, View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type ListFieldState<ElementFormState> = {
  commonFormState: CommonFormState;
  elementFormStates: Map<number, ElementFormState>;
};
export const ListFieldState = <ElementFormState>() => ({
  Default: (
    elementFormStates: Map<number, ElementFormState>,
  ): ListFieldState<ElementFormState> => ({
    commonFormState: CommonFormState.Default(),
    elementFormStates,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<ListFieldState<ElementFormState>>()("elementFormStates"),
    },
    Template: {},
  },
});
export type ListFieldView<
  ElementFormState,
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueTuple> & ListFieldState<ElementFormState>,
  ListFieldState<ElementFormState>,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueTuple>;
    add: SimpleCallback<Unit>;
    remove: SimpleCallback<number>;
    move: (elementIndex: number, to: number) => void;
    duplicate: SimpleCallback<number>;
    insert: SimpleCallback<number>;
  },
  {
    embeddedElementTemplate: BasicFun<
      number,
      Template<
        Context & Value<ValueTuple> & ListFieldState<ElementFormState>,
        ListFieldState<ElementFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
          move: (elementIndex: number, to: number) => void;
          duplicate: SimpleCallback<number>;
          insert: SimpleCallback<number>;
        }
      >
    >;
  }
>;
