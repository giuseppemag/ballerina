module positions.model
open System
open Ballerina.Fun
open Ballerina.Option
open Ballerina.Collections.Map
open Ballerina.BusinessRules

type AB = { 
  ABId:Guid; Metadata:EntityMetadata
  A:int; ACountMetadata:SingletonIntFieldMetadata
  B:int; BCountMetadata:SingletonIntFieldMetadata
  TotalABC:int; TotalABCMetadata:ReadonlyIntFieldMetadata
  CD:CD; CDMetadata:RefFieldMetadata
}
and CD = { 
  CDId:Guid; Metadata:EntityMetadata 
  C:int; CCountMetadata:SingletonIntFieldMetadata
}
and ABCDEvent = SetField of SetFieldEvent
and Context = {
  ABs:Unit -> Map<Guid, AB>; CDs:Unit -> Map<Guid, CD>;
  ActiveEvents:List<ABCDEvent>; PastEvents:List<ABCDEvent>;
  BusinessRules:Map<Guid, BusinessRule>;
  Schema:Schema
}
