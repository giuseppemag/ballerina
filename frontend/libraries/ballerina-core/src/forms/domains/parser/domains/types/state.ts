import { Map, OrderedMap } from "immutable";
import { BuiltIns } from "../built-ins/state";
import { InjectedPrimitives } from "../injectables/state";

export type FieldName = string;
export type TypeName = string;
export type TypeDefinition = {
  extends: Array<TypeName>;
  name: TypeName;
  fields: OrderedMap<FieldName, Type>;
};
export type PrimitiveTypeName = "string" | "number" | "maybeBoolean" | "boolean" | "Date" | "CollectionReference" | "base64File" | "secret";
export type Type = {
  kind: "lookup"; name: TypeName;
} | {
  kind: "primitive"; value: PrimitiveTypeName;
} | {
  kind: "application"; value: TypeName; args: Array<TypeName>; // args: Array<TypeName | Type>;
};
export const Type = {
  Default: {
    lookup: (name: TypeName): Type => ({ kind: "lookup", name }),
    primitive: (name: PrimitiveTypeName): Type => ({ kind: "primitive", value: name }),
    application: (value: TypeName, args: Array<TypeName>): Type => ({ kind: "application", value, args }),
  },
  Operations: {
    Equals: (fst: Type, snd: Type): boolean =>
      fst.kind == "lookup" && snd.kind == "lookup" ? fst.name == snd.name :
        fst.kind == "primitive" && snd.kind == "primitive" ? fst.value == snd.value :
          fst.kind == "application" && snd.kind == "application" ?
            fst.value == snd.value &&
            fst.args.length == snd.args.length &&
            fst.args.every((v, i) => v == snd.args[i]) :
            false,
    FromName: (types: Map<string, TypeDefinition>, builtIns: BuiltIns, injectedPrimitives?: InjectedPrimitives) => (typeName: string): Type | undefined => {
      const recordTypeName = types.get(typeName)?.name
      if (recordTypeName) return Type.Default.lookup(recordTypeName)
      const primitiveTypeName = (builtIns.primitives.get(typeName) && typeName)  ?? (injectedPrimitives?.injectedPrimitives.get(typeName) && typeName)
      if (primitiveTypeName) return Type.Default.primitive(primitiveTypeName as any)
      return undefined
    }
  }
}

