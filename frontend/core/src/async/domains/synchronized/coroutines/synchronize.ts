import { ApiResultStatus, ErrorPermanenceStatus } from "../../../../apiResultStatus/state";
import { CoTypedFactory } from "../../../../coroutines/builder";
import { Coroutine } from "../../../../coroutines/state";
import { Unit } from "../../../../fun/domains/unit/state";
import { BasicFun } from "../../../../fun/state";
import { AsyncState } from "../../../state";
import { Synchronized } from "../state";

export const Synchronize = <value, syncResult, event extends { Kind: string; } = never>(
	p: BasicFun<value, Promise<syncResult>>, errorProcessor: BasicFun<any, ErrorPermanenceStatus>,
	maxAttempts: number, delayBetweenAttemptsInMs: number): 
		Coroutine<Synchronized<value, syncResult>, Synchronized<value, syncResult>, event, ApiResultStatus> => {
	const Co = CoTypedFactory<Unit, Synchronized<value, syncResult>, event>();
	return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoading())).then(() => 
			Co.GetState().then(current => Co.Await(() => p(current as value), errorProcessor).then(apiResult => {
		if (apiResult.kind == "l") {
			return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoaded(apiResult.value))).then(() => 
				Co.Return<ApiResultStatus>("success"));
		} else if (apiResult.value == "transient failure" && maxAttempts > 0) {
			return Co.Wait(delayBetweenAttemptsInMs).then(() => 
				Synchronize(p, errorProcessor, maxAttempts - 1, delayBetweenAttemptsInMs));
		} else {
			return Co.Return<ApiResultStatus>("permanent failure");
		}
	})
	)
	);
};
