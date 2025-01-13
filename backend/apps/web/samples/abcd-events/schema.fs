module abcdsample.schema
#nowarn 40

open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Coroutines
open Ballerina.Option
open Ballerina.BusinessRules
open Ballerina.BusinessRuleEvaluation
open Ballerina.BusinessRuleTypeChecking

let private updateSingleField<'a,'f when 'f : equality> (getE:Guid -> Option<'a>) (setE:'a -> Guid -> unit) 
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

let private createIntFieldDescriptor entityName (tryFindEntity:Guid -> Option<'e>) setEntity getField setField = 
  { 
    FieldDescriptorId=Guid.NewGuid(); 
    FieldName = entityName; 
    Type = fun () -> ExprType.PrimitiveType IntType
    Lookup = Option<'e>.fromObject >> Option.map(getField >> Value.ConstInt);
    Get = fun id -> tryFindEntity id |> Option.map(getField >> Value.ConstInt);
    Update = {|
      AsInt = 
        fun (One entityId) updater -> 
            updateSingleField
              tryFindEntity setEntity
              getField setField
              (One entityId) updater;
      AsRef = (fun _ _ -> FieldUpdateResult.Failure);
      AsRefs = (fun _ _ -> FieldUpdateResult.Failure);
    |};
  }  
let private createRefFieldDescriptor () guid entityName (targetEntityDescriptorId:EntityDescriptorId) (tryFindEntity:Guid -> Option<'e>) setEntity getField setField = 
  { 
    FieldDescriptorId=guid; 
    FieldName = entityName; 
    Type = fun () -> ExprType.PrimitiveType (GuidType targetEntityDescriptorId)
    Lookup = Option<'e>.fromObject >> Option.map(getField >> Value.ConstGuid);
    Get = fun id -> tryFindEntity id |> Option.map(getField >> Value.ConstGuid);
    Update = {|
      AsInt = (fun _ _ -> FieldUpdateResult.Failure);
      AsRef = fun (One entityId) updater -> 
            updateSingleField
              tryFindEntity setEntity
              getField setField
              (One entityId) updater;
      AsRefs = (fun _ _ -> FieldUpdateResult.Failure);
    |};
  }  

let createABCDSchema (allABs:ref<Map<Guid,AB>>) (allCDs:ref<Map<Guid,CD>>) (allEFs:ref<Map<Guid,EF>>) =

  let rec descriptors = {|
    EF = {|
      Entity = {|
        Descriptor = { 
          EntityDescriptorId = Guid.NewGuid(); EntityName = "EF";
          TryFind = fun id -> allEFs.contents |> Map.tryFind id |> Option.map(fun e -> e :> obj)
          GetId = 
            (function
            | :? EF as e ->  Some e.EFId
            | _ -> None);
          Lookup = fun (obj, fields) -> EntityDescriptor.GenericLookup descriptors.EF.Entity.Descriptor allEntities (obj, fields)
          GetEntities = fun () -> allEFs.contents |> Map.values |> Seq.map (fun e -> e :> obj) |> List.ofSeq
          GetFieldDescriptors = fun () -> [descriptors.EF.EFId(); descriptors.EF.F; descriptors.EF.E] |> Seq.map (fun (fd:FieldDescriptor) -> fd.ToFieldDescriptorId, fd) |> Map.ofSeq
        }
        TryFind = fun id -> allEFs.contents |> Map.tryFind id |> Option.map(fun e -> e :> obj);
      |}
      EFId = let guid = Guid.NewGuid() in fun () -> 
        createRefFieldDescriptor () guid "EFId" descriptors.EF.Entity.Descriptor.ToEntityDescriptorId 
          (fun id -> allEFs.contents |> Map.tryFind id) 
          (fun (e':EF) entityId -> allEFs.contents <- allEFs.contents |> Map.add entityId e') 
          (fun e -> e.EFId) (fun (e:EF) f -> { e with EFId = f })
      E = createIntFieldDescriptor "E" (fun id -> allEFs.contents |> Map.tryFind id) 
        (fun (e':EF) entityId -> allEFs.contents <- allEFs.contents |> Map.add entityId e') 
        (fun e -> e.E) (fun (e:EF) f -> { e with E = f })
      F = createIntFieldDescriptor "F" (fun id -> allEFs.contents |> Map.tryFind id) 
        (fun (e':EF) entityId -> allEFs.contents <- allEFs.contents |> Map.add entityId e') 
        (fun e -> e.F) (fun (e:EF) f -> { e with F = f })
    |}
    CD = {|
      Entity = {|
        Descriptor = { 
          EntityDescriptorId = Guid.NewGuid(); EntityName = "CD";
          TryFind = fun id -> allCDs.contents |> Map.tryFind id |> Option.map(fun e -> e :> obj)
          GetId = 
            (function
            | :? CD as e ->  Some e.CDId
            | _ -> None);
          Lookup = fun (obj, fields) -> EntityDescriptor.GenericLookup descriptors.CD.Entity.Descriptor allEntities (obj, fields)
          GetEntities = fun () -> allCDs.contents |> Map.values |> Seq.map (fun e -> e :> obj) |> List.ofSeq
          GetFieldDescriptors = fun () -> [descriptors.CD.D; descriptors.CD.C; descriptors.CD.EF] |> Seq.map (fun (fd:FieldDescriptor) -> fd.ToFieldDescriptorId, fd) |> Map.ofSeq
        }
        TryFind = fun id -> allCDs.contents |> Map.tryFind id |> Option.map(fun e -> e :> obj);
      |}
      C = createIntFieldDescriptor "C" (fun id -> allCDs.contents |> Map.tryFind id) 
        (fun (e':CD) entityId -> allCDs.contents <- allCDs.contents |> Map.add entityId e') 
        (fun e -> e.C) (fun (e:CD) f -> { e with C = f })
      D = createIntFieldDescriptor "D" (fun id -> allCDs.contents |> Map.tryFind id) 
        (fun (e':CD) entityId -> allCDs.contents <- allCDs.contents |> Map.add entityId e') 
        (fun e -> e.D) (fun (e:CD) f -> { e with D = f })
      EF = { 
        FieldDescriptorId=Guid.NewGuid(); 
        FieldName = "EF"; 
        Type = fun () -> ExprType.LookupType descriptors.EF.Entity.Descriptor.ToEntityDescriptorId
        Lookup = 
          Option<positions.model.CD>.fromObject >> Option.map(fun (e:positions.model.CD) -> e.EFId |> Value.ConstGuid)
        Get = fun id -> descriptors.CD.Entity.TryFind id |> Option.bind descriptors.CD.EF.Lookup;
        Update = {|
          AsInt = (fun _ _ -> FieldUpdateResult.Failure);
          AsRef = 
            fun (One entityId) updater -> 
              updateSingleField
                (fun entityId -> allCDs.contents |> Map.tryFind entityId) 
                (fun e' entityId -> allCDs .contents <- allCDs.contents |> Map.add entityId e')
                (fun e -> e.EFId) (fun e f -> { e with EFId = f })
                (One entityId) updater;          
          AsRefs = 
            fun entitiesIdentifier updater -> 
              do printfn "Updating AB::EF over %A" entitiesIdentifier
              do Console.ReadLine() |> ignore
              match entitiesIdentifier with 
              | All -> 
                let mutable changes = 0
                allCDs .contents <- allCDs.contents |> Map.map (fun key -> (fun e -> 
                  let e' = { e with EFId = updater(e.EFId)}
                  if e.EFId <> e'.EFId then changes <- changes + 1
                  e')) 
                if changes > 0 then FieldUpdateResult.ValueChanged
                else FieldUpdateResult.ValueStayedTheSame
              | Multiple abIds ->  
                let mutable changes = 0
                allCDs .contents <- allCDs.contents |> Map.map (fun key -> 
                  if abIds |> Set.contains key then 
                    (fun e -> 
                      let e' = { e with EFId = updater(e.EFId)}
                      if e.EFId <> e'.EFId then changes <- changes + 1
                      e'
                    ) 
                  else id)
                if changes > 0 then FieldUpdateResult.ValueChanged
                else FieldUpdateResult.ValueStayedTheSame
        |}
      }
    |}
    AB = {|
      Entity = {|
        Descriptor = 
          { EntityDescriptorId = Guid.NewGuid(); EntityName = "AB"; 
            TryFind = fun id -> allABs.contents |> Map.tryFind id |> Option.map(fun e -> e :> obj)
            GetId = 
              (function
              | :? AB as e ->  Some e.ABId
              | _ -> None);
            Lookup = fun (obj, fields) -> EntityDescriptor.GenericLookup descriptors.AB.Entity.Descriptor allEntities (obj, fields)
            GetEntities = fun () -> allABs.contents |> Map.values |> Seq.map (fun e -> e :> obj) |> List.ofSeq
            GetFieldDescriptors = fun () -> [descriptors.AB.A1; descriptors.AB.B1; descriptors.AB.CD; descriptors.AB.Total1; descriptors.AB.А2; descriptors.AB.Б2; descriptors.AB.Весь2; descriptors.AB.Α3; descriptors.AB.Β3; descriptors.AB.Σ3] |> Seq.map (fun (fd:FieldDescriptor) -> fd.ToFieldDescriptorId, fd) |> Map.ofSeq
          }      
        TryFind = fun id -> allABs.contents |> Map.tryFind id |> Option.map(fun e -> e :> obj);
      |}
      A1 = createIntFieldDescriptor "A1" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.A1) (fun e f -> { e with A1 = f })
      B1 = createIntFieldDescriptor "B1" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.B1) (fun e f -> { e with B1 = f })
      Total1 = createIntFieldDescriptor "Total1" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.Total1) (fun e f -> { e with Total1 = f })
      А2 = createIntFieldDescriptor "А2" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.А2) (fun e f -> { e with А2 = f })
      Б2 = createIntFieldDescriptor "Б2" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.Б2) (fun e f -> { e with Б2 = f })
      Весь2 = createIntFieldDescriptor "Весь2" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.Весь2) (fun e f -> { e with Весь2 = f })
      Α3 = createIntFieldDescriptor "Α3" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.Α3) (fun e f -> { e with Α3 = f })
      Β3 = createIntFieldDescriptor "Β3" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.Β3) (fun e f -> { e with Β3 = f })
      Σ3 = createIntFieldDescriptor "Σ3" (fun id -> allABs.contents |> Map.tryFind id) 
        (fun e' entityId -> allABs.contents <- allABs.contents |> Map.add entityId e') 
        (fun e -> e.Σ3) (fun e f -> { e with Σ3 = f })
      CD = { 
        FieldDescriptorId=Guid.NewGuid(); 
        FieldName = "CD"; 
        Type = fun () -> ExprType.LookupType descriptors.CD.Entity.Descriptor.ToEntityDescriptorId
        Lookup = 
          Option<positions.model.AB>.fromObject >> Option.map(fun (e:positions.model.AB) -> e.CDId |> Value.ConstGuid)
        Get = fun id -> descriptors.AB.Entity.TryFind id |> Option.bind descriptors.AB.CD.Lookup;
        Update = {|
          AsInt = (fun _ _ -> FieldUpdateResult.Failure);
          AsRef = 
            fun (One entityId) updater -> 
              updateSingleField
                (fun entityId -> allABs.contents |> Map.tryFind entityId) 
                (fun e' entityId -> allABs .contents <- allABs.contents |> Map.add entityId e')
                (fun e -> e.CDId) (fun e f -> { e with CDId = f })
                (One entityId) updater;          
          AsRefs = 
            fun entitiesIdentifier updater -> 
              do printfn "Updating AB::CD over %A" entitiesIdentifier
              do Console.ReadLine() |> ignore
              match entitiesIdentifier with 
              | All -> 
                let mutable changes = 0
                allABs .contents <- allABs.contents |> Map.map (fun key -> (fun e -> 
                  let e' = { e with CDId = updater(e.CDId)}
                  if e.CDId <> e'.CDId then changes <- changes + 1
                  e')) 
                if changes > 0 then FieldUpdateResult.ValueChanged
                else FieldUpdateResult.ValueStayedTheSame
              | Multiple abIds ->  
                let mutable changes = 0
                allABs .contents <- allABs.contents |> Map.map (fun key -> 
                  if abIds |> Set.contains key then 
                    (fun e -> 
                      let e' = { e with CDId = updater(e.CDId)}
                      if e.CDId <> e'.CDId then changes <- changes + 1
                      e'
                    ) 
                  else id)
                if changes > 0 then FieldUpdateResult.ValueChanged
                else FieldUpdateResult.ValueStayedTheSame
        |}
      }
    |}
  |}
  and allEntities = 
    [
      descriptors.AB.Entity.Descriptor; descriptors.CD.Entity.Descriptor; descriptors.EF.Entity.Descriptor
    ] |> Seq.map (fun e -> e.ToEntityDescriptorId, e) |> Map.ofSeq
  and allFields = 
    [
      for e in allEntities |> Map.values do
      yield! e.GetFieldDescriptors() |> Map.values; 
    ] |> Seq.map (fun f -> f.ToFieldDescriptorId, f) |> Map.ofSeq
  descriptors, allEntities, allFields
