import { Collection } from "immutable";
import { Unit } from "../fun/domains/unit/state";
import { BasicUpdater } from "../fun/domains/updater/state";
import { BasicFun } from "../fun/state";
import { Template, createTemplate } from "../template/state";
import { Coroutine } from "./state";
import { CoroutineComponentOptions, CoroutineTemplate } from "./template";

export const CoTypedFactory = <c, s, e extends { Kind: string }>() => ({
  Seq: Coroutine.Seq<c & s, s, e>,
  GetState: Coroutine.GetState<c & s, s, e>,
  SetState: Coroutine.SetState<c & s, s, e>,
  UpdateState: Coroutine.UpdateState<c & s, s, e>,
  Any: Coroutine.Any<c & s, s, e, Unit>,
  Yield: Coroutine.Yield<c & s, s, e, Unit>,
  Wait: Coroutine.Wait<c & s, s, e>,
  Await: <r, err>(
    p: BasicFun<Unit, Promise<r>>,
    onErr: BasicFun<any, err>,
    debugName?: string
  ) => Coroutine.Await<c & s, s, e, r, err>(p, onErr, debugName),
  Repeat: Coroutine.Repeat<c & s, s, e>,
  Return: <r>(res: r) => Coroutine.Return<c & s, s, e, r>(res),
  While: Coroutine.While<c & s, s, e>,
  For: <element>(collection:Collection<number, element>) => (p:BasicFun<element, Coroutine<c & s, s, e, Unit>>) => 
    Coroutine.For<c & s, s, e, element>(collection, p),
  On: Coroutine.On<c & s, s, e>(),
  Embed: <parentContext, parentState, result, events>(
    p: Coroutine<c &s, s, events, result>,
    narrow:BasicFun<parentContext & parentState, c &s>,
    widen:BasicFun<BasicUpdater<s>,BasicUpdater<parentState>>
  ): Coroutine<parentContext & parentState, parentState, events, result> =>
    Coroutine.Embed(p, narrow, widen),
  Template:(
    initialCoroutine: Coroutine<c & s, s, e, Unit>,
    options?: CoroutineComponentOptions
  ) : Template<c & s & { events:e[] }, s, Unit> => createTemplate(
      props => CoroutineTemplate<c & s, s, e>()({
      ...props,
      context:{
        ...props.context, 
        initialCoroutine,
        options,
      },
    })
  )
});
