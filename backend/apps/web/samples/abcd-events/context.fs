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
  let EFs:ref<Map<Guid,EF>> = ref Map.empty

  let descriptors, allEntities, allFields = createABCDSchema ABs CDs EFs
  
  let schema:Schema = {
    tryFindEntity = fun (entityDescriptorId:EntityDescriptorId) -> allEntities |> Map.tryFind entityDescriptorId
    tryFindField = fun (fieldDescriptorId:FieldDescriptorId) -> allFields |> Map.tryFind fieldDescriptorId
  }

  let createEF id E F =  
    {
      EFId = id;
      E = E;
      F = F
    }
  let ef1 = createEF (Guid("6b3b39dc-24e8-425f-8bf3-7abd248f522f")) 3 4
  let ef2 = createEF (Guid("2a2356f1-f220-450c-abcb-a9baf0f4094d")) 5 7
  EFs .contents <-
    [
      ef1
      ef2
    ] |> Seq.map (fun e -> (e.EFId, e)) |> Map.ofSeq

  let createCD id C D ef =  
    {
      CDId = id;
      C = C;
      D = D;
      EFId = ef.EFId
    }
  let cd1 = createCD (Guid("d8ff0920-2b47-499f-9f7b-cb07a1f8f3a4")) 3 4 ef1
  let cd2 = createCD (Guid("69f182db-84ba-4e81-91c5-d3becd029a6b")) 30 40 ef2
  CDs .contents <-
    [
      cd1
      cd2
    ] |> Seq.map (fun e -> (e.CDId, e)) |> Map.ofSeq
  let createAB id cd A B = 
      {
        ABId = id;
        A1 = A ;
        B1 = B ;
        Total1 = 0 ;
        CDId = cd.CDId; 
        А2 = A;
        Б2 = B;
        Весь2 = 0;
        Α3 = A;
        Β3 = B;
        Σ3 = 0;
      }
  let ab1 = createAB (Guid("8fba2a7c-e2da-43bd-b8ee-ddaa774d081d")) cd1 1 2
  let ab2 = createAB (Guid("91620c12-cd9e-4e66-9df3-58f4b1a50b1f")) cd2 10 20

  ABs .contents <- [
      ab1
      ab2
    ] |> Seq.map (fun e -> (e.ABId, e)) |> Map.ofSeq

  let (!) (varname:string) = { VarName = varname }
  let (!!) (varname:string) = !varname |> Expr.VarLookup
  let rec (=>) (e:Expr) (fields:List<FieldDescriptorId>) =
    match fields with
    | [] -> e
    | field::fields -> 
      FieldLookup(e, field) => fields
  let total1:BusinessRule = 
    { 
      BusinessRuleId = Guid.NewGuid(); 
      Name = "Total1 = A1+B1+C+D"; Priority = BusinessRulePriority.System; 
      Condition = Expr.Exists(!"this", descriptors.AB.Entity.Descriptor.ToEntityDescriptorId, Expr.Value (Value.ConstBool true)); 
      Actions=[
        {
          Variable = !"this", [descriptors.AB.Total1.ToFieldDescriptorId]
          Value=(!!"this" => [descriptors.AB.A1.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.B1.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.CD.ToFieldDescriptorId; descriptors.CD.C.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.CD.ToFieldDescriptorId; descriptors.CD.D.ToFieldDescriptorId])
        }
      ]
    }
  let total2:BusinessRule = 
    { 
      BusinessRuleId = Guid.NewGuid(); 
      Name = "Total2 = A2+B2+C+D"; Priority = BusinessRulePriority.System; 
      Condition = Expr.Exists(!"this", descriptors.AB.Entity.Descriptor.ToEntityDescriptorId, Expr.Value (Value.ConstBool true)); 
      Actions=[
        {
          Variable = !"this", [descriptors.AB.Весь2.ToFieldDescriptorId]
          Value=(!!"this" => [descriptors.AB.А2.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.Б2.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.CD.ToFieldDescriptorId; descriptors.CD.C.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.CD.ToFieldDescriptorId; descriptors.CD.D.ToFieldDescriptorId])
        }
      ]
    }
  let total3:BusinessRule = 
    { 
      BusinessRuleId = Guid.NewGuid(); 
      Name = "Total3 = A3+B3+E+F"; Priority = BusinessRulePriority.System; 
      Condition = Expr.Exists(!"this", descriptors.AB.Entity.Descriptor.ToEntityDescriptorId, Expr.Value (Value.ConstBool true)); 
      Actions=[
        {
          Variable = !"this", [descriptors.AB.Σ3.ToFieldDescriptorId]
          Value=(!!"this" => [descriptors.AB.Α3.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.Β3.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.CD.ToFieldDescriptorId; descriptors.CD.EF.ToFieldDescriptorId; descriptors.EF.E.ToFieldDescriptorId])
            + (!!"this" => [descriptors.AB.CD.ToFieldDescriptorId; descriptors.CD.EF.ToFieldDescriptorId; descriptors.EF.F.ToFieldDescriptorId])
        }
      ]
    }

  let totalsLoop = 
    [
     { 
        BusinessRuleId = Guid.NewGuid(); 
        Name = "Total2 = Total1+1+Total3"; Priority = BusinessRulePriority.System; 
        Condition = Expr.Exists(!"this", descriptors.AB.Entity.Descriptor.ToEntityDescriptorId, Expr.Value (Value.ConstBool true)); 
        Actions=[
          {
            Variable = !"this", [descriptors.AB.Весь2.ToFieldDescriptorId]
            Value=(!!"this" => [descriptors.AB.Total1.ToFieldDescriptorId])
              + Expr.Value(Value.ConstInt 1) 
              + (!!"this" => [descriptors.AB.Σ3.ToFieldDescriptorId])
          }
        ]
      }
     { 
        BusinessRuleId = Guid.NewGuid(); 
        Name = "Total3 = Total2+1"; Priority = BusinessRulePriority.System; 
        Condition = Expr.Exists(!"this", descriptors.AB.Entity.Descriptor.ToEntityDescriptorId, Expr.Value (Value.ConstBool true)); 
        Actions=[
          {
            Variable = !"this", [descriptors.AB.Σ3.ToFieldDescriptorId]
            Value=(!!"this" => [descriptors.AB.Весь2.ToFieldDescriptorId])
              + Expr.Value(Value.ConstInt 1)
          }
        ]
      }
    ]

  let businessRules = 
    // totalsLoop @ 
    [
      total1; total2; total3; 
    ] |> Seq.map (fun br -> br.BusinessRuleId, br) |> Map.ofSeq

  let context = {
    ABs = (fun () -> ABs.contents)
    CDs = (fun () -> CDs.contents)
    EFs = (fun () -> EFs.contents)
    ActiveEvents = [
      // ABCDEvent.SetField(
      //   SetFieldEvent.SingletonIntFieldEvent 
      //     { 
      //       Self = { 
      //         FieldEventId = Guid.NewGuid(); 
      //         EntityDescriptorId = descriptors.AB.Entity.Descriptor.ToEntityDescriptorId
      //         Assignment = {
      //           Variable = (!"this", [descriptors.AB.A.ToFieldDescriptorId])
      //           Value=(!!"this" => [descriptors.AB.A.ToFieldDescriptorId]) + (Expr.Value(Value.ConstInt 10))
      //         }
      //       }; 
      //       Target = One (ABs.contents.First().Key)
      //     })
      // ABCDEvent.SetField(
      //   SetFieldEvent.SingletonIntFieldEvent 
      //     { 
      //       Self = { 
      //         FieldEventId = Guid.NewGuid(); 
      //         EntityDescriptorId = descriptors.CD.Entity.Descriptor.ToEntityDescriptorId
      //         Assignment = {
      //           Variable = (!"this", [descriptors.CD.C.ToFieldDescriptorId])
      //           Value=(!!"this" => [descriptors.CD.C.ToFieldDescriptorId]) + (Expr.Value(Value.ConstInt 20))
      //         }
      //       }; 
      //       Target = One (cd2.CDId)
      //     })
      // ABCDEvent.SetField(
      //   SetFieldEvent.SingletonRefFieldEvent 
      //     { 
      //       Self = { 
      //         FieldEventId = Guid.NewGuid(); 
      //         EntityDescriptorId = descriptors.AB.Entity.Descriptor.ToEntityDescriptorId
      //         Assignment = {
      //           Variable = (!"this", [descriptors.AB.CD.ToFieldDescriptorId])
      //           Value=Expr.Value(Value.ConstGuid(cd2.CDId))
      //         }
      //       }; 
      //       Target = One (ab1.ABId)
      //     })
      ABCDEvent.SetField(
        SetFieldEvent.SingletonRefFieldEvent 
          { 
            Self = { 
              FieldEventId = Guid.NewGuid(); 
              EntityDescriptorId = descriptors.EF.Entity.Descriptor.ToEntityDescriptorId
              Assignment = {
                Variable = (!"this", [descriptors.EF.E.ToFieldDescriptorId])
                Value=(!!"this" => [descriptors.EF.E.ToFieldDescriptorId]) + (Expr.Value(Value.ConstInt 10))
              }
            }; 
            Target = One (ef1.EFId)
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
