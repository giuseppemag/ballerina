namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.Expr.Types.Model

module EnumPOSTers =

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

  type GolangEnumPOSTers =
    { FunctionName: string
      Enums: List<{| EnumName: string; EnumType: string |}>
      UnitType: string
      InvalidEnumValueCombinationError: string }

    static member Generate (ctx: GolangContext) (posters: GolangEnumPOSTers) =
      StringBuilder.Many(
        seq {
          yield StringBuilder.One $"func {posters.FunctionName}(enumName string, enumValue string, "

          yield
            StringBuilder.Many(
              posters.Enums
              |> Seq.map (fun e ->
                StringBuilder.One($$"""on{{e.EnumName}} func ({{e.EnumType}}) ({{posters.UnitType}},error), """))
            )

          yield StringBuilder.One $$""") ({{posters.UnitType}},error) {"""
          yield StringBuilder.One "\n"
          yield StringBuilder.One "  switch enumName {\n"

          yield
            StringBuilder.Many(
              posters.Enums
              |> Seq.map (fun e ->
                StringBuilder.Many(
                  seq {
                    yield StringBuilder.One(sprintf "  case \"%s\":\n" e.EnumName)

                    yield
                      StringBuilder.One(
                        $$"""    if slices.Contains(All{{e.EnumType}}Cases[:], {{e.EnumType}}(enumValue)) {"""
                      )

                    yield StringBuilder.One("\n")

                    yield StringBuilder.One($$"""      return on{{e.EnumName}}({{e.EnumType}}(enumValue))""")

                    yield StringBuilder.One("\n")
                    yield StringBuilder.One("    }\n")
                  }
                ))
            )

          yield StringBuilder.One "  }\n"
          yield StringBuilder.One $$"""  var result {{posters.UnitType}}"""
          yield StringBuilder.One "\n"

          yield
            StringBuilder.One
              $$"""  return result, {{posters.InvalidEnumValueCombinationError}}(enumName, enumValue )"""

          yield StringBuilder.One "\n}\n\n"
        }
      )
