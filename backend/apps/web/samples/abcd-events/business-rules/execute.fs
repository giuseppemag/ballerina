module abcdsample.rules.execute
open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Coroutines
open abcdsample
open execute
open abcdsample.rules.preprocess
open abcdsample.eval

let rec executeRulesTransitively 
  (context:Context)
  (executedRules:Map<{| BusinessRuleId:Guid |}, {| Target:EntitiesIdentifiers |}>) 
  (modifiedFields:Map<{| FieldDescriptorId:Guid |}, {| Target:EntitiesIdentifiers |}>) = 
  let candidateRules = getCandidateRules context (modifiedFields |> Map.keys |> Set.ofSeq)
  let mutable modifiedFields':Map<{| FieldDescriptorId:Guid |}, {| Target:EntitiesIdentifiers |}> = 
    Map.empty
  let mutable executedRules':Map<{| BusinessRuleId:Guid |}, {| Target:EntitiesIdentifiers |}> = Map.empty
  for businessRule in candidateRules do
    let businessRuleId = {| BusinessRuleId=businessRule.BusinessRuleId |}
    // this is the place where we calculate and pass the restrictions to eval
    let results = eval context Map.empty businessRule.Condition
    for (vars,result) in results do
      match result with
      | Value.ConstBool true ->
        for a in businessRule.Actions do
          let modifiedFieldsByRuleVariants:list<Map<{| FieldDescriptorId:Guid |}, {| Target:EntitiesIdentifiers |}>> = execute context vars a
          for modifiedFieldsByRule in modifiedFieldsByRuleVariants do
            let allModifiedTargets = 
              seq{
                if executedRules' |> Map.containsKey businessRuleId then
                  yield executedRules'.[businessRuleId].Target
                for modifiedField in modifiedFieldsByRule do
                  yield modifiedField.Value.Target 
              } |> Seq.reduce mergeEntitiesIdentifiers
            executedRules' <- executedRules' |> Map.add businessRuleId {| Target=allModifiedTargets |}
            for modifiedField in modifiedFieldsByRule do
              if modifiedFields' |> Map.containsKey {| FieldDescriptorId=modifiedField.Key.FieldDescriptorId |} |> not then
                modifiedFields' <- 
                  modifiedFields' |> Map.add {| FieldDescriptorId=modifiedField.Key.FieldDescriptorId |} {| Target=modifiedField.Value.Target |}
              else 
                let mergedTarget = mergeEntitiesIdentifiers (modifiedFields'.[modifiedField.Key].Target) modifiedField.Value.Target
                modifiedFields' <- 
                  modifiedFields' |> Map.add {| FieldDescriptorId=modifiedField.Key.FieldDescriptorId |} {| Target=mergedTarget |}                
              ()
            ()
      | _ -> ()
  if overlap executedRules executedRules' then
    None
  else
    if modifiedFields' |> Map.isEmpty then
      Some()
    else
      executeRulesTransitively context (mergeExecutedRules executedRules executedRules') modifiedFields'
