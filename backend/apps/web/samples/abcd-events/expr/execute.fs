module abcdsample.execute

open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Coroutines
open eval

let execute (context:Context) (vars:Vars) (assignment:Assignment) : list<Map<{| FieldDescriptorId:Guid |}, {| Target:EntitiesIdentifiers |}>> =
  match assignment.Variable, eval context vars assignment.Value with
  | (assignedVar, [fieldDescriptor]), values ->
    [
      for (vars, value) in values do
        let variants = eval context vars (Expr.VarLookup assignedVar)
        for (_, res) in variants do
          match res with
          | Value.Var(entityDescriptor, One entityId) ->
            let ABs = context.ABs()
            let CDs = context.CDs()
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
