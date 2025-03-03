import { BasicUpdater } from "../../../../../main";
import {
  ApiResultStatus,
  ErrorPermanenceStatus,
} from "../../../../apiResultStatus/state";
import { CoTypedFactory } from "../../../../coroutines/builder";
import { Coroutine } from "../../../../coroutines/state";
import { id } from "../../../../fun/domains/id/state";
import { Unit } from "../../../../fun/domains/unit/state";
import { BasicFun } from "../../../../fun/state";
import { AsyncState } from "../../../state";
import { Synchronized } from "../state";

export const Synchronize = <value, syncResult, context = Unit>(
  p: BasicFun<value & context, Promise<syncResult>>,
  errorProcessor: BasicFun<any, ErrorPermanenceStatus> = () =>
    "transient failure",
  maxAttempts: number = 2,
  delayBetweenAttemptsInMs: number = 250,
): Coroutine<
  Synchronized<value, syncResult> & context,
  Synchronized<value, syncResult>,
  ApiResultStatus
> => {
  const Co = CoTypedFactory<context, Synchronized<value, syncResult>>();
  return Co.SetState(
    Synchronized.Updaters.sync(AsyncState.Updaters.toReloading()),
  ).then(() =>
    Co.GetState().then((current) =>
      Co.Await(() => p(current as value & context), id).then((apiResult) => {
        if (apiResult.kind == "l") {
          return Co.SetState(
            Synchronized.Updaters.sync(
              AsyncState.Updaters.toLoaded(apiResult.value),
            ),
          ).then(() => Co.Return<ApiResultStatus>("success"));
        } else if (
          errorProcessor(apiResult.value) == "transient failure" &&
          maxAttempts > 0
        ) {
          return Co.Wait(delayBetweenAttemptsInMs).then(() =>
            Synchronize<value, syncResult, context>(
              p,
              errorProcessor,
              maxAttempts - 1,
              delayBetweenAttemptsInMs,
            ),
          );
        } else {
          return Co.SetState(
            Synchronized.Updaters.sync(
              AsyncState.Updaters.toError(apiResult.value),
            ),
          ).then(() => Co.Return<ApiResultStatus>("permanent failure"));
        }
      }),
    ),
  );
};

export const SynchronizeWithValueUpdater = <value, syncResult, context = Unit>(
  p: BasicFun<value & context, Promise<[syncResult, BasicUpdater<value>]>>,
  errorProcessor: BasicFun<any, ErrorPermanenceStatus> = () =>
    "transient failure",
  maxAttempts: number = 2,
  delayBetweenAttemptsInMs: number = 250,
): Coroutine<
  Synchronized<value, syncResult> & context,
  Synchronized<value, syncResult>,
  ApiResultStatus
> => {
  const Co = CoTypedFactory<context, Synchronized<value, syncResult>>();
  return Co.SetState(
    Synchronized.Updaters.sync(AsyncState.Updaters.toReloading()),
  ).then(() =>
    Co.GetState().then((current) =>
      Co.Await(() => p(current as value & context), id).then((apiResult) => {
        if (apiResult.kind == "l") {
          return Co.SetState(
            Synchronized.Updaters.sync<value, syncResult>(
              AsyncState.Updaters.toLoaded(apiResult.value[0]),
            )
              .then(
                Synchronized.Updaters.value<value, syncResult>(
                  apiResult.value[1],
                ),
              )
              .then((_) => {
                return _;
              }),
          ).then(() => Co.Return<ApiResultStatus>("success"));
        } else if (
          errorProcessor(apiResult.value) == "transient failure" &&
          maxAttempts > 0
        ) {
          return Co.Wait(delayBetweenAttemptsInMs).then(() =>
            SynchronizeWithValueUpdater<value, syncResult, context>(
              p,
              errorProcessor,
              maxAttempts - 1,
              delayBetweenAttemptsInMs,
            ),
          );
        } else {
          return Co.SetState(
            Synchronized.Updaters.sync(
              AsyncState.Updaters.toError(apiResult.value),
            ),
          ).then(() => Co.Return<ApiResultStatus>("permanent failure"));
        }
      }),
    ),
  );
};
