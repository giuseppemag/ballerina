module positions.model
open System
open Ballerina.Fun
open Ballerina.Option
open Ballerina.Collections.Map
open Ballerina.BusinessRules

type AB = { 
  ABId:Guid;  
  A1:int;
  B1:int;
  CDId:Guid;
  Total1:int;
  А2:int;
  Б2:int;
  Весь2:int;
  Α3: int;
  Β3: int;
  Σ3: int;
}
and CD = { 
  CDId:Guid;
  C:int;
  D:int;
  EFId:Guid;
}
and EF = { 
  EFId:Guid;
  E:int;
  F:int;
}
and ABCDEvent = Edit of BusinessRule
and Context = {
  ABs:Unit -> Map<Guid, AB>; CDs:Unit -> Map<Guid, CD>; EFs:Unit -> Map<Guid, EF>;
  ActiveEvents:List<ABCDEvent>; PastEvents:List<ABCDEvent>;
  BusinessRules:Map<Guid, BusinessRule>;
  Schema:Schema
}
