import { ErrorPermanenceStatus, ApiResultStatus } from "@/src/apiResultStatus/state";
import { Coroutine } from "@/src/coroutines/state";
import { BasicUpdater } from "@/src/fun/domains/updater/state";
import { BasicFun } from "@/src/fun/state";
import { Synchronized } from "../state";
export declare const Synchronize: <value, syncResult>(p: BasicFun<value, Promise<syncResult>>, errorProcessor: BasicFun<any, ErrorPermanenceStatus>, maxAttempts: number, delayBetweenAttemptsInMs: number) => Coroutine<Synchronized<value, syncResult>, Synchronized<value, syncResult>, ApiResultStatus>;
export declare const SynchronizeWithValueUpdater: <value, syncResult>(p: BasicFun<value, Promise<[syncResult, BasicUpdater<value>]>>, errorProcessor: BasicFun<any, ErrorPermanenceStatus>, maxAttempts: number, delayBetweenAttemptsInMs: number) => Coroutine<Synchronized<value, syncResult>, Synchronized<value, syncResult>, ApiResultStatus>;
//# sourceMappingURL=synchronize.d.ts.map