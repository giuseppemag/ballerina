module Ballerina.BusinessRuleTypeChecking


open System
open System.Linq
open Ballerina.Fun
open Ballerina.Option
open Ballerina.BusinessRules

let typeCheck (schema:Schema) (vars:VarTypes) : Expr -> Option<ExprType * VarTypes> =
  let rec eval (vars:VarTypes) (e:Expr) : Option<ExprType * VarTypes> =
    match e with
    | Expr.Exists(varName, entityDescriptor, condition) -> 
      option{
        let vars' = vars |> Map.add varName (ExprType.LookupType entityDescriptor)
        return! eval vars' condition
      }
    | Expr.VarLookup v -> 
      option{
        let! varType = vars |> Map.tryFind v
        return (varType, vars)
      }
    | Expr.FieldLookup(var, []) -> eval vars var
    | Expr.FieldLookup(var, [field]) -> 
      option{
        let! varType,vars' = eval vars var
        match varType with
        | LookupType entityDescriptor -> 
          let! fieldDescriptor = schema.tryFindField field
          return fieldDescriptor.Type(), vars'
        | PrimitiveType _ -> ()
      }
    | Expr.FieldLookup(var, field::fields) -> 
      eval vars (FieldLookup(FieldLookup(var, [field]), fields))
    | Expr.Value v ->
      option{ 
        match v with
        | Value.ConstInt _ -> 
          return PrimitiveType PrimitiveType.IntType, vars
        | Value.ConstBool _ -> 
          return PrimitiveType PrimitiveType.BoolType, vars
        | _ -> ()
      }
    | Expr.Binary(Plus, e1, e2) -> 
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
