namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs
open Ballerina.DSL.Expr.Types.Model

module Enum =

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

  type GolangEnum =
    { Name: string
      Cases: List<{| Name:string; Value:string |}> }

    static member ToGolang (ctx: GolangContext) (enum: GolangEnum) =
      seq {
        yield StringBuilder.One $"type {enum.Name} string"
        yield StringBuilder.One "\n"
        yield StringBuilder.One "const ("
        yield StringBuilder.One "\n"

        for case in enum.Cases do
          yield
            StringBuilder.One
              $$"""  {{case.Name}} {{enum.Name}} = "{{case.Value}}" """

          yield StringBuilder.One "\n"

        yield StringBuilder.One ")"
        yield StringBuilder.One "\n"
        yield StringBuilder.One $$"""var All{{enum.Name}}Cases = [...]{{enum.Name}}{ """

        for case in enum.Cases do
          yield StringBuilder.One $$"""{{case.Name}}, """

        yield StringBuilder.One "}\n\n"
        yield StringBuilder.One $"func Default{enum.Name}() {enum.Name} {{ return All{enum.Name}Cases[0]; }}"
        yield StringBuilder.One "\n\n"
      }
      |> StringBuilder.Many
