module Ballerina.Coroutines
open System

type U<'s> = 's -> 's
let (>>?) (f:Option<U<'a>>) (g:Option<U<'a>>) : Option<U<'a>> =
  match f,g with 
  | Some f, Some g -> Some(fun x -> g(f(x)))
  | None, Some _ -> g
  | Some _, None -> f
  | _ -> None

type Updater<'s> = U<'s>
let replaceWith (v:'a) : U<'a> = fun _ -> v
type DeltaT = TimeSpan

type Coroutine<'a, 's, 'e when 'e : comparison> = Co of ('s * Set<'e> * DeltaT -> CoroutineResult<'a, 's, 'e> * Option<U<'s>> * Option<U<Set<'e>>>)
  with 
    static member map<'a, 'b, 's, 'e when 'e : comparison> (f:('a -> 'b)) ((Co p):Coroutine<'a,'s,'e>): Coroutine<'b, 's, 'e> = 
      Co(fun (s, e, dt) ->
        let (p_result, s_updater, e_updater) = p(s,e,dt)
        (CoroutineResult.map f p_result, s_updater, e_updater)
      )

and CoroutineResult<'a, 's, 'e when 'e : comparison> = 
  | Return of 'a
  | Any of List<Coroutine<'a, 's, 'e>>
  // | All of List<Coroutine<'a, 's, 'e>>
  | Spawn of Coroutine<Unit, 's, 'e>
  | Wait of TimeSpan * Coroutine<'a, 's, 'e>
  | On of ('e -> Option<'a>)
  | Await of Async<'a>
  | Awaiting of Guid * Async<'a>
  | Then of (Coroutine<Coroutine<'a, 's, 'e>, 's, 'e>)
  | Combine of (Coroutine<Unit, 's, 'e> * Coroutine<'a, 's, 'e>)
  with 
    static member map<'a, 'b, 's, 'e when 'e : comparison> (f:('a -> 'b)) (p:CoroutineResult<'a,'s,'e>) : CoroutineResult<'b, 's, 'e> = 
      match p with
      | Return x -> x |> f |> Return
      | Any ps -> ps |> List.map(Coroutine.map f) |> Any
      // | All ps -> ps |> List.map(Coroutine.map f) |> All
      | Spawn p -> p |> Spawn
      | Wait (t, p) -> Wait(t, p |> Coroutine.map f)
      | On(e_predicate) -> On(fun e -> e |> e_predicate |> Option.map f)
      | Awaiting (id,p) -> 
          Awaiting(
            id,
            async{ 
              let! x = p
              return f x
            }
          )
      | Await (p) -> 
          Await(
            async{ 
              let! x = p
              return f x
            }
          )
      | Then(p_p) -> 
        p_p |> Coroutine.map (Coroutine.map f) |> CoroutineResult.Then
      | Combine(p, k) -> 
        Combine(p, k |> Coroutine.map  f)

let rec bind(p:Coroutine<'a, 's, 'e>, k:'a -> Coroutine<'b, 's, 'e>) = 
    Co(fun _ -> CoroutineResult.Then(p |> Coroutine.map(k)), None, None)
and repeat (p:Coroutine<'a,'s,'e>) = 
  bind(p, fun _ -> repeat p)
  
type CoroutineBuilder() = 
  member _.Return(result:'a) = 
    Co(fun _ -> CoroutineResult.Return(result), None, None)
  member co.Yield() =
    Co(fun _ -> CoroutineResult.Wait(TimeSpan.FromMilliseconds(0), co.Return()), None, None)
  member _.Bind(p:Coroutine<'a, 's, 'e>, k:'a -> Coroutine<'b, 's, 'e>) = 
    bind(p, k)
  member _.Combine(p:Coroutine<Unit, 's, 'e>, k:Coroutine<'a, 's, 'e>) = 
    Co(fun _ -> CoroutineResult.Combine(p, k), None, None)
  member _.Any(ps:List<Coroutine<'a,'s,'e>>) =
    Co(fun _ -> CoroutineResult.Any(ps), None, None)
  // member _.All(ps:List<Coroutine<'a,'s,'e>>) =
  //   Co(fun _ -> CoroutineResult.Any(ps), None, None)
  member _.On(p_e:'e -> Option<'a>) =
    Co(fun _ -> CoroutineResult.On(p_e), None, None)
  member co.Wait(t:TimeSpan) =
    Co(fun _ -> CoroutineResult.Wait(t, co.Return()), None, None)
  member _.Await(p : Async<'a>) =
    Co(fun _ -> CoroutineResult.Await(p), None, None)
  member _.Awaiting(id:Guid, p : Async<'a>) =
    Co(fun _ -> CoroutineResult.Awaiting(id,p), None, None)
  member _.Spawn(p:Coroutine<Unit,'s,'e>) =
    Co(fun _ -> CoroutineResult.Spawn(p), None, None)
  member _.Repeat(p:Coroutine<'a,'s,'e>) =
    repeat p    
  member co.ReturnFrom(p:Coroutine<'a,'s,'e>) = 
    co{
      let! res = p
      return res
    }
    
let co = CoroutineBuilder()

type WaitingCoroutine<'a, 's, 'e when 'e : comparison> = { P:Coroutine<'a, 's, 'e>; Until:DateTime }
type EvaluatedCoroutine<'a, 's, 'e when 'e : comparison> = 
  | Done of 'a * Option<U<'s>> * Option<U<Set<'e>>>
  | Spawned of List<Coroutine<Unit, 's, 'e>> * Option<U<'s>> * Option<U<Set<'e>>> * Option<Coroutine<'a, 's, 'e>>
  | Active of Coroutine<'a, 's, 'e> * Option<U<'s>> * Option<U<Set<'e>>>
  | Listening of Coroutine<'a, 's, 'e> * Option<U<'s>> * Option<U<Set<'e>>>
  | Waiting of WaitingCoroutine<'a, 's, 'e> * Option<U<'s>> * Option<U<Set<'e>>>
  | WaitingOrListening of WaitingCoroutine<'a, 's, 'e> * Option<U<'s>> * Option<U<Set<'e>>>
  with 
    member this.After(u_s, u_e) = 
      match this with
      | Done(x, u_s', u_e') -> Done(x, u_s >>? u_s', u_e >>? u_e')
      | Spawned(x, u_s', u_e', p) -> Spawned(x, u_s >>? u_s', u_e >>? u_e', p)
      | Active(x, u_s', u_e') -> Active(x, u_s >>? u_s', u_e >>? u_e')
      | Listening(x, u_s', u_e') -> Listening(x, u_s >>? u_s', u_e >>? u_e')
      | Waiting(x, u_s', u_e') -> Waiting(x, u_s >>? u_s', u_e >>? u_e')
      | WaitingOrListening(x, u_s', u_e') -> WaitingOrListening(x, u_s >>? u_s', u_e >>? u_e')

let mutable awaiting:Map<Guid, Async<obj>> = Map.empty
let mutable awaited:Map<Guid, obj> = Map.empty
type EvaluatedCoroutines<'s, 'e when 'e : comparison> = {
    active:Map<Guid, Coroutine<Unit, 's, 'e>>
    stopped:Set<Guid>
    waiting:Map<Guid, WaitingCoroutine<Unit, 's, 'e>>
    listening:Map<Guid, Coroutine<Unit, 's, 'e>>
    waitingOrListening:Map<Guid, WaitingCoroutine<Unit, 's, 'e>>
  }

type Eval<'s,'e when 'e : comparison>() = class end
  with 
    static member eval<'a> ((Co p):Coroutine<'a,'s,'e>) (ctx:'s * Set<'e> * DeltaT) : EvaluatedCoroutine<'a,'s,'e> = 
      let (s,es,dt) = ctx
      let (step, u_s, u_e) = p ctx
      match step with
      | Then(p_p:Coroutine<Coroutine<'a, 's, 'e>, 's, 'e>) ->
        match Eval.eval p_p ctx with
        | Done(p', u_s, u_e) -> 
          let res = Eval.eval p' ctx
          res.After(u_s, u_e)
        | Spawned(p_p', u_s, u_e, rest) -> 
          Spawned(p_p', u_s, u_e, rest |> Option.map (fun p -> Co(fun _ -> CoroutineResult.Then(p), None, None)))
        | Active(p_p', u_s, u_e) -> 
          Active(Co(fun _ -> CoroutineResult.Then(p_p'), None, None), u_s, u_e)
        | Listening(p_p', u_s, u_e) -> 
          Listening(Co(fun _ -> CoroutineResult.Then(p_p'), None, None), u_s, u_e)
        | Waiting(w, u_s, u_e) -> 
          Waiting({ P = Co(fun _ -> CoroutineResult.Then(w.P), None, None); Until = w.Until }, u_s, u_e)
        | WaitingOrListening(w, u_s, u_e) -> 
          Waiting({ P = Co(fun _ -> CoroutineResult.Then(w.P), None, None); Until = w.Until }, u_s, u_e)
      | Combine (p, k) -> 
        match Eval.eval p ctx with
        | Done(p', u_s, u_e) -> 
          let res = Eval.eval k ctx
          res.After(u_s, u_e)
        | Spawned(p', u_s, u_e, rest) -> 
          Spawned(p', u_s, u_e, rest |> Option.map (fun p -> bind(p, fun () -> k)) |> Option.orElse (Some k))
        | Active(p', u_s, u_e) -> 
          Active(co.Combine(p', k), u_s, u_e)
        | Listening(p', u_s, u_e) -> 
          Listening(co.Combine(p', k), u_s, u_e)
        | Waiting(w, u_s, u_e) -> 
          Waiting({ P = co.Combine(w.P, k); Until = w.Until }, u_s, u_e)
        | WaitingOrListening(w, u_s, u_e) -> 
          Waiting({ P = co.Combine(w.P, k); Until = w.Until }, u_s, u_e)
      | Return res -> Done(res, u_s, u_e)
      | Any(ps) ->
        let res = 
          ps |> List.fold
            (fun res p -> 
              match res with
              | Choice2Of2 _ -> res
              | Choice1Of2(ps', spawned', u_s, u_e) ->
                match Eval.eval p ctx with
                | Done(res, u_s', u_e') -> Choice2Of2(res, u_s >>? u_s', u_e >>? u_e')
                | Spawned(p', u_s', u_e', rest) -> Choice1Of2(ps' @ Option.toList rest, p' @ spawned', u_s >>? u_s', u_e >>? u_e')
                | Active(p',u_s',u_e')
                | Listening(p',u_s',u_e')
                | Waiting({ P = p'; Until = _ }, u_s', u_e')
                | WaitingOrListening({ P = p'; Until = _ }, u_s', u_e') ->
                  Choice1Of2(p'::ps', spawned', u_s >>? u_s', u_e >>? u_e')
            ) (Choice1Of2([], [], None, None)) 
        match res with
        | Choice1Of2(ps', [], u_s, u_e) -> 
          Active(co.Any ps', u_s, u_e)
        | Choice1Of2(ps', spawned, u_s, u_e) -> 
          Spawned(spawned, u_s, u_e, Some(co.Any ps'))
        | Choice2Of2(res, u_s, u_e) -> 
          Done(res, u_s, u_e)
      | Wait(timeSpan, p':Coroutine<'a,'s,'e>) -> 
        let timeSpan' = timeSpan - dt
        if timeSpan'.TotalMilliseconds <= 0 then
          Active(p', None, None)
        else
          Active(co{ 
            do! co.Wait timeSpan'
            return! p'
          }, None, None)
      | On(p_e) ->
        match es |> Seq.map (fun e -> p_e e, e) |> Seq.tryFind (function Some _, e -> true | _ -> false) with
        | Some(Some res,e) -> Done(res, None, Some(Set.remove e))
        | _ -> Active(co.On p_e, None, None)
      | Spawn(p) -> 
        Spawned([p], None, None, None)
      | Await(a:Async<'a>) ->
        let id = Guid.NewGuid()
        do Async.Start(
          async{
            let! res = a
            awaited <- awaited |> Map.add id (res :> obj)
          })
        awaiting <- awaiting |> Map.add id 
          (async{ 
            let! res = a
            return res :> obj 
          })
        Active(co.Awaiting(id, a), None, None)
      | Awaiting(id, a) ->
        match awaited |> Map.tryFind id with
        | Some res -> 
          awaiting <- awaiting |> Map.remove id
          awaited <- awaited |> Map.remove id
          Done(res :?> 'a, None, None)
        | None when awaiting |> Map.containsKey id  -> Active(co.Awaiting(id, a), None, None)
        | _ -> Active(co.Await(a), None, None) // this can happen if the container has been restarted

let rec evalMany (ps:Map<Guid, Coroutine<Unit, 's, 'e>>) ((s, es, dt):'s * Set<'e> * DeltaT) : EvaluatedCoroutines<'s, 'e> * Option<U<'s>> * Option<U<Set<'e>>> =
    let ctx = (s,es,dt)
    let mutable u_s:Option<U<'s>> = None
    let mutable u_e:Option<U<Set<'e>>> = None
    let mutable evaluated:EvaluatedCoroutines<'s, 'e> = {
      active=Map.empty;
      stopped=Set.empty;
      waiting=Map.empty;
      listening=Map.empty;
      waitingOrListening=Map.empty;
    }
    for p in ps do
      match Eval.eval p.Value ctx with
      | Done(_, u_s', u_e') -> 
        evaluated <- { evaluated with stopped = evaluated.stopped.Add p.Key }; u_s <- u_s >>? u_s'; u_e <- u_e >>? u_e'
      | Spawned (spawned, u_s', u_e', rest) ->
        match rest with 
        | Some p' ->
          evaluated <- { evaluated with active = evaluated.active.Add(p.Key, p') }; u_s <- u_s >>? u_s'; u_e <- u_e >>? u_e'
        | _ -> ()
        for p' in spawned do
          evaluated <- { evaluated with active = evaluated.active.Add(Guid.NewGuid(), p') }; u_s <- u_s >>? u_s'; u_e <- u_e >>? u_e'
      | Active (p', u_s', u_e') -> 
        evaluated <- { evaluated with active = evaluated.active.Add(p.Key, p') }; u_s <- u_s >>? u_s'; u_e <- u_e >>? u_e'
      | Listening (p', u_s', u_e') -> 
        evaluated <- { evaluated with listening = evaluated.listening.Add(p.Key, p') }; u_s <- u_s >>? u_s'; u_e <- u_e >>? u_e'
      | Waiting (p', u_s', u_e') -> 
        evaluated <- { evaluated with waiting = evaluated.waiting.Add(p.Key, p') }; u_s <- u_s >>? u_s'; u_e <- u_e >>? u_e'
      | WaitingOrListening (p', u_s', u_e') -> 
        evaluated <- { evaluated with waitingOrListening = evaluated.waitingOrListening.Add(p.Key, p') }; u_s <- u_s >>? u_s'; u_e <- u_e >>? u_e'
      
    evaluated, u_s, u_e

