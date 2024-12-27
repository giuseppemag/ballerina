module abcdsample.eval

open System
open System.Linq
open positions.model
open typeCheck
open Ballerina.Fun
open Ballerina.Coroutines

let eval (context:Context) (vars:Vars) : Expr -> list<Vars * Value> =
  let rec eval (vars:Vars) (e:positions.model.Expr) : list<Vars * Value> =
    match e with
    | positions.model.Expr.Exists(varName, entityDescriptor, condition) -> 
      if entityDescriptor.EntityDescriptorId = context.Schema.AB.Entity.EntityDescriptorId then
        let ABs = context.ABs() |> Map.values
        [
          for ab in ABs do
          let vars' = vars |> Map.add varName (entityDescriptor, One ab.ABId)
          for res in eval vars' condition do
            match res with
            | vars'', ConstBool true -> yield res
            | _ -> ()
        ]
      else
        failwith "positions.model.Expr.Exists(CD) not implemented"
    | positions.model.Expr.VarLookup v when vars |> Map.containsKey v -> 
      [vars, (Value.Var (vars.[v]))]
    | positions.model.Expr.FieldLookup(var, []) -> eval vars var
    | positions.model.Expr.FieldLookup(var, field::fields) -> 
      let remainingLookup (vars,e) = eval vars (Expr.FieldLookup(e, fields))
      [
        for res1 in eval vars var do
          match res1 with
          | (vars', Value.Var (entityDescriptor, One entityId)) ->
            let ABs = context.ABs()
            let CDs = context.CDs()
            if entityDescriptor.EntityDescriptorId = context.Schema.AB.Entity.EntityDescriptorId &&
              ABs |> Map.containsKey entityId then
              if field.FieldDescriptorId = context.Schema.AB.ACount.Self.FieldDescriptorId then
                yield! (vars', (Value.ConstInt(ABs.[entityId].ACount)) |> Expr.Value) |> remainingLookup
              else if field.FieldDescriptorId = context.Schema.AB.BCount.Self.FieldDescriptorId then
                yield! (vars', (Value.ConstInt(ABs.[entityId].BCount)) |> Expr.Value) |> remainingLookup
              else if field.FieldDescriptorId = context.Schema.AB.CD.Self.FieldDescriptorId then
                let ab = ABs.[entityId]
                yield! (vars', (Value.Var({ EntityDescriptorId=context.Schema.CD.Entity.EntityDescriptorId; EntityName="CD" }, One ab.CD.CDId)) |> Expr.Value) |> remainingLookup
              else
                ()
            else if entityDescriptor.EntityDescriptorId = context.Schema.CD.Entity.EntityDescriptorId &&
              CDs |> Map.containsKey entityId then
              if field.FieldDescriptorId = context.Schema.CD.CCount.Self.FieldDescriptorId then
                yield! (vars', (Value.ConstInt(CDs.[entityId].CCount)) |> Expr.Value) |> remainingLookup
              else
                ()
            else 
              ()
          | _ -> ()
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
  // Rules = [
  //   Rule1 = 
  //     when
  //       exists ab:AB -> true
  //     do
  //       ab.Target := ab.A + ab.B + ab.CD.C
  // ]
  // Dependencies.[Rule1] = [
  //   Dep1 = { EntityDesc = AB; EntityVariable = "ab"; Path = []; Field = ".A" } <- the entity variable is always the first step of the expression lookup
  //   Dep2 = { EntityDesc = AB; EntityVariable = "ab"; Path = []; Field = ".B" } <- the entity variable is always the first step of the expression lookup
  //   Dep3 = { EntityDesc = AB; EntityVariable = "ab"; Path = []; Field = ".CD" }
  //   Dep4 = { EntityDesc = CD; EntityVariable = "ab"; Path = [".CD"]; Field = ".C" }
  // ]
  // Changes
  //   Delta1 = ab1.A := ... = { EntityDesc = AB; EntityId = ab1.ABId; fieldId = "A" }
  //   Delta2 = cd1.C := ... = { EntityDesc = CD; EntityId = cd1.CDId; FieldId = "C" }
  //   Delta3 = ab1.CD := ... = { EntityDesc = CD; EntityId = ab1.ABId; FieldId = "CD" }

  // Delta1 activates rule Rule1 on Dep1 because
  //   Dep1.EntityDesc = Delta1.EntityDesc <- lookups by EntityDesc thus means Map<EntityDesc, ...>
  //   Dep1.FieldId = Delta1.FieldId
  //   Dep1.EntityVariable is constrained to ABs().Where(fun ab -> ab.ABId = Delta1.EntityVariable.ABId)

  // Delta2 activates rule Rule1 on Dep4 because
  //   Dep4.EntityDesc = Delta2.EntityDesc
  //   Dep4.FieldId = Delta2.FieldId
  //   Dep4.EntityVariable is constrained to ABs().Where(fun ab -> ab.CD.CDId = Delta2.EntityVariable.CDId)
  // WHEN MERGING, MERGE THE CONDITIONS OF THE FILTER PREDICATES WITH (||)

  member rule.Dependencies : Context -> RuleDependencies = fun context ->
    // entity of each assigned variable x list of lookup chains
    let variables = scope rule.Condition |> Seq.map (fun v -> v.varName, v.entityType) |> Map.ofSeq
    let conditionType = typeCheck context Map.empty rule.Condition
    match conditionType with
    | None -> failwithf "Condition %A does not type check" (rule.Condition)
    | Some (_,vars) ->
      let assignmentsByVariable = [
        for action in rule.Actions do
          let fieldLookups = fieldLookups action.Value
          // printfn "fieldLookups %A" fieldLookups
          // Console.ReadLine() |> ignore
          for (varName, fields) in fieldLookups do
            match typeCheck context vars (Expr.VarLookup varName) with
            | None -> failwithf "Cannot typecheck varName %A" (Expr.VarLookup varName) 
            | Some (varType, _) ->
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
                match typeCheck context vars (Expr.FieldLookup(Expr.VarLookup varName, lookupFields)) with
                | None -> failwithf "Cannot typecheck lookup path %A" (Expr.FieldLookup(Expr.VarLookup varName, lookupFields)) 
                | Some (lookupType, _) ->
                  printfn "lookupType (%A:%A).%A %A" varName varType lookupFields lookupType
                  Console.ReadLine() |> ignore
                // and RuleDependency = { ChangedEntityType:EntityDescriptor; RestrictedVariable:string; RestrictedVariableType:EntityDescriptor; PathFromVariableToChange:List<FieldDescriptor> }
                // and RuleDependencies = Map<EntityDescriptorId * FieldDescriptor, List<RuleDependency>>
                // for each prefix of fields
                  // the type is the type of the varName + path, thus excluding the last fieldName
              ()
      ]
      failwith "result not assembled yet"
