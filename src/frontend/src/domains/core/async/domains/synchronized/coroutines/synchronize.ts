import { ApiResultStatus } from "../../../../apiResultStatus/state";
import { CoTypedFactory } from "../../../../coroutines/builder";
import { Coroutine } from "../../../../coroutines/state";
import { Unit } from "../../../../fun/domains/unit/state";
import { BasicFun } from "../../../../fun/state";
import { AsyncState } from "../../../state";
import { Synchronized } from "../state";

export type ErrorPermanence = "permanent" | "transient";
export const Synchronize = <v, syncResult, event extends { Kind: string; }>(
	p: BasicFun<v, Promise<syncResult>>, errorProcessor: BasicFun<any, ErrorPermanence>,
	maxAttempts: number, delayBetweenAttemptsInMs: number):
	Coroutine<Synchronized<v, syncResult>, Synchronized<v, syncResult>, event, ApiResultStatus> => {
	const Co = CoTypedFactory<Unit, Synchronized<v, syncResult>, event>();
	return Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoading())).then(() =>
		Co.GetState().then(current =>
			Co.Await(() => p(current as v), errorProcessor).then(apiResult =>
				(apiResult.kind == "l") ?
					Co.SetState(Synchronized.Updaters.sync(AsyncState.Updaters.toLoaded(apiResult.value))).then(() => Co.Return<ApiResultStatus>("success"))
					: (apiResult.value == "transient" && maxAttempts > 0) ?
						Co.Wait(delayBetweenAttemptsInMs).then(() => Synchronize(p, errorProcessor, maxAttempts - 1, delayBetweenAttemptsInMs))
						: Co.Return<ApiResultStatus>("permanent failure")
			)
		)
	)
};
