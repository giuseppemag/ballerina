import { List } from "immutable";
import {
  BasicFun,
  Delta,
  Guid,
  PredicateValue,
  simpleUpdater,
  Sum,
  Unit,
  Updater,
} from "../../../../main";
import { FormParsingResult, FormsParserState } from "../parser/state";

export type FormRefCreateApiHandlers<Arg> = {
  onDefaultSuccess?: (_: Arg) => void;
  onDefaultError?: (_: Arg) => void;
  onCreateSuccess?: (_: Arg) => void;
  onCreateError?: (_: Arg) => void;
};

export type FormRefEditApiHandlers<Arg> = {
  onGetSuccess?: (_: Arg) => void;
  onGetError?: (_: Arg) => void;
  onUpdateSuccess?: (_: Arg) => void;
  onUpdateError?: (_: Arg) => void;
};

export type FormRef = {
  formName: string;
} & (
  | {
      kind: "edit";
      submitButtonWrapper: any;
      entityId: Guid;
      apiHandlers?: FormRefEditApiHandlers<any>;
    }
  | {
      kind: "create";
      apiHandlers?: FormRefCreateApiHandlers<any>;
      submitButtonWrapper: any;
    }
  | {
      kind: "passthrough";
      entity: Sum<any, "not initialized">;
      globalConfiguration: Sum<any, "not initialized">;
      containerWrapper: any;
      onEntityChange: (
        updater: Updater<PredicateValue>,
        delta: Delta,
      ) => void;
    }
);

export type FormRunnerContext = {
  extraContext: any;
  formRef: FormRef;
  showFormParsingErrors: BasicFun<FormParsingResult, JSX.Element>;
} & FormsParserState;

export type FormRunnerState = {
  form: Sum<
    {
      form: any;
      formFieldStates: any;
      entity: any;
      commonFormState: any;
      customFormState: any;
      globalConfiguration: any;
    },
    "not initialized"
  >;
};
export type FormRunnerForeignMutationsExpected = Unit;
export const FormRunnerState = {
  Default: (): FormRunnerState => ({
    form: Sum.Default.right("not initialized"),
  }),
  Updaters: {
    ...simpleUpdater<FormRunnerState>()("form"),
  },
};
