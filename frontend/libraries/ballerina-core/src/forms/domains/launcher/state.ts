import { List } from "immutable";
import {
  BasicFun,
  Guid,
  PredicateValue,
  simpleUpdater,
  Sum,
  Unit,
  Updater,
} from "../../../../main";
import {
  FormLaunchersResult,
  FormsParserState,
  ParsedLauncher,
} from "../parser/state";

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
        path: List<string>,
      ) => void;
    }
);

export type FormRunnerContext<T extends { [key in keyof T]: { type: any; state: any } }> = {
  extraContext: any;
  formRef: FormRef;
  showFormParsingErrors: BasicFun<FormLaunchersResult<T>, JSX.Element>;
} & FormsParserState<T>;

export type FormRunnerState<T> = {
  form: Sum<ParsedLauncher<T>, "not initialized">;
};
export type FormRunnerForeignMutationsExpected = Unit;
export const FormRunnerState = <T>() => {
  return {
    Default: (): FormRunnerState<T> => ({
      form: Sum.Default.right("not initialized"),
    }),
    Updaters: {
      ...simpleUpdater<FormRunnerState<T>>()("form"),
    },
  };
};
