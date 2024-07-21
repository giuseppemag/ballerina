import { ApiResultStatus, ErrorPermanenceStatus } from "../../../../apiResultStatus/state";
import { CoTypedFactory } from "../../../../coroutines/builder";
import { Coroutine } from "../../../../coroutines/state";
import { id } from "../../../../fun/domains/id/state";
import { Unit } from "../../../../fun/domains/unit/state";
import { BasicFun } from "../../../../fun/state";
import { AsyncState } from "../../../state";
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
