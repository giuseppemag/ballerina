import { Map } from "immutable";
import { CommonFormState } from "../../../singleton/state";
import { BasicFun, FormLabel, OnChange, simpleUpdater, Template, Value, ValueUnionCase, View } from "../../../../../../main";

export type UnionFieldState<
  CaseName extends string,
  ElementFormStates extends Map<
    CaseName,
    { commonFormState: { modifiedByUser: boolean } }
  >,
> = {
  commonFormState: CommonFormState;
  elementFormStates: ElementFormStates;
};

export const UnionFieldState = <
  CaseName extends string,
  ElementFormStates extends Map<
    CaseName,
    { commonFormState: { modifiedByUser: boolean } }
  >,
>() => ({
  Default: (
    elementFormStates: ElementFormStates,
  ): UnionFieldState<CaseName, ElementFormStates> => ({
    commonFormState: CommonFormState.Default(),
    elementFormStates,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<UnionFieldState<CaseName, ElementFormStates>>()(
        "elementFormStates",
      ),
    },
    Template: {},
  },
});

export type UnionFieldView<
  CaseName extends string,
  ElementFormStates extends Map<
    CaseName,
    { commonFormState: { modifiedByUser: boolean } }
  >,
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueUnionCase> & UnionFieldState<CaseName, ElementFormStates>,
  UnionFieldState<CaseName, ElementFormStates>,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueUnionCase>;
  },
  {
    embeddedElementTemplates: BasicFun<
      CaseName,
      Template<
        Context & Value<ValueUnionCase> & UnionFieldState<CaseName, ElementFormStates>,
        UnionFieldState<CaseName, ElementFormStates>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueUnionCase>;
        }
      >
    >;
  }
>;
