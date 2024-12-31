module abcdsample.typeCheck

open System
open System.Linq
open positions.model
open Ballerina.Fun
open Ballerina.Option

let typeCheck (schema:Schema) (vars:VarTypes) : Expr -> Option<ExprType * VarTypes> =
  let rec eval (vars:VarTypes) (e:positions.model.Expr) : Option<ExprType * VarTypes> =
    match e with
    | positions.model.Expr.Exists(varName, entityDescriptor, condition) -> 
      option{
        let vars' = vars |> Map.add varName (ExprType.LookupType entityDescriptor)
        return! eval vars' condition
      }
    | positions.model.Expr.VarLookup v -> 
      option{
        let! varType = vars |> Map.tryFind v
        return (varType, vars)
      }
    | positions.model.Expr.FieldLookup(var, []) -> eval vars var
    | positions.model.Expr.FieldLookup(var, [field]) -> 
      option{
        let! varType,vars' = eval vars var
        match varType with
        | LookupType entityDescriptor -> 
          let! fieldDescriptor = schema.tryFindField field
          return fieldDescriptor.Type(), vars'
        | PrimitiveType _ -> ()
      }
    | positions.model.Expr.FieldLookup(var, field::fields) -> 
      eval vars (FieldLookup(FieldLookup(var, [field]), fields))
    | positions.model.Expr.Value v ->
      option{ 
        match v with
        | Value.ConstInt _ -> 
          return PrimitiveType PrimitiveType.IntType, vars
        | Value.ConstBool _ -> 
          return PrimitiveType PrimitiveType.BoolType, vars
        | _ -> ()
      }
    | positions.model.Expr.Binary(Plus, e1, e2) -> 
      option{
        let! t1,vars' = eval vars e1
        let! t2,vars'' = eval vars' e2
        match t1,t2 with
        | PrimitiveType IntType, PrimitiveType IntType -> return PrimitiveType IntType,vars''
        | _ -> ()
      }
    | e -> 
      printfn "not implemented Expr type checker for %A" e
      option{        
      }
  eval vars
