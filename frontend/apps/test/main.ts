import { Sum, Errors, MapRepo } from "ballerina-core"
import { ValueOrErrors } from "node_modules/ballerina-core/src/collections/domains/valueOrErrors/state"
import { Map } from "immutable"

export type ValueRecord = { kind:"record", fields:Map<string,Value> }
export type ValueUnionCase = { kind:"unionCase", caseName:string, value:Value }
export type Value = 
  number | string | boolean  | { kind:"guid", value:string }
  | { kind:"unit" }
  | { kind:"varLookup", varName:string } 
  | { kind:"tuple", values:Array<Value> }
  | ValueRecord
  | ValueUnionCase
  
export type Expr = 
  Value
  | { kind:"fieldLookup", operands:[Expr, string] }
  | { kind:"isCase", operands:[Expr, string] }
  | { kind:BinaryOperator, operands:[Expr, Expr] }

export type BinaryOperator = "or" | "equals"

export type Bindings = Map<string,Value>
export const evaluateAsRecord = (vars:Bindings) => (e:Expr) : ValueOrErrors<ValueRecord, string> => 
  typeof e == "boolean" || typeof e == "number" || typeof e == "string" || e.kind != "record" ? ValueOrErrors.Default.throwOne(`Error: expected record, got ${JSON.stringify(e)}`)
  : ValueOrErrors.Default.return(e)
export const evaluateAsUnionCase = (vars:Bindings) => (e:Expr) : ValueOrErrors<ValueUnionCase, string> => 
  typeof e == "boolean" || typeof e == "number" || typeof e == "string" || e.kind != "unionCase" ? ValueOrErrors.Default.throwOne(`Error: expected union case, got ${JSON.stringify(e)}`)
  : ValueOrErrors.Default.return(e)
export const evaluateAsBoolean = (vars:Bindings) => (e:Expr) : ValueOrErrors<boolean, string> => 
  typeof e == "boolean" ? ValueOrErrors.Default.return(e)
  : ValueOrErrors.Default.throwOne(`Error: expected union case, got ${JSON.stringify(e)}`)
  
export const evaluate = (vars:Bindings) => (e:Expr) : ValueOrErrors<Value, string> => 
  typeof e == "boolean" || typeof e == "number" || typeof e == "string" 
  || e.kind == "unit" || e.kind == "guid" || e.kind == "record" || e.kind == "tuple" || e.kind == "unionCase" ? ValueOrErrors.Default.return(e)
  : e.kind == "varLookup" ?
    MapRepo.Operations.tryFindWithError(e.varName, vars, 
    () => `Error: cannot find variable ${JSON.stringify(e.varName)}`)
  : e.kind == "fieldLookup" ?
    evaluate(vars)(e.operands[0]).Then((record:Value) => 
      evaluateAsRecord(vars)(record).Then((record:ValueRecord) => 
          MapRepo.Operations.tryFindWithError(e.operands[1], record.fields,
          () => `Error: unsupported expression ${JSON.stringify(e)}`
        )
      )
    )
  : e.kind == "isCase" ?
    evaluate(vars)(e.operands[0]).Then((unionCase:Value) => 
      evaluateAsUnionCase(vars)(unionCase).Then((unionCase:ValueUnionCase) => 
        ValueOrErrors.Default.return(unionCase.caseName == e.operands[1])
      )
    )
  : e.kind == "or" ?
    evaluate(vars)(e.operands[0]).Then(v1 => 
      evaluate(vars)(e.operands[1]).Then(v2 => 
        evaluateAsBoolean(vars)(v1).Then(v1 => 
          evaluateAsBoolean(vars)(v2).Then(v2 => 
            ValueOrErrors.Default.return(v1 || v2)
          )
        )
      )
    )
  : ValueOrErrors.Default.throwOne(`Error: unsupported expression ${JSON.stringify(e)}`)

const sample1:Expr = {
  "kind": "or",
  "operands": [
    {
      "kind": "fieldLookup",
      "operands": [
        {
          "kind": "varLookup",
          "varName": "root"
        },
        "subscribeToNewsletter"
      ]
    },
    {
      "kind": "equals",
      "operands": [
        {
          "kind": "fieldLookup",
          "operands": [
            {
              "kind": "varLookup",
              "varName": "local"
            },
            "number"
          ]
        },
        10
      ]
    }
  ]
}

const sample2:Expr = 
{
  "kind": "or",
  "operands": [
    {
      "kind": "fieldLookup",
      "operands": [
        {
          "kind": "varLookup",
          "varName": "global"
        },
        "IsAdmin"
      ]
    },
    {
      "kind": "isCase",
      "operands": [
        {
          "kind": "fieldLookup",
          "operands": [
            {
              "kind": "varLookup",
              "varName": "global"
            },
            "ERP"
          ]
        },
        "ERP:SAP"
      ]
    }
  ]
}

let global:Value = { kind:"record", fields:Map<string,Value>().set("isAdmin", true).set("ERP", { kind:"unionCase", caseName:"ERP:SAP", value:{ kind:"unit"}}) }
let root:Value = { kind:"record", fields:Map<string,Value>().set("subscribeToNewsletter", true) }
let local:Value = { kind:"record", fields:Map<string,Value>().set("number", 20) }
console.log(evaluate(Map<string,Value>().set("global", global).set("root", root).set("local", local))(sample1))

