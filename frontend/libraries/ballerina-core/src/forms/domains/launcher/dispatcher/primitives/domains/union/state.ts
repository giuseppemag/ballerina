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
} from "../../../../../../../../main";
import { CommonFormState, EntityFormState } from "../../../singleton/state";
import { Map, Set } from "immutable";

export type UnionFormState = {
  commonFormState: CommonFormState;
} & {
  customFormState: {
    selectedCase: string;
    caseState: any;
  };
};

export const UnionFormState = () => ({
  Default: (
    customFormState: UnionFormState["customFormState"],
  ): UnionFormState => ({
    commonFormState: CommonFormState.Default(),
    customFormState,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<UnionFormState>()("customFormState"),
    },
    Template: {},
  },
});
export type UnionFormView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context & Value<ValueUnionCase> & UnionFormState,
  UnionFormState,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueUnionCase>;
  },
  {
    embeddedCaseTemplate: BasicFun<
      string,
      Template<
        Context & Value<ValueUnionCase> & UnionFormState,
        UnionFormState,
        ForeignMutationsExpected & {
          onChange: OnChange<ValueUnionCase>;
        }
      >
    >;
  }
>;
