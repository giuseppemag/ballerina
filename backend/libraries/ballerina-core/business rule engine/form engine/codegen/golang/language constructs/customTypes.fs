namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum

type GolangCustomType =
  { TypeName: string
    GeneratedTypeName: string
    DefaultConstructor: string }

  static member Generate (_: GolangContext) (customTypes: List<GolangCustomType>) =
    customTypes
    |> Seq.map (fun t ->
      StringBuilder.Many(
        seq {
          yield StringBuilder.One "\n"
          yield StringBuilder.One $"type {t.TypeName} = {t.GeneratedTypeName}"
          yield StringBuilder.One "\n"
          yield StringBuilder.One $"func Default{t.TypeName}() {t.TypeName} {{"
          yield StringBuilder.One $"  return {t.GeneratedTypeName}({t.DefaultConstructor}());"
          yield StringBuilder.One "\n"
          yield StringBuilder.One "}"
          yield StringBuilder.One "\n"
        }
      ))
    |> StringBuilder.Many
