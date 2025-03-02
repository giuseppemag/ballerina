namespace Ballerina.DSL

#nowarn FS0060

module Model =

  open System
  open Ballerina.Fun
  open Ballerina.Collections.Option
  open Ballerina.Collections.Map
  open Ballerina.Collections.Sum
  open Ballerina.Errors
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model

  type BusinessRuleId = { BusinessRuleId: Guid }

  and Assignment =
    { Variable: VarName * List<FieldDescriptorId>
      Value: Expr }

  and BusinessRule =
    { BusinessRuleId: Guid
      Name: string
      Priority: BusinessRulePriority
      Condition: Expr
      Actions: List<Assignment> }

  and RuleDependency =
    { ChangedEntityType: EntityDescriptorId
      RestrictedVariable: VarName
      RestrictedVariableType: EntityDescriptorId
      PathFromVariableToChange: List<FieldDescriptorId>
      ChangedField: FieldDescriptorId }

  and RuleDependencies =
    { dependencies: Map<EntityDescriptorId * FieldDescriptorId, Set<RuleDependency>> }

  and EntitiesIdentifiers =
    | All
    | Multiple of Set<Guid>

  and BusinessRulePriority =
    | Custom = 0
    | System = 1
    | User = 2

  and EntityDescriptor =
    { EntityDescriptorId: Guid
      EntityName: string
      TryFind: Guid -> Option<obj>
      GetId: obj -> Option<Guid>
      Lookup: obj * List<FieldDescriptorId> -> Option<obj>
      GetEntities: Unit -> List<obj>
      GetFieldDescriptors: Unit -> Map<FieldDescriptorId, FieldDescriptor> }

  and FieldDescriptor =
    { FieldDescriptorId: Guid
      FieldName: string
      Type: Unit -> ExprType
      Lookup: obj -> Option<Value>
      Get: Guid -> Option<Value>
      Update:
        {| AsInt: EntityIdentifier -> Updater<int> -> FieldUpdateResult
           AsRef: EntityIdentifier -> Updater<Guid> -> FieldUpdateResult |} }

  and FieldUpdateResult =
    | ValueChanged = 0
    | ValueStayedTheSame = 1
    | Failure = 2

  and Edit =
    | FieldEdit of
      {| entityId: Guid
         fieldDescriptorId: Guid |}

  and JobsState = { edits: Set<Edit> }

  and Schema =
    { tryFindEntity: EntityDescriptorId -> Option<EntityDescriptor>
      tryFindField: FieldDescriptorId -> Option<FieldDescriptor> }

  type FieldDescriptor with
    member this.ToFieldDescriptorId: FieldDescriptorId =
      { FieldDescriptorId = this.FieldDescriptorId
        FieldName = this.FieldName }

  type EntityDescriptor with
    member this.ToEntityDescriptorId =
      { EntityDescriptorId = this.EntityDescriptorId
        EntityName = this.EntityName }

  type BusinessRule with
    member this.ToBusinessRuleId = { BusinessRuleId = this.BusinessRuleId }

  type EntityDescriptor with
    static member GenericLookup
      : EntityDescriptor -> Map<EntityDescriptorId, EntityDescriptor> -> obj * List<FieldDescriptorId> -> Option<obj> =
      fun self allEntities (obj, fieldIds) ->
        option {
          // do printfn "lookup = %A" (obj, fieldIds)
          // do Console.ReadLine() |> ignore
          match fieldIds with
          | [] -> return obj
          | fieldId :: fieldIds ->
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
              let! result = entityDescriptor.Lookup(fieldValue, fieldIds)
              return result
            | _ ->
              let! result = fieldValue.toObject
              // do printfn "result = %A" fieldValue
              // do Console.ReadLine() |> ignore
              return result
        }

  type FieldDescriptor with
    static member UpdateSingleField<'a, 'f when 'f: equality>
      (getE: Guid -> Option<'a>)
      (setE: 'a -> Guid -> unit)
      (getField: 'a -> 'f)
      (setField: 'a -> 'f -> 'a)
      (One entityId)
      (updater: Updater<'f>)
      =
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
      | None -> FieldUpdateResult.Failure

    static member Default<'e>() =
      {| IntField =
          fun entityName (tryFindEntity: Guid -> Option<'e>) setEntity getField setField ->
            { FieldDescriptorId = Guid.CreateVersion7()
              FieldName = entityName
              Type = fun () -> ExprType.PrimitiveType IntType
              Lookup = Option<'e>.fromObject >> Option.map (getField >> Value.ConstInt)
              Get = fun id -> tryFindEntity id |> Option.map (getField >> Value.ConstInt)
              Update =
                {| AsInt =
                    fun (One entityId) updater ->
                      FieldDescriptor.UpdateSingleField tryFindEntity setEntity getField setField (One entityId) updater
                   AsRef = (fun _ _ -> FieldUpdateResult.Failure) |} }
         IdField =
          fun
              guid
              entityName
              (targetEntityDescriptorId: EntityDescriptorId)
              (tryFindEntity: Guid -> Option<'e>)
              setEntity
              getField
              setField ->
            { FieldDescriptorId = guid
              FieldName = entityName
              Type = fun () -> ExprType.PrimitiveType(RefType targetEntityDescriptorId)
              Lookup = Option<'e>.fromObject >> Option.map (getField >> Value.ConstGuid)
              Get = fun id -> tryFindEntity id |> Option.map (getField >> Value.ConstGuid)
              Update =
                {| AsInt = (fun _ _ -> FieldUpdateResult.Failure)
                   AsRef =
                    fun (One entityId) updater ->
                      FieldDescriptor.UpdateSingleField tryFindEntity setEntity getField setField (One entityId) updater |} }
         LookupField =
          fun
              guid
              entityName
              (targetEntityDescriptorId: EntityDescriptorId)
              (tryFindEntity: Guid -> Option<'e>)
              setEntity
              getField
              setField ->
            { FieldDescriptorId = guid
              FieldName = entityName
              Type = fun () -> ExprType.SchemaLookupType targetEntityDescriptorId
              Lookup = Option<'e>.fromObject >> Option.map (getField >> Value.ConstGuid)
              Get = fun id -> tryFindEntity id |> Option.map (getField >> Value.ConstGuid)
              Update =
                {| AsInt = (fun _ _ -> FieldUpdateResult.Failure)
                   AsRef =
                    fun (One entityId) updater ->
                      FieldDescriptor.UpdateSingleField tryFindEntity setEntity getField setField (One entityId) updater |} } |}
