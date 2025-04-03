namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.Expr.Types.Model

module StreamPOSTers =

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

  type GolangStreamPOSTers =
    { FunctionName: string
      Streams:
        List<
          {| StreamName: string
             StreamType: string |}
         >
      GuidType: string
      StreamNotFoundErrorConstructor: string }

    static member Generate (ctx: GolangContext) (posters: GolangStreamPOSTers) =
      StringBuilder.Many(
        seq {
          yield
            StringBuilder.One
              $"func {posters.FunctionName}[serializedResult any](streamName string, id {posters.GuidType}, "

          yield
            StringBuilder.Many(
              posters.Streams
              |> Seq.map (fun e ->
                StringBuilder.One(
                  $$"""get{{e.StreamName}} func({{posters.GuidType}}) ({{e.StreamType}}, error), serialize{{e.StreamName}} func({{e.StreamType}}) (serializedResult, error), """
                ))
            )

          yield StringBuilder.One ") (serializedResult,error) {\n"
          yield StringBuilder.One "  var result serializedResult\n"
          yield StringBuilder.One "  switch streamName {\n"

          yield
            StringBuilder.Many(
              posters.Streams
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
            )

          yield StringBuilder.One "  }\n"

          yield StringBuilder.One $$"""  return result, {{posters.StreamNotFoundErrorConstructor}}(streamName)"""

          yield StringBuilder.One "\n}\n\n"
        }
      )
