import { Map, Set, List } from "immutable"
import { ValueOrErrors, MapRepo, Value } from "../../../../../../main"

export type ValueRecord = { kind: "record", fields: Map<string, PredicateValue> }
export type ValueUnionCase = { kind: "unionCase", caseName: string, value: PredicateValue }
export type ValueTuple = { kind: "tuple", values: Array<PredicateValue> }
export type PredicateValue =
  number | string | boolean | { kind: "guid", value: string }
  | { kind: "unit" }
  | { kind: "varLookup", varName: string }
  | ValueTuple
  | ValueRecord
  | ValueUnionCase

export type Expr =
  PredicateValue
  | { kind: "fieldLookup", operands: [Expr, string] }
  | { kind: "isCase", operands: [Expr, string] }
  | { kind: BinaryOperator, operands: [Expr, Expr] }

export const BinaryOperators = ["or", "equals"] as const
export const BinaryOperatorsSet = Set(BinaryOperators)
export type BinaryOperator = (typeof BinaryOperators)[number]

export type Bindings = Map<string, PredicateValue>

export const PredicateValue = {
  Default: {
    record: (fields: Map<string, PredicateValue>): ValueRecord => ({ kind: "record", fields }),
    unionCase: (caseName: string, value: PredicateValue): ValueUnionCase => ({ kind: "unionCase", caseName, value }),
    tuple: (values: Array<PredicateValue>): ValueTuple => ({ kind: "tuple", values })
  },
  Operations: {
    parse: (json: any): ValueOrErrors<PredicateValue, string> => {
      if (typeof json == "boolean" || typeof json == "number" || typeof json == "string")
        return ValueOrErrors.Default.return(json)
      if ("kind" in json && json["kind"] == "unit")
        return ValueOrErrors.Default.return(json)
      if ("kind" in json && "varName" in json && json["kind"] == "varLookup" && typeof json["varName"] == "string")
        return ValueOrErrors.Default.return(json)
      if ("kind" in json && "fields" in json && json["kind"] == "record" && typeof json["fields"] == "object") {
        return ValueOrErrors.Operations.All(List(
          Object.entries(json["fields"]).map(([fieldName, fieldValue]) => PredicateValue.Operations.parse(fieldValue).Then(value =>
            ValueOrErrors.Default.return([fieldName, value] as [string, PredicateValue])))
        )).Then(entries =>
          ValueOrErrors.Default.return(PredicateValue.Default.record(Map(entries))))
      }
      if ("kind" in json && "values" in json && json["kind"] == "tuple" && Array.isArray(json["values"])) {
        return ValueOrErrors.Operations.All(List(
          json["values"].map(elementValue => PredicateValue.Operations.parse(elementValue))
        )).Then(values =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values.toArray())))
      }
      if ("kind" in json && "value" in json && "caseName" in json && json["kind"] == "record" && typeof json["caseName"] == "string") {
        return PredicateValue.Operations.parse(json["value"]).Then(value =>
          ValueOrErrors.Default.return(PredicateValue.Default.unionCase(json["caseName"], value))
        )
      }
      if (typeof json == "object") {
        return ValueOrErrors.Operations.All(List(
          Object.entries(json).map(([fieldName, fieldValue]) => 
            PredicateValue.Operations.parse(fieldValue).Then(value =>
              ValueOrErrors.Default.return(PredicateValue.Default.tuple([fieldName, value]))))
        )).Then(entries =>
          ValueOrErrors.Default.return(
            PredicateValue.Default.record(Map(entries.map(_ => [_.values[0] as string, _.values[1]])))
          ))
      }
      if (Array.isArray(json)) {
        return ValueOrErrors.Operations.All(List(
          json.map(elementValue => PredicateValue.Operations.parse(elementValue))
        )).Then(values =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values.toArray())))
      }
      return ValueOrErrors.Default.throwOne(`Error: cannot parse json into Value ${JSON.stringify(json)}`)
    },
    recordToTuple: (r: ValueRecord): ValueTuple => {
      const valuesSortedByName = r.fields.toSeq().map((v, k) => [k, v]).sortBy(([k, v]) => k).map(([k, v]) => v).valueSeq().toArray()
      return PredicateValue.Default.tuple(valuesSortedByName)
    },
    Equals: (vars: Bindings) => (v1: PredicateValue, v2: PredicateValue): ValueOrErrors<boolean, string> =>
      (typeof v1 == "boolean" || typeof v1 == "number" || typeof v1 == "string") ||
        (typeof v2 == "boolean" || typeof v2 == "number" || typeof v2 == "string") ?
        typeof v1 == typeof v2 ?
          ValueOrErrors.Default.return(v1 == v2)
          : ValueOrErrors.Default.throwOne(`Error: cannot compare expressions of different types ${JSON.stringify(v1)} and ${JSON.stringify(v2)}.`)
        : v1.kind == "guid" && v2.kind == "guid" ?
          ValueOrErrors.Default.return(v1.value == v2.value)
          : v1.kind == "unionCase" && v2.kind == "unionCase" ?
            v1.caseName == v2.caseName ?
            PredicateValue.Operations.Equals(vars)(v1.value, v2.value)
              : ValueOrErrors.Default.return(false)
            : v1.kind == "tuple" && v2.kind == "tuple" ?
              v1.values.length != v2.values.length ?
                ValueOrErrors.Default.return(false)
                : v1.values.length == 0 ?
                  ValueOrErrors.Default.return(true)
                  : PredicateValue.Operations.Equals(vars)(v1.values[0], v2.values[0]).Then(firstEqual =>
                    firstEqual ?
                    PredicateValue.Operations.Equals(vars)(PredicateValue.Default.tuple(v1.values.slice(1)), PredicateValue.Default.tuple(v2.values.slice(1)))
                      : ValueOrErrors.Default.return(false)
                  )
              : v1.kind == "record" && v2.kind == "record" ?
                PredicateValue.Operations.Equals(vars)(PredicateValue.Operations.recordToTuple(v1), PredicateValue.Operations.recordToTuple(v2))
                : v1.kind == "unit" && v2.kind == "unit" ?
                  ValueOrErrors.Default.return(true)
                  : v1.kind != v2.kind ?
                    ValueOrErrors.Default.throwOne(`Error: cannot compare expressions of different types ${JSON.stringify(v1)} and ${JSON.stringify(v2)}.`)
                    : ValueOrErrors.Default.throwOne(`Error: structural equality is not implemented yet between ${JSON.stringify(v1)} and ${JSON.stringify(v2)}.`)
  }
}

export const Expr = {
  Default: {
    fieldLookup: (e: Expr, f: string): Expr => ({ kind: "fieldLookup", operands: [e, f] }),
    isCase: (e: Expr, c: string): Expr => ({ kind: "isCase", operands: [e, c] }),
    binaryOperator: (op: BinaryOperator, e1: Expr, e2: Expr): Expr => ({ kind: op, operands: [e1, e2] }),
  },
  Operations: {
    parse: (json: any): ValueOrErrors<Expr, string> => {
      const asValue = PredicateValue.Operations.parse(json)
      if (asValue.kind == "value") return asValue
      if ("kind" in json && "operands" in json && typeof json["kind"] == "string" && Array.isArray(json["operands"]) && json["operands"].length == 2) {
        const kind: string = json["kind"]
        const [first, second]: Array<any> = json["operands"]
        if (json["kind"] == "fieldLookup" && typeof second == "string") {
          return Expr.Operations.parse(first).Then(first =>
            ValueOrErrors.Default.return(Expr.Default.fieldLookup(first, second))
          )
        }
        if (json["kind"] == "isCase" && typeof second == "string") {
          return Expr.Operations.parse(first).Then(first =>
            ValueOrErrors.Default.return(Expr.Default.isCase(first, second))
          )
        }
        if (BinaryOperatorsSet.contains(json["kind"] as BinaryOperator)) {
          return Expr.Operations.parse(first).Then(first =>
            Expr.Operations.parse(second).Then(second =>
              ValueOrErrors.Default.return(Expr.Default.binaryOperator(json["kind"], first, second))
            )
          )
        }
      }
      return ValueOrErrors.Default.throwOne(`Error: cannot parse ${JSON.stringify(json)} to Expr.`)
    },
    EvaluateAsRecord: (vars: Bindings) => (e: Expr): ValueOrErrors<ValueRecord, string> =>
      typeof e == "boolean" || typeof e == "number" || typeof e == "string" || e.kind != "record" ? ValueOrErrors.Default.throwOne(`Error: expected record, got ${JSON.stringify(e)}`)
        : ValueOrErrors.Default.return(e),
    EvaluateAsUnionCase: (vars: Bindings) => (e: Expr): ValueOrErrors<ValueUnionCase, string> =>
      typeof e == "boolean" || typeof e == "number" || typeof e == "string" || e.kind != "unionCase" ? ValueOrErrors.Default.throwOne(`Error: expected union case, got ${JSON.stringify(e)}`)
        : ValueOrErrors.Default.return(e),
    EvaluateAsBoolean: (vars: Bindings) => (e: Expr): ValueOrErrors<boolean, string> =>
      typeof e == "boolean" ? ValueOrErrors.Default.return(e)
        : ValueOrErrors.Default.throwOne(`Error: expected union case, got ${JSON.stringify(e)}`),
    Evaluate: (vars: Bindings) => (e: Expr): ValueOrErrors<PredicateValue, string> =>
      typeof e == "boolean" || typeof e == "number" || typeof e == "string"
        || e.kind == "unit" || e.kind == "guid" || e.kind == "record" || e.kind == "tuple" || e.kind == "unionCase" ? ValueOrErrors.Default.return(e)
        : e.kind == "varLookup" ?
          MapRepo.Operations.tryFindWithError(e.varName, vars,
            () => `Error: cannot find variable ${JSON.stringify(e.varName)}`)
          : e.kind == "fieldLookup" ?
            Expr.Operations.Evaluate(vars)(e.operands[0]).Then((record: PredicateValue) =>
              Expr.Operations.EvaluateAsRecord(vars)(record).Then((record: ValueRecord) =>
                MapRepo.Operations.tryFindWithError(e.operands[1], record.fields,
                  () => `Error: cannot find field ${e.operands[1]} in record ${JSON.stringify(record)}`
                )
              )
            )
            : e.kind == "isCase" ?
              Expr.Operations.Evaluate(vars)(e.operands[0]).Then((unionCase: PredicateValue) =>
                Expr.Operations.EvaluateAsUnionCase(vars)(unionCase).Then((unionCase: ValueUnionCase) =>
                  ValueOrErrors.Default.return(unionCase.caseName == e.operands[1])
                )
              )
              : e.kind == "equals" ?
                Expr.Operations.Evaluate(vars)(e.operands[0]).Then(v1 =>
                  Expr.Operations.Evaluate(vars)(e.operands[1]).Then(v2 =>
                    PredicateValue.Operations.Equals(vars)(v1, v2).Then(eq =>
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
                  : ValueOrErrors.Default.throwOne(`Error: unsupported expression ${JSON.stringify(e)}`)
  }
}
