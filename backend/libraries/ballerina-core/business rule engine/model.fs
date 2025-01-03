module Ballerina.BusinessRules

open System
open Ballerina.Fun
open Ballerina.Option
open Ballerina.Collections.Map

type EntityMetadata = { EntityMetadataId:Guid; Approval:bool; Entity:EntityDescriptor }
and EntityDescriptor = { 
  EntityDescriptorId:Guid; 
  EntityName:string; 
  GetId:obj -> Option<Guid>; 
  Lookup:obj * List<FieldDescriptorId> -> Option<obj>;
  GetEntities:Unit -> List<obj> }

and FieldMetadata = { FieldMetadataId:Guid; Approval:bool; CurrentEditPrio:EditPriority }
and IntFieldMetadata = { Self:FieldMetadata; Field:FieldDescriptorId }
and RefFieldMetadata = { Self:FieldMetadata; Field:FieldDescriptorId }
and ReadonlyIntFieldMetadata = { Self:FieldMetadata; Field:FieldDescriptorId }
and SingletonIntFieldMetadata = { Self:FieldMetadata; Field:FieldDescriptorId }

and FieldDescriptorId = { FieldDescriptorId:Guid; FieldName:string }
and FieldDescriptor = { 
  FieldDescriptorId:Guid; 
  FieldName:string;
  Type:Unit -> ExprType
  Get:Guid -> Option<Value>; 
  Update:{| 
    AsInt:EntityIdentifier -> Updater<int> -> FieldUpdateResult;
    AsRef:EntityIdentifier -> Updater<Guid> -> FieldUpdateResult;
    AsRefs:EntitiesIdentifiers -> Updater<Guid> -> FieldUpdateResult;
 |}
}
and FieldUpdateResult = | ValueChanged = 0 | ValueStayedTheSame = 1 | Failure = 2
// and IntFieldDescriptor = { 
//   Self:FieldDescriptor; 
// }
// and RefFieldDescriptor = { 
//   Self:FieldDescriptor; 
// }
// and ReadonlyIntFieldDescriptor = { 
//   Self:FieldDescriptor; 
// }
// and SingletonIntFieldDescriptor = { 
//   Self:FieldDescriptor; 
// }

and FieldEventBase = { FieldEventId:Guid; EntityDescriptorId:EntityDescriptorId; Assignment:Assignment }
and IntFieldEvent = { Self:FieldEventBase; Targets:EntitiesIdentifiers }
and SingletonIntFieldEvent = { Self:FieldEventBase; Target:EntityIdentifier }
and SetFieldEvent = IntFieldEvent of IntFieldEvent | SingletonIntFieldEvent of SingletonIntFieldEvent

and BusinessRuleId = { BusinessRuleId:Guid }
and BusinessRule = { BusinessRuleId:Guid; Name:string; Priority:BusinessRulePriority; Condition:Expr; Actions:List<Assignment> }
and RuleDependency = { ChangedEntityType:EntityDescriptorId; RestrictedVariable:VarName; RestrictedVariableType:EntityDescriptorId; PathFromVariableToChange:List<FieldDescriptorId>; ChangedField:FieldDescriptorId }
and RuleDependencies = { dependencies:Map<EntityDescriptorId * FieldDescriptorId, List<RuleDependency>> }

and Assignment = { Variable:VarName * List<FieldDescriptorId>; Value:Expr }
and VarName = { VarName:string }
and ExprType = LookupType of EntityDescriptorId | PrimitiveType of PrimitiveType
and VarTypes = Map<VarName, ExprType>
and Vars = Map<VarName, Var>
and EntityDescriptorId = { EntityDescriptorId:Guid; EntityName:string }
and Var = EntityDescriptorId * EntityIdentifier
and PrimitiveType = IntType | FloatType | StringType | BoolType | GuidType of EntityDescriptorId
and Value = ConstInt of int | ConstFloat of float | ConstString of string | ConstBool of bool | ConstGuid of Guid | Var of Var 
// | Field of FieldDescriptor
and Expr = 
  | Value of Value
  | Binary of BinaryOperator * Expr * Expr
  | VarLookup of VarName
  | FieldLookup of Expr * List<FieldDescriptorId>
  | Exists of VarName * EntityDescriptorId * Expr
  | SumBy of VarName * EntityDescriptorId * Expr
and BinaryOperator = Plus | Minus | GreaterThan | Equals | GreaterThanEquals | Times | DividedBy | And | Or

and EntitiesIdentifiers = All | Multiple of Set<Guid>
and EntityIdentifier = One of Guid
and EditPriority = | None = 0 | Predictions = 1 | CustomBusinessRule = 2 | SystemBusinessRule = 3 | User = 4
and BusinessRulePriority = Custom = 0 | System = 1

and Edit = FieldEdit of {| entityId:Guid; fieldDescriptorId:Guid |}
and JobsState = {
  edits:Set<Edit>
}
and Schema = {
  tryFindEntity:EntityDescriptorId -> Option<EntityDescriptor>
  tryFindField:FieldDescriptorId -> Option<FieldDescriptor>
}

type Expr with 
  static member (+) (e1:Expr, e2:Expr) =
    Binary(Plus, e1, e2)
  static member (=>) (varname:VarName, fields:List<FieldDescriptorId>) =
    FieldLookup(Expr.VarLookup varname, fields)
  static member op_GreaterThan (e1:Expr, e2:Expr) =
    Binary(GreaterThan, e1, e2)

type FieldDescriptor with
  member this.ToFieldDescriptorId : FieldDescriptorId = 
    { FieldDescriptorId = this.FieldDescriptorId; FieldName = this.FieldName }

type EntityDescriptor with 
  member this.ToEntityDescriptorId = 
    { EntityDescriptorId=this.EntityDescriptorId; EntityName=this.EntityName }

type RuleDependency with
  member dep.Predicate (schema:Schema) (changedEntitiesIds:Set<Guid>) =
    option{
      let! changedEntityType = schema.tryFindEntity dep.ChangedEntityType
      // do printfn "changedEntityType = %A" (changedEntityType.ToEntityDescriptorId)
      // do Console.ReadLine() |> ignore
      let! restrictedVariableType = schema.tryFindEntity dep.RestrictedVariableType
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
  member deps.PredicatesByRestrictedVariable (schema:Schema) (changedEntitiesIds:Set<Guid>) =
    let (||.) = fun p1 p2 -> fun (o:obj) -> p1 o || p2 o
    let dependencies = deps.dependencies |> Map.values
    let dependencies = 
      seq{
        for depsByChangeType in dependencies do
        for dep in depsByChangeType do
        yield [dep.RestrictedVariable, [dep.Predicate schema changedEntitiesIds]] |> Map.ofList
      } 
    dependencies
      |> Map.mergeMany (fun l1 l2 -> l1 @ l2)
      |> Map.map (fun k ps -> ps |> Seq.reduce (||.))

type BusinessRule with
  member this.ToBusinessRuleId = { BusinessRuleId = this.BusinessRuleId }
