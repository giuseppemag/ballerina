import { AsyncState } from "@/src/async/state";
import { CoTypedFactory } from "@/src/coroutines/builder";
import { id } from "@/src/fun/domains/id/state";
import { Synchronized } from "../state";
export const Synchronize = (p, errorProcessor, maxAttempts, delayBetweenAttemptsInMs) => {
    const Co = CoTypedFactory();
    return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toReloading())).then(() => Co.GetState().then(current => Co.Await(() => p(current), id).then(apiResult => {
        if (apiResult.kind == "l") {
            return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoaded(apiResult.value))).then(() => Co.Return("success"));
        }
        else if (errorProcessor(apiResult.value) == "transient failure" && maxAttempts > 0) {
            return Co.Wait(delayBetweenAttemptsInMs).then(() => Synchronize(p, errorProcessor, maxAttempts - 1, delayBetweenAttemptsInMs));
        }
        else {
            return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toError(apiResult.value))).then(() => Co.Return("permanent failure"));
        }
    })));
};
export const SynchronizeWithValueUpdater = (p, errorProcessor, maxAttempts, delayBetweenAttemptsInMs) => {
    const Co = CoTypedFactory();
    return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toReloading())).then(() => Co.GetState().then(current => Co.Await(() => p(current), id).then(apiResult => {
        if (apiResult.kind == "l") {
            return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoaded(apiResult.value[0]))
                .then(Synchronized.Updaters.value(apiResult.value[1])).then(_ => {
                return _;
            })).then(() => Co.Return("success"));
        }
        else if (errorProcessor(apiResult.value) == "transient failure" && maxAttempts > 0) {
            return Co.Wait(delayBetweenAttemptsInMs).then(() => SynchronizeWithValueUpdater(p, errorProcessor, maxAttempts - 1, delayBetweenAttemptsInMs));
        }
        else {
            return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toError(apiResult.value))).then(() => Co.Return("permanent failure"));
        }
    })));
};
//# sourceMappingURL=synchronize.js.map