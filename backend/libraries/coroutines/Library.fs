module Ballerina.Coroutines
open System

type U<'s> = 's -> 's
type Updater<'s> = U<'s>
let replaceWith (v:'a) : U<'a> = fun _ -> v
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
  | Spawn of Coroutine<'a, 's, 'e>
  | Wait of TimeSpan
  | On of ('e -> Option<'a>)
  | Await of Async<'a>
  | Then of (Coroutine<Coroutine<'a, 's, 'e>, 's, 'e>)
  with 
    static member map<'a, 'b, 's, 'e when 'e : comparison> (f:('a -> 'b)) (p:CoroutineResult<'a,'s,'e>) : CoroutineResult<'b, 's, 'e> = 
      match p with
      | Return x -> x |> f |> Return
      | Any ps -> ps |> List.map(Coroutine.map f) |> Any
      | All ps -> ps |> List.map(Coroutine.map f) |> All
      | Spawn p -> p |> Coroutine.map f |> Spawn
      | Wait (t) -> Wait(t)
      | On(e_predicate) -> On(fun e -> e |> e_predicate |> Option.map f)
      | Await (p) -> 
          Await(
            async{ 
              let! x = p
              return f x
            }
          )
      | Then(p_p) -> 
        p_p |> Coroutine.map (Coroutine.map f) |> CoroutineResult.Then

let rec bind(p:Coroutine<'a, 's, 'e>, k:'a -> Coroutine<'b, 's, 'e>) = 
    Co(fun _ -> CoroutineResult.Then(p |> Coroutine.map(k)), None, None)
and repeat (p:Coroutine<'a,'s,'e>) = 
  bind(p, fun _ -> repeat p)
  
type CoroutineBuilder() = 
  member _.Return(result:'a) = 
    Co(fun _ -> CoroutineResult.Return(result), None, None)
  member _.Yield() =
    Co(fun _ -> CoroutineResult.Wait(TimeSpan.FromMilliseconds(0)), None, None)
  member _.Bind(p:Coroutine<'a, 's, 'e>, k:'a -> Coroutine<'b, 's, 'e>) = 
    bind(p, k)
  member _.Any(ps:List<Coroutine<'a,'s,'e>>) =
    Co(fun _ -> CoroutineResult.Any(ps), None, None)
  member _.All(ps:List<Coroutine<'a,'s,'e>>) =
    Co(fun _ -> CoroutineResult.Any(ps), None, None)
  member _.On(p_e:'e -> Option<'a>) =
    Co(fun _ -> CoroutineResult.On(p_e), None, None)
  member _.Wait(t:TimeSpan) =
    Co(fun _ -> CoroutineResult.Wait(t), None, None)
  member _.Await(p : Async<'a>) =
    Co(fun _ -> CoroutineResult.Await(p), None, None)
  member _.Spawn(p:Coroutine<'a,'s,'e>) =
    Co(fun _ -> CoroutineResult.Spawn(p), None, None)
  member _.Repeat(p:Coroutine<'a,'s,'e>) =
    repeat p    
    
let co = CoroutineBuilder()

type Token = { token:string }
let Token = 
  {|
    create = fun () -> async{ return { token=BCrypt.Net.BCrypt.GenerateSalt() } }
  |}    

type NewUser = { email:string; password:string }
type UserEvent = NewUser of NewUser | EmailConfirmed of email:string * token:Token
type UserCoroutinesState = unit 
type User = { id:Guid; email:string; passwordHash:string; emailConfirmed:bool; active:bool }
let User = 
  {|
    create = fun (newUser:NewUser) -> failwith<Async<Guid>> "not implemented";
    update = fun (userId:Guid) (updater:U<User>) -> failwith<Async<Unit>> "not implemented";
    delete = fun (userId:Guid) -> failwith<Async<Unit>> "not implemented";
    updaters = 
      {|
        emailConfirmed = fun (updater:U<bool>) (current:User) -> { current with emailConfirmed = updater(current.emailConfirmed) } 
        active = fun (updater:U<bool>) (current:User) -> { current with active = updater(current.active) } 
      |};
    sendRegistrationConfirmationEmail = fun (userId:Guid) (token:Token) -> failwith<Async<Unit>> "not implemented"
    registrationExpiration = TimeSpan.FromDays(3)
  |}

let register : Coroutine<unit, UserCoroutinesState, UserEvent> = 
  // forever, because users may register at any time
  co.Repeat(
    co{
      // wait for a NewUser event
      let! newUser = co.On (function NewUser newUser -> Some newUser | _ -> None)
      // spawn, so that other users may register while waiting for confirmation from this one
      do! co.Spawn(
        co{
          // create the user right away
          let! userId = co.Await(User.create newUser)
          let! token = co.Await(Token.create())
          do! co.Await(User.sendRegistrationConfirmationEmail userId token)
          do! co.Any [            
            co{ // after a few days, remove this account: it is "dead"
              do! co.Wait User.registrationExpiration
              do! co.Await(User.delete userId)
            }
            co{ // wait for an email confirmation event, then mark the user as confirmed and active
              do! co.On (function | EmailConfirmed (confirmedEmail, confirmedToken) when confirmedEmail = newUser.email && confirmedToken.token = token.token  -> Some() | _ -> None)
              do! co.Await(User.update userId 
                (User.updaters.emailConfirmed(replaceWith true) >> User.updaters.active(replaceWith true)))
            };
        ]
      })
    }
  )
