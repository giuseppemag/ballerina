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

  type ExprType with
    static member ToWriter (path: List<string>) (writerName: WriterName) (t: ExprType) =
      let listAdd x xs = x :: xs
      state {
        let! ((ctx, codegenConfig): ParsedFormsContext * CodeGenConfig) = state.GetContext()
        let! st = state.GetState()
        let customTypes = codegenConfig.Custom.Keys |> Set.ofSeq

        match st |> List.tryFind (fun w -> w.Name = writerName) with
        | Some w -> return w
        | None ->
          match t with
          | ExprType.RecordType fields ->
            let! fields =
              fields
              |> Seq.map (fun field ->
                state {
                  let! wf = ExprType.ToWriterField (field.Key :: path) field.Value
                  return field.Key, wf
                })
              |> state.All

            let fields = fields |> Map.ofSeq

            let w =
              { Name = writerName
                DeltaTypeName = $"Delta{writerName.WriterName}"
                Path = path
                Type = t
                Components = fields
                Kind = WriterKind.Generated }

            do! state.SetState(w |> listAdd)
            return w
          | ExprType.UnionType cases ->
            let! cases =
              cases
              |> Seq.map (fun case ->
                state {
                  let! wf = ExprType.ToWriterField (case.Key.CaseName :: path) case.Value.Fields
                  return case.Key.CaseName, wf
                })
              |> state.All

            let fields = cases |> Map.ofSeq

            let w =
              { Name = writerName
                DeltaTypeName = $"Delta{writerName.WriterName}"
                Path = path
                Type = t
                Components = fields
                Kind = WriterKind.Generated }

            do! state.SetState(listAdd w)
            return w
          | ExprType.SumType(a, b) ->
            let! wa = ExprType.ToWriter ("left" :: path) writerName a
            let! wb = ExprType.ToWriter ("right" :: path) writerName b

            let w =
              { Name =
                  { WriterName = $"{codegenConfig.Sum.WriterTypeName}[Delta, {wa.DeltaTypeName}, {wb.DeltaTypeName}]" }
                DeltaTypeName = $"{codegenConfig.Sum.DeltaTypeName}[Delta, {wa.DeltaTypeName}, {wb.DeltaTypeName}]"
                Path = path
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(listAdd w)
            return w
          | ExprType.OptionType(a) ->
            let! wa = ExprType.ToWriter ("value" :: path) writerName a

            let w =
              { Name = { WriterName = $"{codegenConfig.Option.WriterTypeName}[Delta, {wa.DeltaTypeName}]" }
                Path = path
                DeltaTypeName = $"{codegenConfig.Option.DeltaTypeName}[Delta, {wa.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(listAdd w)
            return w
          | ExprType.SetType(a) ->
            let! wa = ExprType.ToWriter ("element" :: path) writerName a

            let w =
              { Name = { WriterName = $"{codegenConfig.Set.WriterTypeName}[Delta, {wa.DeltaTypeName}]" }
                Path = path
                DeltaTypeName = $"{codegenConfig.Set.DeltaTypeName}[Delta, {wa.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(listAdd w)
            return w
          | ExprType.PrimitiveType(p) ->
            let config = PrimitiveType.GetConfig codegenConfig p

            let w =
              { Name = { WriterName = $"{config.WriterTypeName}[Delta]" }
                Path = path
                DeltaTypeName = $"{config.DeltaTypeName}[Delta]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(listAdd w)
            return w
          | ExprType.ListType(e) ->
            let! we = ExprType.ToWriter ("element" :: path) writerName e

            let w =
              { Name = { WriterName = $"{codegenConfig.List.WriterTypeName}[Delta, {we.DeltaTypeName}]" }
                Path = path
                DeltaTypeName = $"{codegenConfig.List.DeltaTypeName}[Delta, {we.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(listAdd w)
            return w
          | ExprType.MapType(k, v) ->
            let! wk = ExprType.ToWriter ("key" :: path) writerName k
            let! wv = ExprType.ToWriter ("value" :: path) writerName v

            let w =
              { Name =
                  { WriterName = $"{codegenConfig.Map.WriterTypeName}[Delta, {wk.DeltaTypeName}, {wv.DeltaTypeName}]" }
                Path = path
                DeltaTypeName = $"{codegenConfig.Map.DeltaTypeName}[Delta, {wk.DeltaTypeName}, {wv.DeltaTypeName}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(listAdd w)
            return w
          | ExprType.TupleType fields ->
            let! fields =
              fields
              |> Seq.mapi (fun index field -> ExprType.ToWriter ($"Item{index + 1}" :: path) writerName field)
              |> state.All

            let fields = fields |> Seq.map (fun field -> field.DeltaTypeName) |> Seq.toList
            let fieldDeltaTypeNames = System.String.Join(',', fields)

            let! tupleConfig =
              codegenConfig.Tuple
              |> Seq.tryFind (fun tc -> tc.Ariety = fields.Length)
              |> Sum.fromOption (fun () -> Errors.Singleton $"Error: missing tuple config for ariety {fields.Length}")
              |> state.OfSum

            let w =
              { Name = { WriterName = $"{tupleConfig.WriterTypeName}[Delta, {fieldDeltaTypeNames}]" }
                Path = path
                DeltaTypeName = $"{tupleConfig.DeltaTypeName}[Delta, {fieldDeltaTypeNames}]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(listAdd w)
            return w
          | ExprType.LookupType tn as lt ->
            let! t = ctx.Types |> Map.tryFindWithError tn.TypeName "types" "types" |> state.OfSum

            match codegenConfig.Custom |> Map.tryFind tn.TypeName with
            | Some customType ->
              let w =
                { Name = { WriterName = $"{customType.WriterTypeName}[Delta]" }
                  Path = path
                  DeltaTypeName = $"{customType.DeltaTypeName}[Delta]"
                  Type = lt
                  Components = Map.empty
                  Kind = WriterKind.Imported }

              do! state.SetState(listAdd w)
              return w
            | _ ->
              let! w = ExprType.ToWriter (tn.TypeName :: path) { WriterName = tn.TypeName } t.Type
              do! state.SetState(listAdd w)
              return w
          | ExprType.UnitType ->
            let w =
              { Name = { WriterName = $"{codegenConfig.Unit.WriterTypeName}[Delta]" }
                Path = path
                DeltaTypeName = $"{codegenConfig.Unit.DeltaTypeName}[Delta]"
                Type = t
                Components = Map.empty
                Kind = WriterKind.Imported }

            do! state.SetState(fun l -> w::l)
            return w
          | _ -> return! state.Throw(Errors.Singleton $"Error: cannot convert type {t} to a Writer.")
      }

    static member ToWriterField (path: List<string>) (t: ExprType) =
      state {
        let! ((ctx, codegenConfig): ParsedFormsContext * CodeGenConfig) = state.GetContext()

        match t with
        | ExprType.LookupType tn ->
          let! t = ctx.Types |> Map.tryFindWithError tn.TypeName "types" "types" |> state.OfSum
          let! w = ExprType.ToWriter path { WriterName = tn.TypeName } t.Type
          return w.Name
        | _ ->
          let! w = ExprType.ToWriter path { WriterName = System.String.Join("_", path |> List.rev) } t
          return w.Name
      }
