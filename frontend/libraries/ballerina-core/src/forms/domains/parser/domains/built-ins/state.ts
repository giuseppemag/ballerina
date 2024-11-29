import { Map, List, Set, OrderedMap } from "immutable"
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { BasicFun } from "../../../../../fun/state";
import { Option, Sum } from "../../../../../collections/domains/sum/state"
import { Type, TypeDefinition, TypeName } from "../../../../../../main";

export const PrimitiveTypes =
  ["string",
    "number",
    "boolean",
    "maybeBoolean",
    "Date",
    "CollectionReference"] as const
export type PrimitiveType = (typeof PrimitiveTypes)[number]

export const GenericTypes = [
  "SingleSelection",
  "MultiSelection",
  "List"] as const
export type GenericType = (typeof GenericTypes)[number]

export type ApiConverter<T> = { fromAPIRawValue: BasicFun<any, T>, toAPIRawValue: BasicFun<T, any> }
export type ApiConverters = {
  "string": ApiConverter<string>
  "number": ApiConverter<number>
  "boolean": ApiConverter<boolean>
  "maybeBoolean": ApiConverter<boolean | undefined>
  "Date": ApiConverter<Date>
  "CollectionReference": ApiConverter<CollectionReference>
  "SingleSelection": ApiConverter<CollectionSelection<any>>
  "MultiSelection": ApiConverter<OrderedMap<string, any>>
  "List": ApiConverter<List<any>>
}

export type PrimitiveBuiltIn = { renderers: Set<keyof BuiltIns["renderers"]>, apiConverters: ApiConverter<any>, defaultValue: any }
export type GenericBuiltIn = { defaultValue: any, apiConverters: ApiConverter<any> }
export type BuiltIns = {
  primitives: Map<string, PrimitiveBuiltIn>;
  generics: Map<string, GenericBuiltIn>;
  renderers: {
    boolean: Set<string>;
    maybeBoolean: Set<string>;
    number: Set<string>;
    string: Set<string>;
    date: Set<string>;
    enumSingleSelection: Set<string>;
    enumMultiSelection: Set<string>;
    streamSingleSelection: Set<string>;
    streamMultiSelection: Set<string>;
    list: Set<string>;
  };
};

export const builtInsFromFieldViews = (fieldViews: any, fieldTypeConverters: ApiConverters): BuiltIns => {
  let builtins: BuiltIns = {
    "primitives": Map<string, PrimitiveBuiltIn>([
      ["string", { renderers: Set(["string"]), apiConverters: fieldTypeConverters["string"], defaultValue: "" }] as [string, PrimitiveBuiltIn],
      ["number", { renderers: Set(["number"]), apiConverters: fieldTypeConverters["number"], defaultValue: 0 }] as [string, PrimitiveBuiltIn],
      ["boolean", { renderers: Set(["boolean"]), apiConverters: fieldTypeConverters["boolean"], defaultValue: false }],
      ["maybeBoolean", { renderers: Set(["maybeBoolean"]), apiConverters: fieldTypeConverters["maybeBoolean"], defaultValue: undefined }] as [string, PrimitiveBuiltIn],
      ["date", { renderers: Set(["date"]), apiConverters: fieldTypeConverters["Date"], defaultValue: new Date(Date.now()) }] as [string, PrimitiveBuiltIn],
      ["Date", { renderers: Set(["date"]), apiConverters: fieldTypeConverters["Date"], defaultValue: new Date(Date.now()) }] as [string, PrimitiveBuiltIn],
      ["CollectionReference", { renderers: Set(["enumSingleSelection", "enumMultiSelection", "streamSingleSelection", "streamMultiSelection"]), apiConverters: fieldTypeConverters["CollectionReference"], defaultValue: CollectionReference.Default("", "") }] as [string, PrimitiveBuiltIn]
    ]),
    "generics": Map([
      ["SingleSelection", { apiConverters: fieldTypeConverters["SingleSelection"], defaultValue: CollectionSelection().Default.right("no selection") }] as [string, GenericBuiltIn],
      ["Multiselection", { apiConverters: fieldTypeConverters["SingleSelection"], defaultValue: Map() }] as [string, GenericBuiltIn],
      ["List", { apiConverters: fieldTypeConverters["SingleSelection"], defaultValue: List() }] as [string, GenericBuiltIn]
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


export const defaultValue = (types:Map<TypeName, TypeDefinition>, builtIns:BuiltIns) => (t: TypeName): any => {
  let primitive = builtIns.primitives.get(t)
  if (primitive != undefined) {
    return primitive.defaultValue
  } else {
    let generic = builtIns.generics.get(t)
    if (generic != undefined) {
      return generic.defaultValue
    } else {
      let custom = types.get(t)
      if (custom != undefined) {
        let res = {} as any
        custom.fields.forEach((field, fieldName) => {
          res[fieldName] = defaultValue(types, builtIns)(field.kind == "primitive" ? field.value : field.kind == "lookup" ? field.name : field.value)
        }
        )
        return res
      } else {
        throw `cannot find type ${t} when resolving defaultValue`
      }
    }
  }
}

export const fromAPIRawValue = (t:Type, types:Map<TypeName, TypeDefinition>, builtIns:BuiltIns, converters:ApiConverters) => (raw:any) : any => {
  // alert(JSON.stringify(t))
  if (raw == undefined) {
    console.warn(`instantiating default value for type ${JSON.stringify(t)}: the value was undefined so something is missing from the API response`)
    return defaultValue(types, builtIns)(t.kind == "primitive" ? t.value : t.kind == "lookup" ? t.name : t.value)
  }

  if (t.kind == "primitive") {
    return converters[t.value].fromAPIRawValue(raw)
  } else if (t.kind == "application") { // application here means "generic type application"
    if (t.value == "SingleSelection" && t.args.length == 1) {
      let result = converters[t.value].fromAPIRawValue(raw)
      result = CollectionSelection().Updaters.left(
        fromAPIRawValue({ kind:"lookup", name:t.args[0] }, types, builtIns, converters))(result)
      return result
    }
    if ((t.value == "Multiselection" || t.value == "MultiSelection") && t.args.length == 1) {
      let result = converters["MultiSelection"].fromAPIRawValue(raw)
      result = result.map(fromAPIRawValue({ kind:"lookup", name:t.args[0] }, types, builtIns, converters))
      return result
    }
    if (t.value == "List" && t.args.length == 1) {
      let result = converters[t.value].fromAPIRawValue(raw)
      result = result.map(fromAPIRawValue(
        PrimitiveTypes.some(_ => _ == t.args[0]) ?
          { kind:"primitive", value:t.args[0] as PrimitiveType }
        : { kind:"lookup", name:t.args[0] }
        , types, builtIns, converters))
      return result
    }
  } else { // t.kind == lookup: we are dealing with a record/object
    let result:any = {...raw}
    const tDef = types.get(t.name)!
    tDef.fields.forEach((fieldType, fieldName) => {
      const fieldValue = raw[fieldName]
      result[fieldName] = fromAPIRawValue(fieldType, types, builtIns, converters)(fieldValue)
    })
    return result
  }
  console.error(`unsupported type ${JSON.stringify(t)}, returning the raw value right away`)
  return raw
}


export const toAPIRawValue = (t:Type, types:Map<TypeName, TypeDefinition>, builtIns:BuiltIns, converters:ApiConverters) => (raw:any) : any => {
  if (t.kind == "primitive") {
    return converters[t.value].toAPIRawValue(raw as never)
  } else if (t.kind == "application") { // application here means "generic type application"
    if (t.value == "SingleSelection" && t.args.length == 1) {
      let result = converters[t.value].toAPIRawValue(raw)
      if (result != undefined && typeof result == "object")
        result = toAPIRawValue({ kind:"lookup", name:t.args[0] }, types, builtIns, converters)(result)
      return result
    }
    if ((t.value == "Multiselection" || t.value == "MultiSelection") && t.args.length == 1) {
      // alert(`MultiSelect ${JSON.stringify(t)} ${JSON.stringify(raw)}`)
      let result = converters["MultiSelection"].toAPIRawValue(raw)
      // alert(`MultiSelect result1 = ${JSON.stringify(result)}`)
      // alert(`${JSON.stringify(t.args[0])}`)
      result = result.map((_:any) => 
        typeof _ == "object" ? toAPIRawValue({ kind:"lookup", name:t.args[0] }, types, builtIns, converters)(_) : _)
      // alert(`MultiSelect result2 = ${JSON.stringify(result)}`)
      return result
    }
    if (t.value == "List" && t.args.length == 1) {
      let result = converters[t.value].toAPIRawValue(raw)
      result = result.map(toAPIRawValue(
        PrimitiveTypes.some(_ => _ == t.args[0]) ?
          { kind:"primitive", value:t.args[0] as PrimitiveType }
        : { kind:"lookup", name:t.args[0] },
        // { kind:"lookup", name:t.args[0] }, 
        types, builtIns, converters))
      return result
    }
  } else { // t.kind == lookup: we are dealing with a record/object
    let result:any = {...raw}
    const tDef = types.get(t.name)!
    tDef.fields.forEach((fieldType, fieldName) => {
      const fieldValue = raw[fieldName]
      result[fieldName] = toAPIRawValue(fieldType, types, builtIns, converters)(fieldValue)
    })
    return result
  }
  return defaultValue(types, builtIns)(t.value)     
}
