import { CoTypedFactory } from "../../../../../../Shared/Coroutines/Coroutine";
import {
  BasicFun,
  BasicUpdater,
  replaceWith,
  Unit,
  Updater,
} from "../../../../../../Shared/widgets-library/widgets-main";
import { AsyncState } from "../../../state/async";
import { AsyncOperation } from "../state";

export const SimpleActionLoader = <
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
) => {
  const Co = CoTypedFactory<ReadOnlyContext, WritableState, never>();

  return Co.Seq([
    Co.SetState(
      updaters[field](
        AsyncOperation<Result>().Updaters.result(
          AsyncState.Updaters.toLoading()
        )
      )
    ),

    Co.While(
      ([current]) =>
        current[field].result.kind != "loaded" &&
        current[field].result.getLoadingAttempts() < 10,
      Co.GetState().then((current) =>
        Co.Await(apiCall(current), () => "error" as const).then((apiResult) => {
          if (apiResult.kind == "l") {
            return Co.SetState(
              updaters[field](
                AsyncOperation<Result>().Updaters.result(
                  AsyncState.Updaters.toLoaded(apiResult.v)
                )
              )
            );
          } else {
            return Co.SetState(
              updaters[field](
                AsyncOperation<Result>().Updaters.result(
                  AsyncState.Updaters.toError<Result>().then(
                    AsyncState.Updaters.toLoading()
                  )
                )
              )
            );
          }
        })
      )
    ),
    Co.SetState(
      updaters[field](
        AsyncOperation<Result>().Updaters.shouldRun(replaceWith(false))
      )
    ),
  ]);
};
