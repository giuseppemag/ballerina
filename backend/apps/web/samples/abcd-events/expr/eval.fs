module abcdsample.eval

open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Coroutines
open context

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
                yield! (vars', (Value.Var({ EntityDescriptorId=context.Schema.CD.Entity.EntityDescriptorId }, One ab.CD.CDId)) |> Expr.Value) |> remainingLookup
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
