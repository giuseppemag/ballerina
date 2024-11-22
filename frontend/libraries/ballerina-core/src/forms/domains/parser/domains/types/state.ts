import { OrderedMap } from "immutable";

export type FieldName = string;
export type TypeName = string;
export type TypeDefinition = {
  extends: Array<TypeName>;
  name: TypeName;
  fields: OrderedMap<FieldName, Type>;
};
export type Type = {
  kind: "lookup"; name: TypeName;
} | {
  kind: "primitive"; value: "string" | "number" | "maybeBoolean" | "boolean" | "Date" | "CollectionReference";
} | {
  kind: "application"; value: TypeName; args: Array<TypeName>;
};
export const Type = {
  Default: {
    lookup: (name: TypeName): Type => ({ kind: "lookup", name })
  },
  Operations: {
    Equals: (fst: Type, snd: Type): boolean =>
      fst.kind == "lookup" && snd.kind == "lookup" ? fst.name == snd.name :
        fst.kind == "primitive" && snd.kind == "primitive" ? fst.value == snd.value :
          fst.kind == "application" && snd.kind == "application" ?
            fst.value == snd.value &&
            fst.args.length == snd.args.length &&
            fst.args.every((v, i) => v == snd.args[i]) :
            false
  }
}
