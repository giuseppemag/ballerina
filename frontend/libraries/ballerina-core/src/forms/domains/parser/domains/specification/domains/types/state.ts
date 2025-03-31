import { Set, List, Map } from "immutable";
import {
  BuiltInGenericType,
  BuiltInGenericTypes,
  BuiltInPrimitiveTypes,
} from "../../../../../parser/domains/built-ins/state";
import { InjectedPrimitives } from "../../../../../parser/domains/injectables/state";
import { ValueOrErrors } from "../../../../../../../collections/domains/valueOrErrors/state";
import { Unit } from "../../../../../../../../main";

export const isString = (_: any): _ is string => typeof _ == "string";
export const isObject = (_: any): _ is object => typeof _ == "object";
export const isGenericType = (_: any): _ is BuiltInGenericType =>
  _ && BuiltInGenericTypes.includes(_);
export const hasFun = (_: any): _ is { fun: string } =>
  isObject(_) && "fun" in _ && isString(_.fun);
export const hasArgs = (_: any): _ is { args: Array<any> } =>
  isObject(_) && "args" in _ && Array.isArray(_.args);
export type CaseName = string;
export type FieldName = string;
export type TypeName = string;

export type SerializedApplicationType<T> = {
  fun?: BuiltInGenericType;
  args?: Array<SerializedType<T>>;
};

export type SerializedUnionCase = {
  case?: string;
  extends?: Array<TypeName>;
  fields?: Object;
};

export type SerializedUnionType = {
  fun?: "Union";
  args?: Array<SerializedUnionCase>;
};

export type SerializedOptionType = {
  fun?: "Option";
  args?: Array<SerializedType<any>>;
};

export type SerializedRecordType = {
  extends?: Array<TypeName>;
  fields?: object;
};

export type SerializedLookupType = string;

export type SerializedType<T> =
  | Unit
  | PrimitiveTypeName<T>
  | SerializedApplicationType<T>
  | SerializedLookupType
  | SerializedUnionType
  | SerializedRecordType
  | SerializedUnionCase
  | SerializedOptionType;

export const RawType = {
  isExtendedType: <T>(
    type: SerializedType<T>,
  ): type is SerializedType<T> & { extends: Array<TypeName> } =>
    typeof type == "object" &&
    "extends" in type &&
    Array.isArray(type.extends) &&
    type.extends.length == 1 &&
    isString(type.extends[0]),
  hasFields: <T>(type: SerializedType<T>): type is { fields: any } =>
    typeof type == "object" && "fields" in type,
  isMaybeUnion: (_: any): _ is SerializedUnionType =>
    isObject(_) &&
    "fun" in _ &&
    "args" in _ &&
    _.fun == "Union" &&
    Array.isArray(_["args"]) &&
    _["args"].every(
      (__) => typeof __ == "object" && "caseName" in __ && "fields" in __,
    ),
  isMaybePrimitive: (_: any) => isString(_),
  isPrimitive: <T>(
    _: SerializedType<T>,
    injectedPrimitives: InjectedPrimitives<T> | undefined,
  ): _ is PrimitiveTypeName<T> =>
    Boolean(
      BuiltInPrimitiveTypes.some((__) => _ == __) ||
        injectedPrimitives?.injectedPrimitives.has(_ as keyof T),
    ),
  isMaybeApplication: (_: any): _ is Object => isObject(_),
  isApplication: <T>(
    _: SerializedType<T>,
  ): _ is { fun: BuiltInGenericType; args: Array<SerializedType<T>> } =>
    hasFun(_) && isGenericType(_.fun) && hasArgs(_),
  isMaybeLookup: (_: any) => isString(_),
  isLookup: <T>(_: SerializedType<T>, forms: Set<TypeName>): _ is TypeName =>
    isString(_) && forms.has(_),
  isList: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "List"; args: Array<SerializedType<T>> } =>
    RawType.isApplication(_) && _.fun == "List" && _.args.length == 1,
  isMap: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "Map"; args: Array<SerializedType<T>> } =>
    RawType.isApplication(_) && _.fun == "Map" && _.args.length == 2,
  isSum: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "Sum"; args: Array<SerializedType<T>> } =>
    RawType.isApplication(_) && _.fun == "Sum" && _.args.length == 2,
  isSumUnitDate: <T>(_: SerializedType<T>): _ is "SumUnitDate" =>
    typeof _ == "string" && _ == "SumUnitDate",
  isSingleSelection: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "SingleSelection"; args: Array<SerializedType<T>> } =>
    RawType.isApplication(_) &&
    _.fun == "SingleSelection" &&
    _.args.length == 1,
  isMultiSelection: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "MultiSelection"; args: Array<SerializedType<T>> } =>
    RawType.isApplication(_) && _.fun == "MultiSelection" && _.args.length == 1,
  isUnionCase: <T>(
    _: SerializedType<T>,
  ): _ is {
    caseName: string;
    fields: object | string;
    extends?: Array<TypeName>;
  } => typeof _ == "object" && "caseName" in _ && "fields" in _,
  isUnion: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "Union"; args: Array<{ caseName: string; fields: object }> } =>
    hasFun(_) &&
    isGenericType(_.fun) &&
    hasArgs(_) &&
    _.fun == "Union" &&
    _.args.length > 0 &&
    _.args.every(
      (__) => typeof __ == "object" && "caseName" in __ && "fields" in __,
    ),
  isTuple: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "Tuple"; args: Array<SerializedType<T>> } =>
    RawType.isApplication(_) && _.fun == "Tuple",
  isRecord: <T>(
    _: SerializedType<T>,
  ): _ is { fields: Object; extends?: Array<TypeName> } =>
    typeof _ == "object" && "fields" in _ && isObject(_.fields),
  isOption: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "Option"; args: Array<SerializedType<T>> } =>
    typeof _ == "object" &&
    "fun" in _ &&
    _.fun == "Option" &&
    "args" in _ &&
    Array.isArray(_.args) &&
    _.args.length == 1,
  isUnit: <T>(_: SerializedType<T>): _ is string => _ == "unit",
};

export type PrimitiveTypeName<T> =
  | "unit"
  | "string"
  | "number"
  | "maybeBoolean"
  | "boolean"
  | "Date"
  | "base64File"
  | "secret"
  | keyof T
  | "guid";

export type SumUnitDateType = {
  kind: "sumUnitDate";
  typeName: TypeName;
};

export type UnionType<T> = {
  kind: "union";
  args: Map<CaseName, ParsedType<T>>;
  typeName: TypeName;
};

export type UnionCaseType<T> = {
  kind: "unionCase";
  name: CaseName;
  fields: RecordType<T> | LookupType;
  extendedTypes: Array<TypeName>;
  typeName: TypeName;
};

export type RecordType<T> = {
  kind: "record";
  name: TypeName;
  fields: Map<FieldName, ParsedType<T>>;
  extendedTypes: Array<TypeName>;
  typeName: TypeName;
};

export type LookupType = {
  kind: "lookup";
  name: TypeName;
};

export type PrimitiveType<T> = {
  kind: "primitive";
  name: PrimitiveTypeName<T>;
};

export type SingleSelectionType<T> = {
  kind: "singleSelection";
  name: TypeName;
  args: Array<ParsedType<T>>;
};

export type MultiSelectionType<T> = {
  kind: "multiSelection";
  name: TypeName;
  args: Array<ParsedType<T>>;
};

export type ListType<T> = {
  kind: "list";
  name: TypeName;
  args: Array<ParsedType<T>>;
};

export type TupleType<T> = {
  kind: "tuple";
  name: TypeName;
  args: Array<ParsedType<T>>;
};

export type SumType<T> = {
  kind: "sum";
  name: TypeName;
  args: Array<ParsedType<T>>;
};

export type MapType<T> = {
  kind: "map";
  name: TypeName;
  args: Array<ParsedType<T>>;
};

export type ParsedType<T> = (
  | UnionCaseType<T>
  | RecordType<T>
  | LookupType
  | PrimitiveType<T>
  | UnionType<T>
  | SingleSelectionType<T>
  | MultiSelectionType<T>
  | ListType<T>
  | TupleType<T>
  | SumType<T>
  | MapType<T>
  | SumUnitDateType
) & { typeName: TypeName };

export const ParsedType = {
  Default: {
    sumUnitDate: (typeName: TypeName): SumUnitDateType => ({
      kind: "sumUnitDate",
      typeName,
    }),
    unionCase: <T>(
      name: CaseName,
      fields: RecordType<T> | LookupType,
      typeName: TypeName,
      extendedTypes: Array<TypeName>,
    ): UnionCaseType<T> => ({
      kind: "unionCase",
      name,
      fields,
      typeName,
      extendedTypes,
    }),
    record: <T>(
      name: TypeName,
      fields: Map<FieldName, ParsedType<T>>,
      typeName: TypeName,
      extendedTypes: Array<TypeName>,
    ): RecordType<T> => ({
      kind: "record",
      name,
      fields,
      typeName: typeName,
      extendedTypes,
    }),
    primitive: <T>(
      name: PrimitiveTypeName<T> | keyof T,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "primitive",
      name,
      typeName: typeName,
    }),
    singleSelection: <T>(
      name: TypeName,
      args: Array<ParsedType<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "singleSelection",
      name,
      args,
      typeName: typeName,
    }),
    multiSelection: <T>(
      name: TypeName,
      args: Array<ParsedType<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "multiSelection",
      name,
      args,
      typeName: typeName,
    }),
    list: <T>(
      name: TypeName,
      args: Array<ParsedType<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "list",
      name,
      args,
      typeName: typeName,
    }),
    tuple: <T>(
      name: TypeName,
      args: Array<ParsedType<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "tuple",
      name,
      args,
      typeName: typeName,
    }),
    sum: <T>(
      name: TypeName,
      args: Array<ParsedType<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "sum",
      name,
      args,
      typeName: typeName,
    }),
    map: <T>(
      name: TypeName,
      args: Array<ParsedType<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "map",
      name,
      args,
      typeName: typeName,
    }),
    union: <T>(
      args: Map<CaseName, ParsedType<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "union",
      args,
      typeName,
    }),
    lookup: <T>(name: string, typeName: TypeName): ParsedType<T> => ({
      kind: "lookup",
      name,
      typeName,
    }),
  },
  Operations: {
    Equals: <T>(fst: ParsedType<T>, snd: ParsedType<T>): boolean =>
      fst.kind == "record" && snd.kind == "record"
        ? fst.name == snd.name
        : fst.kind == "lookup" && snd.kind == "lookup"
        ? fst.name == snd.name
        : fst.kind == "primitive" && snd.kind == "primitive"
        ? fst.name == snd.name
        : fst.kind == "sumUnitDate" && snd.kind == "sumUnitDate"
        ? fst.typeName == snd.typeName
        : fst.kind == "list" && snd.kind == "list"
        ? fst.name == snd.name
        : fst.kind == "singleSelection" && snd.kind == "singleSelection"
        ? fst.name == snd.name
        : fst.kind == "multiSelection" && snd.kind == "multiSelection"
        ? fst.name == snd.name
        : fst.kind == "map" && snd.kind == "map"
        ? fst.name == snd.name
        : fst.kind == "sum" && snd.kind == "sum"
        ? fst.name == snd.name
        : fst.kind == "tuple" && snd.kind == "tuple"
        ? fst.name == snd.name &&
          fst.args.length == snd.args.length &&
          fst.args.every((v, i) => ParsedType.Operations.Equals(v, snd.args[i]))
        : fst.kind == "union" && snd.kind == "union"
        ? fst.args.size == snd.args.size &&
          fst.args.every((v, i) =>
            ParsedType.Operations.Equals(v, snd.args.get(i)!),
          )
        : fst.kind == "unionCase" && snd.kind == "unionCase"
        ? fst.name == snd.name
        : false,

    ParseRawType: <T>(
      typeName: TypeName,
      rawType: SerializedType<T>,
      typeNames: Set<TypeName>,
      injectedPrimitives?: InjectedPrimitives<T>,
    ): ValueOrErrors<ParsedType<T>, string> => {
      if (RawType.isSumUnitDate(rawType))
        return ValueOrErrors.Default.return(
          ParsedType.Default.sumUnitDate(typeName),
        );
      if (RawType.isPrimitive(rawType, injectedPrimitives))
        return ValueOrErrors.Default.return(
          ParsedType.Default.primitive(
            rawType == "guid" ? "string" : rawType,
            typeName,
          ),
        );
      if (RawType.isSingleSelection(rawType))
        return ParsedType.Operations.ParseRawType(
          typeName,
          rawType.args[0],
          typeNames,
          injectedPrimitives,
        ).Then((parsedArgs) =>
          ValueOrErrors.Default.return(
            ParsedType.Default.singleSelection(
              typeName,
              [parsedArgs],
              typeName,
            ),
          ),
        );
      if (RawType.isMultiSelection(rawType))
        return ParsedType.Operations.ParseRawType(
          typeName,
          rawType.args[0],
          typeNames,
          injectedPrimitives,
        ).Then((parsedArgs) =>
          ValueOrErrors.Default.return(
            ParsedType.Default.multiSelection(typeName, [parsedArgs], typeName),
          ),
        );
      if (RawType.isList(rawType))
        return ParsedType.Operations.ParseRawType(
          typeName,
          rawType.args[0],
          typeNames,
          injectedPrimitives,
        ).Then((parsedArgs) =>
          ValueOrErrors.Default.return(
            ParsedType.Default.list(typeName, [parsedArgs], typeName),
          ),
        );
      if (RawType.isTuple(rawType))
        return ValueOrErrors.Operations.All(
          List(
            rawType.args.map((arg) =>
              ParsedType.Operations.ParseRawType(
                typeName,
                arg,
                typeNames,
                injectedPrimitives,
              ),
            ),
          ),
        ).Then((parsedArgs) =>
          ValueOrErrors.Default.return(
            ParsedType.Default.tuple(typeName, parsedArgs.toArray(), typeName),
          ),
        );
      if (RawType.isMap(rawType))
        return ParsedType.Operations.ParseRawType(
          typeName,
          rawType.args[0],
          typeNames,
          injectedPrimitives,
        ).Then((parsedArgs0) =>
          ParsedType.Operations.ParseRawType(
            typeName,
            rawType.args[1],
            typeNames,
            injectedPrimitives,
          ).Then((parsedArgs1) =>
            ValueOrErrors.Default.return(
              ParsedType.Default.map(
                typeName,
                [parsedArgs0, parsedArgs1],
                typeName,
              ),
            ),
          ),
        );
      if (RawType.isSum(rawType))
        return ParsedType.Operations.ParseRawType(
          typeName,
          rawType.args[0],
          typeNames,
          injectedPrimitives,
        ).Then((parsedArgs0) =>
          ParsedType.Operations.ParseRawType(
            typeName,
            rawType.args[1],
            typeNames,
            injectedPrimitives,
          ).Then((parsedArgs1) =>
            ValueOrErrors.Default.return(
              ParsedType.Default.sum(
                typeName,
                [parsedArgs0, parsedArgs1],
                typeName,
              ),
            ),
          ),
        );
      // A union case is a special case of a record and must be checked before records
      // if (RawType.isUnionCase(rawType)) {
      //   if (typeof rawType.fields == "string") {
      //     return ParsedType.Operations.ParseRawType(
      //       rawType.caseName,
      //       rawType.fields as SerializedType<T>,
      //       typeNames,
      //       injectedPrimitives,
      //     ).Then((parsedFields) => {
      //       if (parsedFields.kind == "lookup") {
      //         return ValueOrErrors.Default.return(
      //           ParsedType.Default.unionCase(
      //             rawType.caseName,
      //             parsedFields,
      //             typeName,
      //             rawType.extends ?? [],
      //           ),
      //         );
      //       }
      //       return ValueOrErrors.Default.throwOne(
      //         `Error: parsed union case ${JSON.stringify(
      //           parsedFields,
      //         )} is not a valid union case`,
      //       );
      //     });
      //   }
      //   return ValueOrErrors.Operations.All(
      //     List(
      //       Object.entries(rawType.fields).map(([fieldName, fieldType]) =>
      //         ParsedType.Operations.ParseRawType(
      //           fieldName,
      //           fieldType as SerializedType<T>,
      //           typeNames,
      //           injectedPrimitives,
      //         ).Then((parsedField) =>
      //           ValueOrErrors.Default.return([fieldName, parsedField] as const),
      //         ),
      //       ),
      //     ),
      //   )
      //     .Then((parsedFields) =>
      //       ValueOrErrors.Default.return(
      //         ParsedType.Default.record(
      //           typeName,
      //           Map(
      //             parsedFields.map(([fieldName, parsedField]) => [
      //               fieldName,
      //               parsedField,
      //             ]),
      //           ),
      //           typeName,
      //           rawType.extends ?? [],
      //         ),
      //       ),
      //     )
      //     .Then((parsedField) => {
      //       if (parsedField.kind == "record") {
      //         return ValueOrErrors.Default.return<ParsedType<T>, string>(
      //           ParsedType.Default.unionCase(
      //             typeName,
      //             parsedField,
      //             typeName,
      //             rawType.extends ?? [],
      //           ),
      //         );
      //       }
      //       return ValueOrErrors.Default.throwOne(
      //         `Error: parsed union case ${JSON.stringify(
      //           parsedField,
      //         )} is not a valid union case`,
      //       );
      //     });
      // }
      if (RawType.isRecord(rawType)) {
        return ValueOrErrors.Operations.All(
          List(
            Object.entries(rawType.fields).map(([fieldName, fieldType]) =>
              ParsedType.Operations.ParseRawType(
                fieldName,
                fieldType as SerializedType<T>,
                typeNames,
                injectedPrimitives,
              ).Then((parsedField) =>
                ValueOrErrors.Default.return([fieldName, parsedField] as const),
              ),
            ),
          ),
        )
          .Then((parsedFields) =>
            ValueOrErrors.Default.return(
              Map(
                parsedFields.map(([fieldName, parsedField]) => [
                  fieldName,
                  parsedField,
                ]),
              ),
            ),
          )
          .Then((parsedField) =>
            ValueOrErrors.Default.return<ParsedType<T>, string>(
              ParsedType.Default.record(
                typeName,
                parsedField,
                typeName,
                rawType.extends ?? [],
              ),
            ),
          );
      }
      if (RawType.isUnion(rawType)) {
        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<[string, ParsedType<T>], string>>(
            rawType.args.map((unionCase) => {
              return ParsedType.Operations.ParseRawType(
                unionCase.caseName,
                typeof unionCase.fields == "string"
                  ? unionCase.fields
                  : unionCase,
                typeNames,
                injectedPrimitives,
              ).Then((parsedUnionCase) => {
                return ValueOrErrors.Default.return([
                  unionCase.caseName,
                  parsedUnionCase,
                ]);
              });
            }),
          ),
        ).Then((parsedUnionCases) =>
          ValueOrErrors.Default.return(
            ParsedType.Default.union(Map(parsedUnionCases), typeName),
          ),
        );
      }
      if (RawType.isLookup(rawType, typeNames))
        return ValueOrErrors.Default.return(
          ParsedType.Default.lookup(rawType, typeName),
        );
      if (RawType.isUnit(rawType)) {
        return ValueOrErrors.Default.return(
          ParsedType.Default.primitive("unit", typeName),
        );
      }
      return ValueOrErrors.Default.throw(
        List([
          `Invalid type ${JSON.stringify(rawType)} for field ${JSON.stringify(
            typeName,
          )}`,
        ]),
      );
    },

    ExtendParsedTypes: <T>(
      parsedTypes: Map<TypeName, ParsedType<T>>,
    ): ValueOrErrors<Map<TypeName, ParsedType<T>>, string> => {
      return ValueOrErrors.Operations.All(
        List<ValueOrErrors<ParsedType<T>, string>>(
          parsedTypes
            .valueSeq()
            .toArray()
            .map((parsedType) => {
              if (parsedType.kind != "record") {
                return ValueOrErrors.Default.return(parsedType);
              }

              if (parsedType.kind == "record") {
                if (parsedType.extendedTypes.length <= 0) {
                  return ValueOrErrors.Default.return(parsedType);
                }
                const extendedType = parsedTypes.get(
                  parsedType.extendedTypes[0],
                );

                if (
                  extendedType == undefined ||
                  extendedType.kind != "record"
                ) {
                  return ValueOrErrors.Default.throwOne(
                    `Error: extended type ${JSON.stringify(
                      parsedType.extendedTypes[0],
                    )} is not a valid extended type`,
                  );
                }
                return ValueOrErrors.Default.return(
                  ParsedType.Default.record(
                    parsedType.name,
                    parsedType.fields.merge(extendedType.fields),
                    parsedType.typeName,
                    parsedType.extendedTypes,
                  ),
                );
              }
              // if (parsedType.kind == "union") {
              //   return ValueOrErrors.Operations.All(
              //     List<ValueOrErrors<UnionCaseType<T>, string>>(
              //       parsedType.args
              //         .valueSeq()
              //         .toArray()
              //         .map((unionCase) => {
              //           if (unionCase.extendedTypes.length <= 0) {
              //             return ValueOrErrors.Default.return(unionCase);
              //           }
              //           const extendedType = parsedTypes.get(
              //             unionCase.extendedTypes[0],
              //           );

              //           if (
              //             extendedType == undefined ||
              //             extendedType.kind != "record" ||
              //             unionCase.fields.kind != "record"
              //           ) {
              //             return ValueOrErrors.Default.throwOne(
              //               `Error: extended type ${JSON.stringify(
              //                 unionCase.extendedTypes,
              //               )} is not a valid extended type`,
              //             );
              //           }

              //           return ValueOrErrors.Default.return(
              //             ParsedType.Default.unionCase(
              //               unionCase.name,
              //               ParsedType.Default.record(
              //                 "unionCase",
              //                 unionCase.fields.fields.merge(
              //                   extendedType.fields,
              //                 ),
              //                 unionCase.typeName,
              //                 unionCase.extendedTypes,
              //               ),
              //               parsedType.typeName,
              //               unionCase.extendedTypes,
              //             ),
              //           );
              //         }),
              //     ),
              //   ).Then((parsedUnionCases) =>
              //     ValueOrErrors.Default.return(
              //       ParsedType.Default.union(
              //         Map(
              //           parsedUnionCases
              //             .toArray()
              //             .map((_) => [_.name, _] as const),
              //         ),
              //         parsedType.typeName,
              //       ),
              //     ),
              //   );
              // }
              return ValueOrErrors.Default.throwOne(
                `Error: parsed type ${JSON.stringify(
                  parsedType,
                )} is not a valid parsed type`,
              );
            }),
        ),
      ).Then((parsedTypes) =>
        ValueOrErrors.Default.return(
          Map(parsedTypes.toArray().map((_) => [_.typeName, _] as const)),
        ),
      );
    },
  },
};
