import { List, Map } from "immutable";
import { simpleUpdater, Updater, SimpleCallback, Unit } from "../../../../../../main";
import { BasicFun } from "../../../../../fun/state";
import { Template, View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/state";


export type ListFieldState<Element, ElementFormState> =
  SharedFormState &
  {
    elementFormStates: Map<number, ElementFormState>
  };
export const ListFieldState = <Element, ElementFormState>() => ({
  Default: (
    elementFormStates: Map<number, ElementFormState>,
  ): ListFieldState<Element, ElementFormState> => ({
    ...SharedFormState.Default(),
    elementFormStates
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<ListFieldState<Element, ElementFormState>>()("elementFormStates"),
    },
    Template: {
    }
  }
});
export type ListFieldView<Element, ElementFormState, Context extends FormLabel, ForeignMutationsExpected> =
  View<
    Context & Value<List<Element>> & ListFieldState<Element, ElementFormState>,
    ListFieldState<Element, ElementFormState>,
    ForeignMutationsExpected & {
      onChange: OnChange<List<Element>>;
      add: SimpleCallback<Unit>;
      remove: SimpleCallback<number>;
    }, {
      embeddedElementTemplate: BasicFun<number, Template<
        Context & Value<List<Element>> & ListFieldState<Element, ElementFormState>,
        ListFieldState<Element, ElementFormState>,
        ForeignMutationsExpected & {
          onChange: OnChange<List<Element>>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
        }>>
    }>;
