import { InfiniteStreamWritableState } from "../state";
export declare const StreamCo: <Element extends {
    id: string;
}>() => {
    Seq: (ps: import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>[]) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    GetState: () => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>>;
    SetState: (stateUpdater: import("../../..").BasicUpdater<InfiniteStreamWritableState<Element>>) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    UpdateState: (stateUpdater: import("../../..").BasicFun<InfiniteStreamWritableState<Element>, import("../../..").BasicUpdater<InfiniteStreamWritableState<Element>>>) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    Any: (ps: import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>[]) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    All: <result>(ps: import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, result>[]) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, result[]>;
    Yield: (next: import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    Wait: (ms: number) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    Await: <r, err>(p: import("../../..").BasicFun<import("../../..").Unit, Promise<r>>, onErr: import("../../..").BasicFun<any, err>, debugName?: string) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Sum<r, err>>;
    Repeat: (p: import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    Return: <r>(res: r) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, r>;
    While: (predicate: import("../../..").BasicFun<[InfiniteStreamWritableState<Element>], boolean>, p: import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    For: <element>(collection: import("immutable").Collection<number, element>) => (p: import("../../..").BasicFun<element, import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>>) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
    Embed: <parentContext, parentState, result>(p: import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, result>, narrow: import("../../..").BasicFun<parentContext & parentState, InfiniteStreamWritableState<Element>>, widen: import("../../..").BasicFun<import("../../..").BasicUpdater<InfiniteStreamWritableState<Element>>, import("../../..").BasicUpdater<parentState>>) => import("../../..").Coroutine<parentContext & parentState, parentState, result>;
    Template: <fm>(initialCoroutine: import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>, options?: import("../../..").CoroutineComponentOptions<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>> | undefined) => import("../../..").Template<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, fm>;
    Trigger: <event_1 extends {
        id: import("../../..").Guid;
        kind: kind;
    }, kind extends string>(event: event_1) => import("../../..").Coroutine<InfiniteStreamWritableState<Element> & {
        outboundEvents: import("immutable").Map<kind, import("immutable").OrderedMap<string, event_1>>;
    }, InfiniteStreamWritableState<Element> & {
        outboundEvents: import("immutable").Map<kind, import("immutable").OrderedMap<string, event_1>>;
    }, import("../../..").Unit>;
    Do: (action: import("../../..").SimpleCallback<void>) => import("../../..").Coroutine<InfiniteStreamWritableState<Element>, InfiniteStreamWritableState<Element>, import("../../..").Unit>;
};
//# sourceMappingURL=builder.d.ts.map