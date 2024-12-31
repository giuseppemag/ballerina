module abcdsample.rules.preprocess

open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Coroutines
open abcdsample
open execute
open abcdsample.eval

let getCandidateRules 
  (context:Context)
  (modifiedFields:Set<{| FieldDescriptorId:Guid |}>) = 
  seq{
    for br in context.BusinessRules |> Map.values do
      let fields = 
        Set.unionMany(seq{
          yield lookedUpFieldDescriptors br.Condition
          for a in br.Actions do
            yield lookedUpFieldDescriptors a.Value
        }) |> Set.map (fun e -> {| FieldDescriptorId = e.FieldDescriptorId |})
      let intersectingFields = fields |> Set.intersect modifiedFields
      if intersectingFields |> Set.isEmpty |> not then
        yield br, intersectingFields
  } |> Seq.toList

let mergeEntitiesIdentifiers (entities1:EntitiesIdentifiers) (entities2:EntitiesIdentifiers) = 
  match entities1, entities2 with
  | All, _ -> All
  | _, All -> All
  | Multiple ids1, Multiple ids2 -> Multiple(Set.union ids1 ids2)

let rec overlap (rules1:Map<{| BusinessRuleId:Guid |}, {| Target:EntitiesIdentifiers |}>)
  (rules2:Map<{| BusinessRuleId:Guid |}, {| Target:EntitiesIdentifiers |}>) = 
  if rules2 |> Map.isEmpty then false
  else 
    let first = rules1 |> Seq.tryHead
    match first with
    | Some first ->
      let rules1 = rules1 |> Map.remove first.Key
      let target1 = first.Value.Target
      match rules2 |> Map.tryFind first.Key with
      | Some target2 ->
        let target2 = target2.Target
        match target1, target2 with
        | All, _ | _,All -> true
        | Multiple target1, Multiple target2 -> 
          if Set.intersect target1 target2 |> Set.isEmpty then
            overlap rules1 rules2
          else
            true
      | None -> overlap rules1 rules2
    | None -> false

let rec mergeExecutedRules (rules1:Map<{| BusinessRuleId:Guid |}, {| Target:EntitiesIdentifiers |}>)
  (rules2:Map<{| BusinessRuleId:Guid |}, {| Target:EntitiesIdentifiers |}>) = 
  if rules2 |> Map.isEmpty then rules1
  else 
    let first = rules1 |> Seq.tryHead
    match first with
    | Some first ->
      let rules1 = rules1 |> Map.remove first.Key
      let mergedTargets = 
        seq{
          yield first.Value.Target
          for target in rules2 |> Map.tryFind first.Key |> Option.toList do
            yield target.Target
        } |> Seq.reduce mergeEntitiesIdentifiers
      let rules2 = rules1 |> Map.add first.Key {| Target=mergedTargets |}
      mergeExecutedRules rules1 rules2
    | None -> rules2
