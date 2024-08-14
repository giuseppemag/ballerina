export declare const Co: {
    Seq: (ps: import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>[]) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    GetState: () => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("../state").Uncle>;
    SetState: (stateUpdater: import("@ballerina/core").BasicUpdater<import("../state").Uncle>) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    UpdateState: (stateUpdater: import("@ballerina/core").BasicFun<import("../state").Uncle, import("@ballerina/core").BasicUpdater<import("../state").Uncle>>) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    Any: (ps: import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>[]) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    All: <result>(ps: import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, result>[]) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, result[]>;
    Yield: (next: import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    Wait: (ms: number) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    Await: <r, err>(p: import("@ballerina/core").BasicFun<import("@ballerina/core").Unit, Promise<r>>, onErr: import("@ballerina/core").BasicFun<any, err>, debugName?: string) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Sum<r, err>>;
    Repeat: (p: import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    Return: <r>(res: r) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, r>;
    While: (predicate: import("@ballerina/core").BasicFun<[import("../state").Uncle], boolean>, p: import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    For: <element>(collection: import("immutable").Collection<number, element>) => (p: import("@ballerina/core").BasicFun<element, import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>>) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
    Embed: <parentContext, parentState, result>(p: import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, result>, narrow: import("@ballerina/core").BasicFun<parentContext & parentState, import("../state").Uncle>, widen: import("@ballerina/core").BasicFun<import("@ballerina/core").BasicUpdater<import("../state").Uncle>, import("@ballerina/core").BasicUpdater<parentState>>) => import("@ballerina/core").Coroutine<parentContext & parentState, parentState, result>;
    Template: <fm>(initialCoroutine: import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>, options?: import("@ballerina/core").CoroutineComponentOptions<import("../state").Uncle, import("../state").Uncle> | undefined) => import("@ballerina/core").Template<import("../state").Uncle, import("../state").Uncle, fm>;
    Trigger: <event_1 extends {
        id: import("@ballerina/core").Guid;
        kind: kind;
    }, kind extends string>(event: event_1) => import("@ballerina/core").Coroutine<import("../state").Uncle & {
        outboundEvents: import("immutable").Map<kind, import("immutable").OrderedMap<string, event_1>>;
    }, import("../state").Uncle & {
        outboundEvents: import("immutable").Map<kind, import("immutable").OrderedMap<string, event_1>>;
    }, import("@ballerina/core").Unit>;
    Do: (action: import("@ballerina/core").SimpleCallback<void>) => import("@ballerina/core").Coroutine<import("../state").Uncle, import("../state").Uncle, import("@ballerina/core").Unit>;
};
//# sourceMappingURL=builder.d.ts.map