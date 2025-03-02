module absample.models

open System

[<CLIMutable>]
type AB =
    { ABId: Guid
      ACount: int
      BCount: int
      AFailCount: int
      BFailCount: int }

and ABEvent =
    | AEvent of AEvent
    | BEvent of BEvent

and AEvent = { event: ABEventBase; AStep: int } //; A1EventId:Guid; A1Event:A1Event }
and BEvent = { event: ABEventBase; BStep: int }

and ABEventBase =
    { ABEventId: Guid
      ABId: Guid
      AB: AB
      CreatedAt: DateTime
      ProcessingStatus: ABEventStatus }

and ABEventStatus =
    | Enqueued = 0
    | Processed = 1
    | Failed = 2
