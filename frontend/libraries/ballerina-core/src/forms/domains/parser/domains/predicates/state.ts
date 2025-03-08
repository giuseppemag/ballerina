import { Map, Set, List } from "immutable";
import {
  ValueOrErrors,
  MapRepo,
  FieldName,
  ParsedType,
  Updater,
  simpleUpdater,
  replaceWith,
} from "../../../../../../main";

export type FieldPredicateExpression =
  | { kind: "primitive"; value: Expr }
  | { kind: "form"; value: Expr; fields: FieldPredicateExpressions }
  | { kind: "list"; value: Expr; elementExpression: FieldPredicateExpression }
  | {
      kind: "map";
      value: Expr;
      keyExpression: FieldPredicateExpression;
      valueExpression: FieldPredicateExpression;
    };

const calculateVisibility = (
  expr: Expr,
  bindings: Bindings
): ValueOrErrors<boolean, string> => {
  if (typeof expr == "boolean") {
    return ValueOrErrors.Default.return(expr);
  }
  return Expr.Operations.Evaluate(bindings)(expr).Then((result) => {
    if (typeof result == "boolean") {
      return ValueOrErrors.Default.return(result);
    }
    return ValueOrErrors.Default.throwOne(
      `Error: cannot evaluate expression ${JSON.stringify(expr)} to a boolean`
    );
  });
};

export const FieldPredicateExpression = {
  Default: {
    primitive: (value: Expr): FieldPredicateExpression => ({
      kind: "primitive",
      value,
    }),
    form: (
      value: Expr,
      fields: FieldPredicateExpressions
    ): FieldPredicateExpression => ({ kind: "form", value, fields }),
    list: (
      value: Expr,
      elementExpression: FieldPredicateExpression
    ): FieldPredicateExpression => ({ kind: "list", value, elementExpression }),
    map: (
      value: Expr,
      keyExpression: FieldPredicateExpression,
      valueExpression: FieldPredicateExpression
    ): FieldPredicateExpression => ({
      kind: "map",
      value,
      keyExpression,
      valueExpression,
    }),
  },
};

export type FieldPredicateExpressions = Map<
  FieldName,
  FieldPredicateExpression
>;

export type FormFieldPredicateEvaluation =
  | { kind: "primitive"; value: boolean }
  | { kind: "form"; value: boolean; fields: FormFieldPredicateEvaluations }
  | {
      kind: "list";
      value: boolean;
      elementValues: FormFieldPredicateEvaluation[];
    }
  | {
      kind: "map";
      value: boolean;
      elementValues: {
        key: FormFieldPredicateEvaluation;
        value: FormFieldPredicateEvaluation;
      }[];
    };

export const FormFieldPredicateEvaluation = {
  Default: {
    primitive: (value: boolean): FormFieldPredicateEvaluation => ({
      kind: "primitive",
      value,
    }),
    form: (
      value: boolean,
      fields: FormFieldPredicateEvaluations
    ): FormFieldPredicateEvaluation => ({ kind: "form", value, fields }),
    list: (
      value: boolean,
      elementValues: FormFieldPredicateEvaluation[]
    ): FormFieldPredicateEvaluation => ({ kind: "list", value, elementValues }),
    map: (
      value: boolean,
      elementValues: {
        key: FormFieldPredicateEvaluation;
        value: FormFieldPredicateEvaluation;
      }[]
    ): FormFieldPredicateEvaluation => ({ kind: "map", value, elementValues }),
  },
};

export type FormFieldPredicateEvaluations = Map<
  FieldName,
  FormFieldPredicateEvaluation
>;

export type EvaluationPredicateValue = {
  kind: "expression";
};

export type ValueRecord = {
  kind: "record";
  fields: Map<string, PredicateValue>;
};
export const ValueRecord = {
  Default: {
    empty: (): ValueRecord => ({ kind: "record", fields: Map() }),
    fromJSON: (json: object): ValueRecord => ({
      kind: "record",
      fields: Map(json),
    }),
    fromMap: (map: Map<string, PredicateValue>): ValueRecord => ({
      kind: "record",
      fields: map,
    }),
  },
  Operations: {
    has: (record: ValueRecord, key: string): boolean => {
      return record.fields.has(key);
    },
  },
  Updaters: {
    ...simpleUpdater<ValueRecord>()("fields"),
    set: (key: string, value: PredicateValue): Updater<ValueRecord> => {
      return ValueRecord.Updaters.fields(MapRepo.Updaters.set(key, value));
    },
    remove: (key: string): Updater<ValueRecord> => {
      return ValueRecord.Updaters.fields(MapRepo.Updaters.remove(key));
    },
    clear: (): Updater<ValueRecord> => {
      return ValueRecord.Updaters.fields(replaceWith(Map()));
    },
  },
};
export type ValueUnionCase = {
  kind: "unionCase";
  caseName: string;
  fields: ValueRecord;
};
export type ValuePrimitive = number | string | boolean | Date;
export type ValueUnit = { kind: "unit" };
export type ValueTuple = { kind: "tuple"; values: List<PredicateValue> };
export type ValueOption = {
  kind: "option";
  isSome: boolean;
  value: PredicateValue;
};
export type ValueVarLookup = { kind: "varLookup"; varName: string };

export type PredicateValue =
  | ValuePrimitive
  | ValueUnit
  | ValueTuple
  | ValueRecord
  | ValueUnionCase
  | ValueOption
  | ValueVarLookup;

export type ExprFieldLookup = { kind: "fieldLookup"; operands: [Expr, string] };
export type ExprIsCase = { kind: "isCase"; operands: [Expr, string] };
export type ExprBinaryOperator = {
  kind: BinaryOperator;
  operands: [Expr, Expr];
};

export type Expr =
  | PredicateValue
  | ExprFieldLookup
  | ExprIsCase
  | ExprBinaryOperator;

export const BinaryOperators = ["or", "equals"] as const;
export const BinaryOperatorsSet = Set(BinaryOperators);
export type BinaryOperator = (typeof BinaryOperators)[number];

export type Bindings = Map<string, PredicateValue>;

export const PredicateValue = {
  Default: {
    string: () => "",
    number: () => 0,
    boolean: () => false,
    date: () => new Date(),
    unit: (): PredicateValue => ({ kind: "unit" }),
    tuple: (values: List<PredicateValue>): ValueTuple => ({
      kind: "tuple",
      values,
    }),
    record: (fields: Map<string, PredicateValue>): ValueRecord => ({
      kind: "record",
      fields,
    }),
    unionCase: (caseName: string, fields: ValueRecord): ValueUnionCase => ({
      kind: "unionCase",
      caseName,
      fields,
    }),
    option: (isSome: boolean, value: PredicateValue): ValueOption => ({
      kind: "option",
      isSome,
      value,
    }),
    varLookup: (varName: string): PredicateValue => ({
      kind: "varLookup",
      varName,
    }),
  },
  Operations: {
    IsBoolean: (value: PredicateValue | Expr): value is boolean => {
      return typeof value == "boolean";
    },
    IsNumber: (value: PredicateValue | Expr): value is number => {
      return typeof value == "number";
    },
    IsString: (value: PredicateValue | Expr): value is string => {
      return typeof value == "string";
    },
    IsDate: (value: PredicateValue | Expr): value is Date => {
      // TODO - test
      return (
        typeof value == "object" &&
        Object.prototype.toString.call(value) === "[object Date]"
      );
    },
    IsUnit: (value: PredicateValue | Expr): value is ValueUnit => {
      return (
        typeof value == "object" &&
        !PredicateValue.Operations.IsDate(value) &&
        value.kind == "unit"
      );
    },
    IsUnionCase: (value: PredicateValue | Expr): value is ValueUnionCase => {
      return (
        typeof value == "object" &&
        !PredicateValue.Operations.IsDate(value) &&
        value.kind == "unionCase"
      );
    },
    IsRecord: (value: PredicateValue | Expr): value is ValueRecord => {
      return (
        typeof value == "object" &&
        !PredicateValue.Operations.IsDate(value) &&
        value.kind == "record"
      );
    },
    IsTuple: (value: PredicateValue | Expr): value is ValueTuple => {
      return (
        typeof value == "object" &&
        !PredicateValue.Operations.IsDate(value) &&
        value.kind == "tuple"
      );
    },
    IsOption: (value: PredicateValue | Expr): value is ValueOption => {
      return (
        typeof value == "object" &&
        !PredicateValue.Operations.IsDate(value) &&
        value.kind == "option"
      );
    },
    IsVarLookup: (value: PredicateValue | Expr): value is ValueVarLookup => {
      return (
        typeof value == "object" &&
        !PredicateValue.Operations.IsDate(value) &&
        value.kind == "varLookup"
      );
    },
    ParseAsDate: (json: any): ValueOrErrors<PredicateValue, string> => {
      if (PredicateValue.Operations.IsDate(json))
        return ValueOrErrors.Default.return(json);
      return ValueOrErrors.Default.throwOne(
        `Error: date has invalid value property`
      );
    },
    ParseAsVarLookup: (json: any): ValueOrErrors<PredicateValue, string> => {
      if (json.kind == "varLookup" && typeof json.varName == "string")
        return ValueOrErrors.Default.return(
          PredicateValue.Default.varLookup(json.varName)
        );
      return ValueOrErrors.Default.throwOne(
        `Error: varLookup has invalid varName property`
      );
    },
    ParseAsUnionCase: (json: any): ValueOrErrors<PredicateValue, string> => {
      if (typeof json.caseName == "string")
        return ValueOrErrors.Default.return(
          PredicateValue.Default.unionCase(json.caseName, json.value)
        );

      return ValueOrErrors.Default.throwOne(
        `Error: union case has invalid caseName property`
      );
    },
    ParseAsRecord: (
      json: any,
      types: Map<string, ParsedType<any>>
    ): ValueOrErrors<PredicateValue, string> => {
      if ("fields" in json && typeof json.fields == "object") {
        return ValueOrErrors.Operations.All(
          List(
            Object.entries(json.fields).map(([fieldName, fieldValue]) =>
              PredicateValue.Operations.parse(
                fieldValue,
                { kind: "expression" },
                types
              ).Then((value) =>
                ValueOrErrors.Default.return([fieldName, value] as [
                  string,
                  PredicateValue
                ])
              )
            )
          )
        ).Then((entries) =>
          ValueOrErrors.Default.return(
            PredicateValue.Default.record(Map(entries))
          )
        );
      }
      return ValueOrErrors.Default.throwOne(
        `Error: record has no field property`
      );
    },
    ParseAsTuple: (
      json: any,
      types: Map<string, ParsedType<any>>
    ): ValueOrErrors<PredicateValue, string> => {
      if (json.values != undefined && Array.isArray(json.values)) {
        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<PredicateValue, string>>(
            json.values.map((elementValue: any) =>
              PredicateValue.Operations.parse(
                elementValue,
                { kind: "expression" },
                types
              )
            )
          )
        ).Then((values) =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values))
        );
      }
      return ValueOrErrors.Default.throwOne(
        `Error: tuple has no values property`
      );
    },
    parse: <T>(
      json: any,
      type: ParsedType<T> | EvaluationPredicateValue,
      types: Map<string, ParsedType<T>>
    ): ValueOrErrors<PredicateValue, string> => {
      if (
        type.kind == "expression" &&
        (typeof json == "boolean" ||
          typeof json == "number" ||
          typeof json == "string")
      )
        return ValueOrErrors.Default.return(json);
      if (type.kind == "expression" && json.kind == undefined) {
        return ValueOrErrors.Default.throwOne(
          `Error: evaluation statement has no kind value`
        );
      }
      if (type.kind == "expression" && json.kind == "guid") {
        return ValueOrErrors.Default.return(json);
      }
      if (type.kind == "expression" && json.kind == "date") {
        return PredicateValue.Operations.ParseAsDate(json);
      }
      if (type.kind == "expression" && json.kind == "unit") {
        return ValueOrErrors.Default.return(PredicateValue.Default.unit());
      }
      if (type.kind == "expression" && json.kind == "varLookup") {
        return PredicateValue.Operations.ParseAsVarLookup(json);
      }
      if (
        type.kind == "expression" &&
        json.kind == "record" &&
        "caseName" in json
      ) {
        return PredicateValue.Operations.ParseAsUnionCase(json);
      }
      if (
        type.kind == "expression" &&
        json.kind == "record" &&
        "fields" in json
      ) {
        return PredicateValue.Operations.ParseAsRecord(json, types);
      }
      if (
        type.kind == "expression" &&
        json.kind == "tuple" &&
        "values" in json
      ) {
        return PredicateValue.Operations.ParseAsTuple(json, types);
      }
      if (type.kind == "primitive" && type.value == "Date") {
        // TODO - date conversion and validation
        return ValueOrErrors.Default.return(json);
      }
      if (type.kind == "primitive" && type.value == "maybeBoolean") {
        return json == undefined
          ? ValueOrErrors.Default.return(false)
          : ValueOrErrors.Default.return(json);
      }
      if (type.kind == "primitive") {
        return ValueOrErrors.Default.return(json);
      }
      if (type.kind == "lookup") {
        const subType = types.get(type.name);
        if (subType == undefined) {
          return ValueOrErrors.Default.throwOne(
            `Error: cannot find field ${type.name} in types`
          );
        }
        return PredicateValue.Operations.parse(json, subType, types);
      }
      if (type.kind == "unionCase") {
        if (Object.keys(type.fields).length > 0) {
          return ValueOrErrors.Default.throwOne(
            `Error: union case ${type} has fields, not a valid enum`
          );
        }
        return PredicateValue.Operations.ParseAsUnionCase({
          kind: "unionCase",
          caseName: json,
          value: { kind: "form", value: Map() },
        });
      }
      if (type.kind == "union") {
        const unionCase = type.args.get(json);
        if (unionCase == undefined) {
          return ValueOrErrors.Default.throwOne(
            `Error: cannot find union case ${json} in types`
          );
        }
        return PredicateValue.Operations.parse(json, unionCase, types);
      }
      if (type.kind == "application" && type.value == "List") {
        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<PredicateValue, string>>(
            json.map((elementValue: any) =>
              PredicateValue.Operations.parse(elementValue, type.args[0], types)
            )
          )
        ).Then((values) =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values))
        );
      }
      if (type.kind == "application" && type.value == "Map") {
        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<PredicateValue, string>>(
            json.map((keyValue: any) =>
              PredicateValue.Operations.parse(
                keyValue.key,
                type.args[0],
                types
              ).Then((key) =>
                PredicateValue.Operations.parse(
                  keyValue.value,
                  type?.args[1],
                  types
                ).Then((value) =>
                  ValueOrErrors.Default.return(
                    PredicateValue.Default.tuple(List([key, value]))
                  )
                )
              )
            )
          )
        ).Then((values) =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values))
        );
      }
      if (type.kind == "application" && type.value == "SingleSelection") {
        ValueOrErrors.Default.return(
          PredicateValue.Default.option(json["IsSome"], json["Value"])
        );
      }
      if (type.kind == "application" && type.value == "MultiSelection") {
        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<PredicateValue, string>>(
            json.map((elementValue: any) =>
              PredicateValue.Operations.parse(elementValue, type.args[0], types)
            )
          )
        ).Then((values) =>
          ValueOrErrors.Default.return(PredicateValue.Default.tuple(values))
        );
      }
      if (type.kind == "form") {
        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<[string, PredicateValue], string>>(
            Object.entries(json).map(([fieldName, fieldValue]) => {
              const subType = type.fields.get(fieldName);
              if (subType == undefined) {
                return ValueOrErrors.Default.throwOne(
                  `Error: cannot find field ${fieldName} in type ${JSON.stringify(
                    type
                  )}`
                );
              }
              return PredicateValue.Operations.parse(
                fieldValue,
                subType,
                types
              ).Then((value) =>
                ValueOrErrors.Default.return([fieldName, value])
              );
            })
          )
        ).Then((entries: List<[string, PredicateValue]>) =>
          ValueOrErrors.Default.return(
            PredicateValue.Default.record(Map(entries.map((_) => [_[0], _[1]])))
          )
        );
      }
      return ValueOrErrors.Default.throwOne(
        `Error: unsupported type ${JSON.stringify(type)}`
      );
    },
    recordToTuple: (r: ValueRecord): ValueTuple => {
      const valuesSortedByName = r.fields
        .toSeq()
        .map((v, k) => [k, v])
        .sortBy(([k, v]) => k)
        .map(([k, v]) => v)
        .valueSeq()
        .toArray();
      return PredicateValue.Default.tuple(List(valuesSortedByName));
    },
    Equals:
      (vars: Bindings) =>
      (
        v1: PredicateValue,
        v2: PredicateValue
      ): ValueOrErrors<boolean, string> =>
        typeof v1 == "boolean" ||
        typeof v1 == "number" ||
        typeof v1 == "string" ||
        typeof v2 == "boolean" ||
        typeof v2 == "number" ||
        typeof v2 == "string"
          ? typeof v1 == typeof v2
            ? ValueOrErrors.Default.return(v1 == v2)
            : ValueOrErrors.Default.throwOne(
                `Error: cannot compare expressions of different types ${JSON.stringify(
                  v1
                )} and ${JSON.stringify(v2)}.`
              )
          : PredicateValue.Operations.IsDate(v1) &&
            PredicateValue.Operations.IsDate(v2)
          ? v1.getTime() == v2.getTime()
            ? ValueOrErrors.Default.return(true)
            : ValueOrErrors.Default.return(false)
          : PredicateValue.Operations.IsUnionCase(v1) &&
            PredicateValue.Operations.IsUnionCase(v2)
          ? v1.caseName == v2.caseName
            ? PredicateValue.Operations.Equals(vars)(v1.fields, v2.fields)
            : ValueOrErrors.Default.return(false)
          : PredicateValue.Operations.IsTuple(v1) &&
            PredicateValue.Operations.IsTuple(v2)
          ? v1.values.size != v2.values.size
            ? ValueOrErrors.Default.return(false)
            : v1.values.size == 0
            ? ValueOrErrors.Default.return(true)
            : PredicateValue.Operations.Equals(vars)(
                v1.values.get(0)!,
                v2.values.get(0)!
              ).Then((firstEqual) =>
                firstEqual
                  ? PredicateValue.Operations.Equals(vars)(
                      PredicateValue.Default.tuple(v1.values.slice(1)),
                      PredicateValue.Default.tuple(v2.values.slice(1))
                    )
                  : ValueOrErrors.Default.return(false)
              )
          : PredicateValue.Operations.IsRecord(v1) &&
            PredicateValue.Operations.IsRecord(v2)
          ? PredicateValue.Operations.Equals(vars)(
              PredicateValue.Operations.recordToTuple(v1),
              PredicateValue.Operations.recordToTuple(v2)
            )
          : PredicateValue.Operations.IsUnit(v1) &&
            PredicateValue.Operations.IsUnit(v2)
          ? ValueOrErrors.Default.return(true)
          : PredicateValue.Operations.IsUnit(v1) !=
            PredicateValue.Operations.IsUnit(v2)
          ? ValueOrErrors.Default.throwOne(
              `Error: cannot compare expressions of different types ${JSON.stringify(
                v1
              )} and ${JSON.stringify(v2)}.`
            )
          : ValueOrErrors.Default.throwOne(
              `Error: structural equality is not implemented yet between ${JSON.stringify(
                v1
              )} and ${JSON.stringify(v2)}.`
            ),
  },
};

export const Expr = {
  Default: {
    fieldLookup: (e: Expr, f: string): Expr => ({
      kind: "fieldLookup",
      operands: [e, f],
    }),
    isCase: (e: Expr, c: string): Expr => ({
      kind: "isCase",
      operands: [e, c],
    }),
    binaryOperator: (op: BinaryOperator, e1: Expr, e2: Expr): Expr => ({
      kind: op,
      operands: [e1, e2],
    }),
  },
  Operations: {
    IsFieldLookup: (e: Expr): e is ExprFieldLookup => {
      return (
        typeof e == "object" &&
        !PredicateValue.Operations.IsDate(e) &&
        e.kind == "fieldLookup"
      );
    },
    IsIsCase: (e: Expr): e is ExprIsCase => {
      return (
        typeof e == "object" &&
        !PredicateValue.Operations.IsDate(e) &&
        e.kind == "isCase"
      );
    },
    IsBinaryOperator: (e: Expr): e is ExprBinaryOperator => {
      return (
        typeof e == "object" &&
        !PredicateValue.Operations.IsDate(e) &&
        BinaryOperatorsSet.has(e.kind as BinaryOperator)
      );
    },
    parse: (json: any): ValueOrErrors<Expr, string> => {
      const asValue = PredicateValue.Operations.parse(
        json,
        { kind: "expression" },
        Map<string, ParsedType<unknown>>()
      );
      if (asValue.kind == "value") return asValue;
      if (
        "kind" in json &&
        "operands" in json &&
        typeof json["kind"] == "string" &&
        Array.isArray(json["operands"]) &&
        json["operands"].length == 2
      ) {
        const kind: string = json["kind"];
        const [first, second]: Array<any> = json["operands"];
        if (json["kind"] == "fieldLookup" && typeof second == "string") {
          return Expr.Operations.parse(first).Then((first) =>
            ValueOrErrors.Default.return(
              Expr.Default.fieldLookup(first, second)
            )
          );
        }
        if (json["kind"] == "isCase" && typeof second == "string") {
          return Expr.Operations.parse(first).Then((first) =>
            ValueOrErrors.Default.return(Expr.Default.isCase(first, second))
          );
        }
        if (BinaryOperatorsSet.contains(json["kind"] as BinaryOperator)) {
          return Expr.Operations.parse(first).Then((first) =>
            Expr.Operations.parse(second).Then((second) =>
              ValueOrErrors.Default.return(
                Expr.Default.binaryOperator(json["kind"], first, second)
              )
            )
          );
        }
      }
      return ValueOrErrors.Default.throwOne(
        `Error: cannot parse ${JSON.stringify(json)} to Expr.`
      );
    },
    EvaluateAsRecord:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<ValueRecord, string> =>
        !PredicateValue.Operations.IsRecord(e)
          ? ValueOrErrors.Default.throwOne(
              `Error: expected record, got ${JSON.stringify(e)}`
            )
          : ValueOrErrors.Default.return(e),
    EvaluateAsUnionCase:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<ValueUnionCase, string> =>
        !PredicateValue.Operations.IsUnionCase(e)
          ? ValueOrErrors.Default.throwOne(
              `Error: expected union case, got ${JSON.stringify(e)}`
            )
          : ValueOrErrors.Default.return(e),
    EvaluateAsBoolean:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<boolean, string> =>
        !PredicateValue.Operations.IsBoolean(e)
          ? ValueOrErrors.Default.throwOne(
              `Error: expected boolean, got ${JSON.stringify(e)}`
            )
          : ValueOrErrors.Default.return(e),
    Evaluate:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<PredicateValue, string> =>
        PredicateValue.Operations.IsBoolean(e) ||
        PredicateValue.Operations.IsNumber(e) ||
        PredicateValue.Operations.IsString(e) ||
        PredicateValue.Operations.IsUnit(e) ||
        PredicateValue.Operations.IsRecord(e) ||
        PredicateValue.Operations.IsTuple(e) ||
        PredicateValue.Operations.IsUnionCase(e)
          ? ValueOrErrors.Default.return(e)
          : PredicateValue.Operations.IsVarLookup(e)
          ? MapRepo.Operations.tryFindWithError(
              e.varName,
              vars,
              () => `Error: cannot find variable ${JSON.stringify(e.varName)}`
            )
          : Expr.Operations.IsFieldLookup(e)
          ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then(
              (record: PredicateValue) =>
                Expr.Operations.EvaluateAsRecord(vars)(record).Then(
                  (record: ValueRecord) =>
                    MapRepo.Operations.tryFindWithError(
                      e.operands[1],
                      record.fields,
                      () =>
                        `Error: cannot find field ${
                          e.operands[1]
                        } in record ${JSON.stringify(record)}`
                    )
                )
            )
          : Expr.Operations.IsIsCase(e)
          ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then(
              (unionCase: PredicateValue) =>
                Expr.Operations.EvaluateAsUnionCase(vars)(unionCase).Then(
                  (unionCase: ValueUnionCase) =>
                    ValueOrErrors.Default.return(
                      unionCase.caseName == e.operands[1]
                    )
                )
            )
          : Expr.Operations.IsBinaryOperator(e) &&
            e.kind == "equals"
          ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then((v1) =>
              Expr.Operations.Evaluate(vars)(e.operands[1]).Then((v2) =>
                PredicateValue.Operations.Equals(vars)(v1, v2).Then((eq) =>
                  ValueOrErrors.Default.return(eq)
                )
              )
            )
          : Expr.Operations.IsBinaryOperator(e) &&
            e.kind == "or"
          ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then((v1) =>
              Expr.Operations.Evaluate(vars)(e.operands[1]).Then((v2) =>
                Expr.Operations.EvaluateAsBoolean(vars)(v1).Then((v1) =>
                  Expr.Operations.EvaluateAsBoolean(vars)(v2).Then((v2) =>
                    ValueOrErrors.Default.return(v1 || v2)
                  )
                )
              )
            )
          : ValueOrErrors.Default.throwOne(
              `Error: unsupported expression ${JSON.stringify(e)}`
            ),
  },
};

export const evaluatePredicates = <E>(
  context: {
    global: PredicateValue;
    types: Map<string, ParsedType<E>>;
    visibilityPredicateExpressions: FieldPredicateExpressions;
    disabledPredicatedExpressions: FieldPredicateExpressions;
  },
  root: PredicateValue
): ValueOrErrors<
  {
    visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
    disabledPredicateEvaluations: FormFieldPredicateEvaluation;
  },
  string
> => {
  const bindings: Bindings = Map<string, PredicateValue>()
    .set("global", context.global)
    .set("root", root)
    .set("local", root);
  const traverse = (
    bindings: Bindings,
    predicate: FieldPredicateExpression,
    raw: PredicateValue
  ): ValueOrErrors<FormFieldPredicateEvaluation, string> => {
    if (predicate.kind == "primitive") {
      return calculateVisibility(predicate.value, bindings).Then((result) => {
        return ValueOrErrors.Default.return({
          kind: "primitive",
          value: result,
        });
      });
    }
    if (predicate.kind == "form") {
      if (typeof raw != "object" || !("kind" in raw) || raw.kind != "record") {
        return ValueOrErrors.Default.throwOne(
          `Error: expected record in raw, got ${JSON.stringify(raw)}`
        );
      }
      return calculateVisibility(predicate.value, bindings).Then((result) =>
        ValueOrErrors.Operations.All(
          List<ValueOrErrors<[string, FormFieldPredicateEvaluation], string>>(
            predicate.fields
              .entrySeq()
              .map<
                ValueOrErrors<[string, FormFieldPredicateEvaluation], string>
              >(([fieldName, fieldPredicate]) => {
                const fieldRaw = raw.fields.get(fieldName);

                if (fieldRaw == undefined) {
                  return ValueOrErrors.Default.throwOne(
                    `Error: cannot find field ${fieldName} in raw ${JSON.stringify(
                      raw
                    )}`
                  );
                }

                if (fieldPredicate.kind == "form") {
                  const localBindings = bindings.get("local")! as ValueRecord;
                  const fieldLocal = localBindings.fields.get(fieldName);
                  if (fieldLocal == undefined) {
                    return ValueOrErrors.Default.throwOne(
                      `Error: cannot find field ${fieldName} in local ${JSON.stringify(
                        localBindings
                      )}`
                    );
                  }
                  const fieldBindings = bindings.set("local", fieldLocal);
                  return traverse(fieldBindings, fieldPredicate, fieldRaw).Then(
                    (evaluation) =>
                      ValueOrErrors.Default.return([fieldName, evaluation])
                  );
                }

                return traverse(bindings, fieldPredicate, fieldRaw).Then(
                  (evaluation) =>
                    ValueOrErrors.Default.return([fieldName, evaluation])
                );
              })
          )
        ).Then((evaluations) => {
          return ValueOrErrors.Default.return({
            kind: "form",
            value: result,
            fields: Map(evaluations.map((_) => [_[0], _[1]])),
          });
        })
      );
    }
    if (predicate.kind == "list") {
      return calculateVisibility(predicate.value, bindings).Then((result) => {
        if (PredicateValue.Operations.IsTuple(raw)) {
          return ValueOrErrors.Operations.All(
            List<ValueOrErrors<FormFieldPredicateEvaluation, string>>(
              raw.values.map((value, index) => {
                const elementLocal = raw.values.get(index);
                if (elementLocal == undefined) {
                  return ValueOrErrors.Default.throwOne(
                    `Error: cannot find element of index ${index} in local ${JSON.stringify(
                      raw
                    )}`
                  );
                }
                const elementBindings = bindings.set("local", elementLocal);
                return traverse(
                  elementBindings,
                  predicate.elementExpression,
                  value
                );
              })
            )
          ).Then((elementResults) => {
            return ValueOrErrors.Default.return({
              kind: "list",
              value: result,
              elementValues: elementResults.toArray(),
            });
          });
        }
        return ValueOrErrors.Default.throwOne(
          `Error: expected tuple, got ${JSON.stringify(raw)}`
        );
      });
    }
    if (predicate.kind == "map") {
      return calculateVisibility(predicate.value, bindings).Then((result) => {
        if (typeof raw == "object" && "kind" in raw && raw.kind == "tuple") {
          return ValueOrErrors.Operations.All(
            List<
              ValueOrErrors<
                {
                  key: FormFieldPredicateEvaluation;
                  value: FormFieldPredicateEvaluation;
                },
                string
              >
            >(
              raw.values.map((kv) => {
                if (PredicateValue.Operations.IsTuple(kv)) {
                  const keyLocal = kv.values.get(0)!;
                  const valueLocal = kv.values.get(1)!;
                  // TODO: Since we can have undefined values (date), this error check doesn't work,
                  // we should instead use Option for all undefined values
                  // if(keyLocal == undefined || valueLocal == undefined) {
                  //   console.error(raw.values[kvIndex])
                  //   return ValueOrErrors.Default.throwOne(`Error: cannot find key or value of ${kvIndex} in local ${JSON.stringify(raw)}`)
                  // }
                  const keyBindings = bindings.set("local", keyLocal);
                  const valueBindings = bindings.set("local", valueLocal);
                  return traverse(
                    keyBindings,
                    predicate.keyExpression,
                    keyLocal
                  ).Then((keyResult) => {
                    return traverse(
                      valueBindings,
                      predicate.valueExpression,
                      valueLocal
                    ).Then((valueResult) => {
                      return ValueOrErrors.Default.return({
                        key: keyResult,
                        value: valueResult,
                      });
                    });
                  });
                }
                return ValueOrErrors.Default.throwOne(
                  `Error: expected tuple of key and value, got ${JSON.stringify(
                    kv
                  )}`
                );
              })
            )
          ).Then((keyValues) => {
            return ValueOrErrors.Default.return({
              kind: "map",
              value: result,
              elementValues: keyValues.toArray(),
            });
          });
        }
        return ValueOrErrors.Default.throwOne(
          `Error: expected tuple of key value pairs, got ${JSON.stringify(raw)}`
        );
      });
    }
    return ValueOrErrors.Default.throwOne(
      `Error: unsupported predicate kind ${JSON.stringify(predicate)}`
    );
  };

  const res = traverse(
    bindings,
    {
      kind: "form",
      value: true,
      fields: context.visibilityPredicateExpressions,
    },
    root
  ).Then((visibilities) => {
    return traverse(
      bindings,
      {
        kind: "form",
        value: true,
        fields: context.disabledPredicatedExpressions,
      },
      root
    ).Then((disabledFields) => {
      return ValueOrErrors.Default.return({
        visiblityPredicateEvaluations: visibilities,
        disabledPredicateEvaluations: disabledFields,
      });
    });
  });

  if (res.kind == "errors") {
    console.error("error evaluating predicates", res);
  }
  return res;
};
