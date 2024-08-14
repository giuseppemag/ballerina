export declare const Co: {
    Seq: (ps: import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>[]) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    GetState: () => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("../state").Child2>;
    SetState: (stateUpdater: import("@ballerina/core").BasicUpdater<import("../state").Child2>) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    UpdateState: (stateUpdater: import("@ballerina/core").BasicFun<import("../state").Child2, import("@ballerina/core").BasicUpdater<import("../state").Child2>>) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    Any: (ps: import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>[]) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    All: <result>(ps: import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, result>[]) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, result[]>;
    Yield: (next: import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    Wait: (ms: number) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    Await: <r, err>(p: import("@ballerina/core").BasicFun<import("@ballerina/core").Unit, Promise<r>>, onErr: import("@ballerina/core").BasicFun<any, err>, debugName?: string) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Sum<r, err>>;
    Repeat: (p: import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    Return: <r>(res: r) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, r>;
    While: (predicate: import("@ballerina/core").BasicFun<[import("../state").Child2], boolean>, p: import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    For: <element>(collection: import("immutable").Collection<number, element>) => (p: import("@ballerina/core").BasicFun<element, import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>>) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
    Embed: <parentContext, parentState, result>(p: import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, result>, narrow: import("@ballerina/core").BasicFun<parentContext & parentState, import("../state").Child2>, widen: import("@ballerina/core").BasicFun<import("@ballerina/core").BasicUpdater<import("../state").Child2>, import("@ballerina/core").BasicUpdater<parentState>>) => import("@ballerina/core").Coroutine<parentContext & parentState, parentState, result>;
    Template: <fm>(initialCoroutine: import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>, options?: import("@ballerina/core").CoroutineComponentOptions<import("../state").Child2, import("../state").Child2> | undefined) => import("@ballerina/core").Template<import("../state").Child2, import("../state").Child2, fm>;
    Trigger: <event_1 extends {
        id: import("@ballerina/core").Guid;
        kind: kind;
    }, kind extends string>(event: event_1) => import("@ballerina/core").Coroutine<import("../state").Child2 & {
        outboundEvents: import("immutable").Map<kind, import("immutable").OrderedMap<string, event_1>>;
    }, import("../state").Child2 & {
        outboundEvents: import("immutable").Map<kind, import("immutable").OrderedMap<string, event_1>>;
    }, import("@ballerina/core").Unit>;
    Do: (action: import("@ballerina/core").SimpleCallback<void>) => import("@ballerina/core").Coroutine<import("../state").Child2, import("../state").Child2, import("@ballerina/core").Unit>;
};
//# sourceMappingURL=builder.d.ts.map