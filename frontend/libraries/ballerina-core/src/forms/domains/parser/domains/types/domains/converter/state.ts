import { PrimitiveType, PrimitiveTypes } from "../../../built-ins/state";
import { InjectedPrimitives } from "../../../injectables/state";
import { Type } from "../../state";

export const parseTypeFromForm = <T>(type: any, injectedPrimitives?: InjectedPrimitives<T>) : Type => {
  const isPrimitive = typeof type == "string" && PrimitiveTypes.some(_ => _ == type) || injectedPrimitives?.injectedPrimitives.has(type as keyof T) 
  const isString = typeof type == "string"
  const isSingleSelection = typeof type == "object" && "fun" in type && type.fun == "SingleSelection"
  const isMultiSelection = typeof type == "object" && "fun" in type && type.fun == "MultiSelection"
  const isList = typeof type == "object" && "fun" in type && type.fun == "List"
  const isMap = typeof type == "object" && "fun" in type && type.fun == "Map"

  return  isPrimitive ? { kind: "primitive", value: type as PrimitiveType } :
          isString ? { kind: "lookup", name: type } :
          isSingleSelection ? { kind: "application", value: "SingleSelection", name: type.args[0] } :
          isMultiSelection ? { kind: "lookup", value: "MultiSelection", name: type.args[0] } :
          isList ? { kind: "application", value: "List", args: [parseTypeFromForm(type.args[0], injectedPrimitives)] } :
          isMap ? { kind: "application", value: "Map", args: [parseTypeFromForm(type.args[0], injectedPrimitives), parseTypeFromForm(type.args[1], injectedPrimitives)] } :
          type
}
  