module absample.efmodels

open absample.models

open System

type AB = absample.models.AB
type [<AbstractClass>] ABEvent() = 
  member val ABEventId = Guid.Empty with get, set
  static member ToUnion (instance:ABEvent) = 
    match instance with
    | :? AEvent as e -> e |> AEvent.ToRecord |> absample.models.ABEvent.AEvent
    | :? BEvent as e -> e |> BEvent.ToRecord |> absample.models.ABEvent.BEvent
    | _ -> failwith "cannot convert Tag to union, a case is missing"
and AEvent(ABId:Guid) =
  inherit ABEvent()
  member val ABId = ABId with get, set
  member val AB:AB = Unchecked.defaultof<AB> with get, set
  static member ToRecord (e:AEvent) : absample.models.AEvent = { ABEventId=e.ABEventId; ABId=e.ABId; AB=e.AB }
and BEvent(ABId:Guid) =
  inherit ABEvent()
  member val ABId = ABId with get, set
  member val AB = Unchecked.defaultof<AB> with get, set
  static member ToRecord (e:BEvent) : absample.models.BEvent = { ABEventId=e.ABEventId; ABId=e.ABId; AB=e.AB }

