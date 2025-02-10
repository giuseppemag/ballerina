import { Sum, Errors, ValueOrErrors, MapRepo } from "ballerina-core"
import { Map } from "immutable"

export type ValueRecord = { kind: "record", fields: Map<string, Value> }
export type ValueUnionCase = { kind: "unionCase", caseName: string, value: Value }
export type Value =
  number | string | boolean | { kind: "guid", value: string }
  | { kind: "unit" }
  | { kind: "varLookup", varName: string }
  | { kind: "tuple", values: Array<Value> }
  | ValueRecord
  | ValueUnionCase

export type Expr =
  Value
  | { kind: "fieldLookup", operands: [Expr, string] }
  | { kind: "isCase", operands: [Expr, string] }
  | { kind: BinaryOperator, operands: [Expr, Expr] }

export type BinaryOperator = "or" | "equals"

export type Bindings = Map<string, Value>

export const Value = {
  Operations:{
    Equals:(vars:Bindings) => (v1:Value, v2:Value) : ValueOrErrors<boolean, string> =>
      (typeof v1 == "boolean" || typeof v1 == "number" || typeof v1 == "string") ||
      (typeof v2 == "boolean" || typeof v2 == "number" || typeof v2 == "string") ?
        typeof v1 == typeof v2 ?
          ValueOrErrors.Default.return(v1 == v2)
        : ValueOrErrors.Default.throwOne(`Error: cannot compare expressions of different types ${JSON.stringify(v1)} and ${JSON.stringify(v2)}.`)
        : v1.kind == "guid" && v2.kind == "guid" ?
        ValueOrErrors.Default.return(v1.value == v2.value)
        // : v1.kind == "tuple" && v2.kind == "tuple" ?
          // ValueOrErrors.Operations.All()
        : v1.kind != v2.kind ?
          ValueOrErrors.Default.throwOne(`Error: cannot compare expressions of different types ${JSON.stringify(v1)} and ${JSON.stringify(v2)}.`)
        : ValueOrErrors.Default.throwOne(`Error: structural equality is not implemented yet.`)
  }
}

export const Expr = {
  Operations: {
    EvaluateAsRecord: (vars: Bindings) => (e: Expr): ValueOrErrors<ValueRecord, string> =>
      typeof e == "boolean" || typeof e == "number" || typeof e == "string" || e.kind != "record" ? ValueOrErrors.Default.throwOne(`Error: expected record, got ${JSON.stringify(e)}`)
        : ValueOrErrors.Default.return(e),
    EvaluateAsUnionCase: (vars: Bindings) => (e: Expr): ValueOrErrors<ValueUnionCase, string> =>
      typeof e == "boolean" || typeof e == "number" || typeof e == "string" || e.kind != "unionCase" ? ValueOrErrors.Default.throwOne(`Error: expected union case, got ${JSON.stringify(e)}`)
        : ValueOrErrors.Default.return(e),
    EvaluateAsBoolean: (vars: Bindings) => (e: Expr): ValueOrErrors<boolean, string> =>
      typeof e == "boolean" ? ValueOrErrors.Default.return(e)
        : ValueOrErrors.Default.throwOne(`Error: expected union case, got ${JSON.stringify(e)}`),
    Evaluate: (vars: Bindings) => (e: Expr): ValueOrErrors<Value, string> =>
      typeof e == "boolean" || typeof e == "number" || typeof e == "string"
        || e.kind == "unit" || e.kind == "guid" || e.kind == "record" || e.kind == "tuple" || e.kind == "unionCase" ? ValueOrErrors.Default.return(e)
        : e.kind == "varLookup" ?
          MapRepo.Operations.tryFindWithError(e.varName, vars,
            () => `Error: cannot find variable ${JSON.stringify(e.varName)}`)
          : e.kind == "fieldLookup" ?
            Expr.Operations.Evaluate(vars)(e.operands[0]).Then((record: Value) =>
              Expr.Operations.EvaluateAsRecord(vars)(record).Then((record: ValueRecord) =>
                MapRepo.Operations.tryFindWithError(e.operands[1], record.fields,
                  () => `Error: cannot find field ${e.operands[1]} in record ${JSON.stringify(record)}`
                )
              )
            )
            : e.kind == "isCase" ?
              Expr.Operations.Evaluate(vars)(e.operands[0]).Then((unionCase: Value) =>
                Expr.Operations.EvaluateAsUnionCase(vars)(unionCase).Then((unionCase: ValueUnionCase) =>
                  ValueOrErrors.Default.return(unionCase.caseName == e.operands[1])
                )
              )
              : e.kind == "equals" ?
                Expr.Operations.Evaluate(vars)(e.operands[0]).Then(v1 =>
                  Expr.Operations.Evaluate(vars)(e.operands[1]).Then(v2 =>
                    Value.Operations.Equals(vars)(v1,v2).Then(eq =>
                      ValueOrErrors.Default.return(eq)
                    )
                  )
                )
              : e.kind == "or" ?
                Expr.Operations.Evaluate(vars)(e.operands[0]).Then(v1 =>
                  Expr.Operations.Evaluate(vars)(e.operands[1]).Then(v2 =>
                    Expr.Operations.EvaluateAsBoolean(vars)(v1).Then(v1 =>
                      Expr.Operations.EvaluateAsBoolean(vars)(v2).Then(v2 =>
                        ValueOrErrors.Default.return(v1 || v2)
                      )
                    )
                  )
                )
                : ValueOrErrors.Default.throwOne(`Error: unsupported expression ${JSON.stringify(e)}`),
  }
}

const sample1: Expr = {
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

const sample2: Expr =
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

let global: Value = { kind: "record", fields: Map<string, Value>().set("IsAdmin", true).set("ERP", { kind: "unionCase", caseName: "ERP:SAP", value: { kind: "unit" } }) }
let root: Value = { kind: "record", fields: Map<string, Value>().set("subscribeToNewsletter", true) }
let local: Value = { kind: "record", fields: Map<string, Value>().set("number", 20) }
let res = Expr.Operations.Evaluate(Map<string, Value>().set("global", global).set("root", root).set("local", local))(sample1)
console.log(JSON.stringify(res))
