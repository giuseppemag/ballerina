import { SharedLayoutConstants } from "../../../../../to process/Shared/Layout/SharedLayoutConstants";
import { Sum } from "../collections/domains/sum/state";
import { id } from "../fun/domains/id/state";
import { Unit } from "../fun/domains/unit/state";
import { BasicUpdater } from "../fun/domains/updater/state";
import { BasicFun, Fun } from "../fun/state";
export type DeltaT = number;
export type Coroutine<context, state, events, result> = {
  ([context, deltaT, events]: [context, DeltaT, Array<events>]): CoroutineStep<
    context,
    state,
    events,
    result
  >;
  // map: <nextResult>(
  //   f: Fun<result, nextResult>
  // ) => Coroutine<context, state, events, nextResult>;
  // mapState: (
  //   f: Fun<Updater<state> | undefined, Updater<state> | undefined>
  // ) => Coroutine<context, state, events, result>;
  then: <nextResult>(
    f: BasicFun<result, Coroutine<context, state, events, nextResult>>
  ) => Coroutine<context, state, events, nextResult>;
  seq: <nextResult>(
    k: Coroutine<context, state, events, nextResult>
  ) => Coroutine<context, state, events, nextResult>;
};

const callMaybe = <a,b>(f:BasicFun<BasicUpdater<a>,BasicUpdater<b>>) : BasicFun<BasicUpdater<a> | undefined,BasicUpdater<b> | undefined> =>
    x => x == undefined ? undefined : f(x)

const thenMaybe = <state>(
  f: BasicUpdater<state> | undefined,
  g: BasicUpdater<state> | undefined
): BasicUpdater<state> | undefined =>
  f == undefined ? g : g == undefined ? f : (x => g(f(x)));

export const Coroutine = {
  Create: <context, state, events, result>(
    p: BasicFun<
      [context, DeltaT, Array<events>],
      CoroutineStep<context, state, events, result>
    >
  ): Coroutine<context, state, events, result> => {
    const co = p as unknown as Coroutine<context, state, events, result>;
    // co.map = function <nextResult>(
    //   f: Fun<result, nextResult>
    // ): Coroutine<context, state, events, nextResult> {
    //   return Coroutine.Map(this, f);
    // };
    // co.mapState = function (
    //   f: Fun<Updater<state> | undefined, Updater<state> | undefined>
    // ): Coroutine<context, state, events, result> {
    //   return Coroutine.MapState(this, f);
    // };
    co.then = function <nextResult>(
      f: BasicFun<result, Coroutine<context, state, events, nextResult>>
    ): Coroutine<context, state, events, nextResult> {
      // return Coroutine.Join(Coroutine.Map(this, f));
      return Coroutine.Create((_) => CoroutineStep.Then(undefined, this, f));
    };
    co.seq = function <nextResult>(
      f: Coroutine<context, state, events, nextResult>
    ): Coroutine<context, state, events, nextResult> {
      return this.then(() => f);
    };
    return co;
  },
  UpdateState: <context, state, events>(
    stateUpdater: BasicFun<state, BasicUpdater<state>>
  ): Coroutine<context, state, events, Unit> =>
    Coroutine.Create(([__, _]) =>
      CoroutineStep.Result((state) => stateUpdater(state)(state), {})
    ),
  SetState: <context, state, events>(
    stateUpdater: BasicUpdater<state>
  ): Coroutine<context, state, events, Unit> =>
    Coroutine.Yield(
      Coroutine.Create(([__, _]) => CoroutineStep.Result(stateUpdater, {}))
    ),
  GetState: <context, state, events>(): Coroutine<
    context,
    state,
    events,
    context
  > =>
    Coroutine.Create(([context, __, _]) =>
      CoroutineStep.Result(undefined, context)
    ),
  Start: <context, state, events>(): Coroutine<context, state, events, Unit> =>
    Coroutine.Create(([__, _]) => CoroutineStep.Result(undefined, {})),
  Return: <context, state, events, result>(
    result: result
  ): Coroutine<context, state, events, result> =>
    Coroutine.Create(([__, _]) => CoroutineStep.Result(undefined, result)),
  Yield: <context, state, events, result>(
    next: Coroutine<context, state, events, result>
  ): Coroutine<context, state, events, result> =>
    Coroutine.Create(([__, _]) => CoroutineStep.Yield(undefined, next)),
  Waiting: <context, state, events, result>(
    msLeft: number,
    next: Coroutine<context, state, events, result>
  ): Coroutine<context, state, events, result> =>
    Coroutine.Create(([__, _]) =>
      CoroutineStep.Waiting(undefined, msLeft, next)
    ),
  WaitingForEvent: <context, state, events, result>(
    next: CoroutineEventProcessor<context, state, events, result>
  ): Coroutine<context, state, events, result> =>
    Coroutine.Create(([__, _]) =>
      CoroutineStep.WaitingForEvent(undefined, next)
    ),
  // Map: <context, state, events, result1, result2>(
  //   p: Coroutine<context, state, events, result1>,
  //   f: Fun<result1, result2>
  // ): Coroutine<context, state, events, result2> =>
  //   Coroutine.Create((state) => CoroutineStep.Map(p(state), f)),
  MapContext: <childContext, result, parentContext, state, events>(
    p: Coroutine<childContext, state, events, result>,
    narrow:BasicFun<parentContext, childContext>,
  ): Coroutine<parentContext, state, events, result> =>
    Coroutine.Create(([parentContext, deltaT, events]) => 
      CoroutineStep.MapContext(p([narrow(parentContext), deltaT, events]), narrow)
    ),
  Embed: <childContext, childState, result, parentContext, parentState, events>(
    p: Coroutine<childContext, childState, events, result>,
    narrow:BasicFun<parentContext, childContext>,
    widen:BasicFun<BasicUpdater<childState>,BasicUpdater<parentState>>
  ): Coroutine<parentContext, parentState, events, result> =>
    Coroutine.Create(([parentContext, deltaT, events]) => {
      return CoroutineStep.Embed(p([narrow(parentContext), deltaT, events]), narrow, widen)
    }),
  MapState: <context, state, newState, events, result>(
    p: Coroutine<context, state, events, result>,
    f: BasicFun<
      BasicUpdater<state>,
      BasicUpdater<newState>
    >
  ): Coroutine<context, newState, events, result> =>
    Coroutine.Create((state) => CoroutineStep.MapState(p(state), f)),
  // Join: <context, state, events, result>(
  //   p: Coroutine<context, state, events, Coroutine<context, state, events, result>>
  // ): Coroutine<context, state, events, result> =>
  //   Coroutine.Create<context, state, events, result>(([state, deltaT, events]) => {
  //     const step = p([state, deltaT, events]);
  //     if (step.kind == "result")
  //       return CoroutineStep.MapState(step
  //         .result([(step.newState || id)(state), deltaT, events]),
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
  Tick: <context, state, events, result>(
    context: context,
    events: Array<events>,
    p: Coroutine<context, state, events, result>,
    deltaT: number
  ):
    | {
        kind: "continuing";
        excludeOthers?: true;
        state: BasicUpdater<state> | undefined;
        next: Coroutine<context, state, events, result>;
      }
    | {
        kind: "done";
        state: BasicUpdater<state> | undefined;
        result: result;
      } => {
    // debugger
    const step = p([context, deltaT, events]);
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
    if (step.kind == "then") {
      const next = Coroutine.Tick(context, events, step.p, deltaT);
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
    }
    if (events.length == 0)
      return {
        kind: "continuing",
        state: step.newState,
        next: Coroutine.WaitingForEvent(step.next),
      };
    const next = step.next(events);
    if (next == "no match")
      return {
        kind: "continuing",
        state: step.newState,
        next: Coroutine.WaitingForEvent(step.next),
      };
    return { kind: "continuing", state: step.newState, next: next };
  },
  Nothing: <context, state, events, result>(): Coroutine<
    context,
    state,
    events,
    result
  > =>
    Coroutine.Create(([__, _]) =>
      CoroutineStep.Yield(undefined, Coroutine.Nothing())
    ),
  Any: <context, state, events, result>(
    ps: Array<Coroutine<context, state, events, result>>
  ): Coroutine<context, state, events, result> =>
    Coroutine.Create(([context, deltaT, events]) => {
      const ps1: Array<Coroutine<context, state, events, result>> = [];
      let nextState: BasicUpdater<state> | undefined = undefined;
      for (const p of ps) {
        const step = Coroutine.Tick(context, events, p, deltaT);
        nextState = thenMaybe(nextState, step.state);
        if (step.kind == "done")
          return CoroutineStep.Result(nextState, step.result);
        else {
          if (step.excludeOthers) {
            console.log(
              `exclude others detected, killing ${
                ps.length - 1
              } other coroutines`
            );
            return CoroutineStep.MapState(
              step.next([context, deltaT, events]),
              ((_) => thenMaybe(nextState, _) || id)
            );
          } else ps1.push(step.next);
        }
      }
      return CoroutineStep.Yield(nextState, Coroutine.Any(ps1));
    }),
  All: <context, state, events, result>(
    ps: Array<Coroutine<context, state, events, result>>
  ): Coroutine<context, state, events, Array<result>> =>
    Coroutine.Create(([context, deltaT, events]) => {
      const ps1: Array<Coroutine<context, state, events, result>> = [];
      let nextState: BasicUpdater<state> | undefined = undefined;
      let stillRunning = false;
      const results: Array<result> = [];
      for (const p of ps) {
        const step = Coroutine.Tick(context, events, p, deltaT);
        nextState = thenMaybe(nextState, step.state);
        if (step.kind == "done") {
          results.push(step.result);
          ps1.push(Coroutine.Return(step.result));
        } else {
          stillRunning = true;
          ps1.push(step.next);
        }
      }
      return stillRunning
        ? CoroutineStep.Yield(nextState, Coroutine.All(ps1))
        : CoroutineStep.Result(nextState, results);
    }),
  Repeat: <context, state, events>(
    p: Coroutine<context, state, events, Unit>
  ): Coroutine<context, state, events, Unit> =>
    p.then((_) => Coroutine.Yield(Coroutine.Repeat(p))),
  Seq: <context, state, events>(
    ps: Array<Coroutine<context, state, events, Unit>>
  ): Coroutine<context, state, events, Unit> =>
    ps.length <= 0
      ? Coroutine.Return<context, state, events, Unit>({})
      : ps[0].then(() => Coroutine.Seq<context, state, events>(ps.slice(1))),
  While: <context, state, events>(
    predicate: BasicFun<[context, Array<events>], boolean>,
    p: Coroutine<context, state, events, Unit>
  ): Coroutine<context, state, events, Unit> =>
    Coroutine.Create(([context, deltaT, events]) => {
      if (predicate([context, events])) {
        return p.then((_) =>
          Coroutine.While<context, state, events>(predicate, p)
        )([context, deltaT, events]);
      } else return CoroutineStep.Result(undefined, {});
    }),
  Wait: <context, state, events>(
    ms: number
  ): Coroutine<context, state, events, Unit> =>
    Coroutine.Waiting(ms, Coroutine.Return({})),
  On:
    <context, state, events extends { Kind: string }>() =>
    <event extends events["Kind"]>(
      eventKind: event,
      predicate?: BasicFun<[events & { Kind: event }, context], boolean>
    ): Coroutine<context, state, events, events & { Kind: event }> =>
      Coroutine.Create(([context, _, events]) => {
        const event = events.find((e) => e.Kind == eventKind);
        if (event != undefined) {
          if (!predicate || predicate([event as any, context])) {
            // we don't return undefined but rather s => s in order to 
            // ensure that coroutine runners can see that something happened
            // that might require flushing the event queue
            return CoroutineStep.Result(s => s, event as any);
          }
        }
        return CoroutineStep.Yield(
          undefined,
          Coroutine.On<context, state, events>()(eventKind, predicate)
        );
      }),
  Await: <context, state, events, result, error>(
    promise: BasicFun<Unit, Promise<result>>,
    onCatch: BasicFun<any, error>,
    debugName?: string
  ): Coroutine<context, state, events, Sum<result, error>> =>
    Coroutine.Create(([_, __, ___]) => {
      let promiseResult:
        | { kind: "resolve"; result: result }
        | { kind: "reject"; error: error }
        | undefined = undefined;
      // const started = Date.now();
      // if (SharedLayoutConstants.LogCoroutineTicks)
      //   console.log(`co::await::launched ${debugName}`);
      setTimeout(() =>
        promise({})
          .then((result) => {
            if (SharedLayoutConstants.LogCoroutineTicks)
              console.log(`co::await::resolved ${debugName}`);
            promiseResult = { kind: "resolve", result: result };
          })
          .catch((_) => {
            if (SharedLayoutConstants.LogCoroutineTicks)
              console.log(`co::await::rejected ${debugName}`);
            promiseResult = { kind: "reject", error: onCatch(_) };
          })
      );
      // if (SharedLayoutConstants.LogCoroutineTicks)
      //   console.log(
      //     `co::await::creating awaiter ${debugName} (deltaT = ${
      //       Date.now() - started
      //     })`
      //   );
      const awaiter = (): CoroutineStep<
        context,
        state,
        events,
        Sum<result, error>
      > => {
        // if (SharedLayoutConstants.LogCoroutineTicks)
        //   console.log(
        //     `co::await::checking awaiter ${debugName}`,
        //     promiseResult
        //   );
        return promiseResult == undefined
          ? CoroutineStep.Yield(
              undefined,
              Coroutine.Create(([_, __, ___]) => awaiter())
            )
          : promiseResult.kind == "resolve"
            ? CoroutineStep.Result(
                undefined,
                Sum.Default.left(promiseResult.result)
              )
            : CoroutineStep.Result(
                undefined,
                Sum.Default.right(promiseResult.error)
              );
      };
      return CoroutineStep.Yield(
        undefined,
        Coroutine.Create(([_, __, ___]) => awaiter())
      );
    }),    
};

export type CoroutineEventProcessor<context, state, events, result> = BasicFun<
  Array<events>,
  "no match" | Coroutine<context, state, events, result>
>;
export type CoroutineStep<context, state, events, result> = {
  newState: BasicUpdater<state> | undefined;
} & (
  | { kind: "result"; result: result }
  | {
      kind: "then";
      p: Coroutine<context, state, events, any>;
      k: BasicFun<any, Coroutine<context, state, events, result>>;
    }
  | { kind: "yield"; next: Coroutine<context, state, events, result> }
  | {
      kind: "waiting-for-event";
      next: CoroutineEventProcessor<context, state, events, result>;
    }
  | {
      kind: "waiting";
      msLeft: number;
      next: Coroutine<context, state, events, result>;
    }
) & {
    // map: <nextResult>(
    //   f: Fun<result, nextResult>
    // ) => CoroutineStep<context, state, events, nextResult>;
    // mapState: (
    //   f: Fun<Updater<state> | undefined, Updater<state> | undefined>
    // ) => CoroutineStep<context, state, events, result>;
  };
export const CoroutineStep = {
  Result: <context, state, events, result>(
    newState: BasicUpdater<state> | undefined,
    result: result
  ): CoroutineStep<context, state, events, result> => ({
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
  Then: <context, state, events, result>(
    newState: BasicUpdater<state> | undefined,
    p: Coroutine<context, state, events, any>,
    k: BasicFun<any, Coroutine<context, state, events, result>>
  ): CoroutineStep<context, state, events, result> => ({
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
  Yield: <context, state, events, result>(
    newState: BasicUpdater<state> | undefined,
    next: Coroutine<context, state, events, result>
  ): CoroutineStep<context, state, events, result> => ({
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
  Waiting: <context, state, events, result>(
    newState: BasicUpdater<state> | undefined,
    msLeft: number,
    next: Coroutine<context, state, events, result>
  ): CoroutineStep<context, state, events, result> => ({
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
  WaitingForEvent: <context, state, events, result>(
    newState: BasicUpdater<state> | undefined,
    next: CoroutineEventProcessor<context, state, events, result>
  ): CoroutineStep<context, state, events, result> => ({
    newState,
    kind: "waiting-for-event",
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
  // Map: <context, state, events, result1, result2>(
  //   p: CoroutineStep<context, state, events, result1>,
  //   f: Fun<result1, result2>
  // ): CoroutineStep<context, state, events, result2> =>
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
  MapContext: <childContext, parentContext, state, result, events>(
    p: CoroutineStep<childContext, state, events, result>,
    narrow:BasicFun<parentContext, childContext>,
  ): CoroutineStep<parentContext, state, events, result> =>
    p.kind == "result"
      ? p
      : p.kind == "yield"
        ? CoroutineStep.Yield(p.newState, Coroutine.MapContext(p.next, narrow))
        : p.kind == "waiting"
          ? CoroutineStep.Waiting(
              p.newState,
              p.msLeft,
              Coroutine.MapContext(p.next, narrow)
            )
                : p.kind == "then"
                  ? CoroutineStep.Then(
                      p.newState,
                      Coroutine.MapContext(p.p, narrow),
                      Fun(p.k).then((_) => Coroutine.MapContext(_, narrow))
                    )
            : CoroutineStep.WaitingForEvent(p.newState, (e) => {
                const next = p.next(e);
                return next == "no match" ? next : Coroutine.MapContext(next, narrow);
              }),
  MapState: <context, state, newState, events, result>(
    p: CoroutineStep<context, state, events, result>,
    f: BasicFun<
      BasicUpdater<state>,
      BasicUpdater<newState>
    >
  ): CoroutineStep<context, newState, events, result> =>
    p.kind == "result"
      ? CoroutineStep.Result(callMaybe(f)(p.newState), p.result)
      : p.kind == "yield"
        ? CoroutineStep.Yield(callMaybe(f)(p.newState), Coroutine.MapState(p.next, f))
        : p.kind == "waiting"
          ? CoroutineStep.Waiting(
            callMaybe(f)(p.newState),
              p.msLeft,
              Coroutine.MapState(p.next, f)
            )
          : p.kind == "then"
            ? CoroutineStep.Then(
              callMaybe(f)(p.newState),
                Coroutine.MapState(p.p, f),
                Fun(p.k).then((_) => Coroutine.MapState(_, f))
              )
            : CoroutineStep.WaitingForEvent(callMaybe(f)(p.newState), (e) => {
                const next = p.next(e);
                return next == "no match" ? next : Coroutine.MapState(next, f);
              }),
  Embed: <childContext, childState, result, parentContext, parentState, events>(
    p: CoroutineStep<childContext, childState, events, result>,
    narrow:BasicFun<parentContext, childContext>,
    widen:BasicFun<BasicUpdater<childState>,BasicUpdater<parentState>>
  ): CoroutineStep<parentContext, parentState, events, result> =>
    CoroutineStep.MapState(CoroutineStep.MapContext(p, narrow), widen)
            
};
