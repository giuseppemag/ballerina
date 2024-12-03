module absample.models

open System

type [<CLIMutable>] AB = { ABId:Guid; ACount:int; BCount:int; AFailCount:int; BFailCount:int }
and ABEvent = AEvent of AEvent | BEvent of BEvent
and AEvent = { ABEventId:Guid; ABId:Guid; AB:AB } //; A1EventId:Guid; A1Event:A1Event } 
and BEvent = { ABEventId:Guid; ABId:Guid; AB:AB }

and A1Event = A1EventX of A1EventX | A1Eventy of A1EventY
and A1EventX = { A1EventXId:Guid; Value:string } 
and A1EventY = { A1EventYId:Guid; Value:bool } 
