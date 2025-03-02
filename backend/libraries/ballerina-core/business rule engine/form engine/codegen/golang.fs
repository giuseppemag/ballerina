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

    type GoCodeGenState =
        { UsedImports: Set<string> }

        static member Updaters =
            {| UsedImports =
                fun u ->
                    fun s ->
                        { s with
                            UsedImports = u (s.UsedImports) } |}

    type ExprType with
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

                    let enumCasesGETters =
                        seq {
                            yield StringBuilder.One $"func {formName}EnumAutoGETter(enumName string) "
                            yield StringBuilder.One " ([]string,error) {\n"
                            yield StringBuilder.One "  switch enumName {\n"

                            yield!
                                ctx.Apis.Enums
                                |> Map.values
                                |> Seq.map (fun e ->
                                    StringBuilder.Many(
                                        seq {
                                            yield
                                                StringBuilder.One
                                                    $$"""    case "{{e.EnumName}}": return {{codegenConfig.List.MappingFunction}}(All{{e.UnderlyingEnum.TypeName}}Cases[:], func (c {{e.UnderlyingEnum.TypeName}}) string { return string(c) }), nil"""

                                            yield StringBuilder.One "\n"
                                        }
                                    ))

                            yield StringBuilder.One "  }\n"
                            yield StringBuilder.One "  var res []string\n"

                            yield
                                StringBuilder.One
                                    $$"""  return res, {{codegenConfig.EnumNotFoundError.Constructor}}(enumName)"""

                            yield StringBuilder.One "\n}\n\n"

                            yield StringBuilder.One $"func {formName}EnumGETter[result any](enumName string, "

                            yield!
                                ctx.Apis.Enums
                                |> Map.values
                                |> Seq.map (fun e ->
                                    StringBuilder.One(
                                        $$"""on{{e.EnumName}} func ([]{{e.UnderlyingEnum.TypeName}}) (result,error), """
                                    ))

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

                            yield
                                StringBuilder.One
                                    $$"""  return res, {{codegenConfig.EnumNotFoundError.Constructor}}(enumName)"""

                            yield StringBuilder.One "\n}\n\n"
                        }

                    let enumCasesPOSTter =
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
                                    Many(
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

                    let streamGETter =
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

                                            StringBuilder.One
                                                $$"""   return serialize{{e.StreamName}}(searchArgs, res)"""

                                            StringBuilder.One "\n"
                                        }
                                    ))

                            yield StringBuilder.One "  }\n"

                            yield
                                StringBuilder.One
                                    $$"""  return result, {{codegenConfig.StreamNotFoundError.Constructor}}(streamName)"""

                            yield StringBuilder.One "\n}\n\n"
                        }

                    let streamPOSTter =
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
                                    Many(
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
                                StringBuilder.One
                                    $$"""  return result, {{codegenConfig.StreamNotFoundError.Constructor}}(streamName)"""

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
                                }
                            ))

                    let! generatedTypes =
                        state.All(
                            typesToGenerate
                            |> Seq.map (fun t ->
                                state {
                                    match t.Value.Type with
                                    | ExprType.UnionType cases when
                                        cases |> Seq.forall (fun case -> case.Fields.IsUnitType)
                                        ->
                                        let enumCases = cases |> Seq.map (fun case -> case.CaseName)

                                        return
                                            StringBuilder.Many(
                                                seq {
                                                    yield StringBuilder.One "\n"
                                                    yield StringBuilder.One $$"""type {{t.Key}} string"""
                                                    yield StringBuilder.One "\n"
                                                    yield StringBuilder.One "const ("
                                                    yield StringBuilder.One "\n"

                                                    for enumCase in enumCases do
                                                        yield
                                                            StringBuilder.One
                                                                $$"""  {{t.Key}}{{!enumCase}} {{t.Key}} = "{{enumCase}}" """

                                                        yield StringBuilder.One "\n"

                                                    yield StringBuilder.One ")"
                                                    yield StringBuilder.One "\n"

                                                    yield
                                                        StringBuilder.One
                                                            $$"""var All{{t.Key}}Cases = [...]{{t.Key}}{ """

                                                    for enumCase in enumCases do
                                                        yield StringBuilder.One $$"""{{t.Key}}{{!enumCase}}, """

                                                    yield StringBuilder.One "}\n"
                                                }
                                            )
                                    | ExprType.UnionType cases ->
                                        let! caseValues =
                                            state.All(
                                                cases
                                                |> Seq.map (fun case ->
                                                    state {
                                                        let! fields =
                                                            case.Fields
                                                            |> ExprType.AsRecord
                                                            |> state.OfSum
                                                            |> state.Either(
                                                                case.Fields
                                                                |> ExprType.AsUnit
                                                                |> state.OfSum
                                                                |> state.Map(fun _ -> Map.empty)
                                                            )

                                                        let! fields =
                                                            fields
                                                            |> Seq.map (fun f ->
                                                                state {
                                                                    let! field =
                                                                        f.Value |> ExprType.ToGolangTypeAnnotation

                                                                    return f.Key, field
                                                                })
                                                            |> state.All

                                                        return case.CaseName, fields
                                                    })
                                                |> List.ofSeq
                                            )

                                        let caseValues = caseValues |> Map.ofList

                                        return
                                            StringBuilder.Many(
                                                seq {
                                                    yield StringBuilder.One "\n"

                                                    for case in cases do
                                                        yield
                                                            StringBuilder.One
                                                                $"type {t.Key}{!case.CaseName}Value struct {{\n"

                                                        match caseValues |> Map.tryFind case.CaseName with
                                                        | Some caseValue ->
                                                            for fieldName, fieldType in caseValue do
                                                                yield
                                                                    StringBuilder.One $"  {fieldName} {fieldType}; \n"
                                                        | None -> ()

                                                        yield StringBuilder.One $"}}\n"

                                                        yield
                                                            StringBuilder.One $"func New{t.Key}{!case.CaseName}Value("

                                                        match caseValues |> Map.tryFind case.CaseName with
                                                        | Some caseValue ->
                                                            for fieldName, fieldType in caseValue do
                                                                yield StringBuilder.One $"{fieldName} {fieldType}, "
                                                        | None -> ()

                                                        yield StringBuilder.One $") {t.Key}{!case.CaseName}Value {{\n"

                                                        yield
                                                            StringBuilder.One
                                                                $"  var res {t.Key}{!case.CaseName}Value;\n"

                                                        match caseValues |> Map.tryFind case.CaseName with
                                                        | Some caseValue ->
                                                            for fieldName, fieldType in caseValue do
                                                                yield
                                                                    StringBuilder.One
                                                                        $"  res.{fieldName} = {fieldName}; \n"
                                                        | None -> ()

                                                        yield StringBuilder.One $"  return res;\n"
                                                        yield StringBuilder.One $"}}\n"

                                                    yield StringBuilder.One "\n"
                                                    yield StringBuilder.One $$"""type {{t.Key}}Cases string"""
                                                    yield StringBuilder.One "\n"
                                                    yield StringBuilder.One "const ("
                                                    yield StringBuilder.One "\n"

                                                    for case in cases do
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

                                                    for case in cases do
                                                        yield
                                                            StringBuilder.One
                                                                $"  {t.Key}{!case.CaseName} {t.Key}{!case.CaseName}Value; "

                                                        yield StringBuilder.One "\n"

                                                    yield StringBuilder.One "}"
                                                    yield StringBuilder.One "\n"

                                                    for case in cases do
                                                        yield
                                                            StringBuilder.One
                                                                $$"""func New{{t.Key}}{{!case.CaseName}}( """

                                                        yield StringBuilder.One $"value {t.Key}{!case.CaseName}Value, "
                                                        yield StringBuilder.One $") {t.Key} {{\n"
                                                        yield StringBuilder.One $"  var res {t.Key};\n"

                                                        yield
                                                            StringBuilder.One
                                                                $$"""  res.Discriminator = {{t.Key}}{{!case.CaseName}};"""

                                                        yield StringBuilder.One $"\n"

                                                        yield
                                                            StringBuilder.One
                                                                $$"""  res.{{t.Key}}{{!case.CaseName}} = value;"""

                                                        yield StringBuilder.One $"\n"
                                                        yield StringBuilder.One $"  return res;\n"
                                                        yield StringBuilder.One $"}}\n"

                                                    yield StringBuilder.One "\n"

                                                    yield
                                                        StringBuilder.One
                                                            $"func Match{t.Key}[result any](value {t.Key}, "

                                                    for case in cases do
                                                        yield
                                                            StringBuilder.One
                                                                $"on{t.Key}{!case.CaseName} func({t.Key}{!case.CaseName}Value) (result,error), "

                                                    yield StringBuilder.One $") (result,error) {{\n"
                                                    yield StringBuilder.One $"  switch value.Discriminator {{\n"

                                                    for case in cases do
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
                                            state.All(
                                                fields
                                                |> Seq.map (snd >> ExprType.ToGolangTypeAnnotation)
                                                |> List.ofSeq
                                            )

                                        let fieldDeclarations =
                                            Many(
                                                seq {
                                                    for fieldType, fieldName in
                                                        fields |> Seq.map fst |> Seq.zip fieldTypes do
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
                                            Many(
                                                seq {
                                                    for fieldType, fieldName in
                                                        fields |> Seq.map fst |> Seq.zip fieldTypes do
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
                                                    for fieldType, fieldName in
                                                        fields |> Seq.map fst |> Seq.zip fieldTypes do
                                                        yield StringBuilder.One "  res."
                                                        yield StringBuilder.One fieldName.ToFirstUpper
                                                        yield StringBuilder.One " = "
                                                        yield StringBuilder.One fieldName
                                                        yield StringBuilder.One ";\n"
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
                                                }
                                            )
                                }
                                |> state.WithErrorContext $"...when generating type {t.Value.TypeId.TypeName}")
                            |> List.ofSeq
                        )

                    return
                        StringBuilder.Many(
                            seq {
                                yield! enumCasesGETters
                                yield! enumCasesPOSTter
                                yield! streamGETter
                                yield! streamPOSTter
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
        {{imports |> Seq.map (sprintf "  \"%s\"\n") |> Seq.fold (+) ""}}
      )
      """

                    Many(
                        seq {
                            yield heading
                            yield res
                        }
                    )
                )
