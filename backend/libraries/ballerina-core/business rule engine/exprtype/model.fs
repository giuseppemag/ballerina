namespace Ballerina.Expr
  #nowarn FS0060
  open System
  open Ballerina.Fun
  open Ballerina.Option
  open Ballerina.Collections.Map
  open Ballerina.Sum
  open Ballerina.Errors
  open Ballerina.Expr

  type TypeVarBindings = Map<VarName, ExprType>
  and TypeBinding = { TypeId:TypeId; Type:ExprType }
  and TypeBindings = Map<TypeId, ExprType>
  and TypeId = { TypeName:string; TypeId:Guid }
  and UnificationConstraints = { Equalities:Set<VarName * VarName> }
  and ExprType = 
    | UnitType
    | VarType of VarName
    | SchemaLookupType of EntityDescriptorId 
    | LookupType of TypeId
    | PrimitiveType of PrimitiveType 
    | RecordType of Map<string,ExprType> 
    | UnionType of List<UnionCase>
    | MapType of ExprType * ExprType
    | TupleType of List<ExprType>
    | OptionType of ExprType
    | ListType of ExprType
    | SetType of ExprType
  and UnionCase = { CaseName:string; Fields:ExprType }
  and CaseName = { CaseName:string }
  and VarTypes = Map<VarName, ExprType>

  type UnificationConstraints with
    static member Zero() = { UnificationConstraints.Equalities=Set.empty }
    static member Add (v1:VarName, v2:VarName) (constraints:UnificationConstraints) : UnificationConstraints = 
      { 
        constraints with Equalities = constraints.Equalities |> Set.add (v1,v2) |> Set.add (v2,v1)
      }
    static member (+) (constraints1:UnificationConstraints,constraints2:UnificationConstraints) : UnificationConstraints = 
      { Equalities=constraints1.Equalities + constraints2.Equalities }
    static member Singleton (v1:VarName, v2:VarName) : UnificationConstraints = 
      UnificationConstraints.Zero() |> UnificationConstraints.Add(v1,v2)
    static member ToEquivalenceClasses (constraints:UnificationConstraints) : List<Set<VarName>> =
      let mutable result:Map<VarName, Set<VarName>> = Map.empty    
      for (v1,v2) in constraints.Equalities do
        let v1Equivalence = (result |> Map.tryFind v1 |> Option.defaultWith (fun () -> Set.empty)) + Set.singleton v2
        let v2Equivalence = (result |> Map.tryFind v2 |> Option.defaultWith (fun () -> Set.empty)) + Set.singleton v1
        let newJoinedEquivalence = v1Equivalence + v2Equivalence
        let modifiedConstraints = newJoinedEquivalence |> Set.toSeq |> Seq.map (fun v -> v, newJoinedEquivalence) |> Map.ofSeq
        result <- result |> Map.merge (fun oldConstraint newConstraint -> newConstraint) modifiedConstraints
      result |> Map.values |> Set.ofSeq |> Set.toList

  type TypeBinding with
    static member Create (name,exprType) = { TypeBinding.TypeId=name; TypeBinding.Type=exprType }

  type TypeId with
    static member Create name = { TypeName=name; TypeId=Guid.CreateVersion7() }


  type ExprType with
    override t.ToString () : string = 
      let (!) (t:ExprType) = t.ToString()
      match t with
      | ExprType.LookupType l -> l.TypeName
      | ExprType.SchemaLookupType l -> l.EntityName
      | ExprType.PrimitiveType p -> p.ToString()
      | ExprType.UnitType -> "()"
      | ExprType.VarType v -> v.VarName
      | ExprType.ListType t -> $"List<{!t}>"
      | ExprType.SetType t -> $"Set<{!t}>"
      | ExprType.OptionType t -> $"Option<{!t}>"
      | ExprType.MapType(k,v) -> $"Map<{!k},{!v}>"
      | ExprType.TupleType ts -> $"({ts |> List.map (!) |> fun s -> String.Join(',', s)})"
      | ExprType.UnionType cs -> 
        let printCase (c:UnionCase) = $"{c.CaseName} of {!c.Fields}"
        $"({cs |> List.map printCase |> fun s -> String.Join('|', s)})"
      | ExprType.RecordType fs ->
        let printField (fieldName:string,fieldType:ExprType) = $"{fieldName}:{!fieldType}"
        $"({fs |> Seq.map ((fun kv -> kv.Key,kv.Value) >> printField) |> fun s -> String.Join(';', s)})"

    static member Extend t1 t2 =
      match t1, t2 with
      | RecordType fields1, RecordType fields2 
        when fields1 |> Map.keys |> Set.ofSeq |> Set.intersect (fields2 |> Map.keys |> Set.ofSeq) |> Set.isEmpty
        -> Map.merge (fun a _ -> a) fields1 fields2 |> ExprType.RecordType |> Left
      | _ -> Right(Errors.Singleton $$"""Error: cannot merge types {{t1}} and {{t2}}.""")
    static member GetTypesFreeVars (t:ExprType) : Set<TypeId> = 
      let (!) = ExprType.GetTypesFreeVars
      match t with
      | ExprType.UnitType | ExprType.VarType _ -> Set.empty
      | ExprType.TupleType ts -> ts |> Seq.map (!) |> Seq.fold (+) Set.empty
      | ExprType.ListType t
      | ExprType.SetType t
      | ExprType.OptionType t -> !t
      | ExprType.LookupType t -> Set.singleton t
      | ExprType.MapType(k,v) -> !k + !v
      | ExprType.SchemaLookupType _ 
      | ExprType.PrimitiveType _ -> Set.empty
      | ExprType.UnionType cs -> cs |> Seq.map (fun c -> !c.Fields) |> Seq.fold (+) Set.empty
      | ExprType.RecordType fs -> fs |> Map.values |> Seq.map (!) |> Seq.fold (+) Set.empty
    static member Substitute (tvars:TypeVarBindings) (t:ExprType) : ExprType = 
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
      | ExprType.MapType(k,v) -> ExprType.MapType(!k,!v)
      | ExprType.TupleType ts -> ExprType.TupleType(!!ts)
      | ExprType.UnionType cs -> ExprType.UnionType(cs |> List.map (fun c -> { c with Fields = !c.Fields }))
      | ExprType.RecordType fs -> ExprType.RecordType(fs |> Map.map (fun _ -> (!)))
    static member Unify (tvars:TypeVarBindings) (typedefs:Map<TypeId, ExprType>) (t1:ExprType) (t2:ExprType) : Sum<UnificationConstraints, Errors> = 
      let (=?=) = ExprType.Unify tvars typedefs
      sum{
        match t1,t2 with
        | ExprType.VarType v1, ExprType.VarType v2 -> 
          match tvars |> Map.tryFind v1, tvars |> Map.tryFind v2  with 
          | Some v1, Some v2 -> 
            if v1 = v2 then return UnificationConstraints.Zero()
            else return! sum.Throw(Errors.Singleton($"Error: types {t1} and {t2} cannot be unified"))
          | _ -> 
            return UnificationConstraints.Singleton(v1,v2)
        | t, ExprType.LookupType tn
        | ExprType.LookupType tn, t -> 
          match typedefs |> Map.tryFind tn with
          | None -> return! sum.Throw(Errors.Singleton($"Error: types {t1} and {t2} cannot be unified"))
          | Some t' -> return! t =?= t'
        | ExprType.ListType(t1), ExprType.ListType(t2) 
        | ExprType.SetType(t1), ExprType.SetType(t2) 
        | ExprType.OptionType(t1), ExprType.OptionType(t2) -> 
          return! t1 =?= t2
        | ExprType.MapType(k1,v1),ExprType.MapType(k2,v2) -> 
          let! partialUnifications = sum.All([k1 =?= k2; v1 =?= v2])
          return partialUnifications |> Seq.fold (+) (UnificationConstraints.Zero())
        | ExprType.TupleType([]), ExprType.TupleType([]) -> 
          return UnificationConstraints.Zero()
        | ExprType.TupleType(t1::ts1), ExprType.TupleType(t2::ts2) -> 
          let! partialUnifications = sum.All([t1 =?= t2; ExprType.TupleType(ts1) =?= ExprType.TupleType(ts2)])
          return partialUnifications |> Seq.fold (+) (UnificationConstraints.Zero())
        | ExprType.TupleType(_), ExprType.TupleType(_) -> 
          return! sum.Throw(Errors.Singleton($"Error: tuples of different length {t1} and {t2} cannot be unified"))
        | ExprType.UnionType([]), ExprType.UnionType([]) -> 
          return UnificationConstraints.Zero()
        | ExprType.UnionType(t1::ts1), ExprType.UnionType(t2::ts2) -> 
          if t1.CaseName <> t2.CaseName then 
            return! sum.Throw(Errors.Singleton($"Error: cases {t1} and {t2} cannot be unified"))
          else
            let! partialUnifications = sum.All([t1.Fields =?= t2.Fields; ExprType.UnionType(ts1) =?= ExprType.UnionType(ts2)])
            return partialUnifications |> Seq.fold (+) (UnificationConstraints.Zero())
        | ExprType.UnionType(_), ExprType.UnionType(_) -> 
          return! sum.Throw(Errors.Singleton($"Error: unions of different length {t1} and {t2} cannot be unified"))
        | ExprType.RecordType(m1), ExprType.RecordType(m2) when m1 |> Map.isEmpty && m2 |> Map.isEmpty -> 
          return UnificationConstraints.Zero()
        | ExprType.RecordType(m1), ExprType.RecordType(m2) -> 
          match m1 |> Seq.tryHead with
          | None -> 
            return! sum.Throw(Errors.Singleton($"Error: records of different length {t1} and {t2} cannot be unified"))
          | Some first1 -> 
            let m1 = m1 |> Map.remove first1.Key
            match m2 |> Map.tryFind first1.Key with
            | None ->
              return! sum.Throw(Errors.Singleton($"Error: record fields {t1} and {t2} cannot be unified"))
            | Some first2 ->
              let m2 = m2 |> Map.remove first1.Key
              let! partialUnifications = sum.All([first1.Value =?= first2; ExprType.RecordType(m1) =?= ExprType.RecordType(m2)])
              return partialUnifications |> Seq.fold (+) (UnificationConstraints.Zero())
        | ExprType.VarType v, t 
        | t, ExprType.VarType v -> 
          return UnificationConstraints.Zero()
        | _ -> 
          if t1 = t2 then return UnificationConstraints.Zero()
          else return! sum.Throw(Errors.Singleton($"Error: types {t1} and {t2} cannot be unified"))
      }
