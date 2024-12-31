module positions.model
open System
open Ballerina.Fun
open Ballerina.Option
open Ballerina.Collections.Map

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
  tryFindField:FieldDescriptorId -> Option<FieldDescriptor>
}
and Context = {
  ABs:Unit -> Map<Guid, AB>; CDs:Unit -> Map<Guid, CD>;
  ActiveEvents:List<ABCDEvent>; PastEvents:List<ABCDEvent>;
  BusinessRules:Map<Guid, BusinessRule>;
  Schema:Schema
}



and EntityMetadata = { EntityMetadataId:Guid; Approval:bool; Entity:EntityDescriptor }
and EntityDescriptor = { 
  EntityDescriptorId:Guid; 
  EntityName:string; 
  GetId:obj -> Option<Guid>; 
  Lookup:obj * List<FieldDescriptorId> -> Option<obj>;
  GetEntities:Unit -> List<obj> }

and FieldMetadata = { FieldMetadataId:Guid; Approval:bool; CurrentEditPrio:EditPriority }
and IntFieldMetadata = { Self:FieldMetadata; Field:IntFieldDescriptor }
and RefFieldMetadata = { Self:FieldMetadata; Field:RefFieldDescriptor }
and ReadonlyIntFieldMetadata = { Self:FieldMetadata; Field:ReadonlyIntFieldDescriptor }
and SingletonIntFieldMetadata = { Self:FieldMetadata; Field:SingletonIntFieldDescriptor }

and FieldDescriptorId = { FieldDescriptorId:Guid; FieldName:string }
and FieldDescriptor = { 
  FieldDescriptorId:Guid; 
  FieldName:string;
  Get:Guid -> Option<Value>; 
  // GetAsInt:Guid -> Option<int>; 
  // GetAsRef:Guid -> Option<Guid>; 
}
and FieldUpdateResult = | ValueChanged = 0 | ValueStayedTheSame = 1 | Failure = 2
and IntFieldDescriptor = { 
  Self:FieldDescriptor; 
  Get:obj -> Option<int>; 
  Update:EntitiesIdentifiers -> Updater<int> -> FieldUpdateResult }
and RefFieldDescriptor = { 
  Self:FieldDescriptor; 
  Get:obj -> Option<Guid>; 
  Update:EntitiesIdentifiers -> Updater<Guid> -> FieldUpdateResult 
}
and ReadonlyIntFieldDescriptor = { 
  Self:FieldDescriptor; 
  Get:obj -> Option<int>; 
  Update:EntityIdentifier -> Updater<int> -> FieldUpdateResult 
}
and SingletonIntFieldDescriptor = { 
  Self:FieldDescriptor; 
  Get:obj -> Option<int>; 
  Update:EntityIdentifier -> Updater<int> -> FieldUpdateResult 
}

and FieldEventBase = { FieldEventId:Guid; EntityDescriptorId:EntityDescriptorId; Assignment:Assignment }
and IntFieldEvent = { Self:FieldEventBase; Targets:EntitiesIdentifiers }
and SingletonIntFieldEvent = { Self:FieldEventBase; Target:EntityIdentifier }
and SetFieldEvent = IntFieldEvent of IntFieldEvent | SingletonIntFieldEvent of SingletonIntFieldEvent

and BusinessRule = { BusinessRuleId:Guid; Name:string; Priority:BusinessRulePriority; Condition:Expr; Actions:List<Assignment> }
and RuleDependency = { ChangedEntityType:EntityDescriptorId; RestrictedVariable:string; RestrictedVariableType:EntityDescriptorId; PathFromVariableToChange:List<FieldDescriptorId>; ChangedField:FieldDescriptorId }
and RuleDependencies = { dependencies:Map<EntityDescriptorId * FieldDescriptorId, List<RuleDependency>> }

and Assignment = { Variable:string * List<FieldDescriptorId>; Value:Expr }
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
  | FieldLookup of Expr * List<FieldDescriptorId>
  | Exists of string * EntityDescriptorId * Expr
  | SumBy of string * EntityDescriptorId * Expr
  with 
    static member (+) (e1:Expr, e2:Expr) =
      Binary(Plus, e1, e2)
    static member (=>) (varname:string, fields:List<FieldDescriptorId>) =
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

type FieldDescriptor with
  member this.ToFieldDescriptorId : FieldDescriptorId = 
    { FieldDescriptorId = this.FieldDescriptorId; FieldName = this.FieldName }

type EntityDescriptor with 
  member this.ToEntityDescriptorId = 
    { EntityDescriptorId=this.EntityDescriptorId; EntityName=this.EntityName }

type RuleDependency with
  member dep.Predicate (context:Context) (changedEntitiesIds:Set<Guid>) =
    option{
      let! changedEntityType = context.Schema.tryFindEntity dep.ChangedEntityType
      // do printfn "changedEntityType = %A" (changedEntityType.ToEntityDescriptorId)
      // do Console.ReadLine() |> ignore
      let! restrictedVariableType = context.Schema.tryFindEntity dep.RestrictedVariableType
      // do printfn "restrictedVariableType = %A" (restrictedVariableType.ToEntityDescriptorId)
      // do Console.ReadLine() |> ignore
      return fun (restrictedVariable:obj) -> 
        option{
            // do printfn "restrictedVariable = %A" (restrictedVariable)
            // do Console.ReadLine() |> ignore
            let! variableValue = restrictedVariableType.Lookup(restrictedVariable, dep.PathFromVariableToChange)
            // do printfn "variableValue = %A" (variableValue)
            // do Console.ReadLine() |> ignore
            let! variableValueId = changedEntityType.GetId variableValue
            // do printfn "variableValueId = %A" (variableValueId)
            // do Console.ReadLine() |> ignore
            return changedEntitiesIds |> Set.contains variableValueId
          } |> Option.defaultValue true
        } |> Option.defaultValue (fun o -> true)


type RuleDependencies with
  member deps.PredicatesByRestrictedVariable (context:Context) (changedEntitiesIds:Set<Guid>) =
    let (||.) = fun p1 p2 -> fun (o:obj) -> p1 o || p2 o
    let dependencies = deps.dependencies |> Map.values
    let dependencies = 
      seq{
        for depsByChangeType in dependencies do
        for dep in depsByChangeType do
        yield [dep.RestrictedVariable, [dep.Predicate context changedEntitiesIds]] |> Map.ofList
      } 
    dependencies
      |> Map.mergeMany (fun l1 l2 -> l1 @ l2)
      |> Map.map (fun k ps -> ps |> Seq.reduce (||.))
