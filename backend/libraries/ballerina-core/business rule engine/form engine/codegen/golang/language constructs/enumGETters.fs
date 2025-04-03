namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.Expr.Types.Model

module EnumGETters =

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

  type GolangEnumGETters =
    { FunctionName: string
      Enums: List<{| EnumName: string; EnumType: string |}>
      EnumNotFoundErrorConstructor: string }

    static member Generate (ctx: GolangContext) (getters: GolangEnumGETters) =
      StringBuilder.Many(
        seq {
          yield StringBuilder.One $"func {getters.FunctionName}[result any](enumName string, "

          yield
            StringBuilder.Many(
              getters.Enums
              |> Seq.map (fun e -> StringBuilder.One($$"""on{{e.EnumName}} func ([]{{e.EnumType}}) (result,error), """))
            )

          yield StringBuilder.One ") (result,error) {\n"
          yield StringBuilder.One "  switch enumName {\n"

          yield
            StringBuilder.Many(
              getters.Enums
              |> Seq.map (fun e ->
                StringBuilder.Many(
                  seq {
                    yield
                      StringBuilder.One(
                        $$"""    case "{{e.EnumName}}": return on{{e.EnumName}}(All{{e.EnumType}}Cases[:])"""
                      )

                    yield StringBuilder.One "\n"
                  }
                ))
            )

          yield StringBuilder.One "  }\n"
          yield StringBuilder.One "  var res result\n"
          yield StringBuilder.One $$"""  return res, {{getters.EnumNotFoundErrorConstructor}}(enumName)"""
          yield StringBuilder.One "\n}\n\n"
        }
      )
