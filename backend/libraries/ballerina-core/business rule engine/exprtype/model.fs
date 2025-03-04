namespace Ballerina.DSL.Expr.Types

#nowarn FS0060

module Model =
  open System
  open Ballerina.Fun
  open Ballerina.Collections.Option
  open Ballerina.Collections.Map
  open Ballerina.Collections.Sum
  open Ballerina.Errors
  open Ballerina.DSL.Expr.Model

  type TypeVarBindings = Map<VarName, ExprType>
  and TypeBinding = { TypeId: TypeId; Type: ExprType }
  and TypeBindings = Map<TypeId, ExprType>
  and TypeId = { TypeName: string }

  and ExprType =
    | UnitType
    | VarType of VarName
    | SchemaLookupType of EntityDescriptorId
    | LookupType of TypeId
    | PrimitiveType of PrimitiveType
    | RecordType of Map<string, ExprType>
    | UnionType of List<UnionCase>
    | MapType of ExprType * ExprType
    | TupleType of List<ExprType>
    | OptionType of ExprType
    | ListType of ExprType
    | SetType of ExprType

  and UnionCase = { CaseName: string; Fields: ExprType }
  and CaseName = { CaseName: string }
  and VarTypes = Map<VarName, ExprType>

  type TypeBinding with
    static member Create(name, exprType) =
      { TypeBinding.TypeId = name
        TypeBinding.Type = exprType }

  type TypeId with
    static member Create name = { TypeName = name }


  type ExprType with
    override t.ToString() : string =
      let (!) (t: ExprType) = t.ToString()

      match t with
      | ExprType.LookupType l -> l.TypeName
      | ExprType.SchemaLookupType l -> l.EntityName
      | ExprType.PrimitiveType p -> p.ToString()
      | ExprType.UnitType -> "()"
      | ExprType.VarType v -> v.VarName
      | ExprType.ListType t -> $"List<{!t}>"
      | ExprType.SetType t -> $"Set<{!t}>"
      | ExprType.OptionType t -> $"Option<{!t}>"
      | ExprType.MapType(k, v) -> $"Map<{!k},{!v}>"
      | ExprType.TupleType ts -> $"({ts |> List.map (!) |> (fun s -> String.Join(',', s))})"
      | ExprType.UnionType cs ->
        let printCase (c: UnionCase) = $"{c.CaseName} of {!c.Fields}"
        $"({cs |> List.map printCase |> (fun s -> String.Join('|', s))})"
      | ExprType.RecordType fs ->
        let printField (fieldName: string, fieldType: ExprType) = $"{fieldName}:{!fieldType}"

        $"({fs
            |> Seq.map ((fun kv -> kv.Key, kv.Value) >> printField)
            |> fun s -> String.Join(';', s)})"

    static member Extend t1 t2 =
      match t1, t2 with
      | RecordType fields1, RecordType fields2 when
        fields1
        |> Map.keys
        |> Set.ofSeq
        |> Set.intersect (fields2 |> Map.keys |> Set.ofSeq)
        |> Set.isEmpty
        ->
        Map.merge (fun a _ -> a) fields1 fields2 |> ExprType.RecordType |> Left
      | _ -> Right(Errors.Singleton $$"""Error: cannot merge types {{t1}} and {{t2}}.""")

    static member GetTypesFreeVars(t: ExprType) : Set<TypeId> =
      let (!) = ExprType.GetTypesFreeVars

      match t with
      | ExprType.UnitType
      | ExprType.VarType _ -> Set.empty
      | ExprType.TupleType ts -> ts |> Seq.map (!) |> Seq.fold (+) Set.empty
      | ExprType.ListType t
      | ExprType.SetType t
      | ExprType.OptionType t -> !t
      | ExprType.LookupType t -> Set.singleton t
      | ExprType.MapType(k, v) -> !k + !v
      | ExprType.SchemaLookupType _
      | ExprType.PrimitiveType _ -> Set.empty
      | ExprType.UnionType cs -> cs |> Seq.map (fun c -> !c.Fields) |> Seq.fold (+) Set.empty
      | ExprType.RecordType fs -> fs |> Map.values |> Seq.map (!) |> Seq.fold (+) Set.empty

    static member Substitute (tvars: TypeVarBindings) (t: ExprType) : ExprType =
      let (!) = ExprType.Substitute tvars
      let (!!) = List.map (!)

      match t with
      | ExprType.LookupType _
      | ExprType.SchemaLookupType _
      | ExprType.PrimitiveType _
      | ExprType.UnitType -> t
      | ExprType.VarType v ->
        match tvars |> Map.tryFind v with
        | None -> t
        | Some t -> t
      | ExprType.ListType t -> ExprType.ListType(!t)
      | ExprType.SetType t -> ExprType.SetType(!t)
      | ExprType.OptionType t -> ExprType.OptionType(!t)
      | ExprType.MapType(k, v) -> ExprType.MapType(!k, !v)
      | ExprType.TupleType ts -> ExprType.TupleType(!!ts)
      | ExprType.UnionType cs -> ExprType.UnionType(cs |> List.map (fun c -> { c with Fields = !c.Fields }))
      | ExprType.RecordType fs -> ExprType.RecordType(fs |> Map.map (fun _ -> (!)))
