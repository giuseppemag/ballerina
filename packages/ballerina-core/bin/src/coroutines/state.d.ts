import { Map, Collection, OrderedMap } from "immutable";
import { Sum } from "../collections/domains/sum/state";
import { Unit } from "../fun/domains/unit/state";
import { BasicUpdater } from "../fun/domains/updater/state";
import { BasicFun } from "../fun/state";
import { Guid, SimpleCallback } from "@core";
export type DeltaT = number;
export type Coroutine<context, state, result> = {
    ([context, deltaT]: [context, DeltaT]): CoroutineStep<context, state, result>;
    embed: <parentContext, parentState>(narrow: BasicFun<parentContext, context | undefined>, widen: BasicFun<BasicUpdater<state>, BasicUpdater<parentState>>) => Coroutine<parentContext, parentState, result>;
    then: <nextResult>(f: BasicFun<result, Coroutine<context, state, nextResult>>) => Coroutine<context, state, nextResult>;
    seq: <nextResult>(k: Coroutine<context, state, nextResult>) => Coroutine<context, state, nextResult>;
};
export declare const Coroutine: {
    Create: <context, state, result>(p: BasicFun<[context, DeltaT], CoroutineStep<context, state, result>>) => Coroutine<context, state, result>;
    UpdateState: <context, state>(stateUpdater: BasicFun<state, BasicUpdater<state>>) => Coroutine<context, state, Unit>;
    SetState: <context, state>(stateUpdater: BasicUpdater<state>) => Coroutine<context, state, Unit>;
    GetState: <context, state>() => Coroutine<context, state, context>;
    Start: <context, state>() => Coroutine<context, state, Unit>;
    Return: <context, state, result>(result: result) => Coroutine<context, state, result>;
    Yield: <context, state, result>(next: Coroutine<context, state, result>) => Coroutine<context, state, result>;
    Waiting: <context, state, result>(msLeft: number, next: Coroutine<context, state, result>) => Coroutine<context, state, result>;
    MapContext: <childContext, result, parentContext, state>(p: Coroutine<childContext, state, result>, narrow: BasicFun<parentContext, childContext | undefined>) => Coroutine<parentContext, state, result>;
    Embed: <childContext, childState, result, parentContext, parentState>(p: Coroutine<childContext, childState, result>, narrow: BasicFun<parentContext, childContext | undefined>, widen: BasicFun<BasicUpdater<childState>, BasicUpdater<parentState>>) => Coroutine<parentContext, parentState, result>;
    MapState: <context, state, newState, result>(p: Coroutine<context, state, result>, f: BasicFun<BasicUpdater<state>, BasicUpdater<newState>>) => Coroutine<context, newState, result>;
    Tick: <context, state, result>(context: context, p: Coroutine<context, state, result>, deltaT: number) => {
        kind: "continuing";
        excludeOthers?: true;
        state: BasicUpdater<state> | undefined;
        next: Coroutine<context, state, result>;
    } | {
        kind: "done";
        state: BasicUpdater<state> | undefined;
        result: result;
    };
    Nothing: <context, state, result>() => Coroutine<context, state, result>;
    Any: <context, state, result>(ps: Array<Coroutine<context, state, result>>) => Coroutine<context, state, result>;
    All: <context, state, result>(ps: Array<Coroutine<context, state, result>>) => Coroutine<context, state, Array<result>>;
    Repeat: <context, state>(p: Coroutine<context, state, Unit>) => Coroutine<context, state, Unit>;
    Seq: <context, state>(ps: Array<Coroutine<context, state, Unit>>) => Coroutine<context, state, Unit>;
    For: <context, state, element>(collection: Collection<number, element>, p: BasicFun<element, Coroutine<context, state, Unit>>) => Coroutine<context, state, Unit>;
    While: <context, state>(predicate: BasicFun<[context], boolean>, p: Coroutine<context, state, Unit>) => Coroutine<context, state, Unit>;
    Wait: <context, state>(ms: number) => Coroutine<context, state, Unit>;
    Await: <context, state, result, error>(promise: BasicFun<Unit, Promise<result>>, onCatch: BasicFun<any, error>, debugName?: string) => Coroutine<context, state, Sum<result, error>>;
    On: <eventKind, event, context extends {
        inboundEvents: Map<eventKind, OrderedMap<Guid, event>>;
    }, state extends {
        inboundEvents: Map<eventKind, OrderedMap<Guid, event>>;
    }, matchedEvent extends InboundKindFromContext<context>>(kind: matchedEvent, filter?: BasicFun<[InboundEventFromContext<context & state> & {
        kind: matchedEvent;
    }, context & state], boolean>) => Coroutine<context & state, state, InboundEventFromContext<context & state> & {
        kind: matchedEvent;
    }>;
    Trigger: <context, state extends {
        outboundEvents: Map<kind, OrderedMap<Guid, event>>;
    }, event extends {
        id: Guid;
        kind: kind;
    }, kind extends string>(event: event) => Coroutine<context & state, state, Unit>;
    Do: <context, state>(action: SimpleCallback<void>) => Coroutine<context, state, Unit>;
};
export type CoroutineStep<context, state, result> = {
    newState: BasicUpdater<state> | undefined;
} & ({
    kind: "result";
    result: result;
} | {
    kind: "then";
    p: Coroutine<context, state, any>;
    k: BasicFun<any, Coroutine<context, state, result>>;
} | {
    kind: "yield";
    next: Coroutine<context, state, result>;
} | {
    kind: "waiting";
    msLeft: number;
    next: Coroutine<context, state, result>;
}) & {};
export declare const CoroutineStep: {
    Result: <context, state, result>(newState: BasicUpdater<state> | undefined, result: result) => CoroutineStep<context, state, result>;
    Then: <context, state, result>(newState: BasicUpdater<state> | undefined, p: Coroutine<context, state, any>, k: BasicFun<any, Coroutine<context, state, result>>) => CoroutineStep<context, state, result>;
    Yield: <context, state, result>(newState: BasicUpdater<state> | undefined, next: Coroutine<context, state, result>) => CoroutineStep<context, state, result>;
    Waiting: <context, state, result>(newState: BasicUpdater<state> | undefined, msLeft: number, next: Coroutine<context, state, result>) => CoroutineStep<context, state, result>;
    MapContext: <childContext, parentContext, state, result>(p: CoroutineStep<childContext, state, result>, narrow: BasicFun<parentContext, childContext | undefined>) => CoroutineStep<parentContext, state, result>;
    MapState: <context, state, newState, result>(p: CoroutineStep<context, state, result>, f: BasicFun<BasicUpdater<state>, BasicUpdater<newState>>) => CoroutineStep<context, newState, result>;
    Embed: <childContext, childState, result, parentContext, parentState>(p: CoroutineStep<childContext, childState, result>, narrow: BasicFun<parentContext, childContext | undefined>, widen: BasicFun<BasicUpdater<childState>, BasicUpdater<parentState>>) => CoroutineStep<parentContext, parentState, result>;
};
export type InboundEventFromContext<s> = s extends {
    inboundEvents: Map<infer _kind, OrderedMap<Guid, infer event>>;
} ? event : never;
export type InboundKindFromContext<s> = s extends {
    inboundEvents: Map<infer kind, OrderedMap<Guid, infer _event>>;
} ? kind : never;
//# sourceMappingURL=state.d.ts.map