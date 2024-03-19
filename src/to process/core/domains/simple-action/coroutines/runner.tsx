import {
  BasicFun,
  BasicUpdater,
  coroutine,
  Unit,
  Updater,
} from "../../../../../../Shared/widgets-library/widgets-main";
import { Template } from "../../../templates-lib/templateDefinition";
import { AsyncOperation } from "../state";
import { SimpleActionLoader } from "./_loader";

export const AsyncOperationRunner =
  <
    ReadOnlyContext,
    WritableState extends { [_ in K]: AsyncOperation<Result> },
    WritableStateUpdaters extends {
      [_ in K]: BasicFun<
        BasicUpdater<AsyncOperation<Result>>,
        Updater<WritableState>
      >;
    },
    K extends keyof WritableState,
    Result,
  >(
    field: K,
    updaters: WritableStateUpdaters,
    apiCall: BasicFun<
      ReadOnlyContext & WritableState,
      BasicFun<Unit, Promise<Result>>
    >
  ): Template<ReadOnlyContext, WritableState, Unit> =>
  (props) => {
    return (
      <>
        {props.writableState[field].shouldRun
          ? coroutine(
              SimpleActionLoader<
                ReadOnlyContext,
                WritableState,
                WritableStateUpdaters,
                K,
                Result
              >(field, updaters, apiCall),
              [],
              { interval: 50 }
            )({
              ...props.readonlyState,
              ...props.writableState,
            }).run(props.setState)
          : undefined}
      </>
    );
  };
