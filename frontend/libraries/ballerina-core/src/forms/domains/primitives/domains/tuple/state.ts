import { List, Map } from "immutable";
import {
  simpleUpdater,
  Updater,
  SimpleCallback,
  Unit,
  PredicateValue,
  ValueTuple,
  ListFieldState,
} from "../../../../../../main";
import { BasicFun } from "../../../../../fun/state";
import { Template, View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type TupleFieldState<ElementFormStates extends List<{ commonFormState: { modifiedByUser: boolean } }>> = {
  commonFormState: CommonFormState;
  elementFormStates: ElementFormStates;
};
export const TupleFieldState = <ElementFormStates extends List<{ commonFormState: { modifiedByUser: boolean } }>>() => ({
  Default: (
    elementFormStates: ElementFormStates,
  ): TupleFieldState<ElementFormStates> => ({
    commonFormState: CommonFormState.Default(),
    elementFormStates,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<TupleFieldState<ElementFormStates>>()("elementFormStates"),
    },
    Template: {},
  },
});
export type TupleFieldView<
  ElementFormStates extends List<{ commonFormState: { modifiedByUser: boolean } }>,
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueTuple> & TupleFieldState<ElementFormStates>,
  TupleFieldState<ElementFormStates>,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueTuple>;
  },
  {
    embeddedElementTemplates: BasicFun<
      number,
      Template<
        Context & Value<ValueTuple> & TupleFieldState<ElementFormStates>,
        TupleFieldState<ElementFormStates>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
        }
      >
    >;
  }
>;
