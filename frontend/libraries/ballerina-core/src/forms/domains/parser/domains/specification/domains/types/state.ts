import { Set, List, Map, OrderedMap } from "immutable";
import {
  GenericType,
  GenericTypes,
  PrimitiveTypes,
} from "../../../built-ins/state";
import { InjectedPrimitives } from "../../../injectables/state";
import { ValueOrErrors } from "../../../../../../../collections/domains/valueOrErrors/state";
import { Unit } from "../../../../../../../../main";

export const isString = (_: any): _ is string => typeof _ == "string";
export const isObject = (_: any): _ is object => typeof _ == "object";
export const isGenericType = (_: any): _ is GenericType =>
  _ && GenericTypes.includes(_);
export const hasFun = (_: any): _ is { fun: string } =>
  isObject(_) && "fun" in _ && isString(_.fun);
export const hasArgs = (_: any): _ is { args: Array<any> } =>
  isObject(_) && "args" in _ && Array.isArray(_.args);
export type CaseName = string;
export type FieldName = string;
export type TypeName = string;

export type SerializedApplicationType<T> = {
  fun?: GenericType;
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
      PrimitiveTypes.some((__) => _ == __) ||
        injectedPrimitives?.injectedPrimitives.has(_ as keyof T),
    ),
  isMaybeApplication: (_: any): _ is Object => isObject(_),
  isApplication: <T>(
    _: SerializedType<T>,
  ): _ is { fun: GenericType; args: Array<SerializedType<T>> } =>
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
  ): _ is { caseName: string; fields: object; extends?: Array<TypeName> } =>
    typeof _ == "object" && "caseName" in _ && "fields" in _,
  isUnion: <T>(
    _: SerializedType<T>,
  ): _ is { fun: "Union"; args: Array<{ case: string; fields: object }> } =>
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

export type ParsedUnion<T> = {
  kind: "union";
  args: Map<CaseName, ParsedUnionCase<T>>;
  typeName: TypeName;
};

export type ParsedUnionCase<T> = {
  kind: "unionCase";
  name: CaseName;
  fields: ParsedRecord<T>;
  typeName: TypeName;
  extendedTypes: Array<TypeName>;
};

export type ParsedRecord<T> = {
  kind: "record";
  value: TypeName;
  fields: Map<FieldName, ParsedType<T>>;
  extendedTypes: Array<TypeName>;
  typeName: TypeName;
};

export type ParsedApplicationType<T> = {
  kind: "application";
  value: GenericType;
  args: Array<ParsedType<T>>;
};

export type ParsedLookupType = {
  kind: "lookup";
  name: TypeName;
};

export type ParsedOptionType<T> = {
  kind: "option";
  value: ParsedType<T>;
};

export type ParsedPrimitiveType<T> = {
  kind: "primitive";
  value: PrimitiveTypeName<T>;
};

export type ParsedType<T> = (
  | ParsedUnionCase<T>
  | ParsedOptionType<T>
  | ParsedRecord<T>
  | ParsedLookupType
  | ParsedPrimitiveType<T>
  | ParsedApplicationType<T>
  | ParsedUnion<T>
) & { typeName: TypeName };

export const ParsedType = {
  Default: {
    unionCase: <T>(
      name: CaseName,
      fields: ParsedRecord<T>,
      typeName: TypeName,
      extendedTypes: Array<TypeName>,
    ): ParsedUnionCase<T> => ({
      kind: "unionCase",
      name,
      fields,
      typeName,
      extendedTypes,
    }),
    option: <T>(value: ParsedType<T>, typeName: TypeName): ParsedType<T> => ({
      kind: "option",
      value,
      typeName: typeName,
    }),
    record: <T>(
      value: TypeName,
      fields: Map<FieldName, ParsedType<T>>,
      typeName: TypeName,
      extendedTypes: Array<TypeName>,
    ): ParsedRecord<T> => ({
      kind: "record",
      value,
      fields,
      typeName: typeName,
      extendedTypes,
    }),
    primitive: <T>(
      name: PrimitiveTypeName<T> | keyof T,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "primitive",
      value: name,
      typeName: typeName,
    }),
    application: <T>(
      value: GenericType,
      args: Array<ParsedType<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({ kind: "application", value, args, typeName }),
    union: <T>(
      args: Map<CaseName, ParsedUnionCase<T>>,
      typeName: TypeName,
    ): ParsedType<T> => ({
      kind: "union",
      args,
      typeName: typeName,
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
        ? fst.value == snd.value
        : fst.kind == "lookup" && snd.kind == "lookup"
        ? fst.name == snd.name
        : fst.kind == "primitive" && snd.kind == "primitive"
        ? fst.value == snd.value
        : fst.kind == "application" && snd.kind == "application"
        ? fst.value == snd.value &&
          fst.args.length == snd.args.length &&
          fst.args.every((v, i) => ParsedType.Operations.Equals(v, snd.args[i]))
        : fst.kind == "option" && snd.kind == "option"
        ? fst.value.kind == "option" &&
          snd.value.kind == "option" &&
          ParsedType.Operations.Equals(fst.value.value, snd.value.value)
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
            ParsedType.Default.application(
              "SingleSelection",
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
            ParsedType.Default.application(
              "MultiSelection",
              [parsedArgs],
              typeName,
            ),
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
            ParsedType.Default.application("List", [parsedArgs], typeName),
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
            ParsedType.Default.application(
              "Tuple",
              parsedArgs.toArray(),
              typeName,
            ),
          ),
        );

      if (RawType.isOption(rawType))
        return ParsedType.Operations.ParseRawType(
          typeName,
          rawType.args[0],
          typeNames,
          injectedPrimitives,
        ).Then((parsedArg) =>
          ValueOrErrors.Default.return(
            ParsedType.Default.option(parsedArg, typeName),
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
              ParsedType.Default.application(
                "Map",
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
              ParsedType.Default.application(
                "Sum",
                [parsedArgs0, parsedArgs1],
                typeName,
              ),
            ),
          ),
        );
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
      if (RawType.isUnionCase(rawType)) {
        return ParsedType.Operations.ParseRawType(
          rawType.caseName,
          rawType.fields,
          typeNames,
          injectedPrimitives,
        ).Then((parsedFields) =>
          ValueOrErrors.Default.return(
            ParsedType.Default.unionCase(
              rawType.caseName,
              parsedFields as ParsedRecord<T>,
              typeName,
              rawType.extends ?? [],
            ),
          ),
        );
      }
      if (RawType.isUnion(rawType)) {
        return ValueOrErrors.Operations.All(
          List<ValueOrErrors<ParsedUnionCase<T>, string>>(
            rawType.args.map((unionCase) => {
              if (!RawType.isUnionCase(unionCase)) {
                return ValueOrErrors.Default.throwOne(
                  `Error: arg ${JSON.stringify(
                    unionCase,
                  )} is not a valid union case`,
                );
              }
              return ParsedType.Operations.ParseRawType(
                unionCase.case,
                unionCase,
                typeNames,
                injectedPrimitives,
              ).Then((parsedFields) =>
                ValueOrErrors.Default.return(
                  ParsedType.Default.unionCase(
                    unionCase.caseName,
                    parsedFields as ParsedRecord<T>,
                    typeName,
                    unionCase.extends ?? [],
                  ),
                ),
              );
            }),
          ),
        ).Then((parsedUnionCases) =>
          ValueOrErrors.Default.return(
            ParsedType.Default.union(
              Map(parsedUnionCases.toArray().map((_) => [_.name, _] as const)),
              typeName,
            ),
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
              if (parsedType.kind != "record" && parsedType.kind != "union") {
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
                    parsedType.value,
                    parsedType.fields.merge(extendedType.fields),
                    parsedType.typeName,
                    parsedType.extendedTypes,
                  ),
                );
              }
              if (parsedType.kind == "union") {
                return ValueOrErrors.Operations.All(
                  List<ValueOrErrors<ParsedUnionCase<T>, string>>(
                    parsedType.args
                      .valueSeq()
                      .toArray()
                      .map((unionCase) => {
                        if (unionCase.extendedTypes.length <= 0) {
                          return ValueOrErrors.Default.return(unionCase);
                        }
                        const extendedType = parsedTypes.get(
                          unionCase.extendedTypes[0],
                        );

                        if (
                          extendedType == undefined ||
                          extendedType.kind != "record"
                        ) {
                          return ValueOrErrors.Default.throwOne(
                            `Error: extended type ${JSON.stringify(
                              unionCase.extendedTypes,
                            )} is not a valid extended type`,
                          );
                        }

                        return ValueOrErrors.Default.return(
                          ParsedType.Default.unionCase(
                            unionCase.name,
                            ParsedType.Default.record(
                              "unionCase",
                              unionCase.fields.fields.merge(
                                extendedType.fields,
                              ),
                              unionCase.typeName,
                              unionCase.extendedTypes,
                            ),
                            parsedType.typeName,
                            unionCase.extendedTypes,
                          ),
                        );
                      }),
                  ),
                ).Then((parsedUnionCases) =>
                  ValueOrErrors.Default.return(
                    ParsedType.Default.union(
                      Map(
                        parsedUnionCases
                          .toArray()
                          .map((_) => [_.name, _] as const),
                      ),
                      parsedType.typeName,
                    ),
                  ),
                );
              }
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
