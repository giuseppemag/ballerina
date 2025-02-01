import { Map, List, Set, OrderedMap, is } from "immutable"
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { BasicFun } from "../../../../../fun/state";
import { InjectedPrimitives, Maybe, Type, TypeDefinition, TypeName } from "../../../../../../main";
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
  "secret": ApiConverter<string>
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
        //TODO: fix this in the validator
        let custom = types.get(t[0].toUpperCase() + t.slice(1))
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

export const fromAPIRawValue = <T>(t: Type, types: Map<TypeName, TypeDefinition>, builtIns: BuiltIns, converters: BuiltInApiConverters, injectedPrimitives?: InjectedPrimitives<T>) => (raw: any): any => {
  if (raw == undefined) {
    return defaultValue(types, builtIns, injectedPrimitives)(t.kind == "primitive" ? t.value : t.kind == "lookup" ? t.name : t.value)
  }

  if (t.kind == "primitive") {
    return converters[t.value].fromAPIRawValue(raw)
  } else if (t.kind == "application") { // application here means "generic type application"
    if (t.value == "SingleSelection" && t.args.length == 1) {
      let result = converters[t.value].fromAPIRawValue(raw)
      result = CollectionSelection().Updaters.left(
        fromAPIRawValue({ kind: "lookup", name: t.args[0] as string}, types, builtIns, converters, injectedPrimitives))(result)
      return result
    }
    if ((t.value == "Multiselection" || t.value == "MultiSelection") && t.args.length == 1) {
      let result = converters["MultiSelection"].fromAPIRawValue(raw)
      result = result.map(fromAPIRawValue({ kind: "lookup", name: t.args[0] as string}, types, builtIns, converters, injectedPrimitives))
      return result
    }
    if (t.value == "List" && t.args.length == 1) {
      let result = converters[t.value].fromAPIRawValue(raw)
      const isPrimitive = PrimitiveTypes.some(_ => _ == t.args[0]) || injectedPrimitives?.injectedPrimitives.has(t.args[0] as keyof T) 
      result = result.map(fromAPIRawValue(
        isPrimitive ?
          { kind: "primitive", value: t.args[0] as PrimitiveType }
          : { kind: "lookup", name: t.args[0] as string }
        , types, builtIns, converters, injectedPrimitives))
      return result
    }
    if (t.value == "Map" && t.args.length == 2) {
      let result = converters[t.value].fromAPIRawValue(raw)

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
            types, builtIns, converters, injectedPrimitives)(keyValue[0]),
        fromAPIRawValue(
          typeof t.args[1] == "string" ? 
            isValuePrimitive ?
              { kind: "primitive", value: t.args[1] as PrimitiveType }
            : { kind: "lookup", name: t.args[1] }
          :
            t.args[1], 
            types, builtIns, converters, injectedPrimitives)(keyValue[1]),
      ])
      )
      return result
    }
  } else { // t.kind == lookup: we are dealing with a record/object
    let result: any = { ...raw }
    const tDef = types.get(t.name)!
    tDef.fields.forEach((fieldType, fieldName) => {
      const fieldValue = raw[fieldName]
      result[fieldName] = fromAPIRawValue(fieldType, types, builtIns, converters, injectedPrimitives)(fieldValue)
    })
    return result
  }
  console.error(`unsupported type ${JSON.stringify(t)}, returning the obj value right away`)
  return raw
}

export const toAPIRawValue = <T>(t: Type, types: Map<TypeName, TypeDefinition>, builtIns: BuiltIns, converters: BuiltInApiConverters, injectedPrimitives?: InjectedPrimitives<T>) => (raw: any, formState: any) : ValueOrErrors<any, string> => {
  if (t.kind == "primitive") {
    return ValueOrErrors.Operations.Return(converters[t.value].toAPIRawValue([raw, formState.modifiedByUser] as never))
  } else if (t.kind == "application") { // application here means "generic type application"
    if (t.value == "SingleSelection" && t.args.length == 1) {
      const result = converters[t.value].toAPIRawValue([raw, formState.modifiedByUser])
      if(typeof result != "object") return ValueOrErrors.Operations.Return(result)
      
      return toAPIRawValue({ kind:"lookup", name:t.args[0] as string }, types, builtIns, converters, injectedPrimitives)(result, formState)
    }
    if ((t.value == "Multiselection" || t.value == "MultiSelection") && t.args.length == 1) {
      const result = converters["MultiSelection"].toAPIRawValue([raw, formState.modifiedByUser])

      return ValueOrErrors.Operations.All(List<ValueOrErrors<any, string>>(result.map((_:any) =>
        typeof _ == "object" ? toAPIRawValue({ kind:"lookup", name: t.args[0] as string }, types, builtIns, converters, injectedPrimitives)(_, formState) : ValueOrErrors.Operations.Return(_))))
    }
    if (t.value == "List" && t.args.length == 1) {
      const converterResult = converters[t.value].toAPIRawValue([raw, formState.modifiedByUser])
      return ValueOrErrors.Operations.All(List<ValueOrErrors<any, string>>(converterResult.map((item: any, index: number) =>
        toAPIRawValue(
          t.args[0],
          types, builtIns, converters, injectedPrimitives)(item,
            formState.elementFormStates.get(index)
      ))))
    }
    if (t.value == "Map" && t.args.length == 2) {
      const [converterResult, toIdentiferAndDisplayName] = converters[t.value].toAPIRawValue([raw, formState.modifiedByUser])
      const parsedMap: List<ValueOrErrors<{key: ValueOrErrors<any, any>, value: ValueOrErrors<any, any>}, any>> = converterResult.map((keyValue: any, index: number) => {
        const possiblyUndefinedKey = toAPIRawValue(
            t.args[0],
            types, builtIns, converters, injectedPrimitives)(keyValue[0], formState.elementFormStates.get(index).KeyFormState
          )

          const key: ValueOrErrors<any, string> = (() => {
            if(possiblyUndefinedKey.kind == "value" && (possiblyUndefinedKey.value == undefined || possiblyUndefinedKey.value == null || possiblyUndefinedKey.value == "" || (typeof possiblyUndefinedKey.value == "object" && Object.keys(possiblyUndefinedKey.value).length == 0))) {
              return ValueOrErrors.Operations.Throw(List([`A mapped key is undefined for type ${JSON.stringify(t.args[0])}`]))
            }
            return possiblyUndefinedKey
          })()

          const value = toAPIRawValue(
            t.args[1],
            types, builtIns, converters, injectedPrimitives)(keyValue[1], formState.elementFormStates.get(index).ValueFormState
          )

          return key.kind == "errors" || value.kind == "errors" ? ValueOrErrors.Operations.All(List([key, value]))  : ValueOrErrors.Default.return({key: key.value, value: value.value})
        }
      )
      
      const nonUniqueKeyErrors = parsedMap.filter(_ => _.kind == "value").reduce((acc, _) => { 
        const [id, displayName] = toIdentiferAndDisplayName(_.value.key)
        acc.ids.contains(id) ? acc.errors = acc.errors.push(ValueOrErrors.Default.throw(List([`Keys in the map are not unique: ${displayName}`]))) : acc.ids = acc.ids.push(id)
        return acc
      }, {ids: List<string>(), errors: List<ValueOrErrors<any, string>>()}).errors

      return ValueOrErrors.Operations.All(parsedMap.concat(nonUniqueKeyErrors))
    }
  } else { // t.kind == lookup: we are dealing with a record/object or extended type 
    const convertMap = (typeDefinition: TypeDefinition, isExtended: boolean) => (typeDefinition).fields.mapEntries(([fieldName, fieldType] ) => {
      const fieldValue = raw[fieldName]
      const fieldFormState = isExtended ? formState : formState.formFieldStates[fieldName]
      const converted = toAPIRawValue(fieldType, types, builtIns, converters, injectedPrimitives)(fieldValue, fieldFormState)
      return [fieldName, converted]
    })

    const tDef = types.get(t.name)!
    if (!tDef) debugger
    const isExtended = "extends" in tDef && tDef.extends.length == 1
    // Check for deprecated primitive CollectionReference - later should return error in this case
    if(isExtended && !types.has(tDef.extends[0])) {
      console.warn(`Deprecated: Primitive Collection Reference. Please use a CollectionReference in the form config instead. Cannot find type ${tDef.extends[0]} when resolving toAPIRawValue, assuming the deprecated primitive CollectionReference is being used.`)
      return ValueOrErrors.Operations.Return(converters["CollectionReference"].toAPIRawValue([raw, formState.modifiedByUser] as never))
    }

    const extendedTDef = isExtended ? types.get(tDef.extends[0])! : undefined;

    const convertedMap = extendedTDef ? convertMap(extendedTDef, true) : convertMap(tDef, false)

    if(convertedMap.some((valueOrError) => valueOrError.kind == "errors")) {
      const propertiesWithErrors = convertedMap.filter((valueOrError) => valueOrError.kind == "errors")
      const namedErrors = propertiesWithErrors.map((value, key) => value.MapErrors(_ => _.map((_: string) => `${key}: ${_}`)))
      return ValueOrErrors.Operations.All(List<ValueOrErrors<any, string>>(namedErrors.valueSeq().toList()))
    }
    return ValueOrErrors.Operations.Return(convertedMap.map(valueOrError => valueOrError.kind == "value" ? valueOrError.value : valueOrError.errors).toJS())
  }
  return ValueOrErrors.Operations.Return(defaultValue(types, builtIns, injectedPrimitives)(t.value))
}
