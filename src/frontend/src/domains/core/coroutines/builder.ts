import { Unit } from "../fun/domains/unit/state";
import { BasicUpdater } from "../fun/domains/updater/state";
import { BasicFun } from "../fun/state";
import { Template } from "../template/state";
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
  On: Coroutine.On<c & s, s, e>(),
  Embed: <parentContext, parentState, result, events>(
    p: Coroutine<c, s, events, result>,
    narrow:BasicFun<parentContext, c>,
    widen:BasicFun<BasicUpdater<s>,BasicUpdater<parentState>>
  ): Coroutine<parentContext, parentState, events, result> =>
    Coroutine.Embed(p, narrow, widen),
  Template:(
    initialCoroutine: Coroutine<c & s, s, e, Unit>,
    options?: CoroutineComponentOptions
  ) : Template<c & s & { events:e[] }, s, Unit> => Template.Default(
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
