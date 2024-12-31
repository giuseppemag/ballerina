module abcdsample.context
#nowarn 40

open System
open System.Linq
open positions.model
open abcdsample.typeCheck
open abcdsample.eval
open Ballerina.Fun
open Ballerina.Coroutines
open Ballerina.Option

let init_abcdContext() = 
  let mutable ABs:Map<Guid,AB> = Map.empty
  let mutable CDs:Map<Guid,CD> = Map.empty
  let updateSingleField getE setE getField setField (One entityId) updater =
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
  
  let ACount = { 
    FieldDescriptorId=Guid.NewGuid(); 
    FieldName = "ACount"; 
    Get = fun id -> ABs |> Map.tryFind id |> Option.map(fun e -> e.ACount |> Value.ConstInt) }; 
  let BCount = { 
    FieldDescriptorId=Guid.NewGuid(); 
    FieldName = "BCount"; 
    Get = fun id -> ABs |> Map.tryFind id |> Option.map(fun e -> e.BCount |> Value.ConstInt) }; 
  let TotalABC = { 
    FieldDescriptorId=Guid.NewGuid(); 
    FieldName = "TotalABC"; 
    Get = fun id -> ABs |> Map.tryFind id |> Option.map(fun e -> e.TotalABC |> Value.ConstInt) }; 
  let CD = { 
    FieldDescriptorId=Guid.NewGuid(); 
    FieldName = "CD"; 
    Get = fun id -> ABs |> Map.tryFind id |> Option.map(fun e -> e.CD.CDId |> Value.ConstGuid) }; 
  let CCount = { 
    FieldDescriptorId=Guid.NewGuid(); 
    FieldName = "CCount"; 
    Get = fun id -> CDs |> Map.tryFind id |> Option.map(fun e -> e.CCount |> Value.ConstInt) }; 
  let allFields = 
    [
      ACount; BCount; TotalABC; CD; CCount
    ] |> Seq.map (fun f -> f.FieldDescriptorId, f) |> Map.ofSeq
  let rec schema:Schema = {
    AB = {| 
      Entity = { EntityDescriptorId = Guid.NewGuid(); EntityName = "AB"; 
        GetId = 
          (function
          | :? AB as e ->  Some e.ABId
          | _ -> None);
        Lookup = (fun (obj, fields) -> 
          match obj with
          | :? AB as e -> 
            match fields with
            | [] -> Some obj
            | field::fields ->
              if field.FieldDescriptorId = schema.AB.ACount.Self.FieldDescriptorId then
                Some(e.ACount :> obj)
              else if field.FieldDescriptorId = schema.AB.BCount.Self.FieldDescriptorId then
                Some(e.BCount :> obj)
              else if field.FieldDescriptorId = schema.AB.CD.Self.FieldDescriptorId then
                schema.CD.Entity.Lookup(e.CD :> obj, fields)
              else
                None
          | _ -> None);
        GetEntities = fun () -> ABs |> Map.values |> Seq.map (fun e -> e :> obj) |> List.ofSeq
      }
      ACount = { 
        Self = ACount
        Get = function | :? AB as v -> Option.Some v.ACount | _ -> None;
        Update = fun (One entityId) updater -> 
          updateSingleField 
            (fun entityId -> ABs |> Map.tryFind entityId) (fun e' entityId -> ABs <- ABs |> Map.add entityId e')
            (fun e -> e.ACount) (fun e f -> { e with ACount = f })
            (One entityId) updater
      }; 
      BCount = { 
        Self = BCount; 
        Get = function | :? AB as v -> Option.Some v.BCount | _ -> None;
        Update = fun (One entityId) updater -> 
          updateSingleField 
            (fun entityId -> ABs |> Map.tryFind entityId) (fun e' entityId -> ABs <- ABs |> Map.add entityId e')
            (fun e -> e.BCount) (fun e f -> { e with BCount = f })
            (One entityId) updater
      }; 
      TotalABC = { 
        Self = TotalABC; 
        Get = function | :? AB as v -> Option.Some v.TotalABC | _ -> None;
        Update = fun (One entityId) updater -> 
          updateSingleField 
            (fun entityId -> ABs |> Map.tryFind entityId) (fun e' entityId -> ABs <- ABs |> Map.add entityId e')
            (fun e -> e.TotalABC) (fun e f -> { e with TotalABC = f })
            (One entityId) updater
        }; 
      CD = { 
        Self = CD; 
        Get = function | :? AB as v -> Option.Some v.CD.CDId | _ -> None;
        Update = fun entitiesIdentifier updater -> 
          match entitiesIdentifier with 
          | All -> 
            let mutable changes = 0
            ABs <- ABs |> Map.map (fun key -> (fun e -> 
              let e' = { e with CD = CDs.[updater(e.CD.CDId)]}
              if e.CD.CDId <> e'.CD.CDId then changes <- changes + 1
              e')) 
            if changes > 0 then FieldUpdateResult.ValueChanged
            else FieldUpdateResult.ValueStayedTheSame
          | Multiple abIds ->  
            let mutable changes = 0
            ABs <- ABs |> Map.map (fun key -> 
              if abIds |> Set.contains key then 
                (fun e -> 
                  let e' = { e with CD = CDs.[updater(e.CD.CDId)]}
                  if e.CD.CDId <> e'.CD.CDId then changes <- changes + 1
                  e'
                ) 
              else id)
            if changes > 0 then FieldUpdateResult.ValueChanged
            else FieldUpdateResult.ValueStayedTheSame
        };  
      |}
    CD = {| 
      Entity = { EntityDescriptorId = Guid.NewGuid(); EntityName = "CD";
        GetId = 
          (function
          | :? CD as e ->  Some e.CDId
          | _ -> None);
        Lookup = (fun (obj, fields) -> 
          match obj with
          | :? CD as e -> 
            match fields with
            | [] -> Some obj
            | field::fields ->
              if field.FieldDescriptorId = schema.CD.CCount.Self.FieldDescriptorId then
                Some(e.CCount :> obj)
              else
                None
          | _ -> None);
        GetEntities = fun () -> CDs |> Map.values |> Seq.map (fun e -> e :> obj) |> List.ofSeq
      }
      CCount = { 
        Self = CCount
        Get = function | :? CD as v -> Option.Some v.CCount | _ -> None;
        Update = fun (One entityId) updater -> 
          updateSingleField 
            (fun entityId -> CDs |> Map.tryFind entityId) (fun e' entityId -> CDs <- CDs |> Map.add entityId e')
            (fun e -> e.CCount) (fun e f -> { e with CCount = f })
            (One entityId) updater
      };
    |}
    tryFindEntity = fun (entityDescriptorId:EntityDescriptorId) ->
      option{
        if entityDescriptorId.EntityDescriptorId = schema.AB.Entity.EntityDescriptorId then return schema.AB.Entity
        else if entityDescriptorId.EntityDescriptorId = schema.CD.Entity.EntityDescriptorId then return schema.CD.Entity
      }
    tryFindField = fun (fieldDescriptorId:FieldDescriptorId) -> allFields |> Map.tryFind fieldDescriptorId.FieldDescriptorId
  }
  let createCD id = 
    {
      CDId = id; Metadata = { EntityMetadataId = Guid.NewGuid(); Approval = false; Entity = schema.CD.Entity }
      CCount = 3; CCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.CD.CCount }
    }
  let cd1 = createCD (Guid("d8ff0920-2b47-499f-9f7b-cb07a1f8f3a4"))
  let cd2 = createCD (Guid("69f182db-84ba-4e81-91c5-d3becd029a6b"))
  CDs <- 
    [
      cd1
      cd2
    ] |> Seq.map (fun e -> (e.CDId, e)) |> Map.ofSeq
  let createAB id cd = 
      {
        ABId = id; Metadata = { EntityMetadataId = Guid.NewGuid(); Approval = false; Entity = schema.CD.Entity }
        ACount = 1 ; ACountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.ACount }
        BCount = 2 ; BCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.BCount }
        TotalABC = 0 ; TotalABCMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.TotalABC }
        CD = CDs |> Map.values |> Seq.randomChoice; CDMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = schema.AB.CD }
      }
  let ab1 = createAB (Guid("8fba2a7c-e2da-43bd-b8ee-ddaa774d081d")) cd1
  let ab2 = createAB (Guid("91620c12-cd9e-4e66-9df3-58f4b1a50b1f")) cd2

  ABs <- 
    [
      ab1
      ab2
    ] |> Seq.map (fun e -> (e.ABId, e)) |> Map.ofSeq

  let (=>) (varname:string) (fields:List<FieldDescriptorId>) =
      FieldLookup(Expr.VarLookup varname, fields)
  let totalABC:BusinessRule = 
    { 
      BusinessRuleId = Guid.NewGuid(); 
      Name = "Total = A+B+C"; Priority = BusinessRulePriority.System; 
      Condition = Expr.Exists("this", schema.AB.Entity.ToEntityDescriptorId, Expr.Value (Value.ConstBool true)); 
      Actions=[
        { 
          // this.TotalABC := this.ACount + this.BCount + this.CD.CCount
          Variable = "this", [schema.AB.TotalABC.Self.ToFieldDescriptorId]
          Value=("this" => [schema.AB.ACount.Self.ToFieldDescriptorId])
            + ("this" => [schema.AB.BCount.Self.ToFieldDescriptorId])
            + ("this" => [schema.AB.CD.Self.ToFieldDescriptorId; schema.CD.CCount.Self.ToFieldDescriptorId])
        }
      ]
    }
  let businessRules = 
    [
      totalABC
    ] |> Seq.map (fun br -> br.BusinessRuleId, br) |> Map.ofSeq

  let context = {
    ABs = (fun () -> ABs)
    CDs = (fun () -> CDs)
    ActiveEvents = [
      ABCDEvent.SetField(
        SetFieldEvent.SingletonIntFieldEvent 
          { 
            Self = { 
              FieldEventId = Guid.NewGuid(); 
              EntityDescriptorId = schema.AB.Entity.ToEntityDescriptorId
              Assignment = {
                Variable = ("this", [schema.AB.ACount.Self.ToFieldDescriptorId])
                Value=("this" => [schema.AB.ACount.Self.ToFieldDescriptorId]) + (Expr.Value(Value.ConstInt 10))
              }
            }; 
            Target = One (ABs.First().Key)
          })
          ] // :List<FieldEvent>; 
    PastEvents = [] // :List<FieldEvent>;
    BusinessRules = businessRules
    Schema = schema
  }

  // do printfn "ab1.Id = %A" ab1.ABId
  // do printfn "ab1.CD.Id = %A" ab1.CD.CDId
  // do printfn "ab2.Id = %A" ab2.ABId
  // do printfn "ab2.CD.Id = %A" ab2.CD.CDId
  // do Console.ReadLine() |> ignore
  // do printfn "ABs[0].CD.Id = %A" (Option.bind schema.CD.Entity.GetId (schema.AB.Entity.Lookup(firstAB :> obj, [schema.AB.CD.Self])))
  // do Console.ReadLine() |> ignore
  // do printfn "ABs[0].CD = %A" (schema.AB.Entity.Lookup(firstAB :> obj, [schema.AB.CD.Self]))
  // do Console.ReadLine() |> ignore
  // do printfn "ABs[0].Id = %A" (schema.AB.Entity.GetId(firstAB :> obj))
  // do Console.ReadLine() |> ignore
  // let firstCD = context.CDs() |> Map.values |> Seq.head
  // do printfn "CDs[0].Id = %A" (schema.CD.Entity.GetId(firstCD :> obj))
  // do Console.ReadLine() |> ignore
  // let conditionType = typeCheck context Map.empty totalABC.Condition
  // do printfn "Type(Rules[0].Condition) = %A" conditionType   
  // do Console.ReadLine() |> ignore
  // match conditionType with
  // | Some(_, vars) ->
  //   do printfn "Type(Rules[0].Actions[0].Value) = %A" (typeCheck context vars totalABC.Actions.Head.Value)
  //   do Console.ReadLine() |> ignore
  // | _ -> ()
  // do printfn "dependencies(totalABC) = %A" (totalABC.Dependencies context)
  // do Console.ReadLine() |> ignore
  // let CDEntity = schema.CD.Entity.ToEntityDescriptorId
  // let CCountField = schema.CD.CCount.Self
  // let testedDependencies = (totalABC.Dependencies context.Schema).dependencies.[CDEntity, CCountField]
  // do printfn "dependencies that trigger on CD.CCount = %A" (testedDependencies)
  // do Console.ReadLine() |> ignore

  // let (||.) = fun p1 p2 -> fun (o:obj) -> p1 o || p2 o
  // let changedEntitiesIds:Set<Guid> = Set.empty |> Set.add ab1.CD.CDId
  // do printfn "changedEntitiesIds = %A" (changedEntitiesIds)
  // do Console.ReadLine() |> ignore
  // let predicate = 
  //   testedDependencies 
  //     |> Seq.map (fun dep -> dep.Predicate context changedEntitiesIds) 
  //     |> Seq.fold (||.) (fun (o:obj) -> false)
  // let restrictedABs = context.ABs().Values |> Seq.filter (fun ab -> ab :> obj |> predicate)
  // do printfn "restrictedABs = %A" (restrictedABs |> Seq.map (fun ab -> ab.ABId))
  // do Console.ReadLine() |> ignore
  // let changedEntitiesIds:Set<Guid> = Set.empty |> Set.add ab2.CD.CDId
  // do printfn "changedEntitiesIds = %A" (changedEntitiesIds)
  // do Console.ReadLine() |> ignore
  // let predicate = 
  //   testedDependencies 
  //     |> Seq.map (fun dep -> dep.Predicate context changedEntitiesIds) 
  //     |> Seq.fold (||.) (fun (o:obj) -> false)
  // let restrictedABs = context.ABs().Values |> Seq.filter (fun ab -> ab :> obj |> predicate)
  // do printfn "restrictedABs = %A" (restrictedABs |> Seq.map (fun ab -> ab.ABId))
  // do Console.ReadLine() |> ignore

  context
