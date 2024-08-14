import { Unit } from "@ballerina/core";
import { Child1 } from "../state";
export declare const Co: {
    Seq: (ps: import("@ballerina/core").Coroutine<Child1, Child1, Unit>[]) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    GetState: () => import("@ballerina/core").Coroutine<Child1, Child1, Child1>;
    SetState: (stateUpdater: import("@ballerina/core").BasicUpdater<Child1>) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    UpdateState: (stateUpdater: import("@ballerina/core").BasicFun<Child1, import("@ballerina/core").BasicUpdater<Child1>>) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    Any: (ps: import("@ballerina/core").Coroutine<Child1, Child1, Unit>[]) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    All: <result>(ps: import("@ballerina/core").Coroutine<Child1, Child1, result>[]) => import("@ballerina/core").Coroutine<Child1, Child1, result[]>;
    Yield: (next: import("@ballerina/core").Coroutine<Child1, Child1, Unit>) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    Wait: (ms: number) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    Await: <r, err>(p: import("@ballerina/core").BasicFun<Unit, Promise<r>>, onErr: import("@ballerina/core").BasicFun<any, err>, debugName?: string) => import("@ballerina/core").Coroutine<Child1, Child1, import("@ballerina/core").Sum<r, err>>;
    Repeat: (p: import("@ballerina/core").Coroutine<Child1, Child1, Unit>) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    Return: <r>(res: r) => import("@ballerina/core").Coroutine<Child1, Child1, r>;
    While: (predicate: import("@ballerina/core").BasicFun<[Child1], boolean>, p: import("@ballerina/core").Coroutine<Child1, Child1, Unit>) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    For: <element>(collection: import("immutable").Collection<number, element>) => (p: import("@ballerina/core").BasicFun<element, import("@ballerina/core").Coroutine<Child1, Child1, Unit>>) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
    Embed: <parentContext, parentState, result>(p: import("@ballerina/core").Coroutine<Child1, Child1, result>, narrow: import("@ballerina/core").BasicFun<parentContext & parentState, Child1>, widen: import("@ballerina/core").BasicFun<import("@ballerina/core").BasicUpdater<Child1>, import("@ballerina/core").BasicUpdater<parentState>>) => import("@ballerina/core").Coroutine<parentContext & parentState, parentState, result>;
    Template: <fm>(initialCoroutine: import("@ballerina/core").Coroutine<Child1, Child1, Unit>, options?: import("@ballerina/core").CoroutineComponentOptions<Child1, Child1> | undefined) => import("@ballerina/core").Template<Child1, Child1, fm>;
    Trigger: <event_1 extends {
        id: import("@ballerina/core").Guid;
        kind: kind;
    }, kind extends string>(event: event_1) => import("@ballerina/core").Coroutine<Child1 & {
        outboundEvents: import("immutable").Map<kind, import("immutable").OrderedMap<string, event_1>>;
    }, Child1 & {
        outboundEvents: import("immutable").Map<kind, import("immutable").OrderedMap<string, event_1>>;
    }, Unit>;
    Do: (action: import("@ballerina/core").SimpleCallback<void>) => import("@ballerina/core").Coroutine<Child1, Child1, Unit>;
};
//# sourceMappingURL=builder.d.ts.map