import { List } from "immutable";
import { simpleUpdater, ValueTuple } from "../../../../../../main";
import { BasicFun } from "../../../../../fun/state";
import { Template, View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type TupleFormState<
  ElementFormStates extends List<{
    commonFormState: { modifiedByUser: boolean };
  }>,
> = {
  commonFormState: CommonFormState;
  elementFormStates: ElementFormStates;
};
export const TupleFormState = <
  ElementFormStates extends List<{
    commonFormState: { modifiedByUser: boolean };
  }>,
>() => ({
  Default: (
    elementFormStates: ElementFormStates,
  ): TupleFormState<ElementFormStates> => ({
    commonFormState: CommonFormState.Default(),
    elementFormStates,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<TupleFormState<ElementFormStates>>()(
        "elementFormStates",
      ),
    },
    Template: {},
  },
});
export type TupleFormView<
  ElementFormStates extends List<{
    commonFormState: { modifiedByUser: boolean };
  }>,
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueTuple> & TupleFormState<ElementFormStates>,
  TupleFormState<ElementFormStates>,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueTuple>;
  },
  {
    embeddedElementTemplates: BasicFun<
      number,
      Template<
        Context & Value<ValueTuple> & TupleFormState<ElementFormStates>,
        TupleFormState<ElementFormStates>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
        }
      >
    >;
  }
>;
