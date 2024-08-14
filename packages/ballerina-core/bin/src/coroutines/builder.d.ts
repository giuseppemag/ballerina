import { Map, Collection, OrderedMap } from "immutable";
import { Unit } from "../fun/domains/unit/state";
import { BasicUpdater } from "../fun/domains/updater/state";
import { BasicFun } from "../fun/state";
import { Template } from "../template/state";
import { Coroutine, InboundEventFromContext, InboundKindFromContext } from "./state";
import { CoroutineComponentOptions } from "./template";
import { Guid } from "../baseEntity/domains/identifiable/state";
import { SimpleCallback } from "../fun/domains/simpleCallback/state";
export declare const CoTypedFactory: (<c, s>() => {
    Seq: (ps: Coroutine<c & s, s, Unit>[]) => Coroutine<c & s, s, Unit>;
    GetState: () => Coroutine<c & s, s, c & s>;
    SetState: (stateUpdater: BasicUpdater<s>) => Coroutine<c & s, s, Unit>;
    UpdateState: (stateUpdater: BasicFun<s, BasicUpdater<s>>) => Coroutine<c & s, s, Unit>;
    Any: (ps: Coroutine<c & s, s, Unit>[]) => Coroutine<c & s, s, Unit>;
    All: <result>(ps: Array<Coroutine<c & s, s, result>>) => Coroutine<c & s, s, result[]>;
    Yield: (next: Coroutine<c & s, s, Unit>) => Coroutine<c & s, s, Unit>;
    Wait: (ms: number) => Coroutine<c & s, s, Unit>;
    Await: <r, err>(p: BasicFun<Unit, Promise<r>>, onErr: BasicFun<any, err>, debugName?: string) => Coroutine<c & s, s, import("../..").Sum<r, err>>;
    Repeat: (p: Coroutine<c & s, s, Unit>) => Coroutine<c & s, s, Unit>;
    Return: <r>(res: r) => Coroutine<c & s, s, r>;
    While: (predicate: BasicFun<[c & s], boolean>, p: Coroutine<c & s, s, Unit>) => Coroutine<c & s, s, Unit>;
    For: <element>(collection: Collection<number, element>) => (p: BasicFun<element, Coroutine<c & s, s, Unit>>) => Coroutine<c & s, s, Unit>;
    Embed: <parentContext, parentState, result>(p: Coroutine<c & s, s, result>, narrow: BasicFun<parentContext & parentState, c & s>, widen: BasicFun<BasicUpdater<s>, BasicUpdater<parentState>>) => Coroutine<parentContext & parentState, parentState, result>;
    Template: <fm>(initialCoroutine: Coroutine<c & s, s, Unit>, options?: CoroutineComponentOptions<c & s, s>) => Template<c & s, s, fm>;
    Trigger: <event extends {
        id: Guid;
        kind: kind;
    }, kind extends string>(event: event) => Coroutine<c & s & {
        outboundEvents: Map<kind, OrderedMap<Guid, event>>;
    }, s & {
        outboundEvents: Map<kind, OrderedMap<Guid, event>>;
    }, Unit>;
    Do: (action: SimpleCallback<void>) => Coroutine<c & s, s, Unit>;
}) & {
    withOn: <eventKind, event, c, s extends {
        inboundEvents: Map<eventKind, OrderedMap<Guid, event>>;
    }>() => {
        On: <matchedEvent extends InboundKindFromContext<c & s>>(kind: matchedEvent, filter?: BasicFun<[InboundEventFromContext<c & s> & {
            kind: matchedEvent;
        }, c & s], boolean>) => Coroutine<c & s, s, InboundEventFromContext<c & s> & {
            kind: matchedEvent;
        }>;
        Seq: (ps: Coroutine<c & s, s, Unit>[]) => Coroutine<c & s, s, Unit>;
        GetState: () => Coroutine<c & s, s, c & s>;
        SetState: (stateUpdater: BasicUpdater<s>) => Coroutine<c & s, s, Unit>;
        UpdateState: (stateUpdater: BasicFun<s, BasicUpdater<s>>) => Coroutine<c & s, s, Unit>;
        Any: (ps: Coroutine<c & s, s, Unit>[]) => Coroutine<c & s, s, Unit>;
        All: <result>(ps: Coroutine<c & s, s, result>[]) => Coroutine<c & s, s, result[]>;
        Yield: (next: Coroutine<c & s, s, Unit>) => Coroutine<c & s, s, Unit>;
        Wait: (ms: number) => Coroutine<c & s, s, Unit>;
        Await: <r, err>(p: BasicFun<Unit, Promise<r>>, onErr: BasicFun<any, err>, debugName?: string) => Coroutine<c & s, s, import("../..").Sum<r, err>>;
        Repeat: (p: Coroutine<c & s, s, Unit>) => Coroutine<c & s, s, Unit>;
        Return: <r>(res: r) => Coroutine<c & s, s, r>;
        While: (predicate: BasicFun<[c & s], boolean>, p: Coroutine<c & s, s, Unit>) => Coroutine<c & s, s, Unit>;
        For: <element>(collection: Collection<number, element>) => (p: BasicFun<element, Coroutine<c & s, s, Unit>>) => Coroutine<c & s, s, Unit>;
        Embed: <parentContext, parentState, result>(p: Coroutine<c & s, s, result>, narrow: BasicFun<parentContext & parentState, c & s>, widen: BasicFun<BasicUpdater<s>, BasicUpdater<parentState>>) => Coroutine<parentContext & parentState, parentState, result>;
        Template: <fm>(initialCoroutine: Coroutine<c & s, s, Unit>, options?: CoroutineComponentOptions<c & s, s> | undefined) => Template<c & s, s, fm>;
        Trigger: <event_1 extends {
            id: Guid;
            kind: kind;
        }, kind extends string>(event: event_1) => Coroutine<c & s & {
            outboundEvents: Map<kind, OrderedMap<string, event_1>>;
        }, s & {
            outboundEvents: Map<kind, OrderedMap<string, event_1>>;
        }, Unit>;
        Do: (action: SimpleCallback<void>) => Coroutine<c & s, s, Unit>;
    };
};
//# sourceMappingURL=builder.d.ts.map