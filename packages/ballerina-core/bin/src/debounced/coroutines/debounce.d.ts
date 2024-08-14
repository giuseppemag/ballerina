import { ApiResultStatus } from "../../apiResultStatus/state";
import { Coroutine } from "../../coroutines/state";
import { Unit } from "../../fun/domains/unit/state";
import { Debounced, DebouncedStatus, DirtyStatus } from "../state";
export declare const Debounce: <value>(k: Coroutine<value, value, ApiResultStatus>, debounceDurationInMs: number, waitBeforeRetryOnTransientFailure?: number) => Coroutine<value & {
    lastUpdated: number;
    dirty: DirtyStatus;
    status: DebouncedStatus;
}, Debounced<value>, Unit>;
//# sourceMappingURL=debounce.d.ts.map