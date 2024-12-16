module positions.model
open System
open Ballerina.Fun

type AB = { 
  ABId:Guid; 
  ACount:int; ACountMetadata:IntFieldMetadata
  BCount:int; BCountMetadata:IntFieldMetadata
  CD:CD; CDMetadata:RefFieldMetadata
}
and CD = { 
  CDId:Guid; 
  CCount:int; CCountMetadata:IntFieldMetadata
}

and FieldMetadata = { FieldMetadataId:Guid; Approval:bool; CurrentEditPrio:EditPriority }
and IntFieldMetadata = { Self:FieldMetadata; Field:IntFieldDescriptor }
and RefFieldMetadata = { Self:FieldMetadata; Field:RefFieldDescriptor }
and ReadonlyIntFieldMetadata = { Self:FieldMetadata; Field:ReadonlyIntFieldDescriptor }
and SingletonIntFieldMetadata = { Self:FieldMetadata; Field:SingletonIntFieldDescriptor }

and FieldDescriptor = { FieldDescriptorId:Guid }
and IntFieldDescriptor = { Self:FieldDescriptor; Update:EntitiesIdentifiers -> Updater<int> -> Unit }
and RefFieldDescriptor = { Self:FieldDescriptor; Update:EntitiesIdentifiers -> Updater<Guid> -> Unit }
and ReadonlyIntFieldDescriptor = { Self:FieldDescriptor }
and SingletonIntFieldDescriptor = { Self:FieldDescriptor; Update:EntityIdentifier -> Updater<int> -> Unit }

and FieldEvent = { FieldEventId:Guid; Updater:Expr }

and BusinessRule = { BusinessRuleId:Guid; Name:string; Priority:BusinessRulePriority; Condition:Expr; Actions:List<Assignment> }
and Assignment = { Entity:EntitiesIdentifiers; Field:FieldDescriptor; Value:Expr }
and Expr = 
  | ConstInt of int | ConstFloat of float | ConstString of string
  | Binary of BinaryOperator * Expr * Expr
  | Field of FieldDescriptor
  | Var of string
  | Exists of string * FieldDescriptor * EntitiesIdentifiers * Expr
  | SumBy of string * FieldDescriptor * EntitiesIdentifiers * Expr
and BinaryOperator = Plus | Minus | GreaterThan | Equals | GreaterThanEquals | Times | DividedBy | And | Or

and EntitiesIdentifiers = All | Some of Set<Guid>
and EntityIdentifier = One of Guid
and EditPriority = | None = 0 | Predictions = 1 | CustomBusinessRule = 2 | SystemBusinessRule = 3 | User = 4
and BusinessRulePriority = Custom = 0 | System = 1

and Schema = {
  AB:{| ACount:IntFieldDescriptor; BCount:IntFieldDescriptor; CD:RefFieldDescriptor |}
  CD:{| CCount:IntFieldDescriptor |}
}
and Context = {
  AB1:AB; AB2: AB; CDs:Map<Guid, CD>;
  ActiveEvents:List<FieldEvent>; PastEvents:List<FieldEvent>;
  BusinessRules:Map<Guid, BusinessRule>;
  Schema:Schema
}
