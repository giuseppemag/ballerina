import { ErrorPermanenceStatus, ApiResultStatus } from "@/src/apiResultStatus/state";
import { AsyncState } from "@/src/async/state";
import { CoTypedFactory } from "@/src/coroutines/builder";
import { Coroutine } from "@/src/coroutines/state";
import { id } from "@/src/fun/domains/id/state";
import { Unit } from "@/src/fun/domains/unit/state";
import { BasicUpdater } from "@/src/fun/domains/updater/state";
import { BasicFun } from "@/src/fun/state";
import { Synchronized } from "../state";

export const Synchronize = <value, syncResult>(
	p: BasicFun<value, Promise<syncResult>>, errorProcessor: BasicFun<any, ErrorPermanenceStatus>,
	maxAttempts: number, delayBetweenAttemptsInMs: number): 
		Coroutine<Synchronized<value, syncResult>, Synchronized<value, syncResult>, ApiResultStatus> => {
	const Co = CoTypedFactory<Unit, Synchronized<value, syncResult>>();
	return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toReloading())).then(() => 
			Co.GetState().then(current => Co.Await(() => p(current as value), id).then(apiResult => {
		if (apiResult.kind == "l") {
			return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoaded(apiResult.value))).then(() => 
				Co.Return<ApiResultStatus>("success"));
		} else if (errorProcessor(apiResult.value) == "transient failure" && maxAttempts > 0) {
			return Co.Wait(delayBetweenAttemptsInMs).then(() => 
				Synchronize(p, errorProcessor, maxAttempts - 1, delayBetweenAttemptsInMs));
		} else {
			return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toError(apiResult.value))).then(() => 
				Co.Return<ApiResultStatus>("permanent failure")
			);
		}
	})
	)
	);
};

export const SynchronizeWithValueUpdater = <value, syncResult>(
	p: BasicFun<value, Promise<[syncResult, BasicUpdater<value>]>>, errorProcessor: BasicFun<any, ErrorPermanenceStatus>,
	maxAttempts: number, delayBetweenAttemptsInMs: number): 
		Coroutine<Synchronized<value, syncResult>, Synchronized<value, syncResult>, ApiResultStatus> => {
	const Co = CoTypedFactory<Unit, Synchronized<value, syncResult>>();
	return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toReloading())).then(() => 
			Co.GetState().then(current => Co.Await(() => p(current as value), id).then(apiResult => {
		if (apiResult.kind == "l") {
			return Co.SetState(
				Synchronized.Updaters.sync<value, syncResult>(AsyncState.Updaters.toLoaded(apiResult.value[0]))
				.then(
					Synchronized.Updaters.value<value, syncResult>(apiResult.value[1])
				).then(_ => {
					return _
				})
			).then(() => 
				Co.Return<ApiResultStatus>("success"));
		} else if (errorProcessor(apiResult.value) == "transient failure" && maxAttempts > 0) {
			return Co.Wait(delayBetweenAttemptsInMs).then(() => 
				SynchronizeWithValueUpdater(p, errorProcessor, maxAttempts - 1, delayBetweenAttemptsInMs));
		} else {
			return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toError(apiResult.value))).then(() => 
				Co.Return<ApiResultStatus>("permanent failure")
			);
		}
	})
	)
	);
};
