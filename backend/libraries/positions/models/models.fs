module positions.model
open System
open Ballerina.Fun
open Ballerina.Option
open Ballerina.Collections.Map
open Ballerina.BusinessRules

type AB = { 
  ABId:Guid;  A:int;
  B:int;
  Total:int;
  CDId:Guid;
}
and CD = { 
  CDId:Guid;
  C:int;
  D:int;
}
and ABCDEvent = SetField of SetFieldEvent
and Context = {
  ABs:Unit -> Map<Guid, AB>; CDs:Unit -> Map<Guid, CD>;
  ActiveEvents:List<ABCDEvent>; PastEvents:List<ABCDEvent>;
  BusinessRules:Map<Guid, BusinessRule>;
  Schema:Schema
}
