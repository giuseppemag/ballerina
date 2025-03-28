namespace Ballerina.DSL

module Preprocessor =

  open System
  open System.Linq
  open Ballerina.Fun
  open Ballerina.Coroutines
  open Ballerina.DSL.Model
  open Ballerina.DSL.Expr.Eval
  open Ballerina.DSL.Execute
  open Ballerina.Collections.Map
  open Ballerina.DSL.Expr.Model

  type BusinessRule with
    static member getCandidateRules
      (allBusinessRules: Map<Guid, BusinessRule>)
      (modifiedFields: Set<FieldDescriptorId>)
      =
      seq {
        for br in allBusinessRules |> Map.values do
          let fields =
            Set.unionMany (
              seq {
                yield Expr.lookedUpFieldDescriptors br.Condition

                for a in br.Actions do
                  yield Expr.lookedUpFieldDescriptors a.Value
              }
            )
            |> Set.map (fun e -> e.FieldDescriptorId)

          let intersectingFields = fields |> Set.intersect modifiedFields

          if intersectingFields |> Set.isEmpty |> not then
            yield br, intersectingFields
      }
      |> Seq.toList

  type EntitiesIdentifiers with
    static member merge (entities1: EntitiesIdentifiers) (entities2: EntitiesIdentifiers) =
      match entities1, entities2 with
      | All, _ -> All
      | _, All -> All
      | Multiple ids1, Multiple ids2 -> Multiple(Set.union ids1 ids2)

  type BusinessRule with
    static member overlap
      (rules1: Map<BusinessRuleId, EntitiesIdentifiers>)
      (rules2: Map<BusinessRuleId, EntitiesIdentifiers>)
      =
      if rules2 |> Map.isEmpty then
        false
      else
        let first = rules1 |> Seq.tryHead

        match first with
        | Some first ->
          let rules1 = rules1 |> Map.remove first.Key
          let target1 = first.Value

          match rules2 |> Map.tryFind first.Key with
          | Some target2 ->
            let target2 = target2

            match target1, target2 with
            | All, _
            | _, All -> true
            | Multiple target1, Multiple target2 ->
              if Set.intersect target1 target2 |> Set.isEmpty then
                BusinessRule.overlap rules1 rules2
              else
                true
          | None -> BusinessRule.overlap rules1 rules2
        | None -> false

    static member mergeExecutedRules
      (rules1: Map<BusinessRuleId, EntitiesIdentifiers>)
      (rules2: Map<BusinessRuleId, EntitiesIdentifiers>)
      =
      rules1 |> Map.merge EntitiesIdentifiers.merge rules2
