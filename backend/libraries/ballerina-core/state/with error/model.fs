module Ballerina.StateWithError
open Ballerina.Fun
open Sum

type State<'a,'c,'s,'e> = State of ('c * 's -> Sum<'a * Option<'s>, 'e>)
with 
  member this.run (c,s) = let (State p) = this in p(c,s)
  static member map<'b> (f:'a -> 'b) ((State p):State<'a,'c,'s,'e>) : State<'b,'c,'s,'e> =
    State(fun s0 ->
      match p s0 with
      | Sum.Left (res,u_s) -> Sum.Left(f res,u_s)
      | Sum.Right e -> Sum.Right e
    )
  static member fromValue (res:'a) = State(fun _ -> Sum.Left(res, None))
  static member flatten ((State p):State<State<'a,'c,'s,'e>,'c,'s,'e>) : State<'a,'c,'s,'e> = 
    State(fun (c,s0) ->
      match p (c,s0) with
      | Sum.Left (State p',s1) -> 
        match p' (match s1 with None -> c,s0 | Some s1 -> c,s1) with
        | Sum.Left (res,s2) -> 
          Sum.Left(res, match s2,s1 with | Some _,_ -> s2 | None,Some _ -> s1 | _ -> None)
        | Sum.Right e -> Sum.Right e  
      | Sum.Right e -> Sum.Right e
    )
  static member bind (p:State<'a,'c,'s,'e>) (k:'a -> State<'b,'c,'s,'e>) : State<'b,'c,'s,'e> = 
    State.map k p |> State.flatten


type StateBuilder() = 
  member _.Map f p = 
    State.map f p
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
    State(fun (c,s) -> Sum.Left(c,None))
  member _.GetState() =
    State(fun (c,s) -> Sum.Left(s,None))
  member _.SetState(u:U<'s>) =
    State(fun (_,s) -> Sum.Left((), Some(u s)))
  member state.ReturnFrom(p:State<'a,'c,'s,'e>) = 
    state{
      let! res = p
      return res
    }
  member _.Catch (State p) =
    State(fun cs -> 
      match p cs with
      | Left (res,u_s) -> Left (Left res, u_s)
      | Right err -> Left(Right err, None))
  member _.Throw (e:'e) =
    State(fun _ -> Sum.Right e)
  member state.Delay p = 
    state.Bind ((state.Return ()), p)
  member state.For(seq, body:_ -> State<Unit,_,_,_>) =
    match seq |> Seq.tryHead with
    | Some first -> 
      state.Combine(body first, state.For(seq |> Seq.tail, body))
    | None -> state{ return () }
  member state.All<'a,'c,'s,'e>
    (e:{| concat:'e * 'e -> 'e |}, ps:List<State<'a,'c,'s,'e>>) =
    match ps with
    | [] -> state.Return []
    | p::ps ->
      state{
        let! p_res = p |> state.Catch
        let! ps_res = state.All(e,ps) |> state.Catch
        match p_res, ps_res with
        | Left r,Left rs ->
          return r::rs
        | Right (err:'e), Right (errs:'e) -> 
          let allErrs = e.concat(err,errs)
          return! state.Throw(allErrs)
        | Right (err:'e),_ | _,Right (err:'e) -> 
          return! state.Throw err
      }
  member inline state.All<'a,'c,'s,'b 
    when 'b : (static member Concat:'b * 'b -> 'b)>
    (ps:List<State<'a,'c,'s,'b>>) =
    state.All({| concat='b.Concat |}, ps)
  member inline state.All<'a,'c,'s,'b 
    when 'b : (static member Concat:'b * 'b -> 'b)>
    (ps:seq<State<'a,'c,'s,'b>>) =
    state.All({| concat='b.Concat |}, ps |> Seq.toList)
  member state.OfSum s =
    match s with
    | Left res -> state.Return res
    | Right err -> state.Throw err

let state = StateBuilder()
