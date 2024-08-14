import { OrderedMap } from "immutable";
import { Guid, Unit, SynchronizationResult } from "@core";
import { Coroutine } from "../coroutines/state";
import { BasicFun } from "../fun/state";
export declare const QueueCoroutine: <Context, State>(removeItem: BasicFun<Guid, Coroutine<Context & State, State, Unit>>, getItemsToProcess: BasicFun<Context & State, OrderedMap<Guid, {
    preprocess: Coroutine<Context & State, State, Unit>;
    operation: Coroutine<Context & State, State, SynchronizationResult>;
    postprocess: BasicFun<SynchronizationResult, Coroutine<Context & State, State, Unit>>;
    reenqueue: Coroutine<Context & State, State, Unit>;
}>>) => Coroutine<Context & State, State, Unit>;
//# sourceMappingURL=state.d.ts.map