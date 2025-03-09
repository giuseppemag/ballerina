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
] as const;
export type GenericType = (typeof GenericTypes)[number];

export type ApiConverter<T> = {
  fromAPIRawValue: BasicFun<any, T>;
  toAPIRawValue: BasicFun<[T, boolean], any>;
};
export type ApiConverters<
  T extends { [key in keyof T]: { type: any; state: any } }
> = { [key in keyof T]: ApiConverter<T[key]["type"]> } & BuiltInApiConverters;

export type UnionCase = {
  caseName: string;
  fields: Record<string, any>;
};

export type BuiltInApiConverters = {
  string: ApiConverter<string>;
  number: ApiConverter<number>;
  boolean: ApiConverter<boolean>;
  base64File: ApiConverter<string>;
  secret: ApiConverter<string>;
  Date: ApiConverter<Date>;
  unionCase: ApiConverter<UnionCase>;
  SingleSelection: ApiConverter<
    CollectionSelection<CollectionReference | EnumReference>
  >;
  MultiSelection: ApiConverter<
    OrderedMap<string, CollectionReference | EnumReference>
  >;
  List: ApiConverter<List<any>>;
  Map: ApiConverter<List<[any, any]>>;
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
            PredicateValue.Default.unit()
          ),
        },
      ] as [string, GenericBuiltIn],
      [
        "MultiSelection",
        { defaultValue: PredicateValue.Default.record(Map()) },
      ] as [string, GenericBuiltIn],
      ["List", { defaultValue: PredicateValue.Default.tuple(List()) }] as [
        string,
        GenericBuiltIn
      ],
      ["Map", { defaultValue: PredicateValue.Default.tuple(List()) }] as [
        string,
        GenericBuiltIn
      ],
      ["Union", { defaultValue: PredicateValue.Default.record(Map()) }] as [
        string,
        GenericBuiltIn
      ],
      [
        "Option",
        {
          defaultValue: PredicateValue.Default.option(
            false,
            PredicateValue.Default.unit()
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
    injectedPrimitives?: InjectedPrimitives<T>
  ) =>
  (t: ParsedType<T>): PredicateValue => {
    if (t.kind == "primitive") {
      const primitive = builtIns.primitives.get(t.value as string);
      const injectedPrimitive = injectedPrimitives?.injectedPrimitives.get(
        t.value as keyof T
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
        injectedPrimitives
      )(types.get(t.name)!);

    if (t.kind == "form") {
      let res = {} as any;
      t.fields.forEach((field, fieldName) => {
        res[fieldName] = defaultValue(
          types,
          builtIns,
          injectedPrimitives
        )(field);
      });
      return res;
    }
    throw Error(
      `cannot find type ${JSON.stringify(t)} when resolving defaultValue`
    );
  };

export const fromAPIRawValue =
  <T extends { [key in keyof T]: { type: any; state: any } }>(
    t: ParsedType<T>,
    types: Map<TypeName, ParsedType<T>>,
    builtIns: BuiltIns,
    converters: ApiConverters<T>,
    injectedPrimitives?: InjectedPrimitives<T>
  ) =>
  (raw: any): PredicateValue => {
    if (raw == undefined) {
      return defaultValue(types, builtIns, injectedPrimitives)(t);
    }

    if (t.kind == "primitive") {
      return converters[t.value].fromAPIRawValue(raw);
    }
    if (t.kind == "union") {
      return fromAPIRawValue(
        { kind: "unionCase", name: "", fields: {} as ParsedType<T> },
        types,
        builtIns,
        converters,
        injectedPrimitives
      )(raw);
    }
    if (t.kind == "unionCase") {
      const result = converters[t.kind].fromAPIRawValue(raw);
      return PredicateValue.Default.unionCase(
        result.caseName,
        PredicateValue.Default.record(Map(result.fields))
      );
    }
    if (t.kind == "application") {
      if (t.value == "SingleSelection") {
        const result = converters[t.value].fromAPIRawValue(raw);
        return result.kind == "r"
          ? PredicateValue.Default.option(false, PredicateValue.Default.unit())
          : PredicateValue.Default.option(
              true,
              PredicateValue.Default.record(Map(result.value))
            );
      }
      if (t.value == "MultiSelection") {
        const result = converters[t.value].fromAPIRawValue(raw);
        const values = result.map((_) => PredicateValue.Default.record(Map(_)));
        return PredicateValue.Default.record(Map(values));
      }
      if (t.value == "List") {
        return PredicateValue.Default.tuple(
          converters[t.value]
            .fromAPIRawValue(raw)
            .map(
              fromAPIRawValue(
                t.args[0],
                types,
                builtIns,
                converters,
                injectedPrimitives
              )
            )
        );
      }
      if (t.value == "Map" && t.args.length == 2) {
        const result = converters[t.value].fromAPIRawValue(raw);
        return PredicateValue.Default.tuple(
          result.map(([key, value]) =>
            PredicateValue.Default.tuple(
              List([
                fromAPIRawValue(
                  t.args[0],
                  types,
                  builtIns,
                  converters,
                  injectedPrimitives
                )(key),
                fromAPIRawValue(
                  t.args[1],
                  types,
                  builtIns,
                  converters,
                  injectedPrimitives
                )(value),
              ])
            )
          )
        );
      }
    }

    if (t.kind == "lookup")
      return fromAPIRawValue(
        types.get(t.name)!,
        types,
        builtIns,
        converters,
        injectedPrimitives
      )(raw);

    if (t.kind == "form") {
      let result: Map<string, PredicateValue> = Map();
      t.fields.forEach((fieldType, fieldName) => {
        const fieldValue = raw[fieldName];
        result = result.set(
          fieldName,
          fromAPIRawValue(
            fieldType,
            types,
            builtIns,
            converters,
            injectedPrimitives
          )(fieldValue)
        );
      });
      return PredicateValue.Default.record(result);
    }

    console.error(
      `unsupported type ${JSON.stringify(
        t
      )}, returning the obj value right away`
    );
    return raw;
  };

export const toAPIRawValue =
  <T extends { [key in keyof T]: { type: any; state: any } }>(
    t: ParsedType<T>,
    types: Map<TypeName, ParsedType<T>>,
    builtIns: BuiltIns,
    converters: ApiConverters<T>,
    injectedPrimitives?: InjectedPrimitives<T>
  ) =>
  (
    raw: PredicateValue,
    formState: any,
    checkKeys: boolean
  ): ValueOrErrors<any, string> => {
    console.debug("toAPIRaw");
    console.debug("raw", raw);
    console.debug("t", t);
    console.debug("formState", formState);
    console.debug("--------------------------------");
    if (t.kind == "primitive") {
      return ValueOrErrors.Operations.Return(
        converters[t.value as string | keyof T].toAPIRawValue([
          raw,
          formState.modifiedByUser,
        ])
      );
    }

    if (t.kind == "union") {
      return toAPIRawValue(
        { kind: "unionCase", name: "", fields: {} as ParsedType<T> },
        types,
        builtIns,
        converters,
        injectedPrimitives
      )(raw, formState, checkKeys);
    }

    if (t.kind == "unionCase") {
      if (!PredicateValue.Operations.IsUnionCase(raw)) {
        return ValueOrErrors.Default.throwOne(
          `UnionCase expected but got ${raw}`
        );
      }
      return ValueOrErrors.Operations.Return(
        converters[t.kind].toAPIRawValue([
          { caseName: raw.caseName, fields: raw.fields },
          formState.modifiedByUser,
        ])
      );
    }
    if (t.kind == "application") {
      if (t.value == "SingleSelection") {
        if (!PredicateValue.Operations.IsOption(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Option expected but got ${raw}`
          );
        }

        if (raw.isSome) {
          if (!PredicateValue.Operations.IsRecord(raw.value)) {
            return ValueOrErrors.Default.throwOne(
              `Record expected but got ${raw.value}`
            );
          }
          const rawValue = raw.value.fields.toJS();
          if (
            !CollectionReference.Operations.IsCollectionReference(rawValue) &&
            !EnumReference.Operations.IsEnumReference(rawValue)
          ) {
            return ValueOrErrors.Default.throwOne(
              `CollectionReference or EnumReference expected but got ${rawValue}`
            );
          }

          return ValueOrErrors.Operations.Return(
            converters[t.value].toAPIRawValue([
              Sum.Default.left(rawValue),
              formState.modifiedByUser,
            ])
          );
        } else {
          return ValueOrErrors.Operations.Return(
            converters[t.value].toAPIRawValue([
              Sum.Default.right("no selection"),
              formState.modifiedByUser,
            ])
          );
        }
      }

      if (t.value == "MultiSelection") {
        if (!PredicateValue.Operations.IsRecord(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Record expected but got ms ${JSON.stringify(raw)}`
          );
        }

        // TODO - without casting -- check the collection reference vs enum reference type
        const rawValue: Map<string, CollectionReference> = raw.fields.map(
          (value) => {
            return (value as ValueRecord).fields.toJS() as CollectionReference;
          }
        );

        return ValueOrErrors.Operations.Return(
          converters[t.value].toAPIRawValue([
            rawValue,
            formState.modifiedByUser,
          ])
        );
      }
      if (t.value == "List") {
        if (!PredicateValue.Operations.IsTuple(raw)) {
          return ValueOrErrors.Default.throwOne(
            `Tuple expected but got ${raw}`
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
                injectedPrimitives
              )(value, formState.elementFormStates.get(index), checkKeys)
            )
          )
        ).Then((values) =>
          ValueOrErrors.Default.return(
            converters["List"].toAPIRawValue([values, formState.modifiedByUser])
          )
        );
      }
      if (t.value == "Map") {
        console.debug("FS", JSON.stringify(formState, null, 2));
        const keyValues = (raw as ValueTuple).values.map((keyValue, index) =>
          {
            console.debug("FS", JSON.stringify(formState.elementFormStates.get(index), null, 2));
            return toAPIRawValue(
            t.args[0],
            types,
            builtIns,
            converters,
            injectedPrimitives
          )(
            (keyValue as ValueTuple).values.get(0)!,
            formState.elementFormStates.get(index).KeyFormState.commonFormState,
            checkKeys
          )
            .Then((possiblyUndefinedKey) => {
              if (
                possiblyUndefinedKey == undefined ||
                possiblyUndefinedKey == null ||
                possiblyUndefinedKey == "" ||
                (typeof possiblyUndefinedKey == "object" &&
                  Object.keys(possiblyUndefinedKey).length == 0)
              ) {
                return ValueOrErrors.Default.throwOne(
                  `A mapped key is undefined for type ${JSON.stringify(
                    t.args[0]
                  )}`
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
                injectedPrimitives
              )(
                (keyValue as ValueTuple).values.get(1)!,
                formState.elementFormStates.get(index).ValueFormState.commonFormState,
                checkKeys
              ).Then((value) =>
                ValueOrErrors.Default.return([key, value] as [any, any])
              )
            )
          }
        );

        return ValueOrErrors.Operations.All(List(keyValues)).Then((values) => {
          if (
            values.map((kv) => JSON.stringify(kv[0])).toSet().size !=
            values.size
          ) {
            return ValueOrErrors.Default.throwOne(
              "Keys in the map are not unique"
            );
          }
          return ValueOrErrors.Operations.Return(
            converters["Map"].toAPIRawValue([values, formState.modifiedByUser])
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
        injectedPrimitives
      )(raw, formState, checkKeys);

    if (t.kind == "form") {
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
            injectedPrimitives
          )(
            // TODO - error if the field is not found
            (raw as ValueRecord).fields.get(fieldName)!,
            formState["formFieldStates"]?.[fieldName] ?? formState,
            checkKeys
          ),
        ])
      );
      const errors: ValueOrErrors<
        List<any>,
        string
      > = ValueOrErrors.Operations.All(
        List(
          res.map(
            ([_, value]: [_: string, value: ValueOrErrors<any, string>]) =>
              value
          )
        )
      );
      if (errors.kind == "errors") return errors;

      return ValueOrErrors.Operations.Return(
        res.reduce(
          (acc: any, [fieldName, value]: [fieldName: string, value: any]) => {
            acc[fieldName] = value.value;
            return acc;
          },
          {} as any
        )
      );
    }

    return ValueOrErrors.Operations.Return(
      defaultValue(types, builtIns, injectedPrimitives)(t)
    );
  };
