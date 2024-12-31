module abcdsample.eval

open System
open System.Linq
open positions.model
open typeCheck
open Ballerina.Fun
open Ballerina.Coroutines
open Ballerina.Option

let eval (variableRestriction:Option<VarName * (obj -> bool)>) (context:Context) (vars:Vars) : Expr -> list<Vars * Value> =
  let rec eval (vars:Vars) (e:positions.model.Expr) : list<Vars * Value> =
    match e with
    | positions.model.Expr.Exists(varName, entityDescriptorId, condition) -> 
      let restriction = 
        match variableRestriction with
        | Some(restrictedVarName, predicate) when varName = restrictedVarName.VarName -> 
          predicate
        | _ -> fun o -> true
      [
        for entityDescriptor in context.Schema.tryFindEntity entityDescriptorId |> Option.toList do
        let values = entityDescriptor.GetEntities() |> Seq.filter restriction
        yield! [
          for value in values do
          for valueId in entityDescriptor.GetId value |> Option.toList do
          let vars' = vars |> Map.add varName (entityDescriptorId, One valueId)
          for res in eval vars' condition do
            match res with
            | vars'', ConstBool true -> yield res
            | _ -> ()
        ]
      ]
    | positions.model.Expr.VarLookup v when vars |> Map.containsKey v -> 
      [vars, (Value.Var (vars.[v]))]
    | positions.model.Expr.FieldLookup(var, []) -> eval vars var
    | positions.model.Expr.FieldLookup(var, field::fields) -> 
      let remainingLookup (vars,e) = eval vars (Expr.FieldLookup(e, fields))
      [
        for fieldDescriptor in context.Schema.tryFindField field |> Option.toList do
        for res1 in eval vars var do
          match res1 with
          | (vars', Value.Var (_, One entityId))
          | (vars', Value.ConstGuid (entityId)) ->
            for value in fieldDescriptor.Get entityId |> Option.toList do
              let res = (vars', value |> Expr.Value) |> remainingLookup
              yield! res
          | _ -> 
            do printfn "unsupported field lookup %A -> %A" ([e,fields]) res1
            do Console.ReadLine() |> ignore
            ()
      ]
    | positions.model.Expr.Value v -> [vars, v]
    | positions.model.Expr.Binary(Plus, e1, e2) -> 
      [
        for vars', (i1,i2) in eval2AsInt vars e1 e2 do
          yield vars', Value.ConstInt(i1+i2)
      ]
    | e -> 
      printfn "not implemented Expr evaluator for %A" e
      []
  and eval2AsInt vars e1 e2 = 
    [
      for vars', v1 in eval vars e1 do
        for vars'',v2 in eval vars' e2 do
          match v1, v2 with
          | Value.ConstInt i1, Value.ConstInt i2 -> yield vars'',(i1,i2)
          | _ -> ()
    ]
  eval vars

let rec lookedUpFieldDescriptors (e:Expr) = 
  let (!) e = lookedUpFieldDescriptors e
  match e with
  | Expr.FieldLookup(e, []) -> !e
  | Expr.FieldLookup((Expr.VarLookup varname) as e, f::fs) -> 
    seq{
        yield Set.singleton {| VarName=varname; FieldDescriptorId=f.FieldDescriptorId |}
        yield !Expr.FieldLookup(e, fs)
    } |> Set.unionMany
  | Expr.Binary(_, e1, e2) -> !e1 |> Set.union !e2
  | Expr.SumBy(_,_,e)
  | Expr.Exists(_,_,e) -> !e
  | _ -> Set.empty

let rec scope (e:Expr) = 
  let (!) e = scope e
  match e with
  | Expr.Exists(varName,entityType,e) -> 
    seq{
      yield {| varName=varName; entityType=entityType |}
      yield! !e
    } |> Set.ofSeq
  | Expr.FieldLookup(e, _)
  | Expr.SumBy(_,_,e) -> !e
  | Expr.Binary(_, e1, e2) -> !e1 |> Set.union !e2
  | _ -> Set.empty

let rec scopeSeq (e:Expr) = 
  let (!) e = scopeSeq e
  match e with
  | Expr.Exists(varName,entityType,e) -> 
    seq{
      yield {| varName=varName; entityType=entityType |}
      yield! !e
    }
  | Expr.FieldLookup(e, _)
  | Expr.SumBy(_,_,e) -> !e
  | Expr.Binary(_, e1, e2) -> 
    seq{
      yield! !e1
      yield! !e2
    }
  | _ -> Seq.empty

let rec fieldLookups (e:Expr) = 
  let (!) e = fieldLookups e
  match e with
  | Expr.FieldLookup((Expr.VarLookup varName), fields) ->
    seq{
      yield (varName, fields)
    } |> Set.ofSeq
  | Expr.FieldLookup(e,_)
  | Expr.Exists(_,_,e)
  | Expr.SumBy(_,_,e) -> !e
  | Expr.Binary(_, e1, e2) -> !e1 |> Set.union !e2
  | _ -> Set.empty

type BusinessRule with
  member rule.Dependencies : Schema -> Set<{| FieldDescriptorId:Guid |}> -> RuleDependencies = fun schema changedFields ->
    // let variables = scope rule.Condition |> Seq.map (fun v -> v.varName, v.entityType) |> Map.ofSeq
    let conditionType = typeCheck schema Map.empty rule.Condition
    match conditionType with
    | None -> failwithf "Condition %A does not type check" (rule.Condition)
    | Some (_,vars) ->
      let dependencies = [
        for action in rule.Actions do
          let fieldLookups = fieldLookups action.Value
          // printfn "fieldLookups %A" fieldLookups
          // Console.ReadLine() |> ignore
          for (varName, fields) in fieldLookups do
            match typeCheck schema vars (Expr.VarLookup varName) with
            | Some (LookupType varType, _) ->
              let rec lookupPrefixes = 
                function
                | [] -> []
                | f::fs -> 
                  [
                    yield [],f
                    for prefix in lookupPrefixes fs do
                      let (prefix, lastElement) = prefix                  
                      yield f::prefix, lastElement
                  ]
              let allLookups = lookupPrefixes fields
              for (lookupFields, lastField) in allLookups do
                match typeCheck schema vars (Expr.FieldLookup(Expr.VarLookup varName, lookupFields)) with
                | Some (LookupType lookupType, _) ->
                  let dependency:RuleDependency = {
                    ChangedEntityType = lookupType
                    ChangedField = lastField
                    RestrictedVariable = varName
                    RestrictedVariableType = varType
                    PathFromVariableToChange = lookupFields
                  }
                  if changedFields |> Set.contains {| FieldDescriptorId=dependency.ChangedField.FieldDescriptorId |} then
                    yield dependency
                | _ -> failwithf "Cannot typecheck lookup path %A" (Expr.FieldLookup(Expr.VarLookup varName, lookupFields)) 
                // and RuleDependency = { ChangedEntityType:EntityDescriptor; RestrictedVariable:string; RestrictedVariableType:EntityDescriptor; PathFromVariableToChange:List<FieldDescriptor> }
                // and RuleDependencies = Map<EntityDescriptorId * FieldDescriptor, List<RuleDependency>>
                // for each prefix of fields
                  // the type is the type of the varName + path, thus excluding the last fieldName
              ()
            | _ -> failwithf "Cannot typecheck varName %A" (Expr.VarLookup varName) 
      ]
      let byEntityAndField:RuleDependencies = 
        { 
          dependencies=dependencies |> Seq.groupBy (fun dep -> dep.ChangedEntityType, dep.ChangedField) |> Map.ofSeq |> Map.map (fun k -> List.ofSeq)
        }
      in byEntityAndField 
