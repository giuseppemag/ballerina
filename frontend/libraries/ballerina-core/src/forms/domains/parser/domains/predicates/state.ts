import { Map, Set, List } from "immutable"
import { ValueOrErrors, MapRepo, FieldName, ParsedType, ApiErrors, unit } from "../../../../../../main"

export type FieldPredicateExpression = 
| {kind: "primitive", value: Expr} 
| {kind: "form", value: Expr, fields: FieldPredicateExpressions} 
| {kind: "list", value: Expr, elementExpression: FieldPredicateExpression}
| {kind: "map", value: Expr, keyExpression: FieldPredicateExpression, valueExpression: FieldPredicateExpression}

const calculateVisibility = (expr: Expr, bindings: Bindings): ValueOrErrors<boolean, string> => {
  if (typeof expr == "boolean") {
    return ValueOrErrors.Default.return(expr)
  }
  return Expr.Operations.Evaluate(bindings)(expr).Then(result => {
    if (typeof result == "boolean") {
      return ValueOrErrors.Default.return(result)
    }
    return ValueOrErrors.Default.throwOne(`Error: cannot evaluate expression ${JSON.stringify(expr)} to a boolean`)
  })
}

export const FieldPredicateExpression = {
  Default: {
    primitive: (value: Expr): FieldPredicateExpression => ({kind: "primitive", value}),
    form: (value: Expr, fields: FieldPredicateExpressions): FieldPredicateExpression => ({kind: "form", value, fields}),
    list: (value: Expr, elementExpression: FieldPredicateExpression): FieldPredicateExpression => ({kind: "list", value, elementExpression}),
    map: (value: Expr, keyExpression: FieldPredicateExpression, valueExpression: FieldPredicateExpression): FieldPredicateExpression => ({kind: "map", value, keyExpression, valueExpression})
  }
}

export type FieldPredicateExpressions = Map<FieldName, FieldPredicateExpression>

export type FormFieldPredicateEvaluation = 
| {kind: "primitive", value: boolean} 
| {kind: "form", value: boolean, fields: FormFieldPredicateEvaluations} 
| {kind: "list", value: boolean, elementValues: FormFieldPredicateEvaluation[]}
| {kind: "map", value: boolean, elementValues: {key: FormFieldPredicateEvaluation, value: FormFieldPredicateEvaluation}[]}

export const FormFieldPredicateEvaluation = {
  Default: {
    primitive: (value: boolean): FormFieldPredicateEvaluation => ({kind: "primitive", value}),
    form: (value: boolean, fields: FormFieldPredicateEvaluations): FormFieldPredicateEvaluation => ({kind: "form", value, fields}),
    list: (value: boolean, elementValues: FormFieldPredicateEvaluation[]): FormFieldPredicateEvaluation => ({kind: "list", value, elementValues}),
    map: (value: boolean, elementValues: {key: FormFieldPredicateEvaluation, value: FormFieldPredicateEvaluation}[]): FormFieldPredicateEvaluation => ({kind: "map", value, elementValues}),
  }
}

export type FormFieldPredicateEvaluations =  Map<FieldName, FormFieldPredicateEvaluation>

export type EvaluationPredicateValue = {
  kind: "expression",
}

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
    unit: (): PredicateValue => ({ kind: "unit" }),
    varLookup: (varName: string): PredicateValue => ({ kind: "varLookup", varName }),
    record: (fields: Map<string, PredicateValue>): ValueRecord => ({ kind: "record", fields }),
    unionCase: (caseName: string, value: PredicateValue): ValueUnionCase => ({ kind: "unionCase", caseName, value }),
    tuple: (values: Array<PredicateValue>): ValueTuple => ({ kind: "tuple", values })
  },
  Operations: {
    ParseAsVarLookup: (json: any): ValueOrErrors<PredicateValue, string> => {
      if(json.kind == "varLookup" && typeof json.varName == "string")
        return ValueOrErrors.Default.return(PredicateValue.Default.varLookup(json.varName))
      return ValueOrErrors.Default.throwOne(`Error: varLookup has invalid varName property`)
    },
    ParseAsUnionCase: (json: any): ValueOrErrors<PredicateValue, string> => {
      if(typeof json.caseName == "string")
        return ValueOrErrors.Default.return(PredicateValue.Default.unionCase(json.caseName, json.value))
        
      return ValueOrErrors.Default.throwOne(`Error: union case has invalid caseName property`)
    },
    ParseAsRecord: (json: any, types: Map<string, ParsedType<any>>): ValueOrErrors<PredicateValue, string> => {
      if ("fields" in json && typeof json.fields == "object") {
        return ValueOrErrors.Operations.All(List(
          Object.entries(json.fields).map(([fieldName, fieldValue]) => PredicateValue.Operations.parse(fieldValue, {kind: "expression"}, types).Then(value =>
            ValueOrErrors.Default.return([fieldName, value] as [string, PredicateValue])))
        )).Then(entries =>
          ValueOrErrors.Default.return(PredicateValue.Default.record(Map(entries))))
      }
      return ValueOrErrors.Default.throwOne(`Error: record has no field property`)
    },
    ParseAsTuple: (json: any, types: Map<string, ParsedType<any>>): ValueOrErrors<PredicateValue, string> => {
      if(json.values != undefined && Array.isArray(json.values)) {
        return ValueOrErrors.Operations.All(List<ValueOrErrors<PredicateValue, string>>(
          json.values.map((elementValue: any) => PredicateValue.Operations.parse(elementValue, {kind: "expression"}, types))
        )).Then(values =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values.toArray()))
        )
      }
      return ValueOrErrors.Default.throwOne(`Error: tuple has no values property`)
    },
    parse: <T>(json: any, type: ParsedType<T> | EvaluationPredicateValue, types: Map<string, ParsedType<T>>): ValueOrErrors<PredicateValue, string> => {
      if(type.kind == "expression" && (typeof json == "boolean" || typeof json == "number" || typeof json == "string"))
        return ValueOrErrors.Default.return(json)
      if(type.kind == "expression" && json.kind == undefined){
        return ValueOrErrors.Default.throwOne(`Error: evaluation statement has no kind value`)
      }
      if(type.kind == "expression" && json.kind == "guid") {
        return ValueOrErrors.Default.return(json)
      }
      if(type.kind == "expression" && json.kind == "unit"){
        return ValueOrErrors.Default.return(PredicateValue.Default.unit())
      }
      if(type.kind == "expression" && json.kind == "varLookup"){
        return PredicateValue.Operations.ParseAsVarLookup(json)
      }
      if(type.kind == "expression" && json.kind == "record" && "caseName" in json){
        return PredicateValue.Operations.ParseAsUnionCase(json)
      }
      if(type.kind == "expression" && json.kind == "record" && "fields" in json){
        return PredicateValue.Operations.ParseAsRecord(json, types)
      }
      if(type.kind == "expression" && json.kind == "tuple" && "values" in json){
        return PredicateValue.Operations.ParseAsTuple(json, types)
      }
      if(type.kind == "primitive" && type.value == "Date") {
        return ValueOrErrors.Default.return(json)
      }
      if(type.kind == "primitive" && type.value == "maybeBoolean") {
        return json == undefined ? ValueOrErrors.Default.return(false) : ValueOrErrors.Default.return(json)
      }
      if(type.kind == "primitive") {
        return ValueOrErrors.Default.return(json)
      }
      if(type.kind == "lookup") {
        const subType = types.get(type.name)
        if(subType == undefined) {
          return ValueOrErrors.Default.throwOne(`Error: cannot find field ${type.name} in types`)
        }
        return PredicateValue.Operations.parse(json, subType, types)
      }
      if(type.kind == "unionCase"){
        if(Object.keys(type.fields).length > 0) {
          return ValueOrErrors.Default.throwOne(`Error: union case ${type} has fields, not a valid enum`)
        }
        return PredicateValue.Operations.ParseAsUnionCase({kind: "unionCase", caseName: json, value: {kind: "form", value: Map()}})
      }
      if(type.kind == "union" ){
        const unionCase = type.args.get(json);
        if(unionCase == undefined) {
          return ValueOrErrors.Default.throwOne(`Error: cannot find union case ${json} in types`)
        }
        return PredicateValue.Operations.parse(json, unionCase, types)
      }
      if(type.kind == "application" && type.value == "List"){
        return ValueOrErrors.Operations.All(List<ValueOrErrors<PredicateValue, string>>(
          json.map((elementValue: any) => PredicateValue.Operations.parse(elementValue, type.args[0], types))
        )).Then(values =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values.toArray())))
      }
      if(type.kind == "application" && type.value == "Map"){
        return ValueOrErrors.Operations.All(List<ValueOrErrors<PredicateValue, string>>(
          json.map((keyValue: any) => PredicateValue.Operations.parse(keyValue.key, type.args[0], types).Then(key =>
            PredicateValue.Operations.parse(keyValue.value, type?.args[1], types).Then(value =>
             ValueOrErrors.Default.return(PredicateValue.Default.tuple([key, value]))
            ))
          )
        )).Then(values =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values.toArray())))
      }
      if(type.kind == "application" && type.value == "SingleSelection") {
        // We parse single select as an Option, but it is not encoded as an Option in the type
        return PredicateValue.Operations.parse(json["IsSome"], {kind: "expression"}, types).Then(value =>
          ValueOrErrors.Default.return(PredicateValue.Default.unionCase(value.toString(), value))
        )
      }
      if(type.kind == "application" && type.value == "MultiSelection"){
        return ValueOrErrors.Operations.All(List<ValueOrErrors<PredicateValue, string>>(
          json.map((elementValue: any) => PredicateValue.Operations.parse(elementValue, type.args[0], types))
        )).Then(values =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values.toArray())))
      }
      if(type.kind == "form") {
        return ValueOrErrors.Operations.All(List<ValueOrErrors<[string, PredicateValue], string>>(
          Object.entries(json).map(([fieldName, fieldValue]) => {
            const subType = type.fields.get(fieldName)
            if(subType == undefined) {
              return ValueOrErrors.Default.throwOne(`Error: cannot find field ${fieldName} in type ${JSON.stringify(type)}`)
            }
            return PredicateValue.Operations.parse(fieldValue, subType, types).Then(value =>
              ValueOrErrors.Default.return([fieldName, value]))})
            )).Then((entries: List<[string, PredicateValue]>) =>
              ValueOrErrors.Default.return(
                PredicateValue.Default.record(Map(entries.map(_ => [_[0], _[1]])))
              ))
      }
      return ValueOrErrors.Default.throwOne(`Error: unsupported type ${JSON.stringify(type)}`)
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
      const asValue = PredicateValue.Operations.parse(json, {kind: "expression"}, Map<string, ParsedType<unknown>>())
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
        : ValueOrErrors.Default.throwOne(`Error: expected boolean, got ${JSON.stringify(e)}`),
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


export const evaluatePredicates = <E>(context: {global: PredicateValue, types: Map<string, ParsedType<E>>, visibilityPredicateExpressions: FieldPredicateExpressions, disabledPredicatedExpressions: FieldPredicateExpressions}, root: PredicateValue):
 ValueOrErrors<{visiblityPredicateEvaluations: FormFieldPredicateEvaluation, disabledPredicateEvaluations: FormFieldPredicateEvaluation}, string> => {
  const bindings: Bindings = Map<string, PredicateValue>().set("global", context.global).set("root", root).set("local", root);
  const traverse = (bindings: Bindings, predicate: FieldPredicateExpression, raw: PredicateValue): ValueOrErrors<FormFieldPredicateEvaluation, string> => {

    if(predicate.kind == "primitive") {
      return calculateVisibility(predicate.value, bindings).Then(result => {
        return ValueOrErrors.Default.return({kind: "primitive", value: result})
      })
    }
    if(predicate.kind == "form") {
      if(typeof raw != "object" || !("kind" in raw )|| raw.kind != "record") {
        return ValueOrErrors.Default.throwOne(`Error: expected record in raw, got ${JSON.stringify(raw)}`)
      }
      return calculateVisibility(predicate.value, bindings).Then(result => 
        ValueOrErrors.Operations.All(List<ValueOrErrors<[string, FormFieldPredicateEvaluation], string>>((predicate.fields).entrySeq().map<ValueOrErrors<[string, FormFieldPredicateEvaluation], string>>(([fieldName, fieldPredicate]) => {

        const fieldRaw = raw.fields.get(fieldName)

        if(fieldRaw == undefined) {
          return ValueOrErrors.Default.throwOne(`Error: cannot find field ${fieldName} in raw ${JSON.stringify(raw)}`)
        }

        if(fieldPredicate.kind == "form") {
          const localBindings = bindings.get("local")! as ValueRecord;
          const fieldLocal = localBindings.fields.get(fieldName);
          if(fieldLocal == undefined) {
            return ValueOrErrors.Default.throwOne(`Error: cannot find field ${fieldName} in local ${JSON.stringify(localBindings)}`)
          }
          const fieldBindings = bindings.set("local", fieldLocal);
          return traverse(fieldBindings, fieldPredicate, fieldRaw).Then(evaluation => ValueOrErrors.Default.return([fieldName, evaluation]))
        }

        return traverse(bindings, fieldPredicate, fieldRaw).Then(evaluation => ValueOrErrors.Default.return([fieldName, evaluation]))
      }))).Then(evaluations => {
        return ValueOrErrors.Default.return({kind: "form", value: result, fields: Map(evaluations.map(_ => [_[0], _[1]]))})
      }))
    }
    if(predicate.kind == "list") {
      return calculateVisibility(predicate.value, bindings).Then(result => {
        if(typeof raw == "object" && "kind" in raw && raw.kind == "tuple"){
          return ValueOrErrors.Operations.All(List<ValueOrErrors<FormFieldPredicateEvaluation, string>>(raw.values.map((value, index) => {
            const elementLocal =  raw.values[index];
            if(elementLocal == undefined) {
              return ValueOrErrors.Default.throwOne(`Error: cannot find element of index ${index} in local ${JSON.stringify(raw)}`)
            }
            const elementBindings = bindings.set("local", elementLocal);
            return traverse(elementBindings, predicate.elementExpression, value)}))).Then(elementResults => {
              return ValueOrErrors.Default.return({kind: "list", value: result, elementValues: elementResults.toArray()})
            })
        }
        return ValueOrErrors.Default.throwOne(`Error: expected tuple, got ${JSON.stringify(raw)}`)
      })
    }
    if(predicate.kind == "map") {
      return calculateVisibility(predicate.value, bindings).Then(result => {
        if(typeof raw == "object" && "kind" in raw && raw.kind == "tuple"){
          return ValueOrErrors.Operations.All(List<ValueOrErrors<{key: FormFieldPredicateEvaluation, value: FormFieldPredicateEvaluation}, string>>(
            raw.values.map((kv, kvIndex) => {
              if(typeof raw.values[kvIndex] == "object" && "kind" in raw.values[kvIndex] && raw.values[kvIndex].kind == "tuple"){
                const keyLocal = raw.values[kvIndex].values[0];
                const valueLocal = raw.values[kvIndex].values[1];
                // TODO: Since we can have undefined values (date), this error check doesn't work, 
                // we should instead use Option for all undefined values
                // if(keyLocal == undefined || valueLocal == undefined) {
                //   console.error(raw.values[kvIndex])
                //   return ValueOrErrors.Default.throwOne(`Error: cannot find key or value of ${kvIndex} in local ${JSON.stringify(raw)}`)
                // }
                const keyBindings = bindings.set("local", keyLocal);
                const valueBindings = bindings.set("local", valueLocal);
                return traverse(keyBindings, predicate.keyExpression, keyLocal).Then(keyResult => {
                  return traverse(valueBindings, predicate.valueExpression, valueLocal).Then(valueResult => {
                    return ValueOrErrors.Default.return({key: keyResult, value: valueResult})
                  })
                })
              }
              return ValueOrErrors.Default.throwOne(`Error: expected tuple of key and value, got ${JSON.stringify(kv)}`)
            })
          )).Then(keyValues => {
            return ValueOrErrors.Default.return({kind: "map", value: result, elementValues: keyValues.toArray()})
          })

        }
        return ValueOrErrors.Default.throwOne(`Error: expected tuple of key value pairs, got ${JSON.stringify(raw)}`)
      })
    }
    return ValueOrErrors.Default.throwOne(`Error: unsupported predicate kind ${JSON.stringify(predicate)}`)
  }

  const res = traverse(bindings, {kind: "form", value: true, fields: context.visibilityPredicateExpressions}, root).Then(visibilities => {
    return traverse(bindings, {kind: "form", value: true, fields: context.disabledPredicatedExpressions}, root).Then(disabledFields => {
      return ValueOrErrors.Default.return({visiblityPredicateEvaluations: visibilities, disabledPredicateEvaluations: disabledFields})
    })
  })

  if(res.kind == "errors") {
    console.error('error evaluating predicates', res)
  }
  return res
} 
