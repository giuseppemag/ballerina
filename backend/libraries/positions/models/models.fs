module positions.model
open System
open Ballerina.Fun
open Ballerina.Option

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
and ABCDEvent = SetField of SetFieldEvent
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
  tryFindEntity:EntityDescriptorId -> Option<EntityDescriptor>
}
and Context = {
  ABs:Unit -> Map<Guid, AB>; CDs:Unit -> Map<Guid, CD>;
  ActiveEvents:List<ABCDEvent>; PastEvents:List<ABCDEvent>;
  BusinessRules:Map<Guid, BusinessRule>;
  Schema:Schema
}



and EntityMetadata = { EntityMetadataId:Guid; Approval:bool; Entity:EntityDescriptor }
and EntityDescriptor = { EntityDescriptorId:Guid; EntityName:string; GetId:obj -> Option<Guid>; Lookup:obj * List<FieldDescriptor> -> Option<obj> }

and FieldMetadata = { FieldMetadataId:Guid; Approval:bool; CurrentEditPrio:EditPriority }
and IntFieldMetadata = { Self:FieldMetadata; Field:IntFieldDescriptor }
and RefFieldMetadata = { Self:FieldMetadata; Field:RefFieldDescriptor }
and ReadonlyIntFieldMetadata = { Self:FieldMetadata; Field:ReadonlyIntFieldDescriptor }
and SingletonIntFieldMetadata = { Self:FieldMetadata; Field:SingletonIntFieldDescriptor }

and FieldDescriptor = { FieldDescriptorId:Guid; FieldName:string }
and FieldUpdateResult = | ValueChanged = 0 | ValueStayedTheSame = 1 | Failure = 2
and IntFieldDescriptor = { Self:FieldDescriptor; Update:EntitiesIdentifiers -> Updater<int> -> FieldUpdateResult }
and RefFieldDescriptor = { Self:FieldDescriptor; Update:EntitiesIdentifiers -> Updater<Guid> -> FieldUpdateResult }
and ReadonlyIntFieldDescriptor = { Self:FieldDescriptor; Update:EntityIdentifier -> Updater<int> -> FieldUpdateResult }
and SingletonIntFieldDescriptor = { Self:FieldDescriptor; Update:EntityIdentifier -> Updater<int> -> FieldUpdateResult }

and FieldEventBase = { FieldEventId:Guid; EntityDescriptorId:EntityDescriptorId; Assignment:Assignment }
and IntFieldEvent = { Self:FieldEventBase; Targets:EntitiesIdentifiers }
and SingletonIntFieldEvent = { Self:FieldEventBase; Target:EntityIdentifier }
and SetFieldEvent = IntFieldEvent of IntFieldEvent | SingletonIntFieldEvent of SingletonIntFieldEvent

and BusinessRule = { BusinessRuleId:Guid; Name:string; Priority:BusinessRulePriority; Condition:Expr; Actions:List<Assignment> }
and RuleDependency = { ChangedEntityType:EntityDescriptorId; RestrictedVariable:string; RestrictedVariableType:EntityDescriptorId; PathFromVariableToChange:List<FieldDescriptor>; ChangedField:FieldDescriptor }
and RuleDependencies = Map<EntityDescriptorId * FieldDescriptor, List<RuleDependency>>

and Assignment = { Variable:string * List<FieldDescriptor>; Value:Expr }
and VarName = { VarName:string }
and ExprType = LookupType of EntityDescriptorId | PrimitiveType of PrimitiveType
and VarTypes = Map<string, ExprType>
and Vars = Map<string, Var>
and EntityDescriptorId = { EntityDescriptorId:Guid; EntityName:string }
and Var = EntityDescriptorId * EntityIdentifier
and PrimitiveType = IntType | FloatType | StringType | BoolType | GuidType of EntityDescriptorId
and Value = ConstInt of int | ConstFloat of float | ConstString of string | ConstBool of bool | ConstGuid of Guid | Var of Var 
// | Field of FieldDescriptor
and Expr = 
  | Value of Value
  | Binary of BinaryOperator * Expr * Expr
  | VarLookup of string
  | FieldLookup of Expr * List<FieldDescriptor>
  | Exists of string * EntityDescriptorId * Expr
  | SumBy of string * EntityDescriptorId * Expr
  with 
    static member (+) (e1:Expr, e2:Expr) =
      Binary(Plus, e1, e2)
    static member (=>) (varname:string, fields:List<FieldDescriptor>) =
      FieldLookup(Expr.VarLookup varname, fields)
    static member op_GreaterThan (e1:Expr, e2:Expr) =
      Binary(GreaterThan, e1, e2)
and BinaryOperator = Plus | Minus | GreaterThan | Equals | GreaterThanEquals | Times | DividedBy | And | Or

and EntitiesIdentifiers = All | Multiple of Set<Guid>
and EntityIdentifier = One of Guid
and EditPriority = | None = 0 | Predictions = 1 | CustomBusinessRule = 2 | SystemBusinessRule = 3 | User = 4
and BusinessRulePriority = Custom = 0 | System = 1

and Edit = FieldEdit of {| entityId:Guid; fieldDescriptorId:Guid |}
and JobsState = {
  edits:Set<Edit>
}

type RuleDependency with
  member dep.Predicate (context:Context) (changedEntitiesIds:Set<Guid>) =
    fun (restrictedVariable:obj) -> 
      option{
        let! changedEntityType = context.Schema.tryFindEntity dep.ChangedEntityType
        let! restrictedVariableType = context.Schema.tryFindEntity dep.RestrictedVariableType
        let! variableValue = restrictedVariableType.Lookup(restrictedVariable, dep.PathFromVariableToChange)
        return! changedEntityType.GetId variableValue
      }

type EntityDescriptor with 
  member this.ToEntityDescriptorId = 
    { EntityDescriptorId=this.EntityDescriptorId; EntityName=this.EntityName }
