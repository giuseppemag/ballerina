namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

module DefaultValues =
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open Ballerina.State.WithError
  open Ballerina.DSL.FormEngine.Model
  open Ballerina.Errors
  open Ballerina.Collections.Sum
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.TypeAnnotations

  type ExprType with
    static member GenerateDefaultValue(t: ExprType) =
      let (!) = ExprType.GenerateDefaultValue

      state {
        let! (cfg: CodeGenConfig) = state.GetContext()

        match t with
        | ExprType.UnitType -> return cfg.Unit.DefaultConstructor
        | ExprType.PrimitiveType p ->
          match p with
          | PrimitiveType.BoolType -> return cfg.Bool.DefaultValue
          | PrimitiveType.IntType -> return cfg.Int.DefaultValue
          | PrimitiveType.DateOnlyType -> return cfg.Date.DefaultValue
          | PrimitiveType.DateTimeType -> return cfg.Date.DefaultValue
          | PrimitiveType.FloatType -> return cfg.Int.DefaultValue
          | PrimitiveType.GuidType -> return cfg.Guid.DefaultValue
          | PrimitiveType.StringType -> return cfg.String.DefaultValue
          | _ -> return! state.Throw(Errors.Singleton $"Error: not implemented default value for primitive type {p}")
        | ExprType.TableType e ->
          let! e = e |> ExprType.GenerateTypeAnnotation
          return $"{cfg.Table.DefaultConstructor}[{e}]()"
        | ExprType.ListType e ->
          let! e = e |> ExprType.GenerateTypeAnnotation
          return $"{cfg.List.DefaultConstructor}[{e}]()"
        | ExprType.MapType(k, v) ->
          let! k = k |> ExprType.GenerateTypeAnnotation
          let! v = v |> ExprType.GenerateTypeAnnotation
          return $"{cfg.Map.DefaultConstructor}[{k}, {v}]()"
        | ExprType.SumType(lt, rt) ->
          let! l = lt |> ExprType.GenerateTypeAnnotation
          let! r = rt |> ExprType.GenerateTypeAnnotation
          let! ldef = ExprType.GenerateDefaultValue(lt)
          return $"{cfg.Sum.LeftConstructor}[{l}, {r}]({ldef})"
        | ExprType.OptionType(e) ->
          let! e = e |> ExprType.GenerateTypeAnnotation
          return $"{cfg.Option.DefaultConstructor}[{e}]()"
        | ExprType.SetType(e) ->
          let! e = e |> ExprType.GenerateTypeAnnotation
          return $"{cfg.Set.DefaultConstructor}[{e}]()"
        | ExprType.TupleType(items) ->
          let! e = items |> Seq.map ExprType.GenerateTypeAnnotation |> state.All
          let! eDefaults = items |> Seq.map ExprType.GenerateDefaultValue |> state.All

          let! tupleConfig =
            cfg.Tuple
            |> List.tryFind (fun tc -> tc.Ariety = items.Length)
            |> Sum.fromOption (fun () -> Errors.Singleton $"Error: cannot find tuple config for ariety {items.Length}")
            |> state.OfSum

          return $"{tupleConfig.Constructor}[{System.String.Join(',', e)}]({System.String.Join(',', eDefaults)})"
        | ExprType.LookupType(l) -> return $"Default{l.TypeName}()"
        | _ -> return! state.Throw(Errors.Singleton $"Error: not implemented default value for type {t}")
      }
