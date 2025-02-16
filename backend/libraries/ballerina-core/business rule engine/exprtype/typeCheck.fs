namespace Ballerina.Expr
module TypeCheck =

  open System
  open Ballerina.Fun
  open Ballerina.Sum
  open Ballerina.Errors
  open Ballerina.BusinessRules

  type TypeName = string

  type Expr with
    static member typeCheck (typeBindings:TypeBindings) (schema:Schema) (vars:VarTypes) (e:Expr) : Sum<ExprType * VarTypes, Errors> =
      let lookup t = 
        sum{
          match t with
          | ExprType.LookupType lookupTypeId ->
            let! lookupType = typeBindings |> Map.tryFindWithError lookupTypeId "type id" lookupTypeId.TypeName
            return Some lookupTypeId.TypeName, lookupType
          | _ ->
            return None,t
        }
      let rec eval (vars:VarTypes) (e:Expr) : Sum<Option<TypeName> * ExprType * VarTypes, Errors> =
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
              return (None, varType, vars)
            }
          | Expr.RecordFieldLookup(e, field) -> 
            sum{
              let! eTypeName,eType,vars' = eval vars e
              match eType with
              | RecordType entityDescriptor -> 
                let! fieldDescriptorType = entityDescriptor |> Map.tryFindWithError field "field" field |> sum.MapError (Errors.Map(fun e -> e + " in record " + match eTypeName with | Some n -> n | _ -> eType.ToString()))
                return None,fieldDescriptorType, vars'
              | t-> 
                return! sum.Throw($$"""Error: cannot access field {{field}} on value {{e.ToString()}} because it's not a record""" |> Errors.Singleton)            
            }
          | Expr.IsCase(caseName, e) -> 
            sum{
              let! _,eType,vars' = eval vars e
              match eType with
              | UnionType cases -> 
                let! unionCase = cases |> Seq.tryFind (fun case -> case.CaseName = caseName) |> Sum.fromOption(fun () -> $$"""Error: invalid case name {{caseName}} on {{eType}}""" |> Errors.Singleton)
                return None,ExprType.PrimitiveType PrimitiveType.BoolType, vars'
              | t-> 
                return! sum.Throw(sprintf "Error: unexpected case check on type %A when typechecking expression %A" t e |> Errors.Singleton)            
            }
          | Expr.FieldLookup(e, field) -> 
            sum{
              let! _,eType,vars' = eval vars e
              match eType with
              | SchemaLookupType entityDescriptor -> 
                let! fieldDescriptor = schema.tryFindField field |> Sum.fromOption (fun () -> (sprintf "Error: cannot find field '%s'" field.FieldName) |> Errors.Singleton)
                return None, fieldDescriptor.Type(), vars'
              | t-> 
                return! sum.Throw(sprintf "Error: unexpected lookup on type %A when typechecking expression %A" t e |> Errors.Singleton)            
            }
          | Expr.Value v ->
            sum{ 
              match v with
              | Value.ConstInt _ -> 
                return None,PrimitiveType PrimitiveType.IntType, vars
              | Value.ConstBool _ -> 
                return None,PrimitiveType PrimitiveType.BoolType, vars
              | _ -> 
                return! sum.Throw(sprintf "not implemented type checker for value expression %A" e |> Errors.Singleton)
            }
          | Expr.Binary(Or, e1, e2) -> 
            sum{
              let! _,t1,vars' = eval vars e1
              let! _,t2,vars'' = eval vars' e2
              match t1,t2 with
              | PrimitiveType BoolType, PrimitiveType BoolType -> return None,PrimitiveType BoolType,vars''
              | _ -> 
                return! sum.Throw($$"""Error: invalid type of expression {{e}}""" |> Errors.Singleton)
            }
          | Expr.Binary(Equals, e1, e2) -> 
            sum{
              let! _,t1,vars' = eval vars e1
              let! _,t2,vars'' = eval vars' e2
              if t1 = t2 then
                return None,PrimitiveType BoolType,vars''
              else
                return! sum.Throw($$"""Error: invalid type of expression {{e}}""" |> Errors.Singleton)
            }
          | Expr.Binary(Plus, e1, e2) -> 
            sum{
              let! _,t1,vars' = eval vars e1
              let! _,t2,vars'' = eval vars' e2
              match t1,t2 with
              | PrimitiveType IntType, PrimitiveType IntType -> return None,PrimitiveType IntType,vars''
              | _ -> 
                return! sum.Throw(sprintf "not implemented type checker for binary expression %A" e |> Errors.Singleton)
            }
          | e -> 
            sum.Throw(sprintf "not implemented Expr type checker for %A" e |> Errors.Singleton)
        sum{
          let! _,t,vars = result
          let! n,t = lookup t
          return n,t,vars
        }
      let result = eval vars e
      result |> Sum.map (fun (_,x,y) -> x,y)
