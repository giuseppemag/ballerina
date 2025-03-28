namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

module WritersAndDeltas =
  open System
  open Ballerina.Core.Object
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open Ballerina.State.WithError
  open Ballerina.DSL.FormEngine.Model
  open Ballerina.Errors
  open Ballerina.Collections.Sum
  open Ballerina.DSL.FormEngine.Codegen.Golang.Generator.Model
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.TypeAnnotations

  type ExprType with
    static member ToWriter (writerName: WriterName) (t: ExprType) =
      let add (w: Writer) = Map.add (w.Name, w.Type) w

      let toGolangTypeAnnotation t =
        state {
          let! ((ctx, codegenConfig): ParsedFormsContext * CodeGenConfig) = state.GetContext()

          match (t |> ExprType.ToGolangTypeAnnotation).run (codegenConfig, { UsedImports = Set.empty }) with
          | Right(err, _) -> return! state.Throw err
          | Left(t_a, _) -> return t_a
        }

      state {
        let! ((ctx, codegenConfig): ParsedFormsContext * CodeGenConfig) = state.GetContext()
        let! st = state.GetState()
        let customTypes = codegenConfig.Custom.Keys |> Set.ofSeq

        match st |> Map.tryFind (writerName, t) with
        | Some w -> return w
        | None ->
          match t with
          | ExprType.RecordType fields ->
            let! fields =
              fields
              |> Seq.map (fun field ->
                state {
                  let! wf = ExprType.ToWriterComponent writerName field.Key field.Value
                  return field.Key, wf
                })
              |> state.All

            let fields = fields |> Map.ofSeq

            let w =
              { Name = writerName
                DeltaTypeName = $"Delta{writerName.WriterName}"
                Type = t
                Components = fields
                Kind = WriterKind.Generated }

            do! state.SetState(w |> add)
            return w
          | ExprType.UnionType cases ->
            let! cases =
              cases
              |> Seq.map (fun case ->
                state {
                  let! wf = ExprType.ToWriterComponent writerName case.Key.CaseName case.Value.Fields
                  return case.Key.CaseName, wf
                })
              |> state.All

            let fields = cases |> Map.ofSeq

            let w =
              { Name = writerName
                DeltaTypeName = $"Delta{writerName.WriterName}"
                Type = t
                Components = fields
                Kind = WriterKind.Generated }

            do! state.SetState(add w)
            return w
          | ExprType.SumType(a, b) ->
            let! wa = ExprType.ToWriter { WriterName = $"{writerName.WriterName}_left" } a
            let! wb = ExprType.ToWriter { WriterName = $"{writerName.WriterName}_right" } b

            let! a_annotation = toGolangTypeAnnotation a
            let! b_annotation = toGolangTypeAnnotation b

            let w =
              { Name = { WriterName = $"SumWriter[{wa.DeltaTypeName}, {wb.DeltaTypeName}]" }
                DeltaTypeName =
                  $"{codegenConfig.Sum.DeltaTypeName}[{a_annotation}, {b_annotation}, {wa.DeltaTypeName}, {wb.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(add w)
            return w
          | ExprType.OptionType(a) ->
            let! wa = ExprType.ToWriter { WriterName = $"{writerName.WriterName}_Value" } a

            let! a_annotation = toGolangTypeAnnotation a

            let w =
              { Name = { WriterName = $"OptionWriter[{wa.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.Option.DeltaTypeName}[{a_annotation}, {wa.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(add w)
            return w
          | ExprType.SetType(a) ->
            let! wa = ExprType.ToWriter { WriterName = $"{writerName.WriterName}_Element" } a

            let! a_annotation = toGolangTypeAnnotation a

            let w =
              { Name = { WriterName = $"SetWriter[{wa.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.Set.DeltaTypeName}[{a_annotation}, {wa.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(add w)
            return w
          | ExprType.PrimitiveType(p) ->
            let config = PrimitiveType.GetConfig codegenConfig p

            let w =
              { Name = { WriterName = $"{p.ToString()}Writer" }
                DeltaTypeName = $"{config.DeltaTypeName}"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(add w)
            return w
          | ExprType.ListType(e) ->
            let! we = ExprType.ToWriter { WriterName = $"{writerName.WriterName}_Element" } e

            let! e_annotation = toGolangTypeAnnotation e

            let w =
              { Name = { WriterName = $"ListWriter[{we.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.List.DeltaTypeName}[{e_annotation}, {we.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(add w)
            return w
          | ExprType.MapType(k, v) ->
            let! wk = ExprType.ToWriter { WriterName = $"{writerName.WriterName}_Key" } k
            let! wv = ExprType.ToWriter { WriterName = $"{writerName.WriterName}_Value" } v

            let! k_annotation = toGolangTypeAnnotation k
            let! v_annotation = toGolangTypeAnnotation v

            let w =
              { Name = { WriterName = $"MapWriter[{wk.DeltaTypeName}, {wv.DeltaTypeName}]" }
                DeltaTypeName =
                  $"{codegenConfig.Map.DeltaTypeName}[{k_annotation}, {v_annotation}, {wk.DeltaTypeName}, {wv.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(add w)
            return w
          | ExprType.TupleType fields ->
            let! fields =
              fields
              |> Seq.mapi (fun index field ->
                ExprType.ToWriter { WriterName = $"{writerName.WriterName}_Item{(index + 1)}" } field)
              |> state.All

            let fields = fields |> Seq.map (fun field -> field.DeltaTypeName) |> Seq.toList
            let fieldDeltaTypeNames = System.String.Join(',', fields)

            let! tupleConfig =
              codegenConfig.Tuple
              |> Seq.tryFind (fun tc -> tc.Ariety = fields.Length)
              |> Sum.fromOption (fun () -> Errors.Singleton $"Error: missing tuple config for ariety {fields.Length}")
              |> state.OfSum

            let w =
              { Name = { WriterName = $"TupleWriter[{fieldDeltaTypeNames}]" }
                DeltaTypeName = $"{tupleConfig.DeltaTypeName}[{fieldDeltaTypeNames}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(add w)
            return w
          | ExprType.LookupType tn as lt ->
            let! t = ctx.Types |> Map.tryFindWithError tn.TypeName "types" "types" |> state.OfSum

            match codegenConfig.Custom |> Map.tryFind tn.TypeName with
            | Some customType ->
              let w =
                { Name = { WriterName = $"CustomWriter[{tn.TypeName}]" }
                  DeltaTypeName = $"{customType.DeltaTypeName}"
                  Type = lt
                  Components = Map.empty
                  Kind = WriterKind.Imported }

              do! state.SetState(add w)
              return w
            | _ -> return! ExprType.ToWriter { WriterName = tn.TypeName } t.Type
          | ExprType.UnitType ->
            let w =
              { Name = { WriterName = $"UnitWriter" }
                DeltaTypeName = $"{codegenConfig.Unit.DeltaTypeName}"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(add w)
            return w
          | _ -> return! state.Throw(Errors.Singleton $"Error: cannot convert type {t} to a Writer.")
      }

    static member ToWriterComponent (parentName: WriterName) (componentName: string) (componentType: ExprType) =
      state {
        let! ((ctx, codegenConfig): ParsedFormsContext * CodeGenConfig) = state.GetContext()

        match componentType with
        | ExprType.LookupType tn ->
          let! t = ctx.Types |> Map.tryFindWithError tn.TypeName "types" "types" |> state.OfSum
          let! w = ExprType.ToWriter { WriterName = tn.TypeName } t.Type
          return w.Name, t.Type
        | _ ->
          let! w = ExprType.ToWriter { WriterName = $"{parentName.WriterName}_{componentName}" } componentType
          return w.Name, componentType
      }
