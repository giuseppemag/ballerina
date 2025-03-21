namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

module WritersAndDeltas =
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open Ballerina.State.WithError
  open Ballerina.DSL.FormEngine.Model
  open Ballerina.Errors
  open Ballerina.Collections.Sum
  open Ballerina.DSL.FormEngine.Codegen.Golang.Generator.Model

  type ExprType with
    static member ToWriter (writerName: WriterName) (t: ExprType) =
      state {
        let! ((ctx, codegenConfig): ParsedFormsContext * CodeGenConfig) = state.GetContext()
        let! st = state.GetState()
        let customTypes = codegenConfig.Custom.Keys |> Set.ofSeq

        match st |> Map.tryFind writerName with
        | Some w -> return w
        | None ->
          match t with
          | ExprType.RecordType fields ->
            let! fields =
              fields
              |> Seq.map (fun field ->
                state {
                  let! wf = ExprType.ToWriterField writerName field.Key field.Value
                  return field.Key, wf
                })
              |> state.All

            let fields = fields |> Map.ofSeq

            let w =
              { Name = writerName
                DeltaTypeName = $"Delta{writerName.WriterName}"
                Type = t
                Fields = fields
                Kind = WriterKind.Generated }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.UnionType cases ->
            let! cases =
              cases
              |> Seq.map (fun case ->
                state {
                  let! wf = ExprType.ToWriterField writerName case.Key.CaseName case.Value.Fields
                  return case.Key.CaseName, wf
                })
              |> state.All

            let fields = cases |> Map.ofSeq

            let w =
              { Name = writerName
                DeltaTypeName = $"Delta{writerName.WriterName}"
                Type = t
                Fields = fields
                Kind = WriterKind.Generated }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.SumType(a, b) ->
            let! wa = ExprType.ToWriter writerName a
            let! wb = ExprType.ToWriter writerName b

            let w =
              { Name =
                  { WriterName = $"{codegenConfig.Sum.WriterTypeName}[Delta, {wa.DeltaTypeName}, {wb.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.Sum.DeltaTypeName}[Delta, {wa.DeltaTypeName}, {wb.DeltaTypeName}]"
                Type = t
                Fields = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.OptionType(a) ->
            let! wa = ExprType.ToWriter writerName a

            let w =
              { Name = { WriterName = $"{codegenConfig.Option.WriterTypeName}[Delta, {wa.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.Option.DeltaTypeName}[Delta, {wa.DeltaTypeName}]"
                Type = t
                Fields = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.SetType(a) ->
            let! wa = ExprType.ToWriter writerName a

            let w =
              { Name = { WriterName = $"{codegenConfig.Set.WriterTypeName}[Delta, {wa.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.Set.DeltaTypeName}[Delta, {wa.DeltaTypeName}]"
                Type = t
                Fields = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.PrimitiveType(p) ->
            let config = PrimitiveType.GetConfig codegenConfig p

            let w =
              { Name = { WriterName = $"{config.WriterTypeName}[Delta]" }
                DeltaTypeName = $"{config.DeltaTypeName}[Delta]"
                Type = t
                Fields = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.ListType(e) ->
            let! we = ExprType.ToWriter writerName e

            let w =
              { Name = { WriterName = $"{codegenConfig.List.WriterTypeName}[Delta, {we.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.List.DeltaTypeName}[Delta, {we.DeltaTypeName}]"
                Type = t
                Fields = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.MapType(k, v) ->
            let! wk = ExprType.ToWriter writerName k
            let! wv = ExprType.ToWriter writerName v

            let w =
              { Name =
                  { WriterName = $"{codegenConfig.Map.WriterTypeName}[Delta, {wk.DeltaTypeName}, {wv.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.Map.DeltaTypeName}[Delta, {wk.DeltaTypeName}, {wv.DeltaTypeName}]"
                Type = t
                Fields = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.TupleType fields ->
            let! fields = fields |> Seq.map (fun field -> ExprType.ToWriter writerName field) |> state.All
            let fields = fields |> Seq.map (fun field -> field.DeltaTypeName) |> Seq.toList
            let fieldDeltaTypeNames = System.String.Join(',', fields)

            let! tupleConfig =
              codegenConfig.Tuple
              |> Seq.tryFind (fun tc -> tc.Ariety = fields.Length)
              |> Sum.fromOption (fun () -> Errors.Singleton $"Error: missing tuple config for ariety {fields.Length}")
              |> state.OfSum

            let w =
              { Name = { WriterName = $"{tupleConfig.WriterTypeName}[Delta, {fieldDeltaTypeNames}]" }
                DeltaTypeName = $"{tupleConfig.DeltaTypeName}[Delta, {fieldDeltaTypeNames}]"
                Type = t
                Fields = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(Map.add w.Name w)
            return w
          | ExprType.LookupType tn as lt ->
            let! t = ctx.Types |> Map.tryFindWithError tn.TypeName "types" "types" |> state.OfSum

            match codegenConfig.Custom |> Map.tryFind tn.TypeName with
            | Some customType ->
              let w =
                { Name = { WriterName = customType.WriterTypeName }
                  DeltaTypeName = $"{customType.DeltaTypeName}[Delta]"
                  Type = lt
                  Fields = Map.empty
                  Kind = WriterKind.Imported }

              do! state.SetState(Map.add w.Name w)
              return w
            | _ ->
              let! w = ExprType.ToWriter { WriterName = tn.TypeName } t.Type
              do! state.SetState(Map.add w.Name w)
              return w
          | ExprType.UnitType ->
            let w =
              { Name = { WriterName = $"{codegenConfig.Unit.WriterTypeName}[Delta]" }
                DeltaTypeName = $"{codegenConfig.Unit.DeltaTypeName}[Delta]"
                Type = t
                Fields = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(Map.add w.Name w)
            return w
          | _ -> return! state.Throw(Errors.Singleton $"Error: cannot convert type {t} to a Writer.")
      }

    static member ToWriterField (parentName: WriterName) (fieldName: string) (t: ExprType) =
      state {
        let! ((ctx, codegenConfig): ParsedFormsContext * CodeGenConfig) = state.GetContext()

        match t with
        | ExprType.PrimitiveType p ->
          let config = PrimitiveType.GetConfig codegenConfig p
          return WriterField.Primitive({| DeltaTypeName = $"{config.DeltaTypeName}[Delta]" |})
        | ExprType.LookupType tn ->
          let! t = ctx.Types |> Map.tryFindWithError tn.TypeName "types" "types" |> state.OfSum
          let! w = ExprType.ToWriter { WriterName = tn.TypeName } t.Type
          return WriterField.Nested w.Name
        | _ ->
          let! w = ExprType.ToWriter { WriterName = parentName.WriterName + "_" + fieldName } t
          return WriterField.Nested w.Name
      }
