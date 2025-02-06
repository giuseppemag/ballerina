import { Map, List, Set, OrderedMap } from "immutable"
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { BasicFun } from "../../../../../fun/state";
import { InjectedPrimitives, Maybe, ParsedType, TypeName } from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";

const sortObjectKeys = (obj: Record<string, any>) =>
  Object.keys(obj)
      .sort()
      .reduce((sortedObj, key) => {
      sortedObj[key] = obj[key]!;
      return sortedObj;
      }, {} as any);
  
const simpleMapKeyToIdentifer = (key: any): string  => {
  if(typeof key == "object")
    return JSON.stringify(sortObjectKeys(key));
  return JSON.stringify(key);
}

export const PrimitiveTypes =
  [ 
    "guid", //resolves to string
    "string",
    "number",
    "boolean",
    "maybeBoolean",
    "Date",
    "base64File",
    "secret",
  ] as const
export type PrimitiveType = (typeof PrimitiveTypes)[number]

export const GenericTypes = [
  "SingleSelection",
  "MultiSelection",
  "List",
  "Map",
  "Union"
] as const
export type GenericType = (typeof GenericTypes)[number]

export type ApiConverter<T> =  { fromAPIRawValue: BasicFun<any, T>, toAPIRawValue: BasicFun<[T, boolean], any> }
export type ApiConverters<T extends {[key in keyof T]: {type: any, state: any}}> = {[key in keyof T]: ApiConverter<T[key]["type"]> } & BuiltInApiConverters

export type BuiltInApiConverters = {
  "string": ApiConverter<string>
  "number": ApiConverter<number>
  "boolean": ApiConverter<boolean>
  "maybeBoolean": ApiConverter<boolean | undefined>
  "base64File": ApiConverter<string>
  "secret": ApiConverter<string>
  "Date": ApiConverter<Maybe<Date>>
  "SingleSelection": ApiConverter<CollectionSelection<CollectionReference>>
  "MultiSelection": ApiConverter<OrderedMap<string, CollectionReference>>
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
      ["base64File", { renderers: Set(["base64File"]), defaultValue: "" }] as [string, PrimitiveBuiltIn],
      ["secret", { renderers: Set(["secret"]), defaultValue: "" }] as [string, PrimitiveBuiltIn],
    ]),
    "generics": Map([
      ["SingleSelection", { defaultValue: CollectionSelection().Default.right("no selection") }] as [string, GenericBuiltIn],
      ["MultiSelection", { defaultValue: Map() }] as [string, GenericBuiltIn],
      ["List", { defaultValue: List() }] as [string, GenericBuiltIn],
      ["Map", { defaultValue: List() }] as [string, GenericBuiltIn],    
      ["Union", { defaultValue: Map() }] as [string, GenericBuiltIn],
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

export const defaultValue = <T>(types: Map<TypeName, ParsedType<T>>, builtIns: BuiltIns, injectedPrimitives?: InjectedPrimitives<T>) => (t: ParsedType<T>): any => {
  if(t.kind == "primitive") {
    const primitive = builtIns.primitives.get(t.value as string)
    const injectedPrimitive = injectedPrimitives?.injectedPrimitives.get(t.value as keyof T)
    if (primitive != undefined) 
      return primitive.defaultValue
    if (injectedPrimitive != undefined) 
      return injectedPrimitive.defaultValue
  }

  if (t.kind == "application") {
    const generic = builtIns.generics.get(t.value)
    if (generic) 
      return generic.defaultValue
  }

  if(t.kind == "lookup")
    return defaultValue(types, builtIns, injectedPrimitives)(types.get(t.name)!)

  if(t.kind == "form") {
    let res = {} as any
    t.fields.forEach((field, fieldName) => {
      res[fieldName] = defaultValue(types, builtIns, injectedPrimitives)(field)
    })
    return res
  }
  throw Error(`cannot find type ${JSON.stringify(t)} when resolving defaultValue`)
}

export const fromAPIRawValue = <T extends { [key in keyof T]: { type: any; state: any; } }>(t: ParsedType<T>, types: Map<TypeName, ParsedType<T>>, builtIns: BuiltIns, converters: ApiConverters<T>, injectedPrimitives?: InjectedPrimitives<T>) => (raw: any): any => {
  if (raw == undefined) {
    return defaultValue(types, builtIns, injectedPrimitives)(t)
  }

  if (t.kind == "primitive") {
    return converters[t.value].fromAPIRawValue(raw)
  }
  if(t.kind == "union") {
    return CollectionReference.Default.enum(raw)
  }
  if (t.kind == "application") {
    if (t.value == "SingleSelection") {
      return CollectionSelection().Updaters.left(
        fromAPIRawValue(t.args[0], types, builtIns, converters, injectedPrimitives))(converters[t.value].fromAPIRawValue(raw))
    }
    if (t.value == "MultiSelection") {
      return converters["MultiSelection"].fromAPIRawValue(raw).map(fromAPIRawValue(t.args[0], types, builtIns, converters, injectedPrimitives))
    }
    if (t.value == "List") {
      return converters[t.value].fromAPIRawValue(raw).map(fromAPIRawValue(
        t.args[0], types, builtIns, converters, injectedPrimitives))
    }
    if (t.value == "Map" && t.args.length == 2) {
      return converters[t.value].fromAPIRawValue(raw).map(keyValue => ([
        fromAPIRawValue(
            t.args[0], 
            types, builtIns, converters, injectedPrimitives)(keyValue[0]),
        fromAPIRawValue(
            t.args[1], 
            types, builtIns, converters, injectedPrimitives)(keyValue[1]),
      ])
      )
    }
  }

  if(t.kind == "lookup")
    return fromAPIRawValue(types.get(t.name)!, types, builtIns, converters, injectedPrimitives)(raw)

  if(t.kind == "form") {
    let result: any = { ...raw }
    t.fields.forEach((fieldType, fieldName) => {
      const fieldValue = raw[fieldName]
      result[fieldName] = fromAPIRawValue(fieldType, types, builtIns, converters, injectedPrimitives)(fieldValue)
    })
    return result
  }

  console.error(`unsupported type ${JSON.stringify(t)}, returning the obj value right away`)
  return raw
}

export const toAPIRawValue = <T extends { [key in keyof T]: { type: any; state: any; }}>(t: ParsedType<T>, types: Map<TypeName, ParsedType<T>>, builtIns: BuiltIns, converters: ApiConverters<T>, injectedPrimitives?: InjectedPrimitives<T>) => (raw: any, formState: any) : ValueOrErrors<any, string> => {
  if (t.kind == "primitive")
    return ValueOrErrors.Operations.Return(converters[t.value as string | keyof T].toAPIRawValue([raw, formState.modifiedByUser]))
  if(t.kind == "union"){
    return ValueOrErrors.Operations.Return(raw.Value)
  }
  if (t.kind == "application") {
    if (t.value == "SingleSelection") {
      const result = converters[t.value].toAPIRawValue([raw, formState.modifiedByUser])
      if(typeof result != "object") return ValueOrErrors.Operations.Return(result)
      return toAPIRawValue(t.args[0], types, builtIns, converters, injectedPrimitives)(result, formState)
    }
    if ((t.value == "MultiSelection")) {
      const result = converters["MultiSelection"].toAPIRawValue([raw, formState.modifiedByUser])

      return ValueOrErrors.Operations.All(List<ValueOrErrors<any, string>>(result.map((_:any) =>
        typeof _ == "object" ? toAPIRawValue(t.args[0], types, builtIns, converters, injectedPrimitives)(_, formState) : ValueOrErrors.Operations.Return(_))))
    }
    if (t.value == "List") {
      const converterResult = converters[t.value].toAPIRawValue([raw, formState.modifiedByUser])
      return ValueOrErrors.Operations.All(List<ValueOrErrors<any, string>>(converterResult.map((item: any, index: number) =>
        toAPIRawValue(
          t.args[0],
          types, builtIns, converters, injectedPrimitives)(item,
            formState.elementFormStates.get(index)
        ))))
    }
    if (t.value == "Map") {
      const converterResult = List(converters[t.value].toAPIRawValue([raw, formState.modifiedByUser]))
      const parsedMap: List<ValueOrErrors<{key: ValueOrErrors<any, any>, value: ValueOrErrors<any, any>}, any>> = converterResult.map((keyValue: any, index: number) => {
        return toAPIRawValue(
            t.args[0],
            types, builtIns, converters, injectedPrimitives)(keyValue[0], formState.elementFormStates.get(index).KeyFormState
          ).Then(possiblyUndefinedKey => {
              if((possiblyUndefinedKey == undefined || possiblyUndefinedKey == null || possiblyUndefinedKey == "" || (typeof possiblyUndefinedKey == "object" && Object.keys(possiblyUndefinedKey).length == 0))) {
                return ValueOrErrors.Operations.Throw(List([`A mapped key is undefined for type ${JSON.stringify(t.args[0])}`]))
              }
              else return toAPIRawValue(
                  t.args[1],
                  types, builtIns, converters, injectedPrimitives)(keyValue[1], formState.elementFormStates.get(index).ValueFormState
                ).Then(value => {
                  return ValueOrErrors.Default.return({key: possiblyUndefinedKey, value: value})
                }
              )
            }
          )
        }
      )
      
      const nonUniqueKeyErrors = parsedMap.filter(_ => _.kind == "value").reduce((acc, _) => { 
        const id = simpleMapKeyToIdentifer(_.value.key)
        acc.ids.contains(id) ? acc.errors = acc.errors.push(ValueOrErrors.Default.throw(List([`Keys in the map are not unique`]))) : acc.ids = acc.ids.push(id)
        return acc
      }, {ids: List<string>(), errors: List<ValueOrErrors<any, string>>()}).errors

      return ValueOrErrors.Operations.All(parsedMap.concat(nonUniqueKeyErrors)).Then(parsedMap => 
        ValueOrErrors.Default.return(parsedMap.toArray())
      )
    }
  }
  
  if (t.kind == "lookup") 
    return toAPIRawValue(types.get(t.name)!, types, builtIns, converters, injectedPrimitives)(raw, formState)
    
  if(t.kind == "form") {
    const res = [] as any
    t.fields.forEach((fieldType, fieldName) => 
      // nullish coalescing operator on state used for extended type state, but this maybe should have its own kind
      res.push([fieldName, toAPIRawValue(fieldType, types, builtIns, converters, injectedPrimitives)(raw[fieldName], formState['formFieldStates']?.[fieldName] ?? formState)])
    )
    const errors: ValueOrErrors<List<any>, string> = ValueOrErrors.Operations.All(res.map(([_, value]:[_: string, value: ValueOrErrors<any, string>]) => value))
    if(errors.kind == "errors")
      return errors
    
    return ValueOrErrors.Operations.Return(res.reduce((acc: any, [fieldName, value]: [fieldName: string, value: any]) => {
      acc[fieldName] = value.value
      return acc
    }, {} as any))
  }

  return ValueOrErrors.Operations.Return(defaultValue(types, builtIns, injectedPrimitives)(t))
}
