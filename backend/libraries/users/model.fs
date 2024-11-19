module Users
open System
open Ballerina.Coroutines
open Ballerina.Fun

type [<CLIMutable>] Token = { TokenId:Guid; Token:string }
let Token = {|
  Zero = { TokenId=Guid.Empty; Token="" }
  Create = fun () -> async{ return { TokenId = Guid.NewGuid(); Token=BCrypt.Net.BCrypt.GenerateSalt() } }
|} 
  

type [<CLIMutable>] NewUserEventCase = { UserEventId:Guid; Email:string; Password:string }
type [<CLIMutable>] EmailConfirmedEventCase = { UserEventId:Guid; Email:string; Token:Token }
type UserEventUnion = NewUser of NewUserEventCase | EmailConfirmed of EmailConfirmedEventCase
type [<CLIMutable>] User = { UserId:Guid; Email:string; PasswordHash:string; EmailConfirmed:bool; Active:bool }

type [<AbstractClass>] UserEvent() = 
  member val UserEventId = Guid.Empty with get, set
  static member ToUnion (instance:UserEvent) = 
    match instance with
    | :? NewUserEvent as l -> l |> NewUserEvent.ToRecord |> UserEventUnion.NewUser 
    | :? EmailConfirmedEvent as i -> i |> EmailConfirmedEvent.ToRecord |> UserEventUnion.EmailConfirmed
    | _ -> failwith "cannot convert Tag to union, a case is missing"
and NewUserEvent(Email:string, Password:string) =
  inherit UserEvent()
  member val Email = Email with get, set
  member val Password = Password with get, set
  static member ToRecord (i:NewUserEvent) : NewUserEventCase = { UserEventId=i.UserEventId; Email=i.Email; Password=i.Password }
and EmailConfirmedEvent(Email:string, TokenId:Guid) =
  inherit UserEvent()
  member val Email = Email with get, set
  member val TokenId:Guid = TokenId with get, set
  member val Token:Token = Token.Zero with get, set
  static member ToRecord (i:EmailConfirmedEvent) : EmailConfirmedEventCase = { UserEventId=i.UserEventId; Email=i.Email; Token=i.Token }


type UserCoroutinesState = unit 
let User = 
  {|
    Create = fun (newUser:NewUserEventCase) -> failwith<Async<Guid>> "not implemented";
    Update = fun (userId:Guid) (updater:U<User>) -> failwith<Async<Unit>> "not implemented";
    Delete = fun (userId:Guid) -> failwith<Async<Unit>> "not implemented";
    Updaters = 
      {|
        EmailConfirmed = fun (updater:U<bool>) (current:User) -> { current with EmailConfirmed = updater(current.EmailConfirmed) } 
        Active = fun (updater:U<bool>) (current:User) -> { current with Active = updater(current.Active) } 
      |};
    SendRegistrationConfirmationEmail = fun (userId:Guid) (token:Token) -> failwith<Async<Unit>> "not implemented"
    RegistrationExpiration = TimeSpan.FromDays(3)
  |}

let register : Coroutine<unit, UserCoroutinesState, UserEventUnion> = 
  // forever, because users may register at any time
  co.Repeat(
    co{
      // wait for a NewUser event
      let! newUser = co.On (function NewUser newUser -> Some newUser | _ -> None)
      // spawn, so that other users may register while waiting for confirmation from this one
      do! co.Spawn(
        co{
          // create the user right away
          let! userId = co.Await(User.Create newUser)
          let! token = co.Await(Token.Create())
          do! co.Await(User.SendRegistrationConfirmationEmail userId token)
          do! co.Any [            
            co{ // after a few days, remove this account: it is "dead"
              wait User.RegistrationExpiration
              do! co.Await(User.Delete userId)
            }
            co{ // wait for an email confirmation event, then mark the user as confirmed and active
              do! co.On (function | EmailConfirmed e when e.Email = newUser.Email && e.Token.Token = token.Token  -> Some() | _ -> None)
              do! co.Await(User.Update userId 
                (User.Updaters.EmailConfirmed(replaceWith true) >> User.Updaters.Active(replaceWith true)))
            };
        ]
      })
    }
  )
