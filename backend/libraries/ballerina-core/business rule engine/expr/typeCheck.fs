module Ballerina.BusinessRuleTypeChecking


open System
open System.Linq
open Ballerina.Fun
open Ballerina.Option
open Ballerina.BusinessRules

let typeCheck (schema:Schema) (vars:VarTypes) (e:Expr) : Option<ExprType * VarTypes> =
  let rec eval (vars:VarTypes) (e:Expr) : Option<ExprType * VarTypes> =
    let result = 
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
      | Expr.FieldLookup(e, field) -> 
        option{
          let! eType,vars' = eval vars e
          match eType with
          | LookupType entityDescriptor -> 
            let! fieldDescriptor = schema.tryFindField field
            let result = fieldDescriptor.Type(), vars'
            return result
          | PrimitiveType p -> 
            printfn "unexpected lookup on primitive type %A %A" p e
        }
      | Expr.Value v ->
        option{ 
          match v with
          | Value.ConstInt _ -> 
            return PrimitiveType PrimitiveType.IntType, vars
          | Value.ConstBool _ -> 
            return PrimitiveType PrimitiveType.BoolType, vars
          | _ -> 
            printfn "not implemented type checker for value expression %A" e
        }
      | Expr.Binary(Plus, e1, e2) -> 
        option{
          let! t1,vars' = eval vars e1
          let! t2,vars'' = eval vars' e2
          match t1,t2 with
          | PrimitiveType IntType, PrimitiveType IntType -> return PrimitiveType IntType,vars''
          | _ -> 
            printfn "not implemented type checker for binary expression %A" e
        }
      | e -> 
        printfn "not implemented Expr type checker for %A" e
        option{        
        }
    result
  let result = eval vars e
  result 
