[<Measure>] type s

type Updater<'s> = 's -> 's

type Coroutine<'c,'s,'a> = 
  Coroutine of (('c * 's * float32<s>) -> CoroutineStep<'c,'s,'a>)
  with 
    member this.Co = let (Coroutine co) = this in co
    member this.map<'b>(f:'a->'b) : Coroutine<'c,'s,'b> = 
      Coroutine(fun (c,s,dt) -> (this.Co(c,s,dt)).map(f))

and CoroutineStep<'c,'s,'a> = 
  | Result of Option<Updater<'s>> * 'a
  | Waiting of Option<Updater<'s>> * float32<s> * Coroutine<'c,'s,'a>
  | Bind of Option<Updater<'s>> * Coroutine<'c,'s,obj> * (obj -> Coroutine<'c,'s,'a>)
  with 
    member this.map<'b>(f:'a->'b) : CoroutineStep<'c,'s,'b> =
      match this with
      | Result(s,a) ->Result(s, f a)
      | Waiting(s, dt, next) -> Waiting(s, dt, next.map(f))
      | Bind(s, p, k) -> Bind(s, p, fun v -> (k (v)).map(f))

type Co<'c,'s,'a> = Coroutine<'c,'s,'a>
type CoStep<'c,'s,'a> = CoroutineStep<'c,'s,'a>

let thenMaybe f g = 
  match f, g with
  | Some f, Some g -> Some(f >> g)
  | Some f, _ -> Some f
  | _, Some g -> Some g
  | _ -> None

type CoBuilder<'c,'s>() = 
  member x.Wait(ms) = 
    Co.Coroutine(fun _ -> CoStep.Waiting(None, ms, CoBuilder().Return()))
  member x.Quote<'a>(p:Quotations.Expr<'a>) = p
  member x.Bind<'a,'b>(p:Co<'c,'s,'a>, k:('a -> Coroutine<'c,'s,'b>)) = 
    Co.Coroutine(fun _ -> 
      CoStep.Bind(None, p.map(fun (v:'a) -> v :> obj), 
      fun o -> k (o :?> 'a)) 
    )
  member x.Return<'a>(value : 'a) : Coroutine<'c,'s,'a> = 
    Co.Coroutine(fun _ -> CoStep.Result(None, value))
  member x.Tick<'a>(p:Coroutine<'c,'s,'a>, c:'c, s:'s, dt:float32<s>) : Option<Updater<'s>> * Choice<'a, Coroutine<'c,'s,'a>> = 
    let step = p.Co(c,s,dt)
    match step with
    | Result(s, res) -> s, Choice1Of2(res)
    | Waiting(s, interval, next) ->
      if interval < dt then s, Choice2Of2(next)
      else s, Choice2Of2(Co.Coroutine(fun _ -> CoStep.Waiting(None, interval - dt, next)))
    | Bind(s0, p, k) -> 
      let step = x.Tick(p, c, s, dt)
      match step with
      | s1, Choice1Of2(p_res) -> 
        thenMaybe s0 s1, Choice2Of2(k p_res)
      | s1, Choice2Of2(p') -> 
        thenMaybe s0 s1, Choice2Of2(x.Bind(p', k))
  // member x.Any()

let co = CoBuilder<unit, unit>()

let three = co{
  return 3
}

let four = <@ %(co{
  let! x = %three
  return x + 1
}) @>

let runnableFour = Linq.RuntimeHelpers.LeafExpressionConverter.EvaluateQuotation(four)


printfn "Hello from F#"
