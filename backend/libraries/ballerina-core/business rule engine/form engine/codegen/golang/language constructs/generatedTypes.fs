namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.Expr.Types.Model
open Ballerina.State.WithError
open Ballerina.DSL.FormEngine.Model
open Ballerina.DSL.FormEngine.Parser
open Ballerina.Errors
open Ballerina.Collections.Sum
open Ballerina.Core.StringBuilder
open System.Text.RegularExpressions
open Ballerina.Collections.NonEmptyList
open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.Enum
open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.Union
open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.Record
open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.TypeAnnotations
open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.DefaultValues

type GolangGeneratedType =
  { TypeName: string
    Type: ExprType }

  static member Generate
    (ctx: ParsedFormsContext, codegenConfig: CodeGenConfig, formName: string)
    (typesToGenerate: List<GolangGeneratedType>)
    =
    let identifierAllowedRegex = Regex codegenConfig.IdentifierAllowedRegex
    let (!) (s: string) = identifierAllowedRegex.Replace(s, "_")

    state.All(
      typesToGenerate
      |> Seq.map (fun t ->
        state {
          match t.Type with
          | ExprType.UnionType cases when
            cases |> Map.values |> Seq.forall (fun case -> case.Fields.IsUnitType)
            && cases |> Map.isEmpty |> not
            ->
            let enum: GolangEnum =
              { Name = $"{t.TypeName}"
                Cases =
                  cases
                  |> Map.values
                  |> Seq.map (fun case -> case.CaseName)
                  |> Seq.map (fun enumCase ->
                    {| Name = $"{t.TypeName}{!enumCase}"
                       Value = $"{enumCase}" |})
                  |> Seq.toList }

            return StringBuilder.Many(seq { yield GolangEnum.Generate () enum })
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

                    match fields |> Seq.tryFind (fun f -> f.Key.[0] |> System.Char.IsLower) with
                    | Some f ->
                      return!
                        Errors.Singleton
                          $"Error: field name '{f.Key}' starts with a lowercase character, and this would not serialize correctly to JSON in Go."
                        |> state.Throw
                    | None ->
                      let! fields =
                        fields
                        |> Seq.map (fun f ->
                          state {
                            let! (field: string) = f.Value |> ExprType.GenerateTypeAnnotation
                            let! (fieldDefaultValue: string) = f.Value |> ExprType.GenerateDefaultValue

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

            let (union: GolangUnion) =
              { Name = t.TypeName
                Cases = caseValues }

            return GolangUnion.Generate () union
          | _ ->
            let! fields = ExprType.GetFields t.Type |> state.OfSum

            let! fields =
              state.All(
                fields
                |> Seq.map (fun (fieldName, field) ->
                  state {
                    let! fieldType = field |> ExprType.GenerateTypeAnnotation
                    let! fieldDefaultValue = field |> ExprType.GenerateDefaultValue

                    return
                      {| FieldName = fieldName
                         FieldType = fieldType
                         FieldDefaultValue = fieldDefaultValue |}
                  })
                |> List.ofSeq
              )

            match fields |> Seq.tryFind (fun f -> f.FieldName.[0] |> System.Char.IsLower) with
            | Some f ->
              return!
                Errors.Singleton
                  $"Error: field name '{f.FieldName}' starts with a lowercase character, and this would not serialize correctly to JSON in Go."
                |> state.Throw
            | None ->
              let record = { Name = t.TypeName; Fields = fields }

              return GolangRecord.Generate (ctx, codegenConfig, formName) record
        }
        |> state.WithErrorContext $"...when generating type {t.TypeName}")
      |> List.ofSeq
    )
