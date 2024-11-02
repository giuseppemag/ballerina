namespace Ballerina.Coroutines

type U<'s> = 's -> 's
type DeltaT = float

type Coroutine<'a, 's> = Co of ('s * DeltaT -> CoroutineResult<'a, 's>)

and CoroutineResult<'a, 's> = 
  | Done of 'a * Option<U<'s>>
  | Suspended of Option<U<'s>> * Coroutine<'a, 's>


type Coroutine<'a, 's> with
  member co.embed(x:float) = x
