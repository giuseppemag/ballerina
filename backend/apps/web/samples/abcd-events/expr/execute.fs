module abcdsample.execute

open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Coroutines
open eval

let execute (schema:Schema) (vars:Vars) (assignment:Assignment) : list<Map<{| FieldDescriptorId:Guid |}, {| Target:EntitiesIdentifiers |}>> =
  match assignment.Variable, eval None schema vars assignment.Value with
  | (assignedVar, [fieldDescriptorId]), values ->
    [
      // do printfn "assigning values %A (=%A)" values assignment.Value
      // do Console.ReadLine() |> ignore
      for fieldDescriptor in schema.tryFindField fieldDescriptorId |> Option.toList do
      for (vars, value) in values do
        let variants = eval None schema vars (Expr.VarLookup assignedVar)
        // do printfn "assigning variants %A" variants
        // do Console.ReadLine() |> ignore
        for (_, res) in variants do
          match res with
          | Value.Var(entityDescriptor, One entityId) ->
            match value with
            | Value.ConstInt i ->
              if fieldDescriptor.Update.AsInt (One entityId) (replaceWith i) = FieldUpdateResult.ValueChanged then
                yield [({| FieldDescriptorId=fieldDescriptorId.FieldDescriptorId |}, {| Target=Multiple(Set.singleton entityId); |})] |> Map.ofList
            | Value.ConstGuid id ->
              if fieldDescriptor.Update.AsRef (One entityId) (replaceWith id) = FieldUpdateResult.ValueChanged then
                yield [({| FieldDescriptorId=fieldDescriptorId.FieldDescriptorId |}, {| Target=Multiple(Set.singleton entityId); |})] |> Map.ofList
            | _ -> ()
          | _ -> ()
    ]
  | _ -> []
