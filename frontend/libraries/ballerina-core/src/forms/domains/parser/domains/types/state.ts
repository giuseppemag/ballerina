import { Set, List, Map, OrderedMap } from "immutable";
import { GenericType, GenericTypes, PrimitiveTypes } from "../built-ins/state";
import { InjectedPrimitives } from "../injectables/state";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";
import { Value } from "../../../../../value/state";

export const isString = (_: any): _ is string => typeof _ == "string"
export const isObject = (_: any): _ is Object => typeof _ == "object"
export const isGenericType = (_: any): _ is GenericType => _  && GenericTypes.includes(_)
export const hasFun = (_: any): _ is { fun: string } => isObject(_) && "fun" in _ && isString(_.fun) 
export const hasArgs = (_: any): _ is { args: Array<any> } => isObject(_) && "args" in _ && Array.isArray(_.args)
export type CaseName = string;
export type FieldName = string;
export type TypeName = string;
export type RawType<T> = {
  extends?: Array<TypeName>;
  fields?: OrderedMap<FieldName, RawFieldType<T>>
}
export const RawType = {
    isMaybeExtendedType: <T>(type: RawType<T>): type is RawType<T> & {extends: unknown} => "extends" in type,
    isExtendedType: <T>(type: RawType<T>): type is RawType<T> & {extends: Array<TypeName>} => "extends" in type && Array.isArray(type.extends) && type.extends.length == 1 && (isString(type.extends[0])) ,
    hasFields: <T>(type: RawType<T>): type is {fields: any} => "fields" in type,
    isMaybeUnion: (_: any): _ is RawUnionType => isObject(_) && "fun" in _ && "args" in _ && _.fun == "Union" && Array.isArray(_["args"]) && _["args"].every(__ => typeof __ == "object" && "case" in __ && "fields" in __),
}
export type RawApplicationType<T> = {
  fun?: GenericType;
  args?: Array<RawFieldType<T>>;
}

export type RawUnionCase = {
  case?: string;
  fields?: Object;
}

export type RawUnionType = {
  fun?: "Union";
  args?: Array<RawUnionCase>;
}

export type RawFormType = {fields?: Object}

export type RawFieldType<T> = RawApplicationType<T> | string | PrimitiveTypeName<T> | RawUnionType | RawFormType | RawUnionCase;
export const RawFieldType = { 
  isMaybePrimitive: (_: any) => isString(_),
  isPrimitive: <T>(_: RawFieldType<T>, injectedPrimitives: InjectedPrimitives<T> | undefined): _ is PrimitiveTypeName<T> => Boolean(PrimitiveTypes.some(__ => _ == __) || injectedPrimitives?.injectedPrimitives.has(_ as keyof T)),
  isMaybeApplication: (_: any): _ is Object => isObject(_),
  isApplication: <T>(_: RawFieldType<T>): _ is {fun: GenericType, args: Array<RawFieldType<T>>} => hasFun(_) && isGenericType(_.fun) && hasArgs(_) ,
  isMaybeLookup: (_: any) => isString(_),
  isLookup: <T>(_: RawFieldType<T>, forms: Set<TypeName>): _ is TypeName => isString(_) && forms.has(_),
  isList: <T>(_: RawFieldType<T>): _ is {fun: "List", args: Array<RawFieldType<T>>} => RawFieldType.isApplication(_) && _.fun == "List" && _.args.length == 1,
  isMap: <T>(_: RawFieldType<T>): _ is {fun: "Map", args: Array<RawFieldType<T>>} => RawFieldType.isApplication(_) && _.fun == "Map" && _.args.length == 2,
  isSingleSelection: <T>(_: RawFieldType<T>): _ is {fun: "SingleSelection", args: Array<RawFieldType<T>>} => RawFieldType.isApplication(_) && _.fun == "SingleSelection" && _.args.length == 1,
  isMultiSelection: <T>(_: RawFieldType<T>): _ is {fun: "MultiSelection", args: Array<RawFieldType<T>>} => RawFieldType.isApplication(_) && _.fun == "MultiSelection" && _.args.length == 1,
  isUnionCase: <T>(_: RawFieldType<T>): _ is {case: string, fields: object} => typeof _ == "object" && "case" in _ && "fields" in _,
  isUnion: <T>(_: RawFieldType<T>): _ is {fun: "Union", args: Array<{case: string, fields: object}>} => hasFun(_) && isGenericType(_.fun) && hasArgs(_) && _.fun == "Union" && _.args.length > 1 && _.args.every(__ => typeof __ == "object" && "case" in __ && "fields" in __),
  isForm: <T>(_: RawFieldType<T>): _ is {fields: Object} => typeof _ == "object" && "fields" in _ && isObject(_.fields),
}

export type PrimitiveTypeName<T> = "string" | "number" | "maybeBoolean" | "boolean" | "Date" | "base64File" | "secret" | keyof T | "guid";
export type FormFields<T> =  Map<FieldName, ParsedType<T>>
export type ParsedType<T> = 
  | { kind: "unionCase", name: CaseName, fields: ParsedType<T> }
  | { kind: "form"; value: TypeName; fields: FormFields<T> }
  | { kind: "lookup"; name: TypeName; } 
  | { kind: "primitive"; value: PrimitiveTypeName<T> ;}
  | { kind: "application"; value: GenericType; args: Array<ParsedType<T>>; }
  | { kind: "union";  args: Map<CaseName, ParsedType<T>> }

export const ParsedType = {
  Default: {
    unionCase: <T>(name: CaseName, fields: ParsedType<T>): ParsedType<T> => ({ kind: "unionCase", name, fields }),
    form: <T>(value: TypeName, fields: FormFields<T>): ParsedType<T> => ({ kind: "form", value, fields }),
    primitive: <T>(name: PrimitiveTypeName<T> | keyof T): ParsedType<T> => ({ kind: "primitive", value: name }),
    application: <T>(value: GenericType, args: Array<ParsedType<T>>): ParsedType<T> => ({ kind: "application", value, args }),
    union: <T>(args: Map<CaseName, ParsedType<T>>): ParsedType<T> => ({ kind: "union", args }),
    lookup: <T>(name: string): ParsedType<T> => ({ kind: "lookup", name }),
  },
  Operations: {
    //TODO: Add cases
    Equals: <T>(fst: ParsedType<T>, snd: ParsedType<T>): boolean =>
      fst.kind == "form" && snd.kind == "form" ? fst.value == snd.value :
        fst.kind == "lookup" && snd.kind == "lookup" ? fst.name == snd.name :
          fst.kind == "primitive" && snd.kind == "primitive" ? fst.value == snd.value :
            fst.kind == "application" && snd.kind == "application" ?
              fst.value == snd.value &&
              fst.args.length == snd.args.length &&
              fst.args.every((v, i) => v == snd.args[i]) :
              false,
    
    ParseRawFieldType: <T>(fieldName: TypeName, rawFieldType: RawFieldType<T>, types: Set<TypeName>, injectedPrimitives?: InjectedPrimitives<T>) : ValueOrErrors<ParsedType<T>, string> => {
      if (RawFieldType.isPrimitive(rawFieldType, injectedPrimitives))
         return ValueOrErrors.Default.return(ParsedType.Default.primitive(rawFieldType == "guid" ? "string" : rawFieldType))
      if (RawFieldType.isSingleSelection(rawFieldType))
        return ParsedType.Operations.ParseRawFieldType(fieldName, rawFieldType.args[0], types, injectedPrimitives).Then(parsedArgs =>
          ValueOrErrors.Default.return(ParsedType.Default.application("SingleSelection", [parsedArgs]))
        )
      if (RawFieldType.isMultiSelection(rawFieldType))
        return ParsedType.Operations.ParseRawFieldType(fieldName, rawFieldType.args[0], types, injectedPrimitives).Then(parsedArgs => 
          ValueOrErrors.Default.return(ParsedType.Default.application("MultiSelection", [parsedArgs]))
        )
      if (RawFieldType.isList(rawFieldType))
        return ParsedType.Operations.ParseRawFieldType(fieldName, rawFieldType.args[0], types, injectedPrimitives).Then(parsedArgs => 
          ValueOrErrors.Default.return(ParsedType.Default.application("List", [parsedArgs]))
        )
      if (RawFieldType.isMap(rawFieldType))
        return ParsedType.Operations.ParseRawFieldType(fieldName, rawFieldType.args[0], types, injectedPrimitives).Then(parsedArgs0 => 
          ParsedType.Operations.ParseRawFieldType(fieldName, rawFieldType.args[1], types, injectedPrimitives).Then(parsedArgs1 => 
            ValueOrErrors.Default.return(ParsedType.Default.application("Map", [parsedArgs0, parsedArgs1]))
          )
        )
      if(RawFieldType.isForm(rawFieldType))
        return ValueOrErrors.Operations
              .All(List(Object.entries(rawFieldType.fields).map(([fieldName, fieldType]) => ParsedType.Operations.ParseRawFieldType(fieldName, fieldType as RawFieldType<T>, types, injectedPrimitives)
              .Then(parsedField => ValueOrErrors.Default.return([fieldName, parsedField] as const))
              )))
              .Then(parsedFields =>  ValueOrErrors.Default.return(Map(parsedFields.map(([fieldName, parsedField]) => [fieldName, parsedField]))))
              .Then(parsedField => ValueOrErrors.Default.return<ParsedType<T>, string>(ParsedType.Default.form(fieldName, parsedField)))
      if(RawFieldType.isUnionCase(rawFieldType))
        return ParsedType.Operations.ParseRawFieldType(rawFieldType.case, rawFieldType.fields, types, injectedPrimitives).Then(parsedFields =>
          ValueOrErrors.Default.return(ParsedType.Default.unionCase(rawFieldType.case, parsedFields))
        )
      if(RawFieldType.isUnion(rawFieldType))
        return ValueOrErrors.Operations.All(List(
          rawFieldType.args.map(_ => ParsedType.Operations.ParseRawFieldType(_.case, _, types, injectedPrimitives).Map(parsedFields => ({name: _.case, fields: parsedFields})))))
          .Then(parsedFields =>  ValueOrErrors.Default.return(ParsedType.Default.union(Map(parsedFields.toArray().map(_ => [_.name, _.fields] as const)))))
           
      if(RawFieldType.isLookup(rawFieldType, types))
         return ValueOrErrors.Default.return(ParsedType.Default.lookup(rawFieldType))
      return ValueOrErrors.Default.throw(List([`Invalid type ${JSON.stringify(rawFieldType)} for field ${JSON.stringify(fieldName)}`]))
    }
  }
}