module Ballerina.State
open Ballerina.Fun

type State<'a,'c,'s,'e> = State of ('c * 's -> Choice<'a * Option<'s>, 'e>)
with 
  member this.run = let (State p) = this in p
  static member map<'b> (f:'a -> 'b) ((State p):State<'a,'c,'s,'e>) : State<'b,'c,'s,'e> =
    State(fun s0 ->
      match p s0 with
      | Choice1Of2 (res,u_s) -> Choice1Of2(f res,u_s)
      | Choice2Of2 e -> Choice2Of2 e
    )
  static member fromValue (res:'a) = State(fun _ -> Choice1Of2(res, None))
  static member flatten ((State p):State<State<'a,'c,'s,'e>,'c,'s,'e>) : State<'a,'c,'s,'e> = 
    State(fun (c,s0) ->
      match p (c,s0) with
      | Choice1Of2 (State p',s1) -> 
        match p' (match s1 with None -> c,s0 | Some s1 -> c,s1) with
        | Choice1Of2 (res,s2) -> 
          Choice1Of2(res, match s2,s1 with | Some _,_ -> s2 | None,Some _ -> s1 | _ -> None)
        | Choice2Of2 e -> Choice2Of2 e  
      | Choice2Of2 e -> Choice2Of2 e
    )
  static member bind (p:State<'a,'c,'s,'e>) (k:'a -> State<'b,'c,'s,'e>) : State<'b,'c,'s,'e> = 
    State.map k p |> State.flatten


type StateBuilder() = 
  member _.Zero<'c,'s,'e>() = 
    State.fromValue<'c,'s,'e>()
  member _.Return<'a,'c,'s,'e>(result:'a) = 
    State.fromValue<'c,'s,'e> result
  member _.Yield(result:'a) = 
    State.fromValue<'c,'s,'e> result
  member _.Bind(p:State<'a,'c,'s,'e>, k:'a -> State<'b,'c,'s,'e>) = 
    State.bind p k
  member _.Combine(p:State<'b,'c,'s,'e>, k:State<'a,'c,'s,'e>) = 
    State.bind p (fun _ -> k)
//   member _.Any(ps:List<Coroutine<'a, 's, 'c, 'e>>) =
//     Co(fun _ -> CoroutineResult.Any(ps), None, None)
//   // member _.All(ps:List<Coroutine<'a, 's, 'c, 'e>>) =
//   //   Co(fun _ -> CoroutineResult.Any(ps), None, None)
  member state.Repeat(p:State<'a,'c,'s,'e>) : State<'a,'c,'s,'e> =
    state.Bind(p, fun _ -> state.Repeat(p))
  member _.GetContext() =
    State(fun (c,s) -> Choice1Of2(c,None))
  member _.GetState() =
    State(fun (c,s) -> Choice1Of2(s,None))
  member _.SetState(u:U<'s>) =
    State(fun (_,s) -> Choice1Of2((), Some(u s)))
  member state.ReturnFrom(p:State<'a,'c,'s,'e>) = 
    state{
      let! res = p
      return res
    }
  member _.Throw (e:'e) =
    State(fun _ -> Choice2Of2 e)
  member state.Delay p = 
    state.Bind ((state.Return ()), p)
  member state.For(seq, body:_ -> State<Unit,_,_,_>) =
    match seq |> Seq.tryHead with
    | Some first -> 
      state.Combine(body first, state.For(seq |> Seq.tail, body))
    | None -> state{ return () }

let state = StateBuilder()
