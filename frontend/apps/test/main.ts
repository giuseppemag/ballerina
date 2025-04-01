import { Sum, Errors, ValueOrErrors, MapRepo } from "ballerina-core";
import { List, Map, Set } from "immutable";

export type ExprType =
  | { kind: "string" }
  | { kind: "bool" }
  | { kind: "int32" }
  | { kind: "float32" }
  | { kind: "time" }
  | { kind: "date" }
  | { kind: "guid" }
  | { kind: "unit" }
  | { kind: "Union"; cases: Map<string, ExprType> }
  | { kind: "Record"; fields: Map<string, ExprType> }
  | { kind: "Tuple"; items: List<ExprType> }
  | { kind: "Sum"; items: [ExprType, ExprType] }
  | { kind: "Option"; items: [ExprType] }
  | { kind: "SingleSelection"; items: [ExprType] }
  | { kind: "List"; items: [ExprType] }
  | { kind: "MultiSelection"; items: [ExprType] }
  | { kind: "Set"; items: [ExprType] }
  | { kind: "Map"; items: [ExprType, ExprType] };

export type ValueRecord = { kind: "record"; fields: Map<string, Value> };
export type ValueUnionCase = {
  kind: "unionCase";
  caseName: string;
  value: Value;
};
export type ValueTuple = { kind: "tuple"; values: Array<Value> };
export type Value =
  | number
  | string
  | boolean
  | { kind: "guid"; value: string }
  | { kind: "unit" }
  | { kind: "varLookup"; varName: string }
  | ValueTuple
  | ValueRecord
  | ValueUnionCase;

export type MatchCaseHandler = { parameter: string; body: Expr };
export type Expr =
  | Value
  | { kind: "itemLookup"; operands: [Expr, number] }
  | { kind: "fieldLookup"; operands: [Expr, string] }
  | { kind: "isCase"; operands: [Expr, string] }
  | { kind: "matchCase"; operands: [Expr, Map<string, MatchCaseHandler>] }
  | { kind: BinaryOperator; operands: [Expr, Expr] };

export const BinaryOperators = ["or", "equals"] as const;
export const BinaryOperatorsSet = Set(BinaryOperators);
export type BinaryOperator = (typeof BinaryOperators)[number];

export type Bindings = Map<string, Value>;

export const Value = {
  Default: {
    record: (fields: Map<string, Value>): ValueRecord => ({
      kind: "record",
      fields,
    }),
    unionCase: (caseName: string, value: Value): ValueUnionCase => ({
      kind: "unionCase",
      caseName,
      value,
    }),
    tuple: (values: Array<Value>): ValueTuple => ({ kind: "tuple", values }),
  },
  Operations: {
    parse: (json: any): ValueOrErrors<Value, string> => {
      if (
        typeof json == "boolean" ||
        typeof json == "number" ||
        typeof json == "string"
      )
        return ValueOrErrors.Default.return(json);
      if ("kind" in json && json["kind"] == "unit")
        return ValueOrErrors.Default.return(json);
      if (
        "kind" in json &&
        "varName" in json &&
        json["kind"] == "varLookup" &&
        typeof json["varName"] == "string"
      )
        return ValueOrErrors.Default.return(json);
      if (
        "kind" in json &&
        "fields" in json &&
        json["kind"] == "record" &&
        typeof json["fields"] == "object"
      ) {
        return ValueOrErrors.Operations.All(
          List(
            Object.entries(json["fields"]).map(([fieldName, fieldValue]) =>
              Value.Operations.parse(fieldValue).Then((value) =>
                ValueOrErrors.Default.return([fieldName, value] as [
                  string,
                  Value,
                ]),
              ),
            ),
          ),
        ).Then((entries) =>
          ValueOrErrors.Default.return(Value.Default.record(Map(entries))),
        );
      }
      if (
        "kind" in json &&
        "values" in json &&
        json["kind"] == "tuple" &&
        Array.isArray(json["values"])
      ) {
        return ValueOrErrors.Operations.All(
          List(
            json["values"].map((elementValue) =>
              Value.Operations.parse(elementValue),
            ),
          ),
        ).Then((values) =>
          ValueOrErrors.Default.return(Value.Default.tuple(values.toArray())),
        );
      }
      if (
        "kind" in json &&
        "value" in json &&
        "caseName" in json &&
        json["kind"] == "record" &&
        typeof json["caseName"] == "string"
      ) {
        return Value.Operations.parse(json["value"]).Then((value) =>
          ValueOrErrors.Default.return(
            Value.Default.unionCase(json["caseName"], value),
          ),
        );
      }
      if (typeof json == "object") {
        return ValueOrErrors.Operations.All(
          List(
            Object.entries(json).map(([fieldName, fieldValue]) =>
              Value.Operations.parse(fieldValue).Then((value) =>
                ValueOrErrors.Default.return([fieldName, value] as [
                  string,
                  Value,
                ]),
              ),
            ),
          ),
        ).Then((entries) =>
          ValueOrErrors.Default.return(Value.Default.record(Map(entries))),
        );
      }
      if (Array.isArray(json)) {
        return ValueOrErrors.Operations.All(
          List(
            json.map((elementValue) => Value.Operations.parse(elementValue)),
          ),
        ).Then((values) =>
          ValueOrErrors.Default.return(Value.Default.tuple(values.toArray())),
        );
      }
      return ValueOrErrors.Default.throwOne(
        `Error: cannot parse json into Value ${JSON.stringify(json)}`,
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
      return Value.Default.tuple(valuesSortedByName);
    },
    Equals:
      (vars: Bindings) =>
      (v1: Value, v2: Value): ValueOrErrors<boolean, string> =>
        typeof v1 == "boolean" ||
        typeof v1 == "number" ||
        typeof v1 == "string" ||
        typeof v2 == "boolean" ||
        typeof v2 == "number" ||
        typeof v2 == "string"
          ? typeof v1 == typeof v2
            ? ValueOrErrors.Default.return(v1 == v2)
            : ValueOrErrors.Default.throwOne(
                `Error: cannot compare expressions of different types ${JSON.stringify(v1)} and ${JSON.stringify(v2)}.`,
              )
          : v1.kind == "guid" && v2.kind == "guid"
            ? ValueOrErrors.Default.return(v1.value == v2.value)
            : v1.kind == "unionCase" && v2.kind == "unionCase"
              ? v1.caseName == v2.caseName
                ? Value.Operations.Equals(vars)(v1.value, v2.value)
                : ValueOrErrors.Default.return(false)
              : v1.kind == "tuple" && v2.kind == "tuple"
                ? v1.values.length != v2.values.length
                  ? ValueOrErrors.Default.return(false)
                  : v1.values.length == 0
                    ? ValueOrErrors.Default.return(true)
                    : Value.Operations.Equals(vars)(
                        v1.values[0],
                        v2.values[0],
                      ).Then((firstEqual) =>
                        firstEqual
                          ? Value.Operations.Equals(vars)(
                              Value.Default.tuple(v1.values.slice(1)),
                              Value.Default.tuple(v2.values.slice(1)),
                            )
                          : ValueOrErrors.Default.return(false),
                      )
                : v1.kind == "record" && v2.kind == "record"
                  ? Value.Operations.Equals(vars)(
                      Value.Operations.recordToTuple(v1),
                      Value.Operations.recordToTuple(v2),
                    )
                  : v1.kind == "unit" && v2.kind == "unit"
                    ? ValueOrErrors.Default.return(true)
                    : v1.kind != v2.kind
                      ? ValueOrErrors.Default.throwOne(
                          `Error: cannot compare expressions of different types ${JSON.stringify(v1)} and ${JSON.stringify(v2)}.`,
                        )
                      : ValueOrErrors.Default.throwOne(
                          `Error: structural equality is not implemented yet between ${JSON.stringify(v1)} and ${JSON.stringify(v2)}.`,
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
    parse: (json: any): ValueOrErrors<Expr, string> => {
      const asValue = Value.Operations.parse(json);
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
              Expr.Default.fieldLookup(first, second),
            ),
          );
        }
        if (json["kind"] == "isCase" && typeof second == "string") {
          return Expr.Operations.parse(first).Then((first) =>
            ValueOrErrors.Default.return(Expr.Default.isCase(first, second)),
          );
        }
        if (BinaryOperatorsSet.contains(json["kind"] as BinaryOperator)) {
          return Expr.Operations.parse(first).Then((first) =>
            Expr.Operations.parse(second).Then((second) =>
              ValueOrErrors.Default.return(
                Expr.Default.binaryOperator(json["kind"], first, second),
              ),
            ),
          );
        }
      }
      return ValueOrErrors.Default.throwOne(
        `Error: cannot parse ${JSON.stringify(json)} to Expr.`,
      );
    },
    EvaluateAsTuple:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<ValueTuple, string> =>
        typeof e == "boolean" ||
        typeof e == "number" ||
        typeof e == "string" ||
        e.kind != "tuple"
          ? ValueOrErrors.Default.throwOne(
              `Error: expected record, got ${JSON.stringify(e)}`,
            )
          : ValueOrErrors.Default.return(e),
    EvaluateAsRecord:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<ValueRecord, string> =>
        typeof e == "boolean" ||
        typeof e == "number" ||
        typeof e == "string" ||
        e.kind != "record"
          ? ValueOrErrors.Default.throwOne(
              `Error: expected record, got ${JSON.stringify(e)}`,
            )
          : ValueOrErrors.Default.return(e),
    EvaluateAsUnionCase:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<ValueUnionCase, string> =>
        typeof e == "boolean" ||
        typeof e == "number" ||
        typeof e == "string" ||
        e.kind != "unionCase"
          ? ValueOrErrors.Default.throwOne(
              `Error: expected union case, got ${JSON.stringify(e)}`,
            )
          : ValueOrErrors.Default.return(e),
    EvaluateAsBoolean:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<boolean, string> =>
        typeof e == "boolean"
          ? ValueOrErrors.Default.return(e)
          : ValueOrErrors.Default.throwOne(
              `Error: expected union case, got ${JSON.stringify(e)}`,
            ),
    Evaluate:
      (vars: Bindings) =>
      (e: Expr): ValueOrErrors<Value, string> =>
        typeof e == "boolean" ||
        typeof e == "number" ||
        typeof e == "string" ||
        e.kind == "unit" ||
        e.kind == "guid" ||
        e.kind == "record" ||
        e.kind == "tuple" ||
        e.kind == "unionCase"
          ? ValueOrErrors.Default.return(e)
          : e.kind == "varLookup"
            ? MapRepo.Operations.tryFindWithError(
                e.varName,
                vars,
                () =>
                  `Error: cannot find variable ${JSON.stringify(e.varName)}`,
              )
            : e.kind == "fieldLookup"
              ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then(
                  (record: Value) =>
                    Expr.Operations.EvaluateAsRecord(vars)(record).Then(
                      (record: ValueRecord) =>
                        MapRepo.Operations.tryFindWithError(
                          e.operands[1],
                          record.fields,
                          () =>
                            `Error: cannot find field ${e.operands[1]} in record ${JSON.stringify(record)}`,
                        ),
                    ),
                )
              : e.kind == "itemLookup"
                ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then(
                    (tuple: Value) =>
                      Expr.Operations.EvaluateAsTuple(vars)(tuple).Then(
                        (tuple: ValueTuple) =>
                          e.operands[1] >= 1 &&
                          e.operands[1] <= tuple.values.length
                            ? ValueOrErrors.Default.return(
                                tuple.values[e.operands[1] - 1],
                              )
                            : ValueOrErrors.Default.throwOne(
                                `Error: cannot find field ${e.operands[1]} in tuple ${JSON.stringify(tuple)}`,
                              ),
                      ),
                  )
                : e.kind == "matchCase"
                  ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then(
                      (unionCase: Value) =>
                        Expr.Operations.EvaluateAsUnionCase(vars)(
                          unionCase,
                        ).Then((unionCase: ValueUnionCase) => {
                          const caseHandler = e.operands[1].get(
                            unionCase.caseName,
                          );
                          if (caseHandler == undefined)
                            return ValueOrErrors.Default.throwOne(
                              `Error: no handler provided for case ${unionCase.caseName} in ${JSON.stringify(e.operands[1])}`,
                            );
                          return Expr.Operations.Evaluate(
                            vars.set(caseHandler.parameter, unionCase.value),
                          )(caseHandler.body);
                        }),
                    )
                  : e.kind == "isCase"
                    ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then(
                        (unionCase: Value) =>
                          Expr.Operations.EvaluateAsUnionCase(vars)(
                            unionCase,
                          ).Then((unionCase: ValueUnionCase) =>
                            ValueOrErrors.Default.return(
                              unionCase.caseName == e.operands[1],
                            ),
                          ),
                      )
                    : e.kind == "equals"
                      ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then(
                          (v1) =>
                            Expr.Operations.Evaluate(vars)(e.operands[1]).Then(
                              (v2) =>
                                Value.Operations.Equals(vars)(v1, v2).Then(
                                  (eq) => ValueOrErrors.Default.return(eq),
                                ),
                            ),
                        )
                      : e.kind == "or"
                        ? Expr.Operations.Evaluate(vars)(e.operands[0]).Then(
                            (v1) =>
                              Expr.Operations.Evaluate(vars)(
                                e.operands[1],
                              ).Then((v2) =>
                                Expr.Operations.EvaluateAsBoolean(vars)(
                                  v1,
                                ).Then((v1) =>
                                  Expr.Operations.EvaluateAsBoolean(vars)(
                                    v2,
                                  ).Then((v2) =>
                                    ValueOrErrors.Default.return(v1 || v2),
                                  ),
                                ),
                              ),
                          )
                        : ValueOrErrors.Default.throwOne(
                            `Error: unsupported expression ${JSON.stringify(e)}`,
                          ),
  },
};

const sample1: any = {
  kind: "or",
  operands: [
    {
      kind: "fieldLookup",
      operands: [
        {
          kind: "varLookup",
          varName: "root",
        },
        "subscribeToNewsletter",
      ],
    },
    {
      kind: "equals",
      operands: [
        {
          kind: "fieldLookup",
          operands: [
            {
              kind: "varLookup",
              varName: "local",
            },
            "number",
          ],
        },
        10,
      ],
    },
  ],
};

const sample2: Expr = {
  kind: "or",
  operands: [
    {
      kind: "fieldLookup",
      operands: [
        {
          kind: "varLookup",
          varName: "global",
        },
        "IsAdmin",
      ],
    },
    {
      kind: "matchCase",
      operands: [
        {
          kind: "fieldLookup",
          operands: [{ kind: "varLookup", varName: "global" }, "ERP"],
        },
        Map<string, MatchCaseHandler>()
          .set("ERP:SAP", {
            parameter: "sapFields",
            body: {
              kind: "matchCase",
              operands: [
                {
                  kind: "fieldLookup",
                  operands: [
                    { kind: "varLookup", varName: "sapFields" },
                    "Value",
                  ],
                },
                Map<string, MatchCaseHandler>()
                  .set("SAP:S2", {
                    parameter: "s2Fields",
                    body: {
                      kind: "fieldLookup",
                      operands: [
                        { kind: "varLookup", varName: "s2Fields" },
                        "S2OnlyField",
                      ],
                    },
                  })
                  .set("SAP:S3", {
                    parameter: "s3Fields",
                    body: {
                      kind: "fieldLookup",
                      operands: [
                        { kind: "varLookup", varName: "s3Fields" },
                        "S3OnlyField",
                      ],
                    },
                  })
                  .set("SAP:S4", {
                    parameter: "s4Fields",
                    body: {
                      kind: "fieldLookup",
                      operands: [
                        { kind: "varLookup", varName: "s4Fields" },
                        "S4OnlyField",
                      ],
                    },
                  }),
              ],
            },
          })
          .set("ERP:BC", { parameter: "_", body: false })
          .set("ERP:FAndO", { parameter: "_", body: false }),

        // { "caseName":"ERP:BC", "handler":{ "kind":"lambda", "parameter":"_", "body":false } },
        // { "caseName":"ERP:FAndO", "handler":{ "kind":"lambda", "parameter":"_", "body":false } }
      ],
    },
  ],
};

let global: Value = {
  kind: "record",
  fields: Map<string, Value>()
    .set("IsAdmin", false)
    .set("ERP", {
      kind: "unionCase",
      caseName: "ERP:SAP",
      value: {
        kind: "record",
        fields: Map<string, Value>().set("Value", {
          kind: "unionCase",
          caseName: "SAP:S3",
          value: {
            kind: "record",
            fields: Map<string, Value>().set("S3OnlyField", false),
          },
        }),
      },
    }),
};
let root: Value = {
  kind: "record",
  fields: Map<string, Value>().set("subscribeToNewsletter", true),
};
let local: Value = {
  kind: "record",
  fields: Map<string, Value>().set("number", 20),
};
const sample3: Expr = { kind: "equals", operands: [global, global] };

let res = Expr.Operations.Evaluate(
  Map<string, Value>()
    .set("global", global)
    .set("root", root)
    .set("local", local),
)(sample2);
console.log(JSON.stringify(res));

// const parsedSample = Expr.Operations.parse(sample1)
// if (parsedSample.kind == "value") {
//   let res = Expr.Operations.Evaluate(Map<string, Value>().set("global", global).set("root", root).set("local", local))(parsedSample.value)
//   console.log(JSON.stringify(res))
// } else {
//   console.log("Error: ", JSON.stringify(parsedSample.errors))

// }

type DeltaPrimitive =
  | { kind: "IntReplace"; replace: number }
  | { kind: "StringReplace"; replace: string }
  | { kind: "BoolReplace"; replace: boolean }
  | { kind: "TimeReplace"; replace: number }
  | { kind: "GuidReplace"; replace: string }
  | { kind: "Int32Replace"; replace: bigint }
  | { kind: "Float32Replace"; replace: number };
type DeltaUnit = { kind: "UnitReplace"; replace: Value };
type DeltaOption =
  | { kind: "OptionReplace"; replace: Value; type: ExprType }
  | { kind: "OptionValue"; value: Delta; type: ExprType };
type DeltaSum =
  | { kind: "SumReplace"; replace: Value; type: ExprType }
  | { kind: "SumLeft"; value: Delta; type: ExprType }
  | { kind: "SumRight"; value: Delta; type: ExprType };
type DeltaList =
  | { kind: "ArrayReplace"; replace: Value; type: ExprType }
  | { kind: "ArrayValue"; value: [number, Delta] }
  | { kind: "ArrayAddAt"; value: [number, Value]; type: ExprType }
  | { kind: "ArrayRemoveAt"; index: number }
  | { kind: "ArrayMoveFromTo"; from: number; to: number };
type DeltaSet =
  | { kind: "SetReplace"; replace: Value; type: ExprType }
  | { kind: "SetValue"; value: [Value, Delta]; type: ExprType }
  | { kind: "SetAdd"; value: Value; type: ExprType }
  | { kind: "SetRemove"; value: Value; type: ExprType };
type DeltaMap =
  | { kind: "MapReplace"; replace: Value; type: ExprType }
  | { kind: "MapValue"; keyValue: [Value, Delta]; type: ExprType }
  | { kind: "MapAdd"; keyValue: [Value, Value]; type: ExprType }
  | { kind: "MapRemove"; key: Value; type: ExprType };
type DeltaRecord =
  | { kind: "RecordReplace"; replace: Value; type: ExprType }
  | { kind: "RecordField"; field: [string, Delta]; type: ExprType };
type DeltaUnion =
  | { kind: "UnionReplace"; replace: Value; type: ExprType }
  | { kind: "UnionCase"; case: [string, Delta]; type: ExprType };
type DeltaTuple =
  | { kind: "TupleReplace"; replace: Value; type: ExprType }
  | { kind: "TupleCase"; item: [number, Delta]; type: ExprType };
type Delta =
  | DeltaPrimitive
  | DeltaOption
  | DeltaSum
  | DeltaList
  | DeltaSet
  | DeltaMap
  | DeltaRecord
  | DeltaUnion
  | DeltaTuple;

type TransferTuple2<a, b> = { Item1: a; Item2: b };
type DeltaTransferPrimitive =
  | { Discriminator: "IntReplace"; Replace: number }
  | { Discriminator: "StringReplace"; Replace: string }
  | { Discriminator: "BoolReplace"; Replace: boolean }
  | { Discriminator: "TimeReplace"; Replace: number }
  | { Discriminator: "GuidReplace"; Replace: string }
  | { Discriminator: "Int32Replace"; Replace: bigint }
  | { Discriminator: "Float32Replace"; Replace: number };
type DeltaTransferUnit = { Discriminator: "UnitReplace"; Replace: any };
type DeltaTransferOption =
  | { Discriminator: "OptionReplace"; Replace: any }
  | { Discriminator: "OptionValue"; Value: DeltaTransfer };
type DeltaTransferSum =
  | { Discriminator: "SumReplace"; Replace: any }
  | { Discriminator: "SumLeft"; Left: DeltaTransfer }
  | { Discriminator: "SumRight"; Right: DeltaTransfer };
type DeltaTransferList =
  | { Discriminator: "ArrayReplace"; Replace: any }
  | {
      Discriminator: "ArrayValue";
      Value: TransferTuple2<number, DeltaTransfer>;
    }
  | { Discriminator: "ArrayAddAt"; AddAt: TransferTuple2<number, any> }
  | { Discriminator: "ArrayRemoveAt"; RemoveAt: number }
  | {
      Discriminator: "ArrayMoveFromTo";
      MoveFromTo: TransferTuple2<number, number>;
    };
type DeltaTransferSet =
  | { Discriminator: "SetReplace"; Replace: any }
  | { Discriminator: "SetValue"; Value: TransferTuple2<any, DeltaTransfer> }
  | { Discriminator: "SetAdd"; Add: any }
  | { Discriminator: "SetRemove"; Remove: any };
type DeltaTransferMap =
  | { Discriminator: "MapReplace"; Replace: any }
  | { Discriminator: "MapValue"; Value: TransferTuple2<any, DeltaTransfer> }
  | { Discriminator: "MapAdd"; Add: TransferTuple2<any, any> }
  | { Discriminator: "MapRemove"; Remove: any };
type DeltaTransferRecord =
  | { Discriminator: "RecordReplace"; Replace: any }
  | ({ Discriminator: "RecordField" } & { [field: string]: DeltaTransfer });
type DeltaTransferUnion =
  | { Discriminator: "UnionReplace"; Replace: any }
  | ({ Discriminator: "UnionCase" } & { [caseName: string]: DeltaTransfer });
type DeltaTransferTuple =
  | { Discriminator: "TupleReplace"; Replace: any }
  | ({ Discriminator: "TupleCase" } & { [item: string]: DeltaTransfer });

type DeltaTransfer =
  | DeltaTransferPrimitive
  | DeltaTransferOption
  | DeltaTransferSum
  | DeltaTransferList
  | DeltaTransferSet
  | DeltaTransferMap
  | DeltaTransferRecord
  | DeltaTransferUnion
  | DeltaTransferTuple;

const DeltaTransfer = {
  Default: {
    FromDelta:
      (
        toRawObject: (
          value: Value,
          type: ExprType,
        ) => ValueOrErrors<any, string>,
      ) =>
      (delta: Delta): ValueOrErrors<DeltaTransfer, string> => {
        const rec = DeltaTransfer.Default.FromDelta(toRawObject);
        return delta.kind == "ArrayAddAt"
          ? delta.type.kind == "List"
            ? toRawObject(delta.value[1], delta.type.items[0]).Then((element) =>
                ValueOrErrors.Default.return<DeltaTransfer, string>({
                  Discriminator: "ArrayAddAt",
                  AddAt: { Item1: delta.value[0], Item2: element },
                }),
              )
            : ValueOrErrors.Default.throwOne<DeltaTransfer, string>(
                `Error: cannot process AddAt for delta ${delta}, the type is not a list.`,
              )
          : null!;
      },
  },
};
