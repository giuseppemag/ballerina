module Ballerina.BusinessRules

open System
open Ballerina.Fun
open Ballerina.Option
open Ballerina.Collections.Map
open Sum
open Errors

type EntityDescriptor = { 
  EntityDescriptorId:Guid; 
  EntityName:string; 
  TryFind:Guid -> Option<obj>; 
  GetId:obj -> Option<Guid>; 
  Lookup:obj * List<FieldDescriptorId> -> Option<obj>;
  GetEntities:Unit -> List<obj> 
  GetFieldDescriptors:Unit -> Map<FieldDescriptorId,FieldDescriptor>
}

and FieldDescriptorId = { FieldDescriptorId:Guid; FieldName:string }
and FieldDescriptor = { 
  FieldDescriptorId:Guid; 
  FieldName:string;
  Type:Unit -> ExprType
  Lookup:obj -> Option<Value>; 
  Get:Guid -> Option<Value>; 
  Update:{| 
    AsInt:EntityIdentifier -> Updater<int> -> FieldUpdateResult;
    AsRef:EntityIdentifier -> Updater<Guid> -> FieldUpdateResult;
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

and BusinessRuleId = { BusinessRuleId:Guid }
and BusinessRule = { BusinessRuleId:Guid; Name:string; Priority:BusinessRulePriority; Condition:Expr; Actions:List<Assignment> }
and RuleDependency = { ChangedEntityType:EntityDescriptorId; RestrictedVariable:VarName; RestrictedVariableType:EntityDescriptorId; PathFromVariableToChange:List<FieldDescriptorId>; ChangedField:FieldDescriptorId }
and RuleDependencies = { dependencies:Map<EntityDescriptorId * FieldDescriptorId, Set<RuleDependency>> }

and Assignment = { Variable:VarName * List<FieldDescriptorId>; Value:Expr }
and VarName = { VarName:string }
and TypeBinding = { TypeId:TypeId; Type:ExprType }
and TypeBindings = Map<TypeId, ExprType>
and TypeId = { TypeName:string; TypeId:Guid }
and UnificationConstraints = { EqualityClasses:Map<VarName, Set<VarName>> }
and ExprType = 
  | UnitType
  | VarType of VarName
  | SchemaLookupType of EntityDescriptorId 
  | LookupType of TypeId
  | PrimitiveType of PrimitiveType 
  | RecordType of Map<string,ExprType> 
  | UnionType of List<UnionCase>
  | MapType of ExprType * ExprType
  | TupleType of List<ExprType>
  | OptionType of ExprType
  | ListType of ExprType
  | SetType of ExprType
and UnionCase = { CaseName:string; Fields:ExprType }
and VarTypes = Map<VarName, ExprType>
and Vars = Map<VarName, Var>
and EntityDescriptorId = { EntityDescriptorId:Guid; EntityName:string }
and Var = EntityDescriptorId * EntityIdentifier
and PrimitiveType = DateOnlyType | DateTimeType | IntType | FloatType | StringType | BoolType | GuidType | RefType of EntityDescriptorId
and Value = ConstInt of int | ConstFloat of float | ConstString of string | ConstBool of bool | ConstGuid of Guid | Var of Var 
// | Field of FieldDescriptor
and Expr = 
  | Value of Value
  | Binary of BinaryOperator * Expr * Expr
  | Unary of UnaryOperator * Expr
  | VarLookup of VarName
  | FieldLookup of Expr * FieldDescriptorId
  | RecordFieldLookup of Expr * string
  | Exists of VarName * EntityDescriptorId * Expr
  | SumBy of VarName * EntityDescriptorId * Expr
and UnaryOperator = Not | Minus
and BinaryOperator = Plus | Minus | GreaterThan | Equals | GreaterThanEquals | Times | DividedBy | And | Or

and EntitiesIdentifiers = All | Multiple of Set<Guid>
and EntityIdentifier = One of Guid
and BusinessRulePriority = Custom = 0 | System = 1 | User = 2

and Edit = FieldEdit of {| entityId:Guid; fieldDescriptorId:Guid |}
and JobsState = {
  edits:Set<Edit>
}
and Schema = {
  tryFindEntity:EntityDescriptorId -> Option<EntityDescriptor>
  tryFindField:FieldDescriptorId -> Option<FieldDescriptor>
}

type Value with
  member self.toObject = 
    match self with
    | Value.ConstInt v -> Some(v :> obj)
    | Value.ConstBool v -> Some(v :> obj)
    | Value.ConstFloat v -> Some(v :> obj)
    | Value.ConstGuid v -> Some(v :> obj)
    | Value.ConstString v -> Some(v :> obj)
    | _ -> None    

type Expr with 
  static member op_BooleanOr (e1:Expr, e2:Expr) =
    Binary(Or, e1, e2)
  static member (+) (e1:Expr, e2:Expr) =
    Binary(Plus, e1, e2)
  static member (=>>) (e:Expr, fields:List<FieldDescriptorId>) =
    match fields with
    | [] -> e
    | f::fs -> Expr.FieldLookup(e, f) =>> fs
  static member (=>) (varname:VarName, field:FieldDescriptorId) =
    FieldLookup(Expr.VarLookup varname, field)
  static member op_GreaterThan (e1:Expr, e2:Expr) =
    Binary(GreaterThan, e1, e2)

type TypeBinding with
  static member Create (name,exprType) = { TypeBinding.TypeId=name; TypeBinding.Type=exprType }

type TypeId with
  static member Create name = { TypeName=name; TypeId=Guid.CreateVersion7() }

type ExprType with
  static member Extend t1 t2 =
    match t1, t2 with
    | RecordType fields1, RecordType fields2 
      when fields1 |> Map.keys |> Set.ofSeq |> Set.intersect (fields2 |> Map.keys |> Set.ofSeq) |> Set.isEmpty
      -> Map.merge (fun a _ -> a) fields1 fields2 |> ExprType.RecordType |> Some
    | _ -> None
  static member GetTypesFreeVars (t:ExprType) : Set<TypeId> = 
    let (!) = ExprType.GetTypesFreeVars
    match t with
    | ExprType.UnitType | ExprType.VarType _ -> Set.empty
    | ExprType.TupleType ts -> ts |> Seq.map (!) |> Seq.fold (+) Set.empty
    | ExprType.ListType t
    | ExprType.SetType t
    | ExprType.OptionType t -> !t
    | ExprType.LookupType t -> Set.singleton t
    | ExprType.MapType(k,v) -> !k + !v
    | ExprType.SchemaLookupType _ 
    | ExprType.PrimitiveType _ -> Set.empty
    | ExprType.UnionType cs -> cs |> Seq.map (fun c -> !c.Fields) |> Seq.fold (+) Set.empty
    | ExprType.RecordType fs -> fs |> Map.values |> Seq.map (!) |> Seq.fold (+) Set.empty

type FieldDescriptor with
  member this.ToFieldDescriptorId : FieldDescriptorId = 
    { FieldDescriptorId = this.FieldDescriptorId; FieldName = this.FieldName }

type EntityDescriptor with 
  member this.ToEntityDescriptorId = 
    { EntityDescriptorId=this.EntityDescriptorId; EntityName=this.EntityName }

type BusinessRule with
  member this.ToBusinessRuleId = { BusinessRuleId = this.BusinessRuleId }

type EntityDescriptor with
  static member GenericLookup:EntityDescriptor -> Map<EntityDescriptorId, EntityDescriptor> -> obj * List<FieldDescriptorId> -> Option<obj> = 
    fun self allEntities (obj, fieldIds) ->
      option{
        // do printfn "lookup = %A" (obj, fieldIds)
        // do Console.ReadLine() |> ignore
        match fieldIds with
        | [] -> return obj
        | fieldId::fieldIds -> 
            let! fieldDescriptor = self.GetFieldDescriptors() |> Map.tryFind fieldId
            // do printfn "fieldDescriptor = %A" fieldDescriptor
            // do Console.ReadLine() |> ignore
            let! fieldValue = fieldDescriptor.Lookup obj
            // do printfn "fieldValue = %A" fieldValue
            // do Console.ReadLine() |> ignore
            match fieldDescriptor.Type(), fieldValue with
            | ExprType.SchemaLookupType entityDescriptorId, Value.ConstGuid id ->
              let! entityDescriptor = allEntities |> Map.tryFind entityDescriptorId
              // do printfn "entityDescriptor = %A" entityDescriptor
              // do Console.ReadLine() |> ignore
              let! fieldValue = entityDescriptor.TryFind id
              // do printfn "fieldValue = %A" fieldValue
              // do Console.ReadLine() |> ignore
              let! result = entityDescriptor.Lookup (fieldValue, fieldIds)
              return result
            | _ -> 
              let! result = fieldValue.toObject
              // do printfn "result = %A" fieldValue
              // do Console.ReadLine() |> ignore
              return result
      }

type FieldDescriptor with
  static member UpdateSingleField<'a,'f when 'f : equality> (getE:Guid -> Option<'a>) (setE:'a -> Guid -> unit) 
      (getField:'a -> 'f) (setField:'a -> 'f -> 'a) (One entityId) (updater:Updater<'f>) =
    let e = getE entityId
    match e with 
    | Some e ->
      let f = getField e
      let f' = updater f
      let e' = setField e f'
      if f <> f' then
        setE e' entityId
        FieldUpdateResult.ValueChanged
      else
        FieldUpdateResult.ValueStayedTheSame
    | None -> 
      FieldUpdateResult.Failure

  static member Default<'e>() = 
    {|
      IntField = fun entityName (tryFindEntity:Guid -> Option<'e>) setEntity getField setField ->
        { 
          FieldDescriptorId=Guid.CreateVersion7(); 
          FieldName = entityName; 
          Type = fun () -> ExprType.PrimitiveType IntType
          Lookup = Option<'e>.fromObject >> Option.map(getField >> Value.ConstInt);
          Get = fun id -> tryFindEntity id |> Option.map(getField >> Value.ConstInt);
          Update = {|
            AsInt = 
              fun (One entityId) updater -> 
                  FieldDescriptor.UpdateSingleField
                    tryFindEntity setEntity
                    getField setField
                    (One entityId) updater;
            AsRef = (fun _ _ -> FieldUpdateResult.Failure);
          |};
        }  
      IdField = fun guid entityName (targetEntityDescriptorId:EntityDescriptorId) (tryFindEntity:Guid -> Option<'e>) setEntity getField setField ->
        { 
          FieldDescriptorId=guid; 
          FieldName = entityName; 
          Type = fun () -> ExprType.PrimitiveType (RefType targetEntityDescriptorId)
          Lookup = Option<'e>.fromObject >> Option.map(getField >> Value.ConstGuid);
          Get = fun id -> tryFindEntity id |> Option.map(getField >> Value.ConstGuid);
          Update = {|
            AsInt = (fun _ _ -> FieldUpdateResult.Failure);
            AsRef = fun (One entityId) updater -> 
                  FieldDescriptor.UpdateSingleField
                    tryFindEntity setEntity
                    getField setField
                    (One entityId) updater;
          |};
        }  
      LookupField = fun guid entityName (targetEntityDescriptorId:EntityDescriptorId) (tryFindEntity:Guid -> Option<'e>) setEntity getField setField ->
        { 
          FieldDescriptorId=guid; 
          FieldName = entityName; 
          Type = fun () -> ExprType.SchemaLookupType targetEntityDescriptorId
          Lookup = Option<'e>.fromObject >> Option.map(getField >> Value.ConstGuid);
          Get = fun id -> tryFindEntity id |> Option.map(getField >> Value.ConstGuid);
          Update = {|
            AsInt = (fun _ _ -> FieldUpdateResult.Failure);
            AsRef = fun (One entityId) updater -> 
                  FieldDescriptor.UpdateSingleField
                    tryFindEntity setEntity
                    getField setField
                    (One entityId) updater;
          |};
        }
    |}

type UnificationConstraints with
  static member Add (v1:VarName, v2:VarName) (constraints:UnificationConstraints) : UnificationConstraints = 
    let v1Equivalence = (constraints.EqualityClasses |> Map.tryFind v1 |> Option.defaultWith (fun () -> Set.empty)) + Set.singleton v2
    let v2Equivalence = (constraints.EqualityClasses |> Map.tryFind v2 |> Option.defaultWith (fun () -> Set.empty)) + Set.singleton v1
    let newJoinedEquivalence = v1Equivalence + v2Equivalence
    let modifiedConstraints = newJoinedEquivalence |> Set.toSeq |> Seq.map (fun v -> v, newJoinedEquivalence - Set.singleton v) |> Map.ofSeq
    { 
      constraints with 
        EqualityClasses = constraints.EqualityClasses 
          |> Map.merge (fun oldConstraint newConstraint -> newConstraint) modifiedConstraints 
    }
