import {
  ParsedApplicationType,
  ParsedRecordType,
  ParsedType,
  PredicateValue,
  ValueOrErrors,
} from "../../../../../../main";

export type Delta =
  | DeltaPrimitive
  | DeltaOption
  | DeltaSum
  | DeltaList
  | DeltaSet
  | DeltaMap
  | DeltaRecord
  | DeltaUnion
  | DeltaTuple
  | DeltaCustom
  | DeltaUnit
  | DeltaTable;
export type DeltaPrimitive =
  | {
      kind: "NumberReplace";
      replace: number;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "StringReplace";
      replace: string;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "BoolReplace";
      replace: boolean;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "TimeReplace";
      replace: string;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "GuidReplace";
      replace: string;
      state: any;
      type: ParsedType<any>;
    };

export type DeltaUnit = {
  kind: "UnitReplace";
  replace: PredicateValue;
  state: any;
  type: ParsedType<any>;
};
export type DeltaOption =
  | {
      kind: "OptionReplace";
      replace: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | { kind: "OptionValue"; value: Delta };
export type DeltaSum =
  | {
      kind: "SumReplace";
      replace: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | { kind: "SumLeft"; value: Delta }
  | { kind: "SumRight"; value: Delta };
export type DeltaList =
  | {
      kind: "ArrayReplace";
      replace: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | { kind: "ArrayValue"; value: [number, Delta] }
  | {
      kind: "ArrayAdd";
      value: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "ArrayAddAt";
      value: [number, PredicateValue];
      elementState: any;
      elementType: ParsedType<any>;
    }
  | { kind: "ArrayRemoveAt"; index: number }
  | { kind: "ArrayMoveFromTo"; from: number; to: number }
  | { kind: "ArrayDuplicateAt"; index: number };
export type DeltaSet =
  | {
      kind: "SetReplace";
      replace: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "SetValue";
      value: [PredicateValue, Delta];
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "SetAdd";
      value: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "SetRemove";
      value: PredicateValue;
      state: any;
      type: ParsedType<any>;
    };
export type DeltaMap =
  | {
      kind: "MapReplace";
      replace: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "MapKey";
      value: [number, Delta];
    }
  | {
      kind: "MapValue";
      value: [number, Delta];
    }
  | {
      kind: "MapAdd";
      keyValue: [PredicateValue, PredicateValue];
      keyState: any;
      keyType: ParsedType<any>;
      valueState: any;
      valueType: ParsedType<any>;
    }
  | { kind: "MapRemove"; index: number };
export type DeltaRecord =
  | {
      kind: "RecordReplace";
      replace: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "RecordField";
      field: [string, Delta];
      recordType: ParsedType<any>;
    }
  | {
      kind: "RecordAdd";
      field: [string, PredicateValue];
      state: any;
      type: ParsedType<any>;
    };
export type DeltaUnion =
  | {
      kind: "UnionReplace";
      replace: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | { kind: "UnionCase"; caseName: [string, Delta] };
export type DeltaTuple =
  | {
      kind: "TupleReplace";
      replace: PredicateValue;
      state: any;
      type: ParsedType<any>;
    }
  | {
      kind: "TupleCase";
      item: [number, Delta];
      tupleType: ParsedType<any>;
    };
export type DeltaTable = {
  kind: "TableValue";
  id: string;
  nestedDelta: Delta;
  tableType: ParsedType<any>;
};

export type DeltaCustom = {
  kind: "CustomDelta";
  value: {
    kind: string;
    [key: string]: any;
  };
};

export type TransferTuple2<a, b> = { Item1: a; Item2: b };
export type DeltaTransferPrimitive =
  | { Discriminator: "NumberReplace"; Replace: number }
  | { Discriminator: "StringReplace"; Replace: string }
  | { Discriminator: "BoolReplace"; Replace: boolean }
  | { Discriminator: "TimeReplace"; Replace: number }
  | { Discriminator: "GuidReplace"; Replace: string }
  | { Discriminator: "Int32Replace"; Replace: bigint }
  | { Discriminator: "Float32Replace"; Replace: number };
export type DeltaTransferUnit = { Discriminator: "UnitReplace"; Replace: any };
export type DeltaTransferOption<DeltaTransferCustom> =
  | { Discriminator: "OptionReplace"; Replace: any }
  | { Discriminator: "OptionValue"; Value: DeltaTransfer<DeltaTransferCustom> };
export type DeltaTransferSum<DeltaTransferCustom> =
  | { Discriminator: "SumReplace"; Replace: any }
  | { Discriminator: "SumLeft"; Left: DeltaTransfer<DeltaTransferCustom> }
  | { Discriminator: "SumRight"; Right: DeltaTransfer<DeltaTransferCustom> };
export type DeltaTransferList<DeltaTransferCustom> =
  | { Discriminator: "ArrayAdd"; Add: any }
  | { Discriminator: "ArrayReplace"; Replace: any }
  | {
      Discriminator: "ArrayValue";
      Value: TransferTuple2<number, DeltaTransfer<DeltaTransferCustom>>;
    }
  | { Discriminator: "ArrayAddAt"; AddAt: TransferTuple2<number, any> }
  | { Discriminator: "ArrayRemoveAt"; RemoveAt: number }
  | {
      Discriminator: "ArrayMoveFromTo";
      MoveFromTo: TransferTuple2<number, number>;
    }
  | { Discriminator: "ArrayDuplicateAt"; DuplicateAt: number };
export type DeltaTransferSet<DeltaTransferCustom> =
  | { Discriminator: "SetReplace"; Replace: any }
  | {
      Discriminator: "SetValue";
      Value: TransferTuple2<any, DeltaTransfer<DeltaTransferCustom>>;
    }
  | { Discriminator: "SetAdd"; Add: any }
  | { Discriminator: "SetRemove"; Remove: any };
export type DeltaTransferMap<DeltaTransferCustom> =
  | { Discriminator: "MapReplace"; Replace: any }
  | {
      Discriminator: "MapValue";
      Value: TransferTuple2<number, DeltaTransfer<DeltaTransferCustom>>;
    }
  | {
      Discriminator: "MapKey";
      Key: TransferTuple2<number, DeltaTransfer<DeltaTransferCustom>>;
    }
  | { Discriminator: "MapAdd"; Add: TransferTuple2<any, any> }
  | { Discriminator: "MapRemove"; Remove: number };
export type DeltaTransferRecord<DeltaTransferCustom> =
  | { Discriminator: "RecordReplace"; Replace: any }
  | ({ Discriminator: "RecordField" } & {
      [field: string]: DeltaTransfer<DeltaTransferCustom>;
    });
export type DeltaTransferUnion<DeltaTransferCustom> =
  | { Discriminator: "UnionReplace"; Replace: any }
  | ({ Discriminator: "UnionCase" } & {
      [caseName: string]: DeltaTransfer<DeltaTransferCustom>;
    });
export type DeltaTransferTuple<DeltaTransferCustom> =
  | { Discriminator: "TupleReplace"; Replace: any }
  | ({ Discriminator: string } & {
      [item: string]: DeltaTransfer<DeltaTransferCustom>;
    });
export type DeltaTransferTable<DeltaTransferCustom> = {
  Discriminator: "TableValue";
  Value: { Item1: string; Item2: DeltaTransfer<DeltaTransferCustom> };
};

export type DeltaTransfer<DeltaTransferCustom> =
  | DeltaTransferPrimitive
  | DeltaTransferUnit
  | DeltaTransferOption<DeltaTransferCustom>
  | DeltaTransferSum<DeltaTransferCustom>
  | DeltaTransferList<DeltaTransferCustom>
  | DeltaTransferSet<DeltaTransferCustom>
  | DeltaTransferMap<DeltaTransferCustom>
  | DeltaTransferRecord<DeltaTransferCustom>
  | DeltaTransferUnion<DeltaTransferCustom>
  | DeltaTransferTuple<DeltaTransferCustom>
  | DeltaTransferTable<DeltaTransferCustom>
  | DeltaTransferCustom;

export type DeltaTransferComparand = string;

export const DeltaTransfer = {
  Default: {
    FromDelta:
      <T, DeltaTransferCustom>(
        toRawObject: (
          value: PredicateValue,
          state: any,
          type: ParsedType<T>,
        ) => ValueOrErrors<any, string>,
        parseCustomDelta: (
          toRawObject: (
            value: PredicateValue,
            state: any,
            type: ParsedType<any>,
          ) => ValueOrErrors<any, string>,
          fromDelta: (
            delta: Delta,
          ) => ValueOrErrors<
            [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
            string
          >,
        ) => (
          deltaCustom: DeltaCustom,
        ) => ValueOrErrors<
          [DeltaTransferCustom, DeltaTransferComparand],
          string
        >,
      ) =>
      (
        delta: Delta,
      ): ValueOrErrors<
        [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
        string
      > => {
        if (delta.kind == "NumberReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "NumberReplace",
                  Replace: value,
                },
                "[NumberReplace]",
              ]),
          );
        }
        if (delta.kind == "StringReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "StringReplace",
                  Replace: value,
                },
                "[StringReplace]",
              ]),
          );
        }
        if (delta.kind == "BoolReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "BoolReplace",
                  Replace: value,
                },
                "[BoolReplace]",
              ]),
          );
        }
        if (delta.kind == "TimeReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "TimeReplace",
                  Replace: value,
                },
                "[TimeReplace]",
              ]),
          );
        }
        if (delta.kind == "GuidReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "GuidReplace",
                  Replace: value,
                },
                "[GuidReplace]",
              ]),
          );
        }
        if (delta.kind == "UnitReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "UnitReplace",
                  Replace: value,
                },
                "UnitReplace",
              ]),
          );
        }
        if (delta.kind == "OptionReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "OptionReplace",
                  Replace: value,
                },
                "[OptionReplace]",
              ]),
          );
        }
        if (delta.kind == "OptionValue") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.value).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "OptionValue",
                Value: value[0],
              },
              `[OptionValue]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "SumReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "SumReplace",
                  Replace: value,
                },
                "[SumReplace]",
              ]),
          );
        }
        if (delta.kind == "SumLeft") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.value).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "SumLeft",
                Left: value[0],
              },
              `[SumLeft]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "SumRight") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.value).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "SumRight",
                Right: value[0],
              },
              `[SumRight]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "ArrayReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "ArrayReplace",
                  Replace: value,
                },
                "[ArrayReplace]",
              ]),
          );
        }
        if (delta.kind == "ArrayValue") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.value[1]).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "ArrayValue",
                Value: {
                  Item1: delta.value[0],
                  Item2: value[0],
                },
              },
              `[ArrayValue][${delta.value[0]}]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "ArrayAdd") {
          return toRawObject(delta.value, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "ArrayAdd",
                  Add: value,
                },
                "[ArrayAdd]",
              ]),
          );
        }
        if (delta.kind == "ArrayAddAt") {
          return toRawObject(
            delta.value[1],
            delta.elementState,
            delta.elementType,
          ).Then((element) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "ArrayAddAt",
                AddAt: { Item1: delta.value[0], Item2: element },
              },
              `[ArrayAddAt][${delta.value[0]}]`,
            ]),
          );
        }
        if (delta.kind == "ArrayRemoveAt") {
          return ValueOrErrors.Default.return<
            [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
            string
          >([
            {
              Discriminator: "ArrayRemoveAt",
              RemoveAt: delta.index,
            },
            `[ArrayRemoveAt]`,
          ]);
        }
        if (delta.kind == "ArrayMoveFromTo") {
          return ValueOrErrors.Default.return<
            [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
            string
          >([
            {
              Discriminator: "ArrayMoveFromTo",
              MoveFromTo: { Item1: delta.from, Item2: delta.to },
            },
            `[ArrayMoveFromTo]`,
          ]);
        }
        if (delta.kind == "ArrayDuplicateAt") {
          return ValueOrErrors.Default.return<
            [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
            string
          >([
            {
              Discriminator: "ArrayDuplicateAt",
              DuplicateAt: delta.index,
            },
            `[ArrayDuplicateAt]`,
          ]);
        }
        if (delta.kind == "SetReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "SetReplace",
                  Replace: value,
                },
                "[SetReplace]",
              ]),
          );
        }
        if (delta.kind == "SetValue") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.value[1]).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "SetValue",
                Value: { Item1: delta.value[0], Item2: value[0] },
              },
              `[SetValue][${delta.value[0]}]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "SetAdd") {
          return toRawObject(delta.value, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "SetAdd",
                  Add: value,
                },
                `[SetAdd]`,
              ]),
          );
        }
        if (delta.kind == "SetRemove") {
          return toRawObject(delta.value, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "SetRemove",
                  Remove: value,
                },
                `[SetRemove]`,
              ]),
          );
        }
        if (delta.kind == "MapReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "MapReplace",
                  Replace: value,
                },
                "[MapReplace]",
              ]),
          );
        }
        if (delta.kind == "MapKey") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.value[1]).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "MapKey",
                Key: { Item1: delta.value[0], Item2: value[0] },
              },
              `[MapKey][${delta.value[0]}]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "MapValue") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.value[1]).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "MapValue",
                Value: { Item1: delta.value[0], Item2: value[0] },
              },
              `[MapValue][${delta.value[0]}]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "MapAdd") {
          return toRawObject(
            delta.keyValue[0],
            delta.keyState,
            delta.keyType,
          ).Then((key) =>
            toRawObject(
              delta.keyValue[1],
              delta.valueState,
              delta.valueType,
            ).Then((value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "MapAdd",
                  Add: { Item1: key, Item2: value },
                },
                `[MapAdd]`,
              ]),
            ),
          );
        }
        if (delta.kind == "MapRemove") {
          return ValueOrErrors.Default.return<
            [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
            string
          >([
            {
              Discriminator: "MapRemove",
              Remove: delta.index,
            },
            `[MapRemove]`,
          ]);
        }
        if (delta.kind == "RecordReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "RecordReplace",
                  Replace: value,
                },
                "[RecordReplace]",
              ]),
          );
        }
        if (delta.kind == "RecordField") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.field[1]).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: `${
                  (delta.recordType as ParsedRecordType<any>).value
                }${delta.field[0]}`,
                [delta.field[0]]: value[0],
              } as { Discriminator: string } & {
                [field: string]: DeltaTransfer<DeltaTransferCustom>;
              },
              `[RecordField][${delta.field[0]}]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "UnionReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "UnionReplace",
                  Replace: value,
                },
                "[UnionReplace]",
              ]),
          );
        }
        if (delta.kind == "UnionCase") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.caseName[1]).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "UnionCase",
                [delta.caseName[0]]: value,
              } as { Discriminator: "UnionCase" } & {
                [caseName: string]: DeltaTransfer<DeltaTransferCustom>;
              },
              `[UnionCase][${delta.caseName[0]}]`,
            ]),
          );
        }
        if (delta.kind == "TupleReplace") {
          return toRawObject(delta.replace, delta.state, delta.type).Then(
            (value) =>
              ValueOrErrors.Default.return<
                [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
                string
              >([
                {
                  Discriminator: "TupleReplace",
                  Replace: value,
                },
                "[TupleReplace]",
              ]),
          );
        }
        if (delta.kind == "TupleCase") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.item[1]).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: `Tuple${
                  (delta.tupleType as ParsedApplicationType<any>).args.length
                }Item${delta.item[0] + 1}`,
                [`Item${delta.item[0] + 1}`]: value[0],
              } as { Discriminator: string } & {
                [item: string]: DeltaTransfer<DeltaTransferCustom>;
              },
              `[TupleCase][${delta.item[0] + 1}]${value[1]}`,
            ]),
          );
        }

        if (delta.kind == "TableValue") {
          return DeltaTransfer.Default.FromDelta(
            toRawObject,
            parseCustomDelta,
          )(delta.nestedDelta).Then((value) =>
            ValueOrErrors.Default.return<
              [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
              string
            >([
              {
                Discriminator: "TableValue",
                Value: { Item1: delta.id, Item2: value[0] },
              },
              `[TableValue][${delta.id}]${value[1]}`,
            ]),
          );
        }
        if (delta.kind == "CustomDelta") {
          return parseCustomDelta(
            toRawObject,
            DeltaTransfer.Default.FromDelta(toRawObject, parseCustomDelta),
          )(delta);
        }
        return ValueOrErrors.Default.throwOne<
          [DeltaTransfer<DeltaTransferCustom>, DeltaTransferComparand],
          string
        >(`Error: cannot process delta ${delta}, not currently supported.`);
      },
  },
};
