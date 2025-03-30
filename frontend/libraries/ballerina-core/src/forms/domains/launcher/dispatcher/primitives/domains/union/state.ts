import {
  BasicFun,
  FormLabel,
  OnChange,
  simpleUpdater,
  Template,
  Value,
  ValueRecord,
  ValueUnionCase,
  View,
} from "../../../../../../main";
import {
  CommonFormState,
  EntityFormState,
  EntityFormTemplate,
} from "../../../singleton/state";
import { Map, Set } from "immutable";

export type UnionFormState<
  CaseFormStates extends Map<string, EntityFormState<any, any, any, any>>,
> = {
  commonFormState: CommonFormState;
} & {
  customFormState: {
    selectedCase: string;
    caseStates: CaseFormStates;
  };
};

export const UnionFormState = <
  CaseFormStates extends Map<string, EntityFormState<any, any, any, any>>,
>() => ({
  Default: (
    customFormState: UnionFormState<CaseFormStates>["customFormState"],
  ): UnionFormState<CaseFormStates> => ({
    commonFormState: CommonFormState.Default(),
    customFormState,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<UnionFormState<CaseFormStates>>()("customFormState"),
    },
    Template: {},
  },
});
export type UnionFormView<
  CaseFormStates extends Map<string, EntityFormState<any, any, any, any>>,
  Context extends FormLabel & {
    caseNames: Set<string>;
  },
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueUnionCase> & UnionFormState<CaseFormStates>,
  UnionFormState<CaseFormStates>,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueUnionCase>;
  },
  {
    embeddedCaseTemplate: BasicFun<
      string,
      // EntityFormTemplate<any, any, any, any>
      Template<
        Context & Value<ValueUnionCase> & UnionFormState<CaseFormStates>,
        UnionFormState<CaseFormStates>,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueUnionCase>;
        }
      >
    >;
  }
>;
