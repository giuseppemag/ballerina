namespace Ballerina.DSL.FormEngine.Codegen.Golang.Generator

module Main =

  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open Ballerina.State.WithError
  open Ballerina.DSL.FormEngine.Model
  open Ballerina.DSL.FormEngine.Parser
  open Ballerina.Errors
  open Ballerina.Collections.Sum
  open Ballerina.Core.Object
  open Ballerina.Core.String
  open Ballerina.Core.StringBuilder
  open Ballerina.Core.Json
  open System.Text.RegularExpressions
  open Ballerina.Fun
  open Ballerina.Collections
  open Ballerina.Collections.NonEmptyList
  open Ballerina.DSL.FormEngine.Codegen.Golang.Generator.Model
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.Enum
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.Union
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.Record
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.EnumGETters
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.EnumPOSTers
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.StreamGETters
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.StreamPOSTers

  type PrimitiveType with
    static member GetConfig (config: CodeGenConfig) (p: PrimitiveType) : CodegenConfigTypeDef =
      match p with
      | PrimitiveType.BoolType -> config.Bool
      | PrimitiveType.DateOnlyType -> config.Date
      | PrimitiveType.DateTimeType -> failwith "not implemented - add a CodeGenConfig for float"
      | PrimitiveType.FloatType -> failwith "not implemented - add a CodeGenConfig for float"
      | PrimitiveType.GuidType -> config.Guid
      | PrimitiveType.IntType -> config.Int
      | PrimitiveType.RefType _ -> config.Guid
      | PrimitiveType.StringType -> config.String

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

    static member ToGolangDefaultValue(t: ExprType) =
      let (!) = ExprType.ToGolangDefaultValue

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
        | ExprType.ListType e ->
          let! e = e |> ExprType.ToGolangTypeAnnotation
          return $"{cfg.List.DefaultConstructor}[{e}]()"
        | ExprType.MapType(k, v) ->
          let! k = k |> ExprType.ToGolangTypeAnnotation
          let! v = v |> ExprType.ToGolangTypeAnnotation
          return $"{cfg.Map.DefaultConstructor}[{k}, {v}]()"
        | ExprType.SumType(lt, rt) ->
          let! l = lt |> ExprType.ToGolangTypeAnnotation
          let! r = rt |> ExprType.ToGolangTypeAnnotation
          let! ldef = ExprType.ToGolangDefaultValue(lt)
          return $"{cfg.Sum.LeftConstructor}[{l}, {r}]({ldef})"
        | ExprType.OptionType(e) ->
          let! e = e |> ExprType.ToGolangTypeAnnotation
          return $"{cfg.Option.DefaultConstructor}[{e}]()"
        | ExprType.SetType(e) ->
          let! e = e |> ExprType.ToGolangTypeAnnotation
          return $"{cfg.Set.DefaultConstructor}[{e}]()"
        | ExprType.TupleType(items) ->
          let! e = items |> Seq.map ExprType.ToGolangTypeAnnotation |> state.All
          let! eDefaults = items |> Seq.map ExprType.ToGolangDefaultValue |> state.All

          let! tupleConfig =
            cfg.Tuple
            |> List.tryFind (fun tc -> tc.Ariety = items.Length)
            |> Sum.fromOption (fun () -> Errors.Singleton $"Error: cannot find tuple config for ariety {items.Length}")
            |> state.OfSum

          return $"{tupleConfig.Constructor}[{System.String.Join(',', e)}]({System.String.Join(',', eDefaults)})"
        | ExprType.LookupType(l) -> return $"Default{l.TypeName}()"
        | _ -> return! state.Throw(Errors.Singleton $"Error: not implemented default value for type {t}")
      }

    static member ToGolangTypeAnnotation(t: ExprType) : State<string, CodeGenConfig, GoCodeGenState, Errors> =
      let (!) = ExprType.ToGolangTypeAnnotation

      let error =
        sum.Throw(
          sprintf "Error: cannot generate type annotation for type %A" t
          |> Errors.Singleton
        )
        |> state.OfSum

      let registerImportAndReturn (t: CodegenConfigTypeDef) =
        state {
          do!
            t.RequiredImport
            |> Option.toList
            |> Set.ofList
            |> Set.union
            |> GoCodeGenState.Updaters.UsedImports
            |> state.SetState

          return t.GeneratedTypeName
        }

      state {
        let! config = state.GetContext()

        match t with
        | ExprType.UnitType -> return config.Unit.GeneratedTypeName
        | ExprType.LookupType t -> return t.TypeName
        | ExprType.PrimitiveType p ->
          match p with
          | PrimitiveType.BoolType -> return! config.Bool |> registerImportAndReturn
          | PrimitiveType.DateOnlyType -> return! config.Date |> registerImportAndReturn
          | PrimitiveType.DateTimeType -> return! error
          | PrimitiveType.FloatType -> return! error
          | PrimitiveType.GuidType -> return! config.Guid |> registerImportAndReturn
          | PrimitiveType.IntType -> return! config.Int |> registerImportAndReturn
          | PrimitiveType.RefType r -> return r.EntityName
          | PrimitiveType.StringType -> return! config.String |> registerImportAndReturn
        | ExprType.TupleType items ->
          let! tupleConfig =
            config.Tuple
            |> List.tryFind (fun tc -> tc.Ariety = items.Length)
            |> Sum.fromOption (fun () -> Errors.Singleton $"Error: cannot find tuple config for ariety {items.Length}")
            |> state.OfSum

          do!
            tupleConfig.RequiredImport
            |> Option.toList
            |> Set.ofList
            |> Set.union
            |> GoCodeGenState.Updaters.UsedImports
            |> state.SetState

          let! items = items |> Seq.map (!) |> state.All

          return $"{tupleConfig.GeneratedTypeName}[{System.String.Join(',', items)}]"

        | ExprType.ListType e ->
          let! e = !e

          do!
            config.List.RequiredImport
            |> Option.toList
            |> Set.ofList
            |> Set.union
            |> GoCodeGenState.Updaters.UsedImports
            |> state.SetState

          return $"{config.List.GeneratedTypeName}[{e}]"
        | ExprType.SetType e ->
          let! e = !e

          do!
            config.Set.RequiredImport
            |> Option.toList
            |> Set.ofList
            |> Set.union
            |> GoCodeGenState.Updaters.UsedImports
            |> state.SetState

          return $"{config.Set.GeneratedTypeName}[{e}]"
        | ExprType.OptionType e ->
          let! e = !e

          do!
            config.Option.RequiredImport
            |> Option.toList
            |> Set.ofList
            |> Set.union
            |> GoCodeGenState.Updaters.UsedImports
            |> state.SetState

          return $"{config.Option.GeneratedTypeName}[{e}]"
        | ExprType.MapType(k, v) ->
          let! k = !k
          let! v = !v

          do!
            config.Map.RequiredImport
            |> Option.toList
            |> Set.ofList
            |> Set.union
            |> GoCodeGenState.Updaters.UsedImports
            |> state.SetState

          return $"{config.Map.GeneratedTypeName}[{k},{v}]"
        | ExprType.SumType(l, r) ->
          let! l = !l
          let! r = !r

          do!
            config.Sum.RequiredImport
            |> Option.toList
            |> Set.ofList
            |> Set.union
            |> GoCodeGenState.Updaters.UsedImports
            |> state.SetState

          return $"{config.Sum.GeneratedTypeName}[{l},{r}]"
        | _ -> return! error
      }

  type ParsedFormsContext with
    static member ToGolang
      (codegenConfig: CodeGenConfig)
      (ctx: ParsedFormsContext)
      (packageName: string)
      (formName: string)
      : Sum<StringBuilder, Errors> =
      let result =
        state {
          let identifierAllowedRegex = Regex codegenConfig.IdentifierAllowedRegex
          let (!) (s: string) = identifierAllowedRegex.Replace(s, "_")

          let entitiesEnum:GolangEnum = 
            { Name = $"{formName}EntitiesEnum"; 
              Cases = 
                ctx.Apis.Entities |> Map.values |> Seq.map fst
                |> Seq.map (fun entityApi -> {| Name = $"{entityApi.TypeId.TypeName}Entity"; Value = $"{entityApi.TypeId.TypeName}" |})
                |> Seq.toList
            }

          let entitiesEnum = GolangEnum.ToGolang  () entitiesEnum

          let entityGETters = GolangEntityGETters.ToGolang () { 
            FunctionName= $"{formName}EntityGETter"
            EntityNotFoundErrorConstructor= codegenConfig.EntityNotFoundError.Constructor
            Entities=
              ctx.Apis.Entities
              |> Map.values
              |> Seq.filter (snd >> Set.contains CrudMethod.Get)
              |> Seq.map fst
              |> Seq.map (fun e -> {| EntityName = e.EntityName; EntityType = e.TypeId.TypeName  |})
              |> List.ofSeq
            }            

          let entityDEFAULTers =
            let entities = 
              {
                GolangEntityGETDEFAULTers.FunctionName = $"{formName}EntityDEFAULTer"
                Entities = 
                  ctx.Apis.Entities
                  |> Map.values
                  |> Seq.filter (snd >> Set.contains CrudMethod.Default)
                  |> Seq.map fst
                  |> Seq.map (fun e -> {| EntityName=e.EntityName; EntityType=e.TypeId.TypeName |})
                  |> List.ofSeq
                EntityNotFoundErrorConstructor = codegenConfig.EntityNotFoundError.Constructor
              }
            GolangEntityGETDEFAULTers.ToGolang () entities

          let entityPOSTers =
            let entities = {
              GolangEntityPOSTers.FunctionName = $"{formName}EntityPOSTer"
              Entities = 
                ctx.Apis.Entities
                |> Map.values
                |> Seq.filter (snd >> Set.contains CrudMethod.Create)
                |> Seq.map fst
                |> Seq.map (fun e -> {| EntityName = e.EntityName; EntityType = e.TypeId.TypeName |})
                |> List.ofSeq
              EntityNotFoundErrorConstructor = codegenConfig.EntityNotFoundError.Constructor
            }
            GolangEntityPOSTers.ToGolang () entities

          let enumCasesGETters =
            let getters = { 
              GolangEnumGETters.FunctionName= $"{formName}EnumGETter"; 
              EnumNotFoundErrorConstructor=codegenConfig.EnumNotFoundError.Constructor; 
              Enums=ctx.Apis.Enums
                |> Map.values
                |> Seq.map (fun e -> {| EnumName=e.EnumName; EnumType=e.UnderlyingEnum.TypeName |})
                |> List.ofSeq }
            GolangEnumGETters.ToGolang () getters

          let enumCasesPOSTters =
            let posters = { 
              GolangEnumPOSTers.FunctionName= $"{formName}EnumPOSTter"; 
              InvalidEnumValueCombinationError=codegenConfig.InvalidEnumValueCombinationError.Constructor; 
              UnitType=codegenConfig.Unit.GeneratedTypeName;
              Enums=ctx.Apis.Enums
                |> Map.values
                |> Seq.map (fun e -> {| EnumName=e.EnumName; EnumType=e.UnderlyingEnum.TypeName |})
                |> List.ofSeq }
            GolangEnumPOSTers.ToGolang () posters                

          let streamGETters =
            let getters = { 
              GolangStreamGETters.FunctionName = $"{formName}StreamGETter"
              Streams = 
                ctx.Apis.Streams
                |> Map.values
                |> Seq.map (fun e -> {| StreamName = e.StreamName; StreamType = e.TypeId.TypeName |})
                |> List.ofSeq              
              StreamNotFoundErrorConstructor = codegenConfig.StreamNotFoundError.Constructor
            }
            GolangStreamGETters.ToGolang () getters

          let streamPOSTters =
            let posters:GolangStreamPOSTers = { 
              GolangStreamPOSTers.FunctionName = $"{formName}StreamPOSTter"
              Streams = 
                ctx.Apis.Streams
                |> Map.values
                |> Seq.map (fun e -> {| StreamName = e.StreamName; StreamType = e.TypeId.TypeName |})
                |> List.ofSeq
              GuidType = codegenConfig.Guid.GeneratedTypeName
              StreamNotFoundErrorConstructor = codegenConfig.StreamNotFoundError.Constructor
            }
            GolangStreamPOSTers.ToGolang () posters

          let customTypes = codegenConfig.Custom.Keys |> Set.ofSeq

          let typesToGenerate =
            ctx.Types |> Map.filter (fun k v -> customTypes |> Set.contains k |> not)

          let customTypes =
            codegenConfig.Custom
            |> Seq.map (fun t ->
              StringBuilder.Many(
                seq {
                  yield StringBuilder.One "\n"
                  yield StringBuilder.One $"type {t.Key} = {t.Value.GeneratedTypeName}"
                  yield StringBuilder.One "\n"
                  yield StringBuilder.One $"func Default{t.Key}() {t.Key} {{"
                  yield StringBuilder.One $"  return {t.Value.DefaultConstructor}();"
                  yield StringBuilder.One "\n"
                  yield StringBuilder.One "}"
                  yield StringBuilder.One "\n"

                }
              ))

          let! generatedTypes =
            state.All(
              typesToGenerate
              |> Seq.map (fun t ->
                state {
                  match t.Value.Type with
                  | ExprType.UnionType cases when
                    cases |> Map.values |> Seq.forall (fun case -> case.Fields.IsUnitType)
                    && cases |> Map.isEmpty |> not
                    ->
                    let enum:GolangEnum = { 
                        Name = $"{t.Key}"; 
                        Cases = 
                          cases |> Map.values 
                          |> Seq.map (fun case -> case.CaseName) 
                          |> Seq.map (fun enumCase -> {| Name = $"{t.Key}{!enumCase}"; Value = $"{enumCase}"|}) 
                          |> Seq.toList
                      }

                    return
                      StringBuilder.Many(
                        seq {
                          yield GolangEnum.ToGolang () enum
                        }
                      )
                  | ExprType.UnionType cases when cases |> Map.isEmpty |> not ->
                    let! caseValues =
                      state.All(
                        cases
                        |> Map.values
                        |> Seq.map (fun case ->
                          state {
                            let! fields = case.Fields |> ExprType.ResolveLookup ctx |> state.OfSum

                            let! (fields:Map<string,ExprType>) =
                              state.Any(
                                NonEmptyList.OfList(
                                  fields |> ExprType.AsRecord |> state.OfSum,
                                  [ case.Fields |> ExprType.AsUnit |> state.OfSum |> state.Map(fun _ -> Map.empty)
                                    state.Return([ "Value", case.Fields ] |> Map.ofList) ]
                                )
                              )

                            let! fields =
                              fields
                              |> Seq.map (fun f ->
                                state {
                                  let! (field:string) = f.Value |> ExprType.ToGolangTypeAnnotation
                                  let! (fieldDefaultValue:string) = f.Value |> ExprType.ToGolangDefaultValue

                                  return
                                    {| FieldName = f.Key
                                       FieldType = field
                                       FieldDefaultValue = fieldDefaultValue |}
                                })
                              |> state.All

                            return {| CaseName = !case.CaseName; Fields = fields |}
                          })
                        |> List.ofSeq
                      )

                    let! caseValues = caseValues |> NonEmptyList.TryOfList |> Sum.fromOption (fun () -> Errors.Singleton "Error: expected non-empty list of cases.") |> state.OfSum

                    let (union:GolangUnion) = {
                      Name = t.Key
                      Cases = caseValues
                    }

                    return GolangUnion.ToGolang () union
                  | _ ->
                    let! fields = ExprType.GetFields t.Value.Type |> state.OfSum
                    let! fields =
                      state.All(fields |> Seq.map (fun (fieldName,field) -> state{
                        let! fieldType = field |> ExprType.ToGolangTypeAnnotation
                        let! fieldDefaultValue = field |> ExprType.ToGolangDefaultValue
                        return {| FieldName = fieldName; FieldType=fieldType; FieldDefaultValue=fieldDefaultValue |}
                    }) |> List.ofSeq)

                    let record = { Name = t.Value.TypeId.TypeName; Fields = fields }
                    return GolangRecord.ToGolang () record
                }
                |> state.WithErrorContext $"...when generating type {t.Value.TypeId.TypeName}")
              |> List.ofSeq
            )


          let entityAPIsWithUPDATE =
            ctx.Apis.Entities
            |> Map.values
            |> Seq.filter (snd >> Set.contains CrudMethod.Update)
            |> Seq.map fst

          let writersBuilder =
            state {
              for e in entityAPIsWithUPDATE do
                let! t =
                  ctx.Types
                  |> Map.tryFindWithError e.TypeId.TypeName "types" "types"
                  |> state.OfSum

                do! ExprType.ToWriter { WriterName = e.EntityName } t.Type |> state.Map ignore
            }

          match writersBuilder.run ((ctx, codegenConfig), Map.empty) with
          | Right(err: Errors, _) -> return! state.Throw err
          | Left(_, newWritersState) ->
            // do System.Console.WriteLine(newWritersState.ToFSharpString)
            let allWriters = newWritersState |> Option.defaultWith (fun () -> Map.empty)

            let writers =
              seq {
                for w in allWriters |> Map.values |> Seq.filter (fun w -> w.Kind.IsGenerated) do
                  yield StringBuilder.One $"type {w.DeltaTypeName} interface {{"
                  yield StringBuilder.One "\n"
                  yield StringBuilder.One $"}}"
                  yield StringBuilder.One "\n\n"

                for w in allWriters |> Map.values |> Seq.filter (fun w -> w.Kind.IsGenerated) do
                  yield StringBuilder.One $"type Writer{w.Name.WriterName}[Delta any] interface {{"
                  yield StringBuilder.One "\n"

                  for wf in w.Fields do
                    match wf.Value with
                    | WriterField.Primitive d ->
                      yield StringBuilder.One $"  {wf.Key}(delta {d.DeltaTypeName}) ({w.DeltaTypeName}, error)"
                      yield StringBuilder.One "\n"
                    | WriterField.Nested nwn ->
                      match allWriters |> Map.tryFind nwn with
                      | Some nw ->
                        yield
                          StringBuilder.One
                            $"  {wf.Key}(nestedDelta {nw.DeltaTypeName}, delta Delta) ({w.DeltaTypeName}, error)"
                      | _ -> ()

                      yield StringBuilder.One "\n"

                  yield StringBuilder.One $"  Zero() ({w.DeltaTypeName}, error)"
                  yield StringBuilder.One "\n"
                  yield StringBuilder.One $"}}"
                  yield StringBuilder.One "\n\n"
              }

            return
              StringBuilder.Many(
                seq {
                  yield! writers
                  yield entityGETters
                  yield entityDEFAULTers
                  yield entityPOSTers
                  yield enumCasesGETters
                  yield enumCasesPOSTters
                  yield streamGETters
                  yield streamPOSTters
                  yield! generatedTypes
                  yield! customTypes
                }
              )
        }

      let result = result |> state.WithErrorContext $"...when generating Go code"

      match result.run (codegenConfig, { UsedImports = Set.empty }) with
      | Right(e, _) -> Right e
      | Left(res, s') ->
        Left(
          let imports =
            match s' with
            | Some s' -> s'.UsedImports
            | _ -> Set.empty

          let imports =
            if ctx.Apis.Enums |> Map.isEmpty |> not then
              imports
              + (codegenConfig.List.RequiredImport |> Option.toList |> Set.ofList)
              + ([ "golang.org/x/exp/slices" ] |> Set.ofList)
            else
              imports

          let imports =
            if ctx.Apis.Enums |> Map.isEmpty |> not then
              imports
              + (codegenConfig.EnumNotFoundError.RequiredImport |> Option.toList |> Set.ofList)
              + (codegenConfig.InvalidEnumValueCombinationError.RequiredImport
                 |> Option.toList
                 |> Set.ofList)
            else
              imports

          let imports =
            if ctx.Apis.Entities |> Map.isEmpty |> not then
              imports
              + (codegenConfig.EntityNotFoundError.RequiredImport |> Option.toList |> Set.ofList)
            else
              imports

          let imports =
            if ctx.Apis.Streams |> Map.isEmpty |> not then
              imports
              + (codegenConfig.StreamNotFoundError.RequiredImport |> Option.toList |> Set.ofList)
            else
              imports

          let imports =
            imports + (codegenConfig.Guid.RequiredImport |> Option.toList |> Set.ofList)

          let imports =
            imports + (codegenConfig.Unit.RequiredImport |> Option.toList |> Set.ofList)

          let imports =
            imports
            + (codegenConfig.Custom
               |> Map.values
               |> Seq.map (fun v -> v.RequiredImport |> Option.toList)
               |> List.concat
               |> Set.ofSeq)

          let heading =
            StringBuilder.One
              $$"""package {{packageName}}

import (
  "fmt"
{{imports |> Seq.map (sprintf "  \"%s\"\n") |> Seq.fold (+) ""}})

"""

          StringBuilder.Many(
            seq {
              yield heading
              yield res
            }
          )
        )
