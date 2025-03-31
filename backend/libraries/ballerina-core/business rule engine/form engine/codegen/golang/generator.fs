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
  open System
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
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.WritersAndDeltas
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.TypeAnnotations
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.DefaultValues

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

          let launchersEnum: GolangEnum =
            { Name = $"{formName}LaunchersEnum"
              Cases =
                ctx.Launchers
                |> Map.values
                |> Seq.map (fun launcher ->
                  {| Name = $"{!launcher.LauncherName}Launcher"
                     Value = $"{launcher.LauncherName}" |})
                |> Seq.toList }

          let launchersEnum = GolangEnum.ToGolang () launchersEnum

          let entitiesEnum: GolangEnum =
            { Name = $"{formName}EntitiesEnum"
              Cases =
                ctx.Apis.Entities
                |> Map.values
                |> Seq.map fst
                |> Seq.map (fun entityApi ->
                  {| Name = $"{entityApi.TypeId.TypeName}Entity"
                     Value = $"{entityApi.TypeId.TypeName}" |})
                |> Seq.toList }

          let entitiesEnum = GolangEnum.ToGolang () entitiesEnum

          let entityGETters =
            GolangEntityGETters.ToGolang
              ()
              { FunctionName = $"{formName}EntityGETter"
                EntityNotFoundErrorConstructor = codegenConfig.EntityNotFoundError.Constructor
                Entities =
                  ctx.Apis.Entities
                  |> Map.values
                  |> Seq.filter (snd >> Set.contains CrudMethod.Get)
                  |> Seq.map fst
                  |> Seq.map (fun e ->
                    {| EntityName = e.EntityName
                       EntityType = e.TypeId.TypeName |})
                  |> List.ofSeq }

          let entityDEFAULTers =
            let entities =
              { GolangEntityGETDEFAULTers.FunctionName = $"{formName}EntityDEFAULTer"
                Entities =
                  ctx.Apis.Entities
                  |> Map.values
                  |> Seq.filter (snd >> Set.contains CrudMethod.Default)
                  |> Seq.map fst
                  |> Seq.map (fun e ->
                    {| EntityName = e.EntityName
                       EntityType = e.TypeId.TypeName |})
                  |> List.ofSeq
                EntityNotFoundErrorConstructor = codegenConfig.EntityNotFoundError.Constructor }

            GolangEntityGETDEFAULTers.ToGolang () entities

          let entityPOSTers =
            let entities =
              { GolangEntityPOSTers.FunctionName = $"{formName}EntityPOSTer"
                Entities =
                  ctx.Apis.Entities
                  |> Map.values
                  |> Seq.filter (snd >> Set.contains CrudMethod.Create)
                  |> Seq.map fst
                  |> Seq.map (fun e ->
                    {| EntityName = e.EntityName
                       EntityType = e.TypeId.TypeName |})
                  |> List.ofSeq
                EntityNotFoundErrorConstructor = codegenConfig.EntityNotFoundError.Constructor }

            GolangEntityPOSTers.ToGolang () entities

          let enumCasesGETters =
            let getters =
              { GolangEnumGETters.FunctionName = $"{formName}EnumGETter"
                EnumNotFoundErrorConstructor = codegenConfig.EnumNotFoundError.Constructor
                Enums =
                  ctx.Apis.Enums
                  |> Map.values
                  |> Seq.map (fun e ->
                    {| EnumName = e.EnumName
                       EnumType = e.UnderlyingEnum.TypeName |})
                  |> List.ofSeq }

            GolangEnumGETters.ToGolang () getters

          let enumCasesPOSTters =
            let posters =
              { GolangEnumPOSTers.FunctionName = $"{formName}EnumPOSTter"
                InvalidEnumValueCombinationError = codegenConfig.InvalidEnumValueCombinationError.Constructor
                UnitType = codegenConfig.Unit.GeneratedTypeName
                Enums =
                  ctx.Apis.Enums
                  |> Map.values
                  |> Seq.map (fun e ->
                    {| EnumName = e.EnumName
                       EnumType = e.UnderlyingEnum.TypeName |})
                  |> List.ofSeq }

            GolangEnumPOSTers.ToGolang () posters

          let streamGETters =
            let getters =
              { GolangStreamGETters.FunctionName = $"{formName}StreamGETter"
                Streams =
                  ctx.Apis.Streams
                  |> Map.values
                  |> Seq.map (fun e ->
                    {| StreamName = e.StreamName
                       StreamType = e.TypeId.TypeName |})
                  |> List.ofSeq
                StreamNotFoundErrorConstructor = codegenConfig.StreamNotFoundError.Constructor }

            GolangStreamGETters.ToGolang () getters

          let streamPOSTters =
            let posters: GolangStreamPOSTers =
              { GolangStreamPOSTers.FunctionName = $"{formName}StreamPOSTter"
                Streams =
                  ctx.Apis.Streams
                  |> Map.values
                  |> Seq.map (fun e ->
                    {| StreamName = e.StreamName
                       StreamType = e.TypeId.TypeName |})
                  |> List.ofSeq
                GuidType = codegenConfig.Guid.GeneratedTypeName
                StreamNotFoundErrorConstructor = codegenConfig.StreamNotFoundError.Constructor }

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
                  yield StringBuilder.One $"  return {t.Value.GeneratedTypeName}({t.Value.DefaultConstructor}());"
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
                    let enum: GolangEnum =
                      { Name = $"{t.Key}"
                        Cases =
                          cases
                          |> Map.values
                          |> Seq.map (fun case -> case.CaseName)
                          |> Seq.map (fun enumCase ->
                            {| Name = $"{t.Key}{!enumCase}"
                               Value = $"{enumCase}" |})
                          |> Seq.toList }

                    return StringBuilder.Many(seq { yield GolangEnum.ToGolang () enum })
                  | ExprType.UnionType cases when cases |> Map.isEmpty |> not ->
                    let! caseValues =
                      state.All(
                        cases
                        |> Map.values
                        |> Seq.map (fun case ->
                          state {
                            let! fields = case.Fields |> ExprType.ResolveLookup ctx |> state.OfSum

                            let! (fields: Map<string, ExprType>) =
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
                                  let! (field: string) = f.Value |> ExprType.ToGolangTypeAnnotation
                                  let! (fieldDefaultValue: string) = f.Value |> ExprType.ToGolangDefaultValue

                                  return
                                    {| FieldName = f.Key
                                       FieldType = field
                                       FieldDefaultValue = fieldDefaultValue |}
                                })
                              |> state.All

                            return
                              {| CaseName = !case.CaseName
                                 Fields = fields |}
                          })
                        |> List.ofSeq
                      )

                    let! caseValues =
                      caseValues
                      |> NonEmptyList.TryOfList
                      |> Sum.fromOption (fun () -> Errors.Singleton "Error: expected non-empty list of cases.")
                      |> state.OfSum

                    let (union: GolangUnion) = { Name = t.Key; Cases = caseValues }

                    return GolangUnion.ToGolang () union
                  | _ ->
                    let! fields = ExprType.GetFields t.Value.Type |> state.OfSum

                    let! fields =
                      state.All(
                        fields
                        |> Seq.map (fun (fieldName, field) ->
                          state {
                            let! fieldType = field |> ExprType.ToGolangTypeAnnotation
                            let! fieldDefaultValue = field |> ExprType.ToGolangDefaultValue

                            return
                              {| FieldName = fieldName
                                 FieldType = fieldType
                                 FieldDefaultValue = fieldDefaultValue |}
                          })
                        |> List.ofSeq
                      )

                    let record =
                      { Name = t.Value.TypeId.TypeName
                        Fields = fields }

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
              for t in ctx.Types |> Map.values do
                do! ExprType.ToWriter { WriterName = t.TypeId.TypeName } t.Type |> state.Map ignore
            }

          match writersBuilder.run ((ctx, codegenConfig), Map.empty) with
          | Right(err: Errors, _) -> return! state.Throw err
          | Left(_, newWritersState) ->
            // do System.Console.WriteLine(newWritersState.ToFSharpString)
            let allWriters = newWritersState |> Option.defaultWith (fun () -> Map.empty)

            let! allCommittables =
              entityAPIsWithUPDATE
              |> Seq.map (fun e ->
                state {
                  let! t =
                    ctx.Types
                    |> Map.tryFindWithError e.TypeId.TypeName "type" e.TypeId.TypeName
                    |> state.OfSum

                  let t = t.Type

                  return!
                    allWriters
                    |> Map.tryFindWithError ({ WriterName = e.TypeId.TypeName }) "writer" e.TypeId.TypeName
                    |> Sum.map (fun w ->
                      {| Writer = w
                         EntityApiName = e.EntityName |})
                    |> state.OfSum
                })
              |> state.All

            let entityPATCHers =
              let entities =
                { GolangEntityPATCHers.FunctionName = $"{formName}EntityPATCHer"
                  Writers = allWriters
                  CommittableWriters = allCommittables
                  EntityNotFoundErrorConstructor = codegenConfig.EntityNotFoundError.Constructor }

              GolangEntityPATCHers.ToGolang (ctx, codegenConfig, formName) entities

            return
              StringBuilder.Many(
                seq {
                  yield launchersEnum
                  yield entitiesEnum
                  yield entityGETters
                  yield entityDEFAULTers
                  yield entityPOSTers
                  yield entityPATCHers
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
              $$"""// Code generated by ballerina, DO NOT EDIT.
              
package {{packageName}}

import (
  "fmt"
{{imports
  |> Seq.filter ((fun s -> String.IsNullOrEmpty s || String.IsNullOrWhiteSpace s) >> not)
  |> Seq.map (sprintf "  \"%s\"\n")
  |> Seq.fold (+) ""}})

"""

          StringBuilder.Many(
            seq {
              yield heading
              yield res
            }
          )
        )
