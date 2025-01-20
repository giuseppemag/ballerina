import { Map, List, Set, OrderedMap } from "immutable"
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { BasicFun } from "../../../../../fun/state";
import { InjectedPrimitives, Maybe, replaceKeyword, replaceKeywords, revertKeyword, Sum, Type, TypeDefinition, TypeName, Unit, Value } from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";

export const PrimitiveTypes =
  ["string",
    "number",
    "boolean",
    "maybeBoolean",
    "Date",
    "CollectionReference",
    "base64File",
    "secret",
  ] as const
export type PrimitiveType = (typeof PrimitiveTypes)[number]

export const GenericTypes = [
  "SingleSelection",
  "MultiSelection",
  "List",
  "Map"] as const
export type GenericType = (typeof GenericTypes)[number]

export type ApiConverter<T> =  { fromAPIRawValue: BasicFun<any, T>, toAPIRawValue: BasicFun<[T, boolean], any> }
export type ApiConverters<U extends {[key in keyof U]: {type: any, state: any}}> = {[key in keyof U]: ApiConverter<U[key]["type"]> } & BuiltInApiConverters
export type BuiltInApiConverters = {
  "string": ApiConverter<string>
  "number": ApiConverter<number>
  "boolean": ApiConverter<boolean>
  "maybeBoolean": ApiConverter<boolean | undefined>
  "base64File": ApiConverter<string>
  "secret": ApiConverter<string>,
  "Date": ApiConverter<Maybe<Date>>
  "CollectionReference": ApiConverter<CollectionReference>
  "SingleSelection": ApiConverter<CollectionSelection<any>>
  "MultiSelection": ApiConverter<OrderedMap<string, any>>
  "List": ApiConverter<List<any>>,
  "Map": ApiConverter<List<[any, any]>>
}

export type PrimitiveBuiltIn = { renderers: Set<keyof BuiltIns["renderers"]>, defaultValue: any }
export type GenericBuiltIn = { defaultValue: any }
export type BuiltIns = {
  primitives: Map<string, PrimitiveBuiltIn>;
  generics: Map<string, GenericBuiltIn>;
  renderers: {
    boolean: Set<string>;
    maybeBoolean: Set<string>;
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
  let builtins: BuiltIns = {
    "primitives": Map<string, PrimitiveBuiltIn>([
      ["string", { renderers: Set(["string"]), defaultValue: "" }] as [string, PrimitiveBuiltIn],
      ["number", { renderers: Set(["number"]),  defaultValue: 0 }] as [string, PrimitiveBuiltIn],
      ["boolean", { renderers: Set(["boolean"]), defaultValue: false }],
      ["maybeBoolean", { renderers: Set(["maybeBoolean"]), defaultValue: undefined }] as [string, PrimitiveBuiltIn],
      ["date", { renderers: Set(["date"]), defaultValue: undefined }] as [string, PrimitiveBuiltIn],
      ["Date", { renderers: Set(["date"]), defaultValue: undefined }] as [string, PrimitiveBuiltIn],
      ["CollectionReference", { renderers: Set(["enumSingleSelection", "enumMultiSelection", "streamSingleSelection", "streamMultiSelection"]), defaultValue: CollectionReference.Default("", "") }] as [string, PrimitiveBuiltIn],
      ["base64File", { renderers: Set(["base64File"]), defaultValue: "" }] as [string, PrimitiveBuiltIn],
      ["secret", { renderers: Set(["secret"]), defaultValue: "" }] as [string, PrimitiveBuiltIn],
    ]),
    "generics": Map([
      ["SingleSelection", { defaultValue: CollectionSelection().Default.right("no selection") }] as [string, GenericBuiltIn],
      ["Multiselection", { defaultValue: Map() }] as [string, GenericBuiltIn],
      ["List", { defaultValue: List() }] as [string, GenericBuiltIn],
      ["Map", { defaultValue: List() }] as [string, GenericBuiltIn]
    ]),
    "renderers": {
      "boolean": Set(),
      "maybeBoolean": Set(),
      "date": Set(),
      "enumMultiSelection": Set(),
      "enumSingleSelection": Set(),
      "streamMultiSelection": Set(),
      "streamSingleSelection": Set(),
      "number": Set(),
      "string": Set(),
      "list": Set(),
      "base64File": Set(),
      "secret": Set(),
      "map": Set(),
    }
  }
  Object.keys(builtins.renderers).forEach((_categoryName) => {
    const categoryName = _categoryName as keyof BuiltIns["renderers"]
    if (categoryName in fieldViews) {
      Object.keys(fieldViews[categoryName]).forEach(viewName => {
        builtins.renderers[categoryName] = builtins.renderers[categoryName].add(viewName)
      })
    }
  })
  return builtins
}

export const defaultValue = <T>(types: Map<TypeName, TypeDefinition>, builtIns: BuiltIns, injectedPrimitives?: InjectedPrimitives<T>) => (t: TypeName | Type): any => {
  if (typeof t == "string") {
    let primitive = builtIns.primitives.get(t)
    let injectedPrimitive = injectedPrimitives?.injectedPrimitives.get(t as keyof T)
    if(primitive && injectedPrimitive) {
      throw `both primitive and injected primitive are defined for ${t}`
    }
    if (primitive != undefined) {
      return primitive.defaultValue
    } else if (injectedPrimitive != undefined) {
      return injectedPrimitive.defaultValue
    } else {
      let generic = builtIns.generics.get(t)
      if (generic != undefined) {
        return generic.defaultValue
      } else {
        let custom = types.get(t)
        if (custom != undefined) {
          let res = {} as any
          custom.fields.forEach((field, fieldName) => {
            res[fieldName] = defaultValue(types, builtIns, injectedPrimitives)(field.kind == "primitive" ? field.value : field.kind == "lookup" ? field.name : field.value)
          }
          )
          return res
        } else {
          debugger
          throw `cannot find type ${t} when resolving defaultValue`
        }
      }
    }
  } else {
    if (t.kind == "application") {
      const generic = builtIns.generics.get(t.value)
      if (generic) {
        const res = generic.defaultValue
        return res
      }
    }
    debugger
    throw `cannot find type ${t} when resolving defaultValue`
  }
}

export const fromAPIRawValue = <T>(t: Type, types: Map<TypeName, TypeDefinition>, builtIns: BuiltIns, converters: BuiltInApiConverters, isKeywordsReplaced: boolean = false, injectedPrimitives?: InjectedPrimitives<T>) => (raw: any): any => {
  // alert(JSON.stringify(t))
  if (raw == undefined) {
    console.warn(`instantiating default value for type ${JSON.stringify(t)}: the value was undefined so something is missing from the API response`)
    return defaultValue(types, builtIns, injectedPrimitives)(t.kind == "primitive" ? t.value : t.kind == "lookup" ? t.name : t.value)
  }

  const obj = !isKeywordsReplaced ? replaceKeywords(raw, "from api") : raw

  if (t.kind == "primitive") {
    return converters[t.value].fromAPIRawValue(obj)
  } else if (t.kind == "application") { // application here means "generic type application"
    if (t.value == "SingleSelection" && t.args.length == 1) {
      let result = converters[t.value].fromAPIRawValue(obj)
      result = CollectionSelection().Updaters.left(
        fromAPIRawValue({ kind: "lookup", name: t.args[0] }, types, builtIns, converters, true, injectedPrimitives))(result)
      return result
    }
    if ((t.value == "Multiselection" || t.value == "MultiSelection") && t.args.length == 1) {
      let result = converters["MultiSelection"].fromAPIRawValue(obj)
      result = result.map(fromAPIRawValue({ kind: "lookup", name: t.args[0] }, types, builtIns, converters, true, injectedPrimitives))
      return result
    }
    if (t.value == "List" && t.args.length == 1) {
      let result = converters[t.value].fromAPIRawValue(obj)
      const isPrimitive = PrimitiveTypes.some(_ => _ == t.args[0]) || injectedPrimitives?.injectedPrimitives.has(t.args[0] as keyof T) 
      result = result.map(fromAPIRawValue(
        isPrimitive ?
          { kind: "primitive", value: t.args[0] as PrimitiveType }
          : { kind: "lookup", name: t.args[0] }
        , types, builtIns, converters, true, injectedPrimitives))
      return result
    }
    if (t.value == "Map" && t.args.length == 2) {
      console.log("t", t)
      let result = converters[t.value].fromAPIRawValue(obj)

      const isKeyPrimitive = typeof t.args[0] == "string" && PrimitiveTypes.some(_ => _ == t.args[0]) || injectedPrimitives?.injectedPrimitives.has(t.args[0] as keyof T) 
      const isValuePrimitive = typeof t.args[1] == "string" && PrimitiveTypes.some(_ => _ == t.args[1]) || injectedPrimitives?.injectedPrimitives.has(t.args[1] as keyof T) 
      result = result.map(keyValue => ([
        fromAPIRawValue(
          typeof t.args[0] == "string" ? 
            isKeyPrimitive ?
              { kind: "primitive", value: t.args[0] as PrimitiveType }
            : { kind: "lookup", name: t.args[0] }
          :
            t.args[0], 
            types, builtIns, converters, true, injectedPrimitives)(keyValue[0]),
        fromAPIRawValue(
          typeof t.args[1] == "string" ? 
            isValuePrimitive ?
              { kind: "primitive", value: t.args[1] as PrimitiveType }
            : { kind: "lookup", name: t.args[1] }
          :
            t.args[1], 
            types, builtIns, converters, true, injectedPrimitives)(keyValue[1]),
      ])
      )
      return result
    }
  } else { // t.kind == lookup: we are dealing with a record/object
    let result: any = { ...obj }
    const tDef = types.get(t.name)!
    tDef.fields.forEach((fieldType, fieldName) => {
      const replacedFieldName = replaceKeyword(fieldName)
      const fieldValue = obj[replacedFieldName]
      result[replacedFieldName] = fromAPIRawValue(fieldType, types, builtIns, converters, true, injectedPrimitives)(fieldValue)
    })
    return result
  }
  console.error(`unsupported type ${JSON.stringify(t)}, returning the obj value right away`)
  return obj
}

export const toAPIRawValue = <T>(t: Type, types: Map<TypeName, TypeDefinition>, builtIns: BuiltIns, converters: BuiltInApiConverters, isKeywordsReverted: boolean = false, injectedPrimitives?: InjectedPrimitives<T>) => (raw: any, formState: any) : ValueOrErrors<any, string> => {
  const obj = !isKeywordsReverted ? replaceKeywords(raw, "to api") : raw
  if (t.kind == "primitive") {
    return ValueOrErrors.Operations.return(converters[t.value].toAPIRawValue([obj, formState.modifiedByUser] as never))
  } else if (t.kind == "application") { // application here means "generic type application"
    if (t.value == "SingleSelection" && t.args.length == 1) {
      const result = converters[t.value].toAPIRawValue([obj, formState.modifiedByUser])
      if(typeof result != "object") return ValueOrErrors.Operations.return(result)
      
      return toAPIRawValue({ kind:"lookup", name:t.args[0] }, types, builtIns, converters, true, injectedPrimitives)(result, formState)
    }
    if ((t.value == "Multiselection" || t.value == "MultiSelection") && t.args.length == 1) {
      const result = converters["MultiSelection"].toAPIRawValue([obj, formState.modifiedByUser])

      return ValueOrErrors.Operations.all(List<ValueOrErrors<any, string>>(result.map((_:any) =>
        typeof _ == "object" ? toAPIRawValue({ kind:"lookup", name: t.args[0] }, types, builtIns, converters, true, injectedPrimitives)(_, formState) : ValueOrErrors.Operations.return(_))))
    }
    if (t.value == "List" && t.args.length == 1) {
      const converterResult = converters[t.value].toAPIRawValue([obj, formState.modifiedByUser])
      const isPrimitive = PrimitiveTypes.some(_ => _ == t.args[0]) || injectedPrimitives?.injectedPrimitives.has(t.args[0] as keyof T) 
      return ValueOrErrors.Operations.all(List<ValueOrErrors<any, string>>(converterResult.map((item: any, index: number) =>
        toAPIRawValue(
          isPrimitive ?
            { kind:"primitive", value:t.args[0] as PrimitiveType }
          : { kind:"lookup", name:t.args[0] },
          types, builtIns, converters, true, injectedPrimitives)(item,
            formState.elementFormStates.get(index)
      ))))
    }
    if (t.value == "Map" && t.args.length == 2) {
      const [converterResult, toIdentiferAndDisplayName] = converters[t.value].toAPIRawValue([obj, formState.modifiedByUser])
      const isKeyPrimitive = PrimitiveTypes.some(_ => _ == t.args[0]) || injectedPrimitives?.injectedPrimitives.has(t.args[0] as keyof T)
      const isValuePrimitive = PrimitiveTypes.some(_ => _ == t.args[1]) || injectedPrimitives?.injectedPrimitives.has(t.args[1] as keyof T)

      const parsedMap: List<ValueOrErrors<{key: ValueOrErrors<any, any>, value: ValueOrErrors<any, any>}, any>> = converterResult.map((keyValue: any, index: number) => {
        const possiblyUndefinedKey = toAPIRawValue(
          typeof t.args[0] == "string" ? 
            isKeyPrimitive ?
              { kind: "primitive", value: t.args[0] as PrimitiveType }
            : { kind: "lookup", name: t.args[0] }
          :
            t.args[0], 
            types, builtIns, converters, true, injectedPrimitives)(keyValue[0], formState.elementFormStates.get(index).KeyFormState
          )

          const key: ValueOrErrors<any, string> = (() => {
            if(possiblyUndefinedKey.kind == "value" && (possiblyUndefinedKey.value == undefined || possiblyUndefinedKey.value == null || possiblyUndefinedKey.value == "" || (typeof possiblyUndefinedKey.value == "object" && Object.keys(possiblyUndefinedKey.value).length == 0))) {
              return ValueOrErrors.Operations.throw(List([`A mapped key is undefined for type ${JSON.stringify(t.args[0])}`]))
            }
            return possiblyUndefinedKey
          })()

          const value = toAPIRawValue(
            typeof t.args[1] == "string" ? 
              isValuePrimitive ?
                { kind: "primitive", value: t.args[1] as PrimitiveType }
              : { kind: "lookup", name: t.args[1] }
            :
              t.args[1], 
            types, builtIns, converters, true, injectedPrimitives)(keyValue[1], formState.elementFormStates.get(index).ValueFormState)

          return key.kind == "errors" || value.kind == "errors" ? ValueOrErrors.Operations.all(List([key, value]))  : ValueOrErrors.Default.return({key: key.value, value: value.value})
        }
      )
      
      const nonUniqueKeyErrors = parsedMap.filter(_ => _.kind == "value").reduce((acc, _) => { 
        const [id, displayName] = toIdentiferAndDisplayName(_.value.key)
        console.log('in')
        console.log(toIdentiferAndDisplayName(_.value.key))
        console.log(id, displayName)
        acc.ids.contains(id) ? acc.errors = acc.errors.push(ValueOrErrors.Default.throw(List([`Keys in the map are not unique: ${displayName}`]))) : acc.ids = acc.ids.push(id)
        return acc
      }, {ids: List<string>(), errors: List<ValueOrErrors<any, string>>()}).errors

      return ValueOrErrors.Operations.all(parsedMap.concat(nonUniqueKeyErrors))
    }
  } else { // t.kind == lookup: we are dealing with a record/object or extended type 
    const tDef = types.get(t.name)!
    if("extends" in tDef && tDef.extends.length == 1) {
      return ValueOrErrors.Operations.return(converters[(tDef.extends[0] as keyof BuiltInApiConverters)].toAPIRawValue([obj, formState.modifiedByUser] as never))
    }    
    const convertedMap = tDef.fields.mapEntries(([fieldName, fieldType] ) => {
      const revertedFieldName = revertKeyword(fieldName)
      const fieldValue = obj[revertedFieldName]
      const converted = toAPIRawValue(fieldType, types, builtIns, converters, true, injectedPrimitives)(fieldValue, formState[fieldName])
      return [revertedFieldName, converted]
    })
    if(convertedMap.some((valueOrError) => valueOrError.kind == "errors")) {
      const propertiesWithErrors = convertedMap.filter((valueOrError) => valueOrError.kind == "errors")
      const namedErrors = propertiesWithErrors.map((value, key) => value.mapErrors(_ => _.map((_: string) => `${key}: ${_}`)))
      return ValueOrErrors.Operations.all(List<ValueOrErrors<any, string>>(namedErrors.valueSeq().toList()))
    }
    return ValueOrErrors.Operations.return(convertedMap.map(valueOrError => valueOrError.kind == "value" ? valueOrError.value : valueOrError.errors).toJS())
  }
  return ValueOrErrors.Operations.return(defaultValue(types, builtIns, injectedPrimitives)(t.value))
}
