import { Map, List, Set, OrderedMap } from "immutable";
import {
  CollectionReference,
  EnumReference,
} from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { BasicFun } from "../../../../../fun/state";
import {
  InjectedPrimitives,
  Maybe,
  ParsedType,
  PredicateValue,
  Sum,
  TypeName,
  unit,
  ValueRecord,
  ValueTuple,
} from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";

const sortObjectKeys = (obj: Record<string, any>) =>
  Object.keys(obj)
    .sort()
    .reduce((sortedObj, key) => {
      sortedObj[key] = obj[key]!;
      return sortedObj;
    }, {} as any);

const simpleMapKeyToIdentifer = (key: any): string => {
  if (typeof key == "object") return JSON.stringify(sortObjectKeys(key));
  return JSON.stringify(key);
};

export const PrimitiveTypes = [
  "guid", //resolves to string
  "string",
  "number",
  "boolean",
  "Date",
  "base64File",
  "secret",
] as const;
export type PrimitiveType = (typeof PrimitiveTypes)[number];

export const GenericTypes = [
  "SingleSelection",
  "MultiSelection",
  "List",
  "Map",
  "Union",
  "Option",
  "Sum",
] as const;
export type GenericType = (typeof GenericTypes)[number];

export type ApiConverter<T> = {
  fromAPIRawValue: BasicFun<any, T>;
  toAPIRawValue: BasicFun<[T, boolean], any>;
};
export type ApiConverters<
  T extends { [key in keyof T]: { type: any; state: any } },
> = { [key in keyof T]: ApiConverter<T[key]["type"]> } & BuiltInApiConverters;

export type VerifiedRawUnionCase = {
  caseName: string;
  fields: Record<string, any>;
};

export const VerifiedRawUnionCase = {
  Operations: {
    IsVerifiedRawUnionCase: (value: any): value is VerifiedRawUnionCase => {
      return (
        typeof value == "object" &&
        "caseName" in value &&
        typeof value.caseName == "string" &&
        "fields" in value &&
        typeof value.fields == "object"
      );
    },
  },
};

export type RawOption = {
  isSome: boolean;
  value: Record<string, any>;
};

export const RawOption = {
  Operations: {
    IsRawOption: (value: any): value is RawOption => {
      return (
        typeof value == "object" &&
        "IsSome" in value &&
        typeof value.IsSome == "boolean" &&
        "Value" in value &&
        typeof value.Value == "object"
      );
    },
  },
};

export type BuiltInApiConverters = {
  string: ApiConverter<string>;
  number: ApiConverter<number>;
  boolean: ApiConverter<boolean>;
  base64File: ApiConverter<string>;
  secret: ApiConverter<string>;
  Date: ApiConverter<Date>;
  unionCase: ApiConverter<VerifiedRawUnionCase>;
  SingleSelection: ApiConverter<
    CollectionSelection<CollectionReference | EnumReference>
  >;
  MultiSelection: ApiConverter<
    OrderedMap<string, CollectionReference | EnumReference>
  >;
  List: ApiConverter<List<any>>;
  Map: ApiConverter<List<[any, any]>>;
  Sum: ApiConverter<Sum<any, any>>;
};

export type PrimitiveBuiltIn = {
  renderers: Set<keyof BuiltIns["renderers"]>;
  defaultValue: PredicateValue;
};
export type GenericBuiltIn = { defaultValue: any };
export type BuiltIns = {
  primitives: Map<string, PrimitiveBuiltIn>;
  generics: Map<string, GenericBuiltIn>;
  renderers: {
    boolean: Set<string>;
    number: Set<string>;
    string: Set<string>;
    base64File: Set<string>;
    secret: Set<string>;
    date: Set<string>;
    enumSingleSelection: Set<string>;
    enumMultiSelection: Set<string>;
    streamSingleSelection: Set<string>;
    streamMultiSelection: Set<string>;
    list: Set<string>;
    map: Set<string>;
    sum: Set<string>;
  };
};

export const builtInsFromFieldViews = (fieldViews: any): BuiltIns => {
  const builtins: BuiltIns = {
    primitives: Map<string, PrimitiveBuiltIn>([
      [
        "string",
        {
          renderers: Set(["string"]),
          defaultValue: PredicateValue.Default.string(),
        },
      ] as [string, PrimitiveBuiltIn],
      [
        "number",
        {
          renderers: Set(["number"]),
          defaultValue: PredicateValue.Default.number(),
        },
      ] as [string, PrimitiveBuiltIn],
      [
        "boolean",
        {
          renderers: Set(["boolean"]),
          defaultValue: PredicateValue.Default.boolean(),
        },
      ] as [string, PrimitiveBuiltIn],
      [
        "date",
        {
          renderers: Set(["date"]),
          defaultValue: PredicateValue.Default.date(),
        },
      ] as [string, PrimitiveBuiltIn],
      [
        "Date",
        {
          renderers: Set(["date"]),
          defaultValue: PredicateValue.Default.date(),
        },
      ] as [string, PrimitiveBuiltIn],
      [
        "base64File",
        {
          renderers: Set(["base64File"]),
          defaultValue: PredicateValue.Default.string(),
        },
      ] as [string, PrimitiveBuiltIn],
      [
        "secret",
        {
          renderers: Set(["secret"]),
          defaultValue: PredicateValue.Default.string(),
        },
      ] as [string, PrimitiveBuiltIn],
    ]),
    generics: Map([
      [
        "SingleSelection",
        {
          defaultValue: PredicateValue.Default.option(
            false,
            PredicateValue.Default.unit(),
          ),
        },
      ] as [string, GenericBuiltIn],
      [
        "MultiSelection",
        { defaultValue: PredicateValue.Default.record(Map()) },
      ] as [string, GenericBuiltIn],
      ["List", { defaultValue: PredicateValue.Default.tuple(List()) }] as [
        string,
        GenericBuiltIn,
      ],
      ["Map", { defaultValue: PredicateValue.Default.tuple(List()) }] as [
        string,
        GenericBuiltIn,
      ],
      ["Union", { defaultValue: PredicateValue.Default.record(Map()) }] as [
        string,
        GenericBuiltIn,
      ],
      [
        "Option",
        {
          defaultValue: PredicateValue.Default.option(
            false,
            PredicateValue.Default.unit(),
          ),
        },
      ] as [string, GenericBuiltIn],
    ]),
    renderers: {
      boolean: Set(),
      date: Set(),
      enumMultiSelection: Set(),
      enumSingleSelection: Set(),
      streamMultiSelection: Set(),
      streamSingleSelection: Set(),
      number: Set(),
      string: Set(),
      list: Set(),
      base64File: Set(),
      secret: Set(),
      map: Set(),
      sum: Set(),
    },
  };
  Object.keys(builtins.renderers).forEach((_categoryName) => {
    const categoryName = _categoryName as keyof BuiltIns["renderers"];
    if (categoryName in fieldViews) {
      Object.keys(fieldViews[categoryName]).forEach((viewName) => {
        builtins.renderers[categoryName] =
          builtins.renderers[categoryName].add(viewName);
      });
    }
  });
  return builtins;
};

export const defaultValue =
  <T>(
    types: Map<TypeName, ParsedType<T>>,
    builtIns: BuiltIns,
    injectedPrimitives?: InjectedPrimitives<T>,
  ) =>
  (t: ParsedType<T>): PredicateValue => {
    if (t.kind == "primitive") {
      const primitive = builtIns.primitives.get(t.value as string);
      const injectedPrimitive = injectedPrimitives?.injectedPrimitives.get(
        t.value as keyof T,
      );
      if (primitive != undefined) return primitive.defaultValue;
      if (injectedPrimitive != undefined) return injectedPrimitive.defaultValue;
    }

    if (t.kind == "application") {
      const generic = builtIns.generics.get(t.value);
      if (generic) return generic.defaultValue;
    }

    if (t.kind == "lookup")
      return defaultValue(
        types,
        builtIns,
        injectedPrimitives,
      )(types.get(t.name)!);

    if (t.kind == "form") {
      let res = {} as Record<string, PredicateValue>;
      t.fields.forEach((field, fieldName) => {
        res[fieldName] = defaultValue(
          types,
          builtIns,
          injectedPrimitives,
        )(field);
      });
      return PredicateValue.Default.record(Map(res));
    }
    throw Error(
      `cannot find type ${JSON.stringify(t)} when resolving defaultValue`,
    );
  };

export const fromAPIRawValue =
  <T extends { [key in keyof T]: { type: any; state: any } }>(
    t: ParsedType<T>,
    types: Map<TypeName, ParsedType<T>>,
    builtIns: BuiltIns,
    converters: ApiConverters<T>,
    injectedPrimitives?: InjectedPrimitives<T>,
  ) =>
  (raw: any): ValueOrErrors<PredicateValue, string> => {
    if (raw == undefined) {
      return ValueOrErrors.Default.throwOne(
        `raw value is undefined for type ${JSON.stringify(t)}`,
      );
    }

    if (t.kind == "primitive") {
      if (!PredicateValue.Operations.IsPrimitive(raw)) {
        return ValueOrErrors.Default.throwOne(
          `primitive expected but got ${JSON.stringify(raw)}`,
        );
      }
      return ValueOrErrors.Default.return(
        converters[t.value].fromAPIRawValue(raw),
      );
    }
    if (t.kind == "union") {
      if (!VerifiedRawUnionCase.Operations.IsVerifiedRawUnionCase(raw)) {
        return ValueOrErrors.Default.throwOne(
          `union expected but got ${JSON.stringify(raw)}`,
        );
      }
      const caseType = t.args.get(raw.caseName);
      if (caseType == undefined) {
        return ValueOrErrors.Default.throwOne(
          `union case ${raw.caseName} not found in type ${JSON.stringify(t)}`,
        );
      }
      return fromAPIRawValue(
        caseType,
        types,
        builtIns,
        converters,
        injectedPrimitives,
      )(raw);
    }
    if (t.kind == "unionCase") {
      if (!VerifiedRawUnionCase.Operations.IsVerifiedRawUnionCase(raw)) {
        return ValueOrErrors.Default.throwOne(
          `unionCase expected but got ${JSON.stringify(raw)}`,
        );
      }
      const result = converters[t.kind].fromAPIRawValue(raw);
      return fromAPIRawValue(
        t.fields == unit
          ? {
              kind: "form",
              value: "unionCase",
              fields: Map<string, ParsedType<T>>(),
            }
          : t.fields,
        types,
        builtIns,
        converters,
        injectedPrimitives,
      )(result.fields).Then((fields) => {
        if (!PredicateValue.Operations.IsRecord(fields)) {
          return ValueOrErrors.Default.throwOne(
            `record expected but got ${JSON.stringify(fields)}`,
          );
        }
        return ValueOrErrors.Default.return(
          PredicateValue.Default.unionCase(result.caseName, fields),
        );
      });
    }
    if (t.kind == "application") {
      if (t.value == "SingleSelection") {
        if (!RawOption.Operations.IsRawOption(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Option expected but got ${JSON.stringify(raw)}`,
          );
        }
        const result = converters[t.value].fromAPIRawValue(raw);
        if (result.kind == "r") {
          return ValueOrErrors.Default.return(
            PredicateValue.Default.option(false, PredicateValue.Default.unit()),
          );
        }

        if (result.kind == "l") {
          if (
            !EnumReference.Operations.IsEnumReference(result.value) &&
            !CollectionReference.Operations.IsCollectionReference(result.value)
          ) {
            return ValueOrErrors.Default.throwOne(
              `CollectionReference or EnumReference expected but got ${JSON.stringify(
                result.value,
              )}`,
            );
          }
        }

        return ValueOrErrors.Default.return(
          PredicateValue.Default.option(
            true,
            PredicateValue.Default.record(Map(result.value)),
          ),
        );
      }
      if (t.value == "MultiSelection") {
        if (!Array.isArray(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Array expected but got ${JSON.stringify(raw)}`,
          );
        }
        if (
          raw.some(
            (_) =>
              !CollectionReference.Operations.IsCollectionReference(_) &&
              !EnumReference.Operations.IsEnumReference(_),
          )
        ) {
          return ValueOrErrors.Default.throwOne(
            `CollectionReference or EnumReference for multi selection items expected but got ${JSON.stringify(
              raw,
            )}`,
          );
        }
        const result = converters[t.value].fromAPIRawValue(raw);
        const values = result.map((_) => PredicateValue.Default.record(Map(_)));
        return ValueOrErrors.Default.return(
          PredicateValue.Default.record(Map(values)),
        );
      }
      if (t.value == "List") {
        if (!Array.isArray(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Array expected but got ${JSON.stringify(raw)}`,
          );
        }

        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<PredicateValue, string>>(
            raw.map((_) =>
              fromAPIRawValue(
                t.args[0],
                types,
                builtIns,
                converters,
                injectedPrimitives,
              )(_),
            ),
          ),
        ).Then((values) =>
          ValueOrErrors.Default.return(
            PredicateValue.Default.tuple(
              converters["List"].fromAPIRawValue(values.toArray()),
            ),
          ),
        );
      }
      if (t.value == "Map" && t.args.length == 2) {
        if (!Array.isArray(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Array expected array but got ${JSON.stringify(raw)}`,
          );
        }

        if (
          raw.some(
            (_) => typeof _ != "object" || !("key" in _) || !("value" in _),
          )
        ) {
          return ValueOrErrors.Default.throwOne(
            `Array expected array of objects with key and value but got ${JSON.stringify(
              raw,
            )}`,
          );
        }

        const result = converters[t.value].fromAPIRawValue(raw);

        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<PredicateValue, string>>(
            result.map((_) =>
              fromAPIRawValue(
                t.args[0],
                types,
                builtIns,
                converters,
                injectedPrimitives,
              )(_[0]).Then((key) =>
                fromAPIRawValue(
                  t.args[1],
                  types,
                  builtIns,
                  converters,
                  injectedPrimitives,
                )(_[1]).Then((value) =>
                  ValueOrErrors.Default.return(
                    PredicateValue.Default.tuple(List([key, value])),
                  ),
                ),
              ),
            ),
          ),
        ).Then((values) =>
          ValueOrErrors.Default.return(
            PredicateValue.Default.tuple(List(values)),
          ),
        );
      }
      // TODO: add support for sum
    }

    if (t.kind == "lookup")
      return fromAPIRawValue(
        types.get(t.name)!,
        types,
        builtIns,
        converters,
        injectedPrimitives,
      )(raw);

    if (t.kind == "form") {
      if (typeof raw != "object") {
        return ValueOrErrors.Default.throwOne(
          `object expected but got ${JSON.stringify(raw)}`,
        );
      }
      let result: Map<string, PredicateValue> = Map();
      let errors: List<string> = List();
      t.fields.forEach((fieldType, fieldName) => {
        const fieldValue = raw[fieldName];
        const parsedValue = fromAPIRawValue(
          fieldType,
          types,
          builtIns,
          converters,
          injectedPrimitives,
        )(fieldValue);
        if (parsedValue.kind == "errors") {
          errors = errors.concat(parsedValue.errors);
        } else {
          result = result.set(fieldName, parsedValue.value);
        }
      });
      if (errors.size > 0) {
        return ValueOrErrors.Default.throw(errors);
      }
      return ValueOrErrors.Default.return(
        PredicateValue.Default.record(result),
      );
    }

    return ValueOrErrors.Default.throwOne(
      `unsupported type ${JSON.stringify(t)} for raw: `,
    );
  };

export const toAPIRawValue =
  <T extends { [key in keyof T]: { type: any; state: any } }>(
    t: ParsedType<T>,
    types: Map<TypeName, ParsedType<T>>,
    builtIns: BuiltIns,
    converters: ApiConverters<T>,
    injectedPrimitives?: InjectedPrimitives<T>,
  ) =>
  (raw: PredicateValue, formState: any): ValueOrErrors<any, string> => {
    if (t.kind == "primitive") {
      return ValueOrErrors.Operations.Return(
        converters[t.value as string | keyof T].toAPIRawValue([
          raw,
          formState.modifiedByUser,
        ]),
      );
    }

    if (t.kind == "union") {
      return toAPIRawValue(
        { kind: "unionCase", name: "", fields: {} as ParsedType<T> },
        types,
        builtIns,
        converters,
        injectedPrimitives,
      )(raw, formState);
    }

    if (t.kind == "unionCase") {
      if (!PredicateValue.Operations.IsUnionCase(raw)) {
        return ValueOrErrors.Default.throwOne(
          `UnionCase expected but got ${JSON.stringify(raw)}`,
        );
      }
      return ValueOrErrors.Operations.Return(
        converters[t.kind].toAPIRawValue([
          { caseName: raw.caseName, fields: raw.fields },
          formState.modifiedByUser,
        ]),
      );
    }
    if (t.kind == "application") {
      if (t.value == "SingleSelection") {
        if (!PredicateValue.Operations.IsOption(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Option expected but got ${JSON.stringify(raw)}`,
          );
        }

        if (raw.isSome) {
          if (!PredicateValue.Operations.IsRecord(raw.value)) {
            return ValueOrErrors.Default.throwOne(
              `Record expected but got ${JSON.stringify(raw.value)}`,
            );
          }
          const rawValue = raw.value.fields.toJS();
          if (
            !CollectionReference.Operations.IsCollectionReference(rawValue) &&
            !EnumReference.Operations.IsEnumReference(rawValue)
          ) {
            return ValueOrErrors.Default.throwOne(
              `CollectionReference or EnumReference expected but got ${rawValue}`,
            );
          }

          return ValueOrErrors.Operations.Return(
            converters[t.value].toAPIRawValue([
              Sum.Default.left(rawValue),
              formState.modifiedByUser,
            ]),
          );
        } else {
          return ValueOrErrors.Operations.Return(
            converters[t.value].toAPIRawValue([
              Sum.Default.right("no selection"),
              formState.modifiedByUser,
            ]),
          );
        }
      }

      if (t.value == "MultiSelection") {
        if (!PredicateValue.Operations.IsRecord(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Record expected but got multi selection of ${JSON.stringify(raw)}`,
          );
        }

        const rawValue: Map<
          string,
          ValueOrErrors<CollectionReference | EnumReference, string>
        > = raw.fields.map((value) => {
          if (!PredicateValue.Operations.IsRecord(value)) {
            return ValueOrErrors.Default.throwOne(
              `Record expected but got ${JSON.stringify(value)}`,
            );
          }
          const fieldsObject = value.fields.toJS();

          if (
            !CollectionReference.Operations.IsCollectionReference(
              fieldsObject,
            ) &&
            !EnumReference.Operations.IsEnumReference(fieldsObject)
          ) {
            return ValueOrErrors.Default.throwOne(
              `CollectionReference or EnumReference expected but got ${JSON.stringify(
                fieldsObject,
              )}`,
            );
          }
          return ValueOrErrors.Default.return(fieldsObject);
        });

        return ValueOrErrors.Operations.All(rawValue.valueSeq().toList()).Then(
          (values) =>
            ValueOrErrors.Default.return(
              converters["MultiSelection"].toAPIRawValue([
                OrderedMap<string, EnumReference | CollectionReference>(
                  values
                    .map((v): [string, EnumReference | CollectionReference] => {
                      if (
                        CollectionReference.Operations.IsCollectionReference(v)
                      ) {
                        return [v.Id, v];
                      }
                      return [v.Value, v];
                    })
                    .toArray(),
                ),
                formState.modifiedByUser,
              ]),
            ),
        );
      }
      if (t.value == "List") {
        if (!PredicateValue.Operations.IsTuple(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Tuple expected but got list of${JSON.stringify(raw)}`,
          );
        }
        return ValueOrErrors.Operations.All(
          List(
            raw.values.map((value, index) =>
              toAPIRawValue(
                t.args[0],
                types,
                builtIns,
                converters,
                injectedPrimitives,
              )(value, formState.elementFormStates.get(index)),
            ),
          ),
        ).Then((values) =>
          ValueOrErrors.Default.return(
            converters["List"].toAPIRawValue([
              values,
              formState.modifiedByUser,
            ]),
          ),
        );
      }
      if (t.value == "Map") {
        const keyValues = (raw as ValueTuple).values.map((keyValue, index) => {
          return toAPIRawValue(
            t.args[0],
            types,
            builtIns,
            converters,
            injectedPrimitives,
          )(
            (keyValue as ValueTuple).values.get(0)!,
            formState.elementFormStates.get(index).KeyFormState.commonFormState,
          )
            .Then((possiblyUndefinedKey) => {
              if (
                possiblyUndefinedKey == undefined ||
                possiblyUndefinedKey == null ||
                possiblyUndefinedKey == "" ||
                (typeof possiblyUndefinedKey == "object" &&
                  (Object.keys(possiblyUndefinedKey).length == 0 ||
                    ("IsSome" in possiblyUndefinedKey &&
                      !possiblyUndefinedKey.IsSome)))
              ) {
                return ValueOrErrors.Default.throwOne(
                  `A mapped key is undefined for type ${JSON.stringify(
                    t.args[0],
                  )}`,
                );
              } else {
                return ValueOrErrors.Default.return(possiblyUndefinedKey);
              }
            })
            .Then((key) =>
              toAPIRawValue(
                t.args[1],
                types,
                builtIns,
                converters,
                injectedPrimitives,
              )(
                (keyValue as ValueTuple).values.get(1)!,
                formState.elementFormStates.get(index).ValueFormState
                  .commonFormState,
              ).Then((value) =>
                ValueOrErrors.Default.return([key, value] as [any, any]),
              ),
            );
        });

        return ValueOrErrors.Operations.All(List(keyValues)).Then((values) => {
          if (
            values.map((kv) => JSON.stringify(kv[0])).toSet().size !=
            values.size
          ) {
            return ValueOrErrors.Default.throwOne(
              "Keys in the map are not unique",
            );
          }
          return ValueOrErrors.Operations.Return(
            converters["Map"].toAPIRawValue([values, formState.modifiedByUser]),
          );
        });
      }
    }

    if (t.kind == "lookup")
      return toAPIRawValue(
        types.get(t.name)!,
        types,
        builtIns,
        converters,
        injectedPrimitives,
      )(raw, formState);

    if (t.kind == "form") {
      if (!PredicateValue.Operations.IsRecord(raw)) {
        return ValueOrErrors.Default.throwOne(
          `Record expected but got ${JSON.stringify(raw)}`,
        );
      }
      const res = [] as any;
      t.fields.forEach((fieldType, fieldName) =>
        // nullish coalescing operator on state used for extended type state, but this maybe should have its own kind
        res.push([
          fieldName,
          toAPIRawValue(
            fieldType,
            types,
            builtIns,
            converters,
            injectedPrimitives,
          )(
            raw.fields.get(fieldName)!,
            formState["formFieldStates"]?.[fieldName] ?? formState,
          ),
        ]),
      );
      const errors: ValueOrErrors<
        List<any>,
        string
      > = ValueOrErrors.Operations.All(
        List(
          res.map(
            ([_, value]: [_: string, value: ValueOrErrors<any, string>]) =>
              value,
          ),
        ),
      );
      if (errors.kind == "errors") return errors;

      return ValueOrErrors.Operations.Return(
        res.reduce(
          (acc: any, [fieldName, value]: [fieldName: string, value: any]) => {
            acc[fieldName] = value.value;
            return acc;
          },
          {} as any,
        ),
      );
    }

    return ValueOrErrors.Operations.Return(
      defaultValue(types, builtIns, injectedPrimitives)(t),
    );
  };
