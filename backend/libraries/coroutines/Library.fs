namespace Ballerina.Coroutines
open System

type U<'s> = 's -> 's
type DeltaT = float

type Coroutine<'a, 's, 'e when 'e : comparison> = Co of ('s * Set<'e> * DeltaT -> CoroutineResult<'a, 's, 'e> * Option<U<'s>> * Option<U<Set<'e>>>)
  with 
    static member map<'a, 'b, 's, 'e when 'e : comparison> (f:('a -> 'b)) ((Co p):Coroutine<'a,'s,'e>): Coroutine<'b, 's, 'e> = 
      Co(fun (s, e, dt) ->
        let (p_result, s_updater, e_updater) = p(s,e,dt)
        let p_result_mapped = CoroutineResult.map f p_result
        (p_result_mapped, s_updater, e_updater)
      )

and CoroutineResult<'a, 's, 'e when 'e : comparison> = 
  | Return of 'a
  | Any of List<Coroutine<'a, 's, 'e>>
  | All of List<Coroutine<'a, 's, 'e>>
  | Wait of TimeSpan
  | On of ('e -> Option<'a>)
  | Then of (Coroutine<Coroutine<'a, 's, 'e>, 's, 'e>)
  with 
    static member map<'a, 'b, 's, 'e when 'e : comparison> (f:('a -> 'b)) (p:CoroutineResult<'a,'s,'e>) : CoroutineResult<'b, 's, 'e> = 
      match p with
      | Return x -> x |> f |> Return
      | Any ps -> ps |> List.map(Coroutine.map f) |> Any
      | All ps -> ps |> List.map(Coroutine.map f) |> All
      | Wait (t) -> Wait(t)
      | On(e_predicate) -> On(fun e -> e |> e_predicate |> Option.map f)
      | Then(p_p) -> 
        p_p |> Coroutine.map (Coroutine.map f) |> CoroutineResult.Then

type CoroutineBuilder() = 
  member _.Return(result:'a) = 
    Co(fun _ -> CoroutineResult.Return(result), None, None)
  member _.Yield() =
    Co(fun _ -> CoroutineResult.Wait(TimeSpan.FromMilliseconds(0)), None, None)
  member _.Bind(p:Coroutine<'a, 's, 'e>, k:'a -> Coroutine<'b, 's, 'e>) = 
    Co(fun _ -> CoroutineResult.Then(p |> Coroutine.map(k)), None, None)
  [<CustomOperation("any")>]
  member _.Any(ps:List<Coroutine<'a,'s,'e>>) =
    Co(fun _ -> CoroutineResult.Any(ps), None, None)
  [<CustomOperation("all")>]
  member _.All(ps:List<Coroutine<'a,'s,'e>>) =
    Co(fun _ -> CoroutineResult.Any(ps), None, None)
    