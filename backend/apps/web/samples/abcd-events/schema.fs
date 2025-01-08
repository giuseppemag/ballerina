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

let createABCDSchema (allABs:ref<Map<Guid,AB>>) (allCDs:ref<Map<Guid,CD>>) =
  let rec descriptors = {|
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
          GetFieldDescriptors = fun () -> [descriptors.CD.D; descriptors.CD.C] |> Seq.map (fun (fd:FieldDescriptor) -> fd.ToFieldDescriptorId, fd) |> Map.ofSeq
        }
        TryFind = fun id -> allCDs.contents |> Map.tryFind id |> Option.map(fun e -> e :> obj);
      |}
      C = { 
        FieldDescriptorId=Guid.NewGuid(); 
        FieldName = "C"; 
        Type = fun () -> ExprType.PrimitiveType IntType
        Lookup = Option<AB>.fromObject >> Option.map(fun e -> e.C |> Value.ConstInt)
        Get = fun id -> descriptors.CD.Entity.TryFind id |> Option.bind descriptors.CD.C.Lookup;
        Update = {|
          AsInt = 
            fun (One entityId) updater -> 
              updateSingleField
                (fun entityId -> allCDs.contents |> Map.tryFind entityId)
                (fun e' entityId -> allCDs.contents <- allCDs.contents |> Map.add entityId e')
                (fun e -> e.C) (fun e f -> { e with C = f })
                (One entityId) updater;
          AsRef = (fun _ _ -> FieldUpdateResult.Failure);
          AsRefs = (fun _ _ -> FieldUpdateResult.Failure);
        |}
      }
      D = { 
        FieldDescriptorId=Guid.NewGuid(); 
        FieldName = "D"; 
        Type = fun () -> ExprType.PrimitiveType IntType
        Lookup = Option<AB>.fromObject >> Option.map(fun e -> e.D |> Value.ConstInt)
        Get = fun id -> descriptors.CD.Entity.TryFind id |> Option.bind descriptors.CD.D.Lookup;
        Update = {|
          AsInt = 
            fun (One entityId) updater -> 
              updateSingleField
                (fun entityId -> allCDs.contents |> Map.tryFind entityId)
                (fun e' entityId -> allCDs.contents <- allCDs.contents |> Map.add entityId e')
                (fun e -> e.D) (fun e f -> { e with D = f })
                (One entityId) updater;
          AsRef = (fun _ _ -> FieldUpdateResult.Failure);
          AsRefs = (fun _ _ -> FieldUpdateResult.Failure);
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
            GetFieldDescriptors = fun () -> [descriptors.AB.A; descriptors.AB.B; descriptors.AB.CD; descriptors.AB.Total] |> Seq.map (fun (fd:FieldDescriptor) -> fd.ToFieldDescriptorId, fd) |> Map.ofSeq
          }      
        TryFind = fun id -> allABs.contents |> Map.tryFind id |> Option.map(fun e -> e :> obj);
      |}
      A = { 
        FieldDescriptorId=Guid.NewGuid(); 
        FieldName = "A"; 
        Type = fun () -> ExprType.PrimitiveType IntType
        Lookup = Option<AB>.fromObject >> Option.map(fun e -> e.A |> Value.ConstInt);
        Get = fun id -> descriptors.AB.Entity.TryFind id |> Option.bind descriptors.AB.A.Lookup;
        Update = {|
          AsInt = 
            fun (One entityId) updater -> 
                updateSingleField
                  (fun entityId -> allABs.contents |> Map.tryFind entityId) 
                  (fun e' entityId -> allABs .contents <- allABs.contents |> Map.add entityId e')
                  (fun e -> e.A) (fun e f -> { e with A = f })
                  (One entityId) updater;
          AsRef = (fun _ _ -> FieldUpdateResult.Failure);
          AsRefs = (fun _ _ -> FieldUpdateResult.Failure);
        |};
      }
      B = { 
        FieldDescriptorId=Guid.NewGuid(); 
        FieldName = "B"; 
        Type = fun () -> ExprType.PrimitiveType IntType
        Lookup = Option<AB>.fromObject >> Option.map(fun e -> e.B |> Value.ConstInt) 
        Get = fun id -> descriptors.AB.Entity.TryFind id |> Option.bind descriptors.AB.B.Lookup;
        Update = {|
          AsInt = 
            fun (One entityId) updater -> 
              updateSingleField
                (fun entityId -> allABs.contents |> Map.tryFind entityId) 
                (fun e' entityId -> allABs .contents <- allABs.contents |> Map.add entityId e')
                (fun e -> e.B) (fun e f -> { e with B = f })
                (One entityId) updater;
          AsRef = (fun _ _ -> FieldUpdateResult.Failure);
          AsRefs = (fun _ _ -> FieldUpdateResult.Failure);
        |};    
      }
      Total = { 
        FieldDescriptorId=Guid.NewGuid(); 
        FieldName = "TotalABC"; 
        Type = fun () -> ExprType.PrimitiveType IntType
        Lookup = Option<AB>.fromObject >> Option.map(fun e -> e.Total |> Value.ConstInt) 
        Get = fun id -> descriptors.AB.Entity.TryFind id |> Option.bind descriptors.AB.Total.Lookup;
        Update = {|
          AsInt = 
            fun (One entityId) updater -> 
              updateSingleField
                (fun entityId -> allABs.contents |> Map.tryFind entityId) 
                (fun e' entityId -> allABs .contents <- allABs.contents |> Map.add entityId e')
                (fun e -> e.Total) (fun e f -> { e with Total = f })
                (One entityId) updater;
          AsRef = (fun _ _ -> FieldUpdateResult.Failure);
          AsRefs = (fun _ _ -> FieldUpdateResult.Failure);
        |}
      }
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
      descriptors.AB.Entity.Descriptor; descriptors.CD.Entity.Descriptor
    ] |> Seq.map (fun e -> e.ToEntityDescriptorId, e) |> Map.ofSeq
  and allFields = 
    [
      for e in allEntities |> Map.values do
      yield! e.GetFieldDescriptors() |> Map.values; 
    ] |> Seq.map (fun f -> f.ToFieldDescriptorId, f) |> Map.ofSeq
  descriptors, allEntities, allFields
