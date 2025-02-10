module Ballerina.BusinessRuleTypeChecking


open System
open Ballerina.Fun
open Ballerina.Sum
open Ballerina.Errors
open Ballerina.BusinessRules

let typeCheck (typeBindings:TypeBindings) (schema:Schema) (vars:VarTypes) (e:Expr) : Sum<ExprType * VarTypes, Errors> =
  let lookup t = 
    sum{
      match t with
      | ExprType.LookupType lookupTypeId ->
        let! lookupType = typeBindings |> Map.tryFindWithError lookupTypeId "type id" lookupTypeId.TypeName
        return lookupType
      | _ ->
        return t
    }
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
      | Expr.RecordFieldLookup(e, field) -> 
        sum{
          let! eType,vars' = eval vars e
          match eType with
          | RecordType entityDescriptor -> 
            let! fieldDescriptorType = entityDescriptor |> Map.tryFindWithError field "record field" field
            return fieldDescriptorType, vars'
          | t-> 
            return! sum.Throw(sprintf "Error: unexpected record lookup on type %A when typechecking expression %A" t e |> Errors.Singleton)            
        }
      | Expr.IsCase(caseName, e) -> 
        sum{
          let! eType,vars' = eval vars e
          match eType with
          | UnionType cases -> 
            let! unionCase = cases |> Seq.tryFind (fun case -> case.CaseName = caseName.CaseName) |> Sum.fromOption(fun () -> $$"""Error: invalid case name {{caseName}} on {{eType}}""" |> Errors.Singleton)
            return ExprType.PrimitiveType PrimitiveType.BoolType, vars'
          | t-> 
            return! sum.Throw(sprintf "Error: unexpected case check on type %A when typechecking expression %A" t e |> Errors.Singleton)            
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
            return! sum.Throw(sprintf "Error: unexpected lookup on type %A when typechecking expression %A" t e |> Errors.Singleton)            
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
      | Expr.Binary(Or, e1, e2) -> 
        sum{
          let! t1,vars' = eval vars e1
          let! t2,vars'' = eval vars' e2
          match t1,t2 with
          | PrimitiveType BoolType, PrimitiveType BoolType -> return PrimitiveType BoolType,vars''
          | _ -> 
            return! sum.Throw($$"""Error: invalid type of expression {{e}}""" |> Errors.Singleton)
        }
      | Expr.Binary(Equals, e1, e2) -> 
        sum{
          let! t1,vars' = eval vars e1
          let! t2,vars'' = eval vars' e2
          if t1 = t2 then
            return PrimitiveType BoolType,vars''
          else
            return! sum.Throw($$"""Error: invalid type of expression {{e}}""" |> Errors.Singleton)
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
    sum{
      let! t,vars = result
      let! t = lookup t
      return t,vars
    }
  let result = eval vars e
  result 

type Expr with
  static member typeCheck = typeCheck
