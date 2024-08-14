import { Map, OrderedMap } from "immutable";
import { Sum } from "../collections/domains/sum/state";
import { id } from "../fun/domains/id/state";
import { Fun } from "../fun/state";
const callMaybe = (f) => x => x == undefined ? undefined : f(x);
const thenMaybe = (f, g) => f == undefined ? g : g == undefined ? f : (x => g(f(x)));
export const Coroutine = {
    Create: (p) => {
        const co = p;
        // co.map = function <nextResult>(
        //   f: Fun<result, nextResult>
        // ): Coroutine<context, state, nextResult> {
        //   return Coroutine.Map(this, f);
        // };
        // co.mapState = function (
        //   f: Fun<Updater<state> | undefined, Updater<state> | undefined>
        // ): Coroutine<context, state, result> {
        //   return Coroutine.MapState(this, f);
        // };
        co.embed = function (narrow, widen) {
            return Coroutine.Embed(this, narrow, widen);
        };
        co.then = function (f) {
            // return Coroutine.Join(Coroutine.Map(this, f));
            return Coroutine.Create((_) => CoroutineStep.Then(undefined, this, f));
        };
        co.seq = function (f) {
            return this.then(() => f);
        };
        return co;
    },
    UpdateState: (stateUpdater) => Coroutine.Create(([__, _]) => CoroutineStep.Result((state) => stateUpdater(state)(state), {})),
    SetState: (stateUpdater) => Coroutine.Yield(Coroutine.Create(([__, _]) => CoroutineStep.Result(stateUpdater, {}))),
    GetState: () => Coroutine.Create(([context, __]) => CoroutineStep.Result(undefined, context)),
    Start: () => Coroutine.Create(([__, _]) => CoroutineStep.Result(undefined, {})),
    Return: (result) => Coroutine.Create(([__, _]) => CoroutineStep.Result(undefined, result)),
    Yield: (next) => Coroutine.Create(([__, _]) => CoroutineStep.Yield(undefined, next)),
    Waiting: (msLeft, next) => Coroutine.Create(([__, _]) => CoroutineStep.Waiting(undefined, msLeft, next)),
    // Map: <context, state, result1, result2>(
    //   p: Coroutine<context, state, result1>,
    //   f: Fun<result1, result2>
    // ): Coroutine<context, state, result2> =>
    //   Coroutine.Create((state) => CoroutineStep.Map(p(state), f)),
    MapContext: (p, narrow) => Coroutine.Create(([parentContext, deltaT]) => {
        const childContext = narrow(parentContext);
        if (childContext != undefined)
            return CoroutineStep.MapContext(p([childContext, deltaT]), narrow);
        return CoroutineStep.Yield(undefined, Coroutine.MapContext(p, narrow));
    }),
    Embed: (p, narrow, widen) => Coroutine.Create(([parentContext, deltaT]) => {
        const childContext = narrow(parentContext);
        if (childContext != undefined)
            return CoroutineStep.Embed(p([childContext, deltaT]), narrow, widen);
        return CoroutineStep.Yield(undefined, Coroutine.Embed(p, narrow, widen));
    }),
    MapState: (p, f) => Coroutine.Create((state) => CoroutineStep.MapState(p(state), f)),
    // Join: <context, state, result>(
    //   p: Coroutine<context, state, Coroutine<context, state, result>>
    // ): Coroutine<context, state, result> =>
    //   Coroutine.Create<context, state, result>(([state, deltaT]) => {
    //     const step = p([state, deltaT]);
    //     if (step.kind == "result")
    //       return CoroutineStep.MapState(step
    //         .result([(step.newState || id)(state), deltaT]),
    //         (_) =>
    //           _ == undefined
    //             ? step.newState
    //             : step.newState == undefined
    //               ? _
    //               : then(step.newState, _)
    //         );
    //     if (step.kind == "yield")
    //       return CoroutineStep.Yield(step.newState, Coroutine.Join(step.next));
    //     if (step.kind == "waiting") {
    //       return CoroutineStep.Waiting(
    //         step.newState,
    //         step.msLeft,
    //         Coroutine.Join(step.next)
    //       );
    //     }
    //     return CoroutineStep.WaitingForEvent(step.newState, (e) => {
    //       const next = step.next(e);
    //       return next == "no match" ? next : Coroutine.Join(next);
    //     });
    //   }),
    Tick: (context, p, deltaT) => {
        // debugger
        const step = p([context, deltaT]);
        if (step.kind == "result")
            return { kind: "done", state: step.newState, result: step.result };
        if (step.kind == "yield")
            return { kind: "continuing", state: step.newState, next: step.next };
        if (step.kind == "waiting" && step.msLeft <= deltaT)
            return { kind: "continuing", state: step.newState, next: step.next };
        if (step.kind == "waiting")
            return {
                kind: "continuing",
                state: step.newState,
                next: Coroutine.Waiting(step.msLeft - deltaT, step.next),
            };
        const next = Coroutine.Tick(context, step.p, deltaT);
        if (next.kind == "done")
            return {
                kind: "continuing",
                state: thenMaybe(step.newState, next.state),
                next: step.k(next.result),
            };
        else
            return {
                kind: "continuing",
                state: next.state,
                next: next.next.then(step.k),
            };
    },
    Nothing: () => Coroutine.Create(([__, _]) => CoroutineStep.Yield(undefined, Coroutine.Nothing())),
    Any: (ps) => Coroutine.Create(([context, deltaT]) => {
        const ps1 = [];
        let nextState = undefined;
        for (const p of ps) {
            const step = Coroutine.Tick(context, p, deltaT);
            nextState = thenMaybe(nextState, step.state);
            if (step.kind == "done")
                return CoroutineStep.Result(nextState, step.result);
            else {
                if (step.excludeOthers) {
                    console.log(`exclude others detected, killing ${ps.length - 1} other coroutines`);
                    return CoroutineStep.MapState(step.next([context, deltaT]), ((_) => thenMaybe(nextState, _) || id));
                }
                else
                    ps1.push(step.next);
            }
        }
        return CoroutineStep.Yield(nextState, Coroutine.Any(ps1));
    }),
    All: (ps) => Coroutine.Create(([context, deltaT]) => {
        const ps1 = [];
        let nextState = undefined;
        let stillRunning = false;
        const results = [];
        for (const p of ps) {
            const step = Coroutine.Tick(context, p, deltaT);
            nextState = thenMaybe(nextState, step.state);
            if (step.kind == "done") {
                results.push(step.result);
                ps1.push(Coroutine.Return(step.result));
            }
            else {
                stillRunning = true;
                ps1.push(step.next);
            }
        }
        return stillRunning
            ? CoroutineStep.Yield(nextState, Coroutine.All(ps1))
            : CoroutineStep.Result(nextState, results);
    }),
    Repeat: (p) => p.then((_) => Coroutine.Yield(Coroutine.Repeat(p))),
    Seq: (ps) => ps.length <= 0
        ? Coroutine.Return({})
        : ps[0].then(() => Coroutine.Seq(ps.slice(1))),
    For: (collection, p) => collection.isEmpty() ? Coroutine.Return({})
        : Coroutine.Seq([
            p(collection.first()),
            Coroutine.For(collection.skip(1), p)
        ]),
    While: (predicate, p) => Coroutine.Create(([context, deltaT]) => {
        if (predicate([context])) {
            return p.then((_) => Coroutine.While(predicate, p))([context, deltaT]);
        }
        else
            return CoroutineStep.Result(undefined, {});
    }),
    Wait: (ms) => Coroutine.Waiting(ms, Coroutine.Return({})),
    Await: (promise, onCatch, debugName) => Coroutine.Create(([_, __]) => {
        let promiseResult = undefined;
        // const started = Date.now();
        // if (SharedLayoutConstants.LogCoroutineTicks)
        //   console.log(`co::await::launched ${debugName}`);
        setTimeout(() => promise({})
            .then((result) => {
            promiseResult = { kind: "resolve", result: result };
        })
            .catch((_) => {
            promiseResult = { kind: "reject", error: onCatch(_) };
        }));
        // if (SharedLayoutConstants.LogCoroutineTicks)
        //   console.log(
        //     `co::await::creating awaiter ${debugName} (deltaT = ${
        //       Date.now() - started
        //     })`
        //   );
        const awaiter = () => {
            // if (SharedLayoutConstants.LogCoroutineTicks)
            //   console.log(
            //     `co::await::checking awaiter ${debugName}`,
            //     promiseResult
            //   );
            return promiseResult == undefined
                ? CoroutineStep.Yield(undefined, Coroutine.Create(([_, __]) => awaiter()))
                : promiseResult.kind == "resolve"
                    ? CoroutineStep.Result(undefined, Sum().Default.left(promiseResult.result))
                    : CoroutineStep.Result(undefined, Sum().Default.right(promiseResult.error));
        };
        return CoroutineStep.Yield(undefined, Coroutine.Create(([_, __]) => awaiter()));
    }),
    On: (kind, filter) => Coroutine.GetState().then(context => {
        var _a, _b;
        // { inboundEvents:Map<InboundKindFromContext<c & s>, OrderedMap<Guid, InboundEventFromContext<c & s>>> }
        let inboundEvents = (_a = context.inboundEvents) !== null && _a !== void 0 ? _a : Map();
        let eventsOfKind = ((_b = context.inboundEvents) !== null && _b !== void 0 ? _b : Map()).get(kind);
        if (eventsOfKind == undefined || eventsOfKind.isEmpty()) {
            return Coroutine.Yield(Coroutine.On(kind, filter));
        }
        else {
            const firstEventOfKind = filter == undefined ? eventsOfKind === null || eventsOfKind === void 0 ? void 0 : eventsOfKind.first()
                : eventsOfKind.filter((e) => {
                    return filter([e, context]);
                }).first();
            if (firstEventOfKind == undefined) {
                return Coroutine.Yield(Coroutine.On(kind, filter));
            }
            eventsOfKind = eventsOfKind.remove(firstEventOfKind.id);
            if (eventsOfKind.isEmpty())
                inboundEvents = inboundEvents.remove(kind);
            else
                inboundEvents = inboundEvents.set(kind, eventsOfKind);
            return Coroutine.SetState(_ => (Object.assign(Object.assign({}, _), { inboundEvents: inboundEvents }))).then(() => Coroutine.Return(firstEventOfKind));
        }
    }),
    Trigger: (event) => Coroutine.SetState(_ => { var _a; return (Object.assign(Object.assign({}, _), { outboundEvents: _.outboundEvents.set(event.kind, ((_a = _.outboundEvents.get(event.kind)) !== null && _a !== void 0 ? _a : OrderedMap()).set(event.id, event)) })); }),
    Do: (action) => Coroutine.Create(([_, __]) => {
        action();
        return CoroutineStep.Yield(undefined, Coroutine.Return({}));
    })
};
export const CoroutineStep = {
    Result: (newState, result) => ({
        newState,
        kind: "result",
        result: result,
        // map: function <nextResult>(f: Fun<result, nextResult>) {
        //   return CoroutineStep.Map(this, f);
        // },
        // mapState: function (
        //   f: Fun<Updater<state> | undefined, Updater<state> | undefined>
        // ) {
        //   return CoroutineStep.MapState(this, f);
        // },
    }),
    Then: (newState, p, k) => ({
        kind: "then",
        newState: newState,
        p: p,
        k: k,
        // map: function <nextResult>(f: Fun<result, nextResult>) {
        //   return CoroutineStep.Map(this, f);
        // },
        // mapState: function (
        //   f: Fun<Updater<state> | undefined, Updater<state> | undefined>
        // ) {
        //   return CoroutineStep.MapState(this, f);
        // },
    }),
    Yield: (newState, next) => ({
        newState,
        kind: "yield",
        next: next,
        // map: function <nextResult>(f: Fun<result, nextResult>) {
        //   return CoroutineStep.Map(this, f);
        // },
        // mapState: function (
        //   f: Fun<Updater<state> | undefined, Updater<state> | undefined>
        // ) {
        //   return CoroutineStep.MapState(this, f);
        // },
    }),
    Waiting: (newState, msLeft, next) => ({
        newState,
        kind: "waiting",
        msLeft: msLeft,
        next: next,
        // map: function <nextResult>(f: Fun<result, nextResult>) {
        //   return CoroutineStep.Map(this, f);
        // },
        // mapState: function (
        //   f: Fun<Updater<state> | undefined, Updater<state> | undefined>
        // ) {
        //   return CoroutineStep.MapState(this, f);
        // },
    }),
    // Map: <context, state, result1, result2>(
    //   p: CoroutineStep<context, state, result1>,
    //   f: Fun<result1, result2>
    // ): CoroutineStep<context, state, result2> =>
    //   p.kind == "result"
    //     ? CoroutineStep.Result(p.newState, f(p.result))
    //     : p.kind == "yield"
    //       ? CoroutineStep.Yield(p.newState, Coroutine.Map(p.next, f))
    //       : p.kind == "waiting"
    //         ? CoroutineStep.Waiting(p.newState, p.msLeft, Coroutine.Map(p.next, f))
    //         : CoroutineStep.WaitingForEvent(p.newState, (e) => {
    //             const next = p.next(e);
    //             return next == "no match" ? next : Coroutine.Map(next, f)
    //           }),
    MapContext: (p, narrow) => p.kind == "result"
        ? p
        : p.kind == "yield"
            ? CoroutineStep.Yield(p.newState, Coroutine.MapContext(p.next, narrow))
            : p.kind == "waiting"
                ? CoroutineStep.Waiting(p.newState, p.msLeft, Coroutine.MapContext(p.next, narrow))
                : CoroutineStep.Then(p.newState, Coroutine.MapContext(p.p, narrow), Fun(p.k).then((_) => Coroutine.MapContext(_, narrow))),
    MapState: (p, f) => p.kind == "result"
        ? CoroutineStep.Result(callMaybe(f)(p.newState), p.result)
        : p.kind == "yield"
            ? CoroutineStep.Yield(callMaybe(f)(p.newState), Coroutine.MapState(p.next, f))
            : p.kind == "waiting"
                ? CoroutineStep.Waiting(callMaybe(f)(p.newState), p.msLeft, Coroutine.MapState(p.next, f))
                : CoroutineStep.Then(callMaybe(f)(p.newState), Coroutine.MapState(p.p, f), Fun(p.k).then((_) => Coroutine.MapState(_, f))),
    Embed: (p, narrow, widen) => CoroutineStep.MapState(CoroutineStep.MapContext(p, narrow), widen)
};
//# sourceMappingURL=state.js.map