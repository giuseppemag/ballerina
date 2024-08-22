import { BasicFunc, BasicUpdater, Unit } from '@tenet/core'
import { Map, Collection, OrderedMap } from 'immutable'

import { Template, createTemplate } from '../domain/template'
import { Coroutine, InboundKindFromContext, InboundEventFromContext } from './coroutine'
import { CoroutineComponentOptions, CoroutineTemplate } from './coroutine-runner'

type Guid = string

export const CoTypedFactory = Object.assign(
  <c, s>() => ({
    Seq: Coroutine.Seq<c & s, s>,
    GetState: Coroutine.GetState<c & s, s>,
    SetState: Coroutine.SetState<c & s, s>,
    UpdateState: Coroutine.UpdateState<c & s, s>,
    Any: Coroutine.Any<c & s, s, Unit>,
    All: <result,>(ps: Array<Coroutine<c & s, s, result>>) => Coroutine.All<c & s, s, result>(ps),
    Yield: Coroutine.Yield<c & s, s, Unit>,
    Wait: Coroutine.Wait<c & s, s>,
    Await: <r, err>(p: BasicFunc<Unit, Promise<r>>, onErr: BasicFunc<any, err>, debugName?: string) =>
      Coroutine.Await<c & s, s, r, err>(p, onErr, debugName),
    Repeat: Coroutine.Repeat<c & s, s>,
    Return: <r,>(res: r) => Coroutine.Return<c & s, s, r>(res),
    While: Coroutine.While<c & s, s>,
    For:
      <element,>(collection: Collection<number, element>) =>
      (p: BasicFunc<element, Coroutine<c & s, s, Unit>>) =>
        Coroutine.For<c & s, s, element>(collection, p),
    Embed: <parentContext, parentState, result>(
      p: Coroutine<c & s, s, result>,
      narrow: BasicFunc<parentContext & parentState, c & s>,
      widen: BasicFunc<BasicUpdater<s>, BasicUpdater<parentState>>
    ): Coroutine<parentContext & parentState, parentState, result> => Coroutine.Embed(p, narrow, widen),
    Template: <fm,>(
      initialCoroutine: Coroutine<c & s, s, Unit>,
      options?: CoroutineComponentOptions<c & s, s>
    ): Template<c & s, s, fm> =>
      createTemplate((props) =>
        (options?.runFilter || ((_) => true))({ ...props, foreignMutations: {} }) ? (
          CoroutineTemplate<c & s, s, fm>()({
            ...props,
            context: {
              ...props.context,
              initialCoroutine,
              options,
            },
          })
        ) : (
          <></>
        )
      ),
    Trigger: <event extends { id: Guid; kind: kind }, kind extends string>(
      event: event
    ): Coroutine<
      c & s & { outboundEvents: Map<kind, OrderedMap<Guid, event>> },
      s & { outboundEvents: Map<kind, OrderedMap<Guid, event>> },
      Unit
    > =>
      Coroutine.Trigger<
        c & s & { outboundEvents: Map<kind, OrderedMap<Guid, event>> },
        s & { outboundEvents: Map<kind, OrderedMap<Guid, event>> },
        event,
        kind
      >(event),
    Do: (action: () => void): Coroutine<c & s, s, Unit> => Coroutine.Do(action),
  }),
  {
    withOn: <eventKind, event, c, s extends { inboundEvents: Map<eventKind, OrderedMap<Guid, event>> }>() => ({
      ...CoTypedFactory<c, s>(),
      On: <matchedEvent extends InboundKindFromContext<c & s>>(
        kind: matchedEvent,
        filter?: BasicFunc<[InboundEventFromContext<c & s> & { kind: matchedEvent }, c & s], boolean>
      ): Coroutine<c & s, s, InboundEventFromContext<c & s> & { kind: matchedEvent }> => {
        return Coroutine.On<eventKind, event, c & s, s, matchedEvent>(kind, filter)
      },
    }),
  }
)
