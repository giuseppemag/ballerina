module positions.model
open System
open Ballerina.Fun

type AB = { 
  ABId:Guid; Metadata:EntityMetadata
  ACount:int; ACountMetadata:SingletonIntFieldMetadata
  BCount:int; BCountMetadata:SingletonIntFieldMetadata
  TotalABC:int; TotalABCMetadata:ReadonlyIntFieldMetadata
  CD:CD; CDMetadata:RefFieldMetadata
}
and CD = { 
  CDId:Guid; Metadata:EntityMetadata 
  CCount:int; CCountMetadata:SingletonIntFieldMetadata
}

and EntityMetadata = { EntityMetadataId:Guid; Approval:bool; Entity:EntityDescriptor }
and EntityDescriptor = { EntityDescriptorId:Guid }

and FieldMetadata = { FieldMetadataId:Guid; Approval:bool; CurrentEditPrio:EditPriority }
and IntFieldMetadata = { Self:FieldMetadata; Field:IntFieldDescriptor }
and RefFieldMetadata = { Self:FieldMetadata; Field:RefFieldDescriptor }
and ReadonlyIntFieldMetadata = { Self:FieldMetadata; Field:ReadonlyIntFieldDescriptor }
and SingletonIntFieldMetadata = { Self:FieldMetadata; Field:SingletonIntFieldDescriptor }

and FieldDescriptor = { FieldDescriptorId:Guid }
and IntFieldDescriptor = { Self:FieldDescriptor; Update:EntitiesIdentifiers -> Updater<int> -> Unit }
and RefFieldDescriptor = { Self:FieldDescriptor; Update:EntitiesIdentifiers -> Updater<Guid> -> Unit }
and ReadonlyIntFieldDescriptor = { Self:FieldDescriptor; Update:EntityIdentifier -> Updater<int> -> Unit }
and SingletonIntFieldDescriptor = { Self:FieldDescriptor; Update:EntityIdentifier -> Updater<int> -> Unit }

and FieldEventBase = { FieldEventId:Guid; EntityDescriptor:EntityDescriptor; Assignment:Assignment }
and IntFieldEvent = { Self:FieldEventBase; Targets:EntitiesIdentifiers }
and SingletonIntFieldEvent = { Self:FieldEventBase; Target:EntityIdentifier }
and SetFieldEvent = IntFieldEvent of IntFieldEvent | SingletonIntFieldEvent of SingletonIntFieldEvent
and ABCDEvent = SetField of SetFieldEvent

and BusinessRule = { BusinessRuleId:Guid; Name:string; Priority:BusinessRulePriority; Entity:EntityDescriptor; Condition:Expr; Actions:List<Assignment> }
and Assignment = { Variable:Expr; Value:Expr }
and Vars = Map<string, Var>
and Var = EntityDescriptor * EntityIdentifier
and Value = ConstInt of int | ConstFloat of float | ConstString of string | ConstBool of bool | ConstGuid of Guid | Var of Var | Field of FieldDescriptor
and Expr = 
  | Value of Value
  | Binary of BinaryOperator * Expr * Expr
  | VarLookup of string
  | Exists of string * EntityDescriptor * Expr
  | SumBy of string * EntityDescriptor * Expr
  with 
    static member (+) (e1:Expr, e2:Expr) =
      Binary(Plus, e1, e2)
    static member (=>) (e1:Expr, e2:Expr) =
      Binary(Dot, e1, e2)
    static member op_GreaterThan (e1:Expr, e2:Expr) =
      Binary(GreaterThan, e1, e2)
and BinaryOperator = Dot | Plus | Minus | GreaterThan | Equals | GreaterThanEquals | Times | DividedBy | And | Or

and EntitiesIdentifiers = All | Multiple of Set<Guid>
and EntityIdentifier = One of Guid
and EditPriority = | None = 0 | Predictions = 1 | CustomBusinessRule = 2 | SystemBusinessRule = 3 | User = 4
and BusinessRulePriority = Custom = 0 | System = 1

and Schema = {
  AB:{| 
    Entity:EntityDescriptor
    ACount:SingletonIntFieldDescriptor; 
    BCount:SingletonIntFieldDescriptor; 
    TotalABC:ReadonlyIntFieldDescriptor 
    CD:RefFieldDescriptor 
  |}
  CD:{| 
    Entity:EntityDescriptor
    CCount:SingletonIntFieldDescriptor 
  |}
}
and Context = {
  ABs:Unit -> Map<Guid, AB>; CDs:Unit -> Map<Guid, CD>;
  ActiveEvents:List<ABCDEvent>; PastEvents:List<ABCDEvent>;
  BusinessRules:Map<Guid, BusinessRule>;
  Schema:Schema
}
and Edit = FieldEdit of {| entityId:Guid; fieldDescriptorId:Guid |}
and JobsState = {
  edits:Set<Edit>
}
