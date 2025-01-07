module abcdsample.context
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
open abcdsample.schema

let init_abcdContext() = 
  let ABs:ref<Map<Guid,AB>> = ref Map.empty
  let CDs:ref<Map<Guid,CD>> = ref Map.empty

  let descriptors, allEntities, allFields = createABCDSchema ABs CDs
  
  let schema:Schema = {
    tryFindEntity = fun (entityDescriptorId:EntityDescriptorId) -> allEntities |> Map.tryFind entityDescriptorId
    tryFindField = fun (fieldDescriptorId:FieldDescriptorId) -> allFields |> Map.tryFind fieldDescriptorId
  }
  
  let createCD id = 
    {
      CDId = id; Metadata = { EntityMetadataId = Guid.NewGuid(); Approval = false; Entity = descriptors.CD.Entity.Descriptor }
      C = 3; CCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = descriptors.CD.C.ToFieldDescriptorId }
    }
  let cd1 = createCD (Guid("d8ff0920-2b47-499f-9f7b-cb07a1f8f3a4"))
  let cd2 = createCD (Guid("69f182db-84ba-4e81-91c5-d3becd029a6b"))
  CDs .contents <-
    [
      cd1
      cd2
    ] |> Seq.map (fun e -> (e.CDId, e)) |> Map.ofSeq
  let createAB id cd = 
      {
        ABId = id; Metadata = { EntityMetadataId = Guid.NewGuid(); Approval = false; Entity = descriptors.AB.Entity.Descriptor }
        A = 1 ; ACountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = descriptors.AB.A.ToFieldDescriptorId }
        B = 2 ; BCountMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = descriptors.AB.B.ToFieldDescriptorId }
        TotalABC = 0 ; TotalABCMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = descriptors.AB.TotalABC.ToFieldDescriptorId }
        CD = CDs.contents |> Map.values |> Seq.randomChoice; CDMetadata = { Self = { FieldMetadataId = Guid.NewGuid(); Approval = false; CurrentEditPrio = EditPriority.None }; Field = descriptors.AB.CD.ToFieldDescriptorId }
      }
  let ab1 = createAB (Guid("8fba2a7c-e2da-43bd-b8ee-ddaa774d081d")) cd1
  let ab2 = createAB (Guid("91620c12-cd9e-4e66-9df3-58f4b1a50b1f")) cd2

  ABs .contents <- [
      ab1
      ab2
    ] |> Seq.map (fun e -> (e.ABId, e)) |> Map.ofSeq

  let (!) (varname:string) = { VarName = varname }
  let (=>) (varname:string) (fields:List<FieldDescriptorId>) =
      FieldLookup(Expr.VarLookup !varname, fields)
  let totalABC:BusinessRule = 
    { 
      BusinessRuleId = Guid.NewGuid(); 
      Name = "Total = A+B+C"; Priority = BusinessRulePriority.System; 
      Condition = Expr.Exists(!"this", descriptors.AB.Entity.Descriptor.ToEntityDescriptorId, Expr.Value (Value.ConstBool true)); 
      Actions=[
        {
          // this.TotalABC := this.ACount + this.BCount + this.CD.CCount
          Variable = !"this", [descriptors.AB.TotalABC.ToFieldDescriptorId]
          Value=("this" => [descriptors.AB.A.ToFieldDescriptorId])
            + ("this" => [descriptors.AB.B.ToFieldDescriptorId])
            + ("this" => [descriptors.AB.CD.ToFieldDescriptorId; descriptors.CD.C.ToFieldDescriptorId])
        }
      ]
    }
  let businessRules = 
    [
      totalABC
    ] |> Seq.map (fun br -> br.BusinessRuleId, br) |> Map.ofSeq

  let context = {
    ABs = (fun () -> ABs.contents)
    CDs = (fun () -> CDs.contents)
    ActiveEvents = [
      ABCDEvent.SetField(
        SetFieldEvent.SingletonIntFieldEvent 
          { 
            Self = { 
              FieldEventId = Guid.NewGuid(); 
              EntityDescriptorId = descriptors.AB.Entity.Descriptor.ToEntityDescriptorId
              Assignment = {
                Variable = (!"this", [descriptors.AB.A.ToFieldDescriptorId])
                Value=("this" => [descriptors.AB.A.ToFieldDescriptorId]) + (Expr.Value(Value.ConstInt 10))
              }
            }; 
            Target = One (ABs.contents.First().Key)
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
  // do printfn "ABs[0].CD.Id = %A" (Option.bind schema.CD.Entity.GetId (schema.entities.AB.Entity.Lookup(firstAB :> obj, [schema.entities.AB.CD.Self])))
  // do Console.ReadLine() |> ignore
  // do printfn "ABs[0].CD = %A" (schema.entities.AB.Entity.Lookup(firstAB :> obj, [schema.entities.AB.CD.Self]))
  // do Console.ReadLine() |> ignore
  // do printfn "ABs[0].Id = %A" (schema.entities.AB.Entity.GetId(firstAB :> obj))
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
  // do printfn "restrictedABs = %A" (restrictedABs |> Seq.map (fun ab -> entities.AB.ABId))
  // do Console.ReadLine() |> ignore
  // let changedEntitiesIds:Set<Guid> = Set.empty |> Set.add ab2.CD.CDId
  // do printfn "changedEntitiesIds = %A" (changedEntitiesIds)
  // do Console.ReadLine() |> ignore
  // let predicate = 
  //   testedDependencies 
  //     |> Seq.map (fun dep -> dep.Predicate context changedEntitiesIds) 
  //     |> Seq.fold (||.) (fun (o:obj) -> false)
  // let restrictedABs = context.ABs().Values |> Seq.filter (fun ab -> ab :> obj |> predicate)
  // do printfn "restrictedABs = %A" (restrictedABs |> Seq.map (fun ab -> entities.AB.ABId))
  // do Console.ReadLine() |> ignore

  context
