module absample.efmodels

open absample.models

open System
open System.Runtime.Serialization
open System.Text.Json.Serialization

type AB = absample.models.AB
// [<KnownType(typeof<AEvent>)>]
// [<KnownType(typeof<BEvent>)>]
// [<JsonConverter(typeof<JsonInheritanceConverter>)>]
[<JsonDerivedType(typeof<AEvent>, typeDiscriminator = "AEvent")>]
[<JsonDerivedType(typeof<BEvent>, typeDiscriminator = "BEvent")>]
type [<AbstractClass>] ABEvent(ABId:Guid) = 
  member val ABEventId = Guid.Empty with get, set
  member val ABId = ABId with get, set
  member val AB = Unchecked.defaultof<AB> with get, set
  static member ToUnion (instance:ABEvent) = 
    match instance with
    | :? AEvent as e -> e |> AEvent.ToRecord |> absample.models.ABEvent.AEvent
    | :? BEvent as e -> e |> BEvent.ToRecord |> absample.models.ABEvent.BEvent
    | _ -> failwith "cannot convert Tag to union, a case is missing"
  static member FromUnion (instance:absample.models.ABEvent) : ABEvent = 
    match instance with
    | AEvent e -> e |> AEvent.FromRecord :> ABEvent
    | BEvent e -> e |> BEvent.FromRecord :> ABEvent
and AEvent(ABId:Guid) = // , A1EventId:Guid) =
  inherit ABEvent(ABId)
  // member val A1EventId = A1EventId with get, set
  // member val A1Event:A1Event = Unchecked.defaultof<A1Event> with get, set
  static member ToRecord (e:AEvent) : absample.models.AEvent = { ABEventId=e.ABEventId; ABId=e.ABId; AB=e.AB; 
    // A1EventId=e.A1EventId; A1Event=e.A1Event 
    }
  static member FromRecord (e:absample.models.AEvent) : AEvent = 
    new AEvent(ABId = e.ABId, //A1EventId = e.A1EventId, 
      AB = e.AB //, A1Event = e.A1Event
      )
and BEvent(ABId:Guid) =
  inherit ABEvent(ABId)
  static member ToRecord (e:BEvent) : absample.models.BEvent = { ABEventId=e.ABEventId; ABId=e.ABId; AB=e.AB }
  static member FromRecord (e:absample.models.BEvent) : BEvent = 
    new BEvent(ABId = e.ABId, AB = e.AB)
