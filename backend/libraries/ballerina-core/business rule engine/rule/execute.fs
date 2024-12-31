module Ballerina.BusinessRuleTransitiveExecution
open System
open System.Linq
open Ballerina.Fun
open Ballerina.Coroutines
open Ballerina.BusinessRules
open Ballerina.BusinessRuleExecution
open Ballerina.BusinessRuleEvaluation
open Ballerina.BusinessRulePreprocessor

let rec executeRulesTransitively 
  (allBusinessRules:Map<Guid, BusinessRule>)
  (schema:Schema)
  (executedRules:Map<BusinessRuleId, EntitiesIdentifiers>) 
  (modifiedFields:Map<FieldDescriptorId, EntitiesIdentifiers>) = 
  let candidateRules = getCandidateRules allBusinessRules (modifiedFields |> Map.keys |> Set.ofSeq)
  let mutable modifiedFields':Map<FieldDescriptorId, EntitiesIdentifiers> = Map.empty
  let mutable executedRules':Map<BusinessRuleId, EntitiesIdentifiers> = Map.empty
  for (businessRule, relevantModifiedFieldIds) in candidateRules do
    let businessRuleId = businessRule.ToBusinessRuleId
    let ruleDependencies = businessRule.Dependencies schema (modifiedFields |> Map.keys |> Set.ofSeq)
    // do printfn "ruleDependencies = %A" ruleDependencies
    // do Console.ReadLine() |> ignore
    let changedIds = 
      seq{
        for relevantModifiedFieldId in relevantModifiedFieldIds do
        yield! modifiedFields |> Map.tryFind relevantModifiedFieldId |> Option.toList
      } |> Seq.fold mergeEntitiesIdentifiers (EntitiesIdentifiers.Multiple Set.empty)    
    // do printfn "changedIds = %A" changedIds
    // do Console.ReadLine() |> ignore
    let predicatesByRestrictedVariable = 
      match changedIds with
      | All -> Map.empty
      | Multiple changedIds ->
        ruleDependencies.PredicatesByRestrictedVariable schema changedIds
    // do printfn "predicatesByRestrictedVariable = %A" predicatesByRestrictedVariable
    // do Console.ReadLine() |> ignore
    let firstVar = scopeSeq businessRule.Condition |> Seq.tryHead
    // do printfn "firstVar = %A" firstVar
    // do Console.ReadLine() |> ignore
    let firstRestriction:Option<VarName * (obj -> bool)> = firstVar |> Option.map (fun v -> predicatesByRestrictedVariable |> Map.tryFind v.varName |> Option.map (fun predicate -> v.varName, predicate)) |> Option.flatten
    // do printfn "firstRestriction = %A" firstRestriction
    // do Console.ReadLine() |> ignore
    let results = eval firstRestriction schema Map.empty businessRule.Condition
    for (vars,result) in results do
      match result with
      | Value.ConstBool true ->
        for a in businessRule.Actions do
          let modifiedFieldsByRuleVariants:list<Map<FieldDescriptorId, EntitiesIdentifiers>> = execute schema vars a
          for modifiedFieldsByRule in modifiedFieldsByRuleVariants do
            let allModifiedTargets = 
              seq{
                if executedRules' |> Map.containsKey businessRuleId then
                  yield executedRules'.[businessRuleId]
                for modifiedField in modifiedFieldsByRule do
                  yield modifiedField.Value
              } |> Seq.reduce mergeEntitiesIdentifiers
            executedRules' <- executedRules' |> Map.add businessRuleId allModifiedTargets
            for modifiedField in modifiedFieldsByRule do
              if modifiedFields' |> Map.containsKey modifiedField.Key |> not then
                modifiedFields' <- 
                  modifiedFields' |> Map.add modifiedField.Key modifiedField.Value
              else 
                let mergedTarget = mergeEntitiesIdentifiers (modifiedFields'.[modifiedField.Key]) modifiedField.Value
                modifiedFields' <- 
                  modifiedFields' |> Map.add modifiedField.Key mergedTarget
              ()
            ()
      | _ -> ()
  if overlap executedRules executedRules' then
    None
  else
    if modifiedFields' |> Map.isEmpty then
      Some()
    else
      executeRulesTransitively allBusinessRules schema (mergeExecutedRules executedRules executedRules') modifiedFields'
