namespace Ballerina.DSL.FormEngine.Codegen

module Golang =

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

  type GoCodeGenState =
    { UsedImports: Set<string> }

    static member Updaters =
      {| UsedImports =
          fun u ->
            fun s ->
              { s with
                  UsedImports = u (s.UsedImports) } |}

  type ExprType with
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
        | ExprType.SumType(l, r) ->
          let! l = l |> ExprType.ToGolangTypeAnnotation
          let! r = r |> ExprType.ToGolangTypeAnnotation
          return $"{cfg.Sum.DefaultConstructor}[{l}, {r}]()"
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

          let entityGETters =
            seq {
              yield StringBuilder.One $"type {formName}EntitiesEnum string"
              yield StringBuilder.One "\n"
              yield StringBuilder.One "const ("
              yield StringBuilder.One "\n"

              for entityApi in ctx.Apis.Entities |> Map.values |> Seq.map fst do
                yield
                  StringBuilder.One
                    $$"""  {{entityApi.TypeId.TypeName}}Entity {{formName}}EntitiesEnum = "{{entityApi.TypeId.TypeName}}" """

                yield StringBuilder.One "\n"

              yield StringBuilder.One ")"
              yield StringBuilder.One "\n"
              yield StringBuilder.One $$"""var All{{formName}}EntitiesEnum = [...]{{formName}}EntitiesEnum{ """

              for entityApi in ctx.Apis.Entities |> Map.values |> Seq.map fst do
                yield StringBuilder.One $$"""{{entityApi.TypeId.TypeName}}Entity, """

              yield StringBuilder.One "}\n\n"

              yield StringBuilder.One $"func {formName}EntityGETter[id any, result any]("

              let entityAPIsWithGET =
                ctx.Apis.Entities
                |> Map.values
                |> Seq.filter (snd >> Set.contains CrudMethod.Get)
                |> Seq.map fst

              yield!
                entityAPIsWithGET
                |> Seq.map (fun e ->
                  StringBuilder.Many(
                    seq {
                      yield StringBuilder.One($$"""get{{e.EntityName}} func (id) ({{e.TypeId.TypeName}},error), """)

                      yield
                        StringBuilder.One(
                          $$"""serialize{{e.EntityName}} func ({{e.TypeId.TypeName}}) (result,error), """
                        )
                    }
                  ))


              yield
                StringBuilder.One
                  ") func (string, id) (result,error) { return func (entityName string, entityId id) (result,error) {\n"

              yield StringBuilder.One "    var resultNil result;\n"
              yield StringBuilder.One "    switch entityName {\n"

              for entityApi in entityAPIsWithGET do
                yield StringBuilder.One $$"""      case "{{entityApi.TypeId.TypeName}}Entity":  """
                yield StringBuilder.One "\n"
                yield StringBuilder.One $$"""        var res, err = get{{entityApi.EntityName}}(entityId);  """
                yield StringBuilder.One "\n"

                yield StringBuilder.One $$"""        if err != nil { return resultNil, err }  """
                yield StringBuilder.One "\n"
                yield StringBuilder.One $$"""        return serialize{{entityApi.EntityName}}(res); """

                yield StringBuilder.One "\n"

              yield StringBuilder.One "    }\n"

              yield
                StringBuilder.One
                  $"    return resultNil, {codegenConfig.EntityNotFoundError.Constructor}(entityName);\n"

              yield StringBuilder.One "  }\n"
              yield StringBuilder.One "}\n\n"
            }

          let entityDEFAULTers =
            seq {
              yield StringBuilder.One $"func {formName}EntityDEFAULTer[result any]("

              let entityAPIsWithDEFAULT =
                ctx.Apis.Entities
                |> Map.values
                |> Seq.filter (snd >> Set.contains CrudMethod.Default)
                |> Seq.map fst

              yield!
                entityAPIsWithDEFAULT
                |> Seq.map (fun e ->
                  StringBuilder.Many(
                    seq {
                      yield
                        StringBuilder.One(
                          $$"""serialize{{e.EntityName}} func ({{e.TypeId.TypeName}}) (result,error), """
                        )
                    }
                  ))


              yield
                StringBuilder.One ") func(string) (result, error) { return func(entityName string) (result, error) {\n"

              yield StringBuilder.One "    var resultNil result;\n"
              yield StringBuilder.One "    switch entityName {\n"

              for entityApi in entityAPIsWithDEFAULT do
                yield StringBuilder.One $$"""      case "{{entityApi.TypeId.TypeName}}Entity":  """
                yield StringBuilder.One "\n"

                yield
                  StringBuilder.One
                    $$"""        return serialize{{entityApi.EntityName}}(Default{{entityApi.TypeId.TypeName}}()); """

                yield StringBuilder.One "\n"

              yield StringBuilder.One "    }\n"

              yield
                StringBuilder.One
                  $"    return resultNil, {codegenConfig.EntityNotFoundError.Constructor}(entityName);\n"

              yield StringBuilder.One "  }\n"
              yield StringBuilder.One "}\n\n"
            }

          let entityPOSTers =
            seq {
              yield StringBuilder.One $"func {formName}EntityPOSTer[id any, payload any]("

              let entityAPIsWithPOST =
                ctx.Apis.Entities
                |> Map.values
                |> Seq.filter (snd >> Set.contains CrudMethod.Create)
                |> Seq.map fst

              yield!
                entityAPIsWithPOST
                |> Seq.map (fun e ->
                  StringBuilder.Many(
                    seq {
                      yield
                        StringBuilder.One(
                          $$"""deserialize{{e.EntityName}} func (id, payload) ({{e.TypeId.TypeName}},error), """
                        )

                      yield StringBuilder.One($$"""process{{e.EntityName}} func (id, {{e.TypeId.TypeName}}) error, """)
                    }
                  ))


              yield
                StringBuilder.One
                  ") func (string, id, payload) error { return func(entityName string, entityId id, entityValue payload) error {\n"

              yield StringBuilder.One "    switch entityName {\n"

              for entityApi in entityAPIsWithPOST do
                yield StringBuilder.One $$"""      case "{{entityApi.TypeId.TypeName}}Entity":  """
                yield StringBuilder.One "\n"

                yield
                  StringBuilder.One
                    $$"""        var res, err = deserialize{{entityApi.EntityName}}(entityId, entityValue);  """

                yield StringBuilder.One "\n"

                yield StringBuilder.One $$"""        if err != nil { return err; }  """

                yield StringBuilder.One "\n"
                yield StringBuilder.One $$"""        return process{{entityApi.EntityName}}(entityId, res);  """

                yield StringBuilder.One "\n"

              yield StringBuilder.One "    }\n"

              yield StringBuilder.One $"    return {codegenConfig.EntityNotFoundError.Constructor}(entityName);\n"

              yield StringBuilder.One "  }\n"
              yield StringBuilder.One "}\n"
            }

          let enumCasesGETters =
            seq {
              // yield StringBuilder.One $"func {formName}EnumAutoGETter(enumName string) "
              // yield StringBuilder.One " ([]string,error) {\n"
              // yield StringBuilder.One "  switch enumName {\n"

              // yield!
              //   ctx.Apis.Enums
              //   |> Map.values
              //   |> Seq.map (fun e ->
              //     StringBuilder.Many(
              //       seq {
              //         yield
              //           StringBuilder.One
              //             $$"""    case "{{e.EnumName}}": return {{codegenConfig.List.MappingFunction}}(All{{e.UnderlyingEnum.TypeName}}Cases[:], func (c {{e.UnderlyingEnum.TypeName}}) string { return string(c) }), nil"""

              //         yield StringBuilder.One "\n"
              //       }
              //     ))

              // yield StringBuilder.One "  }\n"
              // yield StringBuilder.One "  var res []string\n"

              // yield StringBuilder.One $$"""  return res, {{codegenConfig.EnumNotFoundError.Constructor}}(enumName)"""

              // yield StringBuilder.One "\n}\n\n"

              yield StringBuilder.One $"func {formName}EnumGETter[result any](enumName string, "

              yield!
                ctx.Apis.Enums
                |> Map.values
                |> Seq.map (fun e ->
                  StringBuilder.One($$"""on{{e.EnumName}} func ([]{{e.UnderlyingEnum.TypeName}}) (result,error), """))

              yield StringBuilder.One ") (result,error) {\n"
              yield StringBuilder.One "  switch enumName {\n"

              yield!
                ctx.Apis.Enums
                |> Map.values
                |> Seq.map (fun e ->
                  StringBuilder.Many(
                    seq {
                      yield
                        StringBuilder.One(
                          $$"""    case "{{e.EnumName}}": return on{{e.EnumName}}(All{{e.UnderlyingEnum.TypeName}}Cases[:])"""
                        )

                      yield StringBuilder.One "\n"
                    }
                  ))

              yield StringBuilder.One "  }\n"
              yield StringBuilder.One "  var res result\n"
              yield StringBuilder.One $$"""  return res, {{codegenConfig.EnumNotFoundError.Constructor}}(enumName)"""
              yield StringBuilder.One "\n}\n\n"
            }

          let enumCasesPOSTters =
            seq {
              yield StringBuilder.One $"func {formName}EnumPOSTter(enumName string, enumValue string, "

              yield!
                ctx.Apis.Enums
                |> Map.values
                |> Seq.map (fun e ->
                  StringBuilder.One(
                    $$"""on{{e.EnumName}} func ({{e.UnderlyingEnum.TypeName}}) ({{codegenConfig.Unit.GeneratedTypeName}},error), """
                  ))

              yield StringBuilder.One $$""") ({{codegenConfig.Unit.GeneratedTypeName}},error) {"""
              yield StringBuilder.One "\n"
              yield StringBuilder.One "  switch enumName {\n"

              yield!
                ctx.Apis.Enums
                |> Map.values
                |> Seq.map (fun e ->
                  StringBuilder.Many(
                    seq {
                      yield StringBuilder.One(sprintf "  case \"%s\":\n" e.EnumName)

                      yield
                        StringBuilder.One(
                          $$"""    if slices.Contains(All{{e.UnderlyingEnum.TypeName}}Cases[:], {{e.UnderlyingEnum.TypeName}}(enumValue)) {"""
                        )

                      yield StringBuilder.One("\n")

                      yield
                        StringBuilder.One(
                          $$"""      return on{{e.EnumName}}({{e.UnderlyingEnum.TypeName}}(enumValue))"""
                        )

                      yield StringBuilder.One("\n")
                      yield StringBuilder.One("    }\n")
                    }
                  ))

              yield StringBuilder.One "  }\n"
              yield StringBuilder.One $$"""  var result {{codegenConfig.Unit.GeneratedTypeName}}"""
              yield StringBuilder.One "\n"

              yield
                StringBuilder.One
                  $$"""  return result, {{codegenConfig.InvalidEnumValueCombinationError.Constructor}}(enumName, enumValue )"""

              yield StringBuilder.One "\n}\n\n"
            }

          let streamGETters =
            seq {
              yield
                StringBuilder.One
                  $"func {formName}StreamGETter[searchParams any, serializedResult any](streamName string, searchArgs searchParams, "

              yield!
                ctx.Apis.Streams
                |> Map.values
                |> Seq.map (fun e ->
                  StringBuilder.One(
                    $$"""get{{e.StreamName}} func(searchParams) ([]{{e.TypeId.TypeName}}, error), serialize{{e.StreamName}} func(searchParams, []{{e.TypeId.TypeName}}) (serializedResult, error), """
                  ))

              yield StringBuilder.One ") (serializedResult,error) {\n"
              yield StringBuilder.One "  var result serializedResult\n"
              yield StringBuilder.One "  switch streamName {\n"

              yield!
                ctx.Apis.Streams
                |> Map.values
                |> Seq.map (fun e ->
                  StringBuilder.Many(
                    seq {
                      StringBuilder.One $$"""  case "{{e.StreamName}}":"""
                      StringBuilder.One "\n"
                      StringBuilder.One $$"""   var res,err = get{{e.StreamName}}(searchArgs)"""
                      StringBuilder.One "\n"
                      StringBuilder.One $$"""   if err != nil { return result,err }"""
                      StringBuilder.One "\n"

                      StringBuilder.One $$"""   return serialize{{e.StreamName}}(searchArgs, res)"""

                      StringBuilder.One "\n"
                    }
                  ))

              yield StringBuilder.One "  }\n"

              yield
                StringBuilder.One $$"""  return result, {{codegenConfig.StreamNotFoundError.Constructor}}(streamName)"""

              yield StringBuilder.One "\n}\n\n"
            }

          let streamPOSTters =
            seq {
              yield
                StringBuilder.One
                  $"func {formName}StreamPOSTter[serializedResult any](streamName string, id {codegenConfig.Guid.GeneratedTypeName}, "

              yield!
                ctx.Apis.Streams
                |> Map.values
                |> Seq.map (fun e ->
                  StringBuilder.One(
                    $$"""get{{e.StreamName}} func({{codegenConfig.Guid.GeneratedTypeName}}) ({{e.TypeId.TypeName}}, error), serialize{{e.StreamName}} func({{e.TypeId.TypeName}}) (serializedResult, error), """
                  ))

              yield StringBuilder.One ") (serializedResult,error) {\n"
              yield StringBuilder.One "  var result serializedResult\n"
              yield StringBuilder.One "  switch streamName {\n"

              yield!
                ctx.Apis.Streams
                |> Map.values
                |> Seq.map (fun e ->
                  StringBuilder.Many(
                    seq {
                      StringBuilder.One $$"""  case "{{e.StreamName}}":"""
                      StringBuilder.One "\n"
                      StringBuilder.One $$"""   var res,err = get{{e.StreamName}}(id)"""
                      StringBuilder.One "\n"
                      StringBuilder.One $$"""   if err != nil { return result,err }"""
                      StringBuilder.One "\n"
                      StringBuilder.One $$"""   return serialize{{e.StreamName}}(res)"""
                      StringBuilder.One "\n"
                    }
                  ))

              yield StringBuilder.One "  }\n"

              yield
                StringBuilder.One $$"""  return result, {{codegenConfig.StreamNotFoundError.Constructor}}(streamName)"""

              yield StringBuilder.One "\n}\n\n"
            }

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
                    let enumCases = cases |> Map.values |> Seq.map (fun case -> case.CaseName)

                    return
                      StringBuilder.Many(
                        seq {
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One $$"""type {{t.Key}} string"""
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One "const ("
                          yield StringBuilder.One "\n"

                          for enumCase in enumCases do
                            yield StringBuilder.One $$"""  {{t.Key}}{{!enumCase}} {{t.Key}} = "{{enumCase}}" """
                            yield StringBuilder.One "\n"

                          yield StringBuilder.One ")"
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One $$"""var All{{t.Key}}Cases = [...]{{t.Key}}{ """

                          for enumCase in enumCases do
                            yield StringBuilder.One $$"""{{t.Key}}{{!enumCase}}, """

                          yield StringBuilder.One "}\n"
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One $"func Default{t.Key}() {t.Key} {{ return All{t.Key}Cases[0]; }}"
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

                            let! fields =
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
                                  // do System.Console.WriteLine(f.Value.ToFSharpString)
                                  // do System.Console.ReadLine() |> ignore
                                  let! field = f.Value |> ExprType.ToGolangTypeAnnotation
                                  let! fieldDefault = f.Value |> ExprType.ToGolangDefaultValue

                                  return
                                    {| FieldName = f.Key
                                       FieldType = field
                                       FieldDefault = fieldDefault |}
                                })
                              |> state.All

                            return case.CaseName, fields
                          })
                        |> List.ofSeq
                      )

                    let caseValues = caseValues |> Map.ofList

                    let! firstUnionCaseName =
                      caseValues.Keys
                      |> Seq.tryHead
                      |> Sum.fromOption (fun () -> Errors.Singleton $"Error: union case must have at least one case.")
                      |> state.OfSum

                    return
                      StringBuilder.Many(
                        seq {
                          yield StringBuilder.One "\n"

                          for case in cases |> Map.values do
                            yield StringBuilder.One $"type {t.Key}{!case.CaseName}Value struct {{\n"

                            match caseValues |> Map.tryFind case.CaseName with
                            | Some caseValue ->
                              for field in caseValue do
                                yield StringBuilder.One $"  {field.FieldName} {field.FieldType}; \n"
                            | None -> ()

                            yield StringBuilder.One $"}}\n"

                            yield StringBuilder.One $"func New{t.Key}{!case.CaseName}Value("

                            match caseValues |> Map.tryFind case.CaseName with
                            | Some caseValue ->
                              for field in caseValue do
                                yield StringBuilder.One $"{field.FieldName} {field.FieldType}, "
                            | None -> ()

                            yield StringBuilder.One $") {t.Key}{!case.CaseName}Value {{\n"

                            yield StringBuilder.One $"  var res {t.Key}{!case.CaseName}Value;\n"

                            match caseValues |> Map.tryFind case.CaseName with
                            | Some caseValue ->
                              for field in caseValue do
                                yield StringBuilder.One $"  res.{field.FieldName} = {field.FieldName}; \n"
                            | None -> ()

                            yield StringBuilder.One $"  return res;\n"
                            yield StringBuilder.One $"}}\n"

                            yield
                              StringBuilder.One
                                $"func Default{t.Key}{!case.CaseName}Value() {t.Key}{!case.CaseName}Value {{"

                            yield StringBuilder.One "\n"

                            yield StringBuilder.One $" return New{t.Key}{!case.CaseName}Value("

                            match caseValues |> Map.tryFind case.CaseName with
                            | Some caseValue ->
                              for field in caseValue do
                                yield StringBuilder.One $"{field.FieldDefault}, "
                            | None -> ()

                            yield StringBuilder.One $");"
                            yield StringBuilder.One "\n"

                            yield StringBuilder.One $"}}\n"


                          yield StringBuilder.One "\n"
                          yield StringBuilder.One $$"""type {{t.Key}}Cases string"""
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One "const ("
                          yield StringBuilder.One "\n"

                          for case in cases |> Map.values do
                            yield
                              StringBuilder.One
                                $$"""  {{t.Key}}{{!case.CaseName}} {{t.Key}}Cases = "{{case.CaseName}}"; """

                            yield StringBuilder.One "\n"

                          yield StringBuilder.One ")"
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One $$"""type {{t.Key}} struct {"""
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One $"  Discriminator {t.Key}Cases\n"

                          for case in cases |> Map.values do
                            yield StringBuilder.One $"  {t.Key}{!case.CaseName} {t.Key}{!case.CaseName}Value; "

                            yield StringBuilder.One "\n"

                          yield StringBuilder.One "}"
                          yield StringBuilder.One "\n"

                          yield StringBuilder.One $"func Default{t.Key}() {t.Key} {{"
                          yield StringBuilder.One "\n"

                          yield
                            StringBuilder.One
                              $"  return New{t.Key}{!firstUnionCaseName}(Default{t.Key}{!firstUnionCaseName}Value());"

                          yield StringBuilder.One "\n"
                          yield StringBuilder.One "}"
                          yield StringBuilder.One "\n"

                          // func Default{UnionName}() {UnionName} {
                          // 	return New{FirstUnionCaseName}(Default{FirstUnionCaseName}Value());
                          // }

                          for case in cases |> Map.values do
                            yield StringBuilder.One $$"""func New{{t.Key}}{{!case.CaseName}}( """

                            yield StringBuilder.One $"value {t.Key}{!case.CaseName}Value, "
                            yield StringBuilder.One $") {t.Key} {{\n"
                            yield StringBuilder.One $"  var res {t.Key};\n"

                            yield StringBuilder.One $$"""  res.Discriminator = {{t.Key}}{{!case.CaseName}};"""

                            yield StringBuilder.One $"\n"

                            yield StringBuilder.One $$"""  res.{{t.Key}}{{!case.CaseName}} = value;"""

                            yield StringBuilder.One $"\n"
                            yield StringBuilder.One $"  return res;\n"
                            yield StringBuilder.One $"}}\n"

                          yield StringBuilder.One "\n"

                          yield StringBuilder.One $"func Match{t.Key}[result any](value {t.Key}, "

                          // BUILD HERE THE DEFAULTING BASED ON THE INVOCATION OF THE CONSTRUCTOR OF THE FIRST CASE

                          for case in cases |> Map.values do
                            yield
                              StringBuilder.One
                                $"on{t.Key}{!case.CaseName} func({t.Key}{!case.CaseName}Value) (result,error), "

                          yield StringBuilder.One $") (result,error) {{\n"
                          yield StringBuilder.One $"  switch value.Discriminator {{\n"

                          for case in cases |> Map.values do
                            yield StringBuilder.One $"    case {t.Key}{!case.CaseName}: \n"

                            yield
                              StringBuilder.One
                                $"      return on{t.Key}{!case.CaseName}(value.{t.Key}{!case.CaseName}) \n"

                          yield StringBuilder.One $"  }}\n"
                          yield StringBuilder.One "  var res result\n"

                          yield
                            StringBuilder.One
                              """  return res, fmt.Errorf("%s is not a valid discriminator value", value.Discriminator );"""

                          yield StringBuilder.One $"\n"
                          yield StringBuilder.One $"}}\n"
                        }
                      )
                  | _ ->
                    let! fields = ExprType.GetFields t.Value.Type |> state.OfSum

                    let typeStart =
                      $$"""type {{t.Value.TypeId.TypeName}} struct {
"""

                    let! fieldTypes =
                      state.All(fields |> Seq.map (snd >> ExprType.ToGolangTypeAnnotation) |> List.ofSeq)

                    let fieldDeclarations =
                      StringBuilder.Many(
                        seq {
                          for fieldType, fieldName in fields |> Seq.map fst |> Seq.zip fieldTypes do
                            yield StringBuilder.One "  "
                            yield StringBuilder.One fieldName.ToFirstUpper
                            yield StringBuilder.One " "
                            yield StringBuilder.One fieldType
                            yield StringBuilder.One "\n"
                        }
                      )

                    let typeEnd =
                      $$"""}
"""

                    let consStart = $$"""func New{{t.Value.TypeId.TypeName}}("""

                    let consParams =
                      StringBuilder.Many(
                        seq {
                          for fieldType, fieldName in fields |> Seq.map fst |> Seq.zip fieldTypes do
                            yield StringBuilder.One fieldName
                            yield StringBuilder.One " "
                            yield StringBuilder.One fieldType
                            yield StringBuilder.One ", "
                        }
                      )

                    let consDeclEnd =
                      $$""") {{t.Value.TypeId.TypeName}} {
  var res {{t.Value.TypeId.TypeName}}
"""

                    let consBodyEnd =
                      $$"""  return res
}

"""

                    let consFieldInits =
                      StringBuilder.Many(
                        seq {
                          for fieldType, fieldName in fields |> Seq.map fst |> Seq.zip fieldTypes do
                            yield StringBuilder.One "  res."
                            yield StringBuilder.One fieldName.ToFirstUpper
                            yield StringBuilder.One " = "
                            yield StringBuilder.One fieldName
                            yield StringBuilder.One ";\n"
                        }
                      )

                    let! fieldDefaults = fields |> Seq.map snd |> Seq.map ExprType.ToGolangDefaultValue |> state.All

                    let defaultValue: StringBuilder =
                      StringBuilder.Many(
                        seq {
                          yield
                            StringBuilder.One $"func Default{t.Value.TypeId.TypeName}() {t.Value.TypeId.TypeName} {{"

                          yield StringBuilder.One "\n"
                          yield StringBuilder.One $"  return New{t.Value.TypeId.TypeName}("

                          for fieldDefault in fieldDefaults do
                            yield StringBuilder.One(fieldDefault)
                            yield StringBuilder.One ", "

                          yield StringBuilder.One ");"
                          yield StringBuilder.One "\n}\n"
                          yield StringBuilder.One "\n"
                        }
                      )

                    return
                      StringBuilder.Many(
                        seq {
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One typeStart
                          yield fieldDeclarations
                          yield StringBuilder.One typeEnd
                          yield StringBuilder.One "\n"
                          yield StringBuilder.One consStart
                          yield consParams
                          yield StringBuilder.One consDeclEnd
                          yield consFieldInits
                          yield StringBuilder.One consBodyEnd
                          yield defaultValue
                        }
                      )
                }
                |> state.WithErrorContext $"...when generating type {t.Value.TypeId.TypeName}")
              |> List.ofSeq
            )

          return
            StringBuilder.Many(
              seq {
                yield! entityGETters
                yield! entityDEFAULTers
                yield! entityPOSTers
                yield! enumCasesGETters
                yield! enumCasesPOSTters
                yield! streamGETters
                yield! streamPOSTters
                // yield! entitiesOPSelector "GET" CrudMethod.Get
                // yield! entitiesOPEnum "GET" CrudMethod.Get
                // yield! entitiesOPSelector "POST" CrudMethod.Create
                // yield! entitiesOPEnum "POST" CrudMethod.Create
                // yield! entitiesOPSelector "PATCH" CrudMethod.Update
                // yield! entitiesOPEnum "PATCH" CrudMethod.Update
                // yield! entitiesOPSelector "DEFAULT" CrudMethod.Default
                // yield! entitiesOPEnum "DEFAULT" CrudMethod.Default
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
