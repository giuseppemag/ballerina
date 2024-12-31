module abcdsample.execute

open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Coroutines
open eval

let execute (context:Context) (vars:Vars) (assignment:Assignment) : list<Map<{| FieldDescriptorId:Guid |}, {| Target:EntitiesIdentifiers |}>> =
  match assignment.Variable, eval None context vars assignment.Value with
  | (assignedVar, [fieldDescriptor]), values ->
    [
      // do printfn "assigning values %A (=%A)" values assignment.Value
      // do Console.ReadLine() |> ignore
      for (vars, value) in values do
        let variants = eval None context vars (Expr.VarLookup assignedVar)
        // do printfn "assigning variants %A" variants
        // do Console.ReadLine() |> ignore
        for (_, res) in variants do
          match res with
          | Value.Var(entityDescriptor, One entityId) ->
            if entityDescriptor.EntityDescriptorId = context.Schema.AB.Entity.EntityDescriptorId then
              if fieldDescriptor.FieldDescriptorId = context.Schema.AB.TotalABC.Self.FieldDescriptorId then
                match value with
                | Value.ConstInt i ->
                  if context.Schema.AB.TotalABC.Update (One entityId) (replaceWith i) = FieldUpdateResult.ValueChanged then
                    yield [({| FieldDescriptorId=fieldDescriptor.FieldDescriptorId |}, {| Target=Multiple(Set.singleton entityId); |})] |> Map.ofList
                | _ -> ()
              else if fieldDescriptor.FieldDescriptorId = context.Schema.AB.ACount.Self.FieldDescriptorId then
                match value with
                | Value.ConstInt i ->
                  if context.Schema.AB.ACount.Update (One entityId) (replaceWith i) = FieldUpdateResult.ValueChanged then
                    yield [({| FieldDescriptorId=fieldDescriptor.FieldDescriptorId |}, {| Target=Multiple(Set.singleton entityId); |})] |> Map.ofList
                | _ -> ()
              else if fieldDescriptor.FieldDescriptorId = context.Schema.AB.BCount.Self.FieldDescriptorId then
                match value with
                | Value.ConstInt i ->
                  if context.Schema.AB.BCount.Update (One entityId) (replaceWith i) = FieldUpdateResult.ValueChanged then
                    yield [({| FieldDescriptorId=fieldDescriptor.FieldDescriptorId |}, {| Target=Multiple(Set.singleton entityId); |})] |> Map.ofList
                | _ -> ()
          | _ -> ()
    ]
  | _ -> []
