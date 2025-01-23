module Ballerina.BusinessRuleTypeChecking


open System
open Ballerina.Fun
open Ballerina.Sum
open Ballerina.Errors
open Ballerina.BusinessRules

let typeCheck (schema:Schema) (vars:VarTypes) (e:Expr) : Sum<ExprType * VarTypes, Errors> =
  let rec eval (vars:VarTypes) (e:Expr) : Sum<ExprType * VarTypes, Errors> =
    let result = 
      match e with
      | Expr.Exists(varName, entityDescriptor, condition) -> 
        sum{
          let vars' = vars |> Map.add varName (ExprType.SchemaLookupType entityDescriptor)
          return! eval vars' condition
        }
      | Expr.VarLookup v -> 
        sum{
          let! varType = vars |> Map.tryFindWithError v "var" v.VarName
          return (varType, vars)
        }
      | Expr.FieldLookup(e, field) -> 
        sum{
          let! eType,vars' = eval vars e
          match eType with
          | SchemaLookupType entityDescriptor -> 
            let! fieldDescriptor = schema.tryFindField field |> withError (sprintf "Error: cannot find field '%s'" field.FieldName)
            let result = fieldDescriptor.Type(), vars'
            return result
          | t-> 
            return! sum.Throw(sprintf "unexpected lookup on type %A when typechecking expression %A" t e |> Errors.Singleton)            
        }
      | Expr.Value v ->
        sum{ 
          match v with
          | Value.ConstInt _ -> 
            return PrimitiveType PrimitiveType.IntType, vars
          | Value.ConstBool _ -> 
            return PrimitiveType PrimitiveType.BoolType, vars
          | _ -> 
            return! sum.Throw(sprintf "not implemented type checker for value expression %A" e |> Errors.Singleton)
        }
      | Expr.Binary(Plus, e1, e2) -> 
        sum{
          let! t1,vars' = eval vars e1
          let! t2,vars'' = eval vars' e2
          match t1,t2 with
          | PrimitiveType IntType, PrimitiveType IntType -> return PrimitiveType IntType,vars''
          | _ -> 
            return! sum.Throw(sprintf "not implemented type checker for binary expression %A" e |> Errors.Singleton)
        }
      | e -> 
        sum.Throw(sprintf "not implemented Expr type checker for %A" e |> Errors.Singleton)
    result
  let result = eval vars e
  result 
