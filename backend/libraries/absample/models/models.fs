module absample.models

open System

type [<CLIMutable>] AB = { ABId:Guid; ACount:int; BCount:int; AFailCount:int; BFailCount:int }
and AEvent = { ABEventId:Guid; ABId:Guid; AB:AB } 
and BEvent = { ABEventId:Guid; ABId:Guid; AB:AB }
and ABEvent = AEvent of AEvent | BEvent of BEvent



