namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.Expr.Types.Model

module StreamGETters =

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

  type GolangStreamGETters =
    { FunctionName: string
      Streams:
        List<
          {| StreamName: string
             StreamType: string |}
         >
      StreamNotFoundErrorConstructor: string }

    static member Generate (ctx: GolangContext) (getters: GolangStreamGETters) =
      StringBuilder.Many(
        seq {
          yield
            StringBuilder.One
              $"func {getters.FunctionName}[searchParams any, serializedResult any](streamName string, searchArgs searchParams, "

          yield
            StringBuilder.Many(
              getters.Streams
              |> Seq.map (fun e ->
                StringBuilder.One(
                  $$"""get{{e.StreamName}} func(searchParams) ([]{{e.StreamType}}, error), serialize{{e.StreamName}} func(searchParams, []{{e.StreamType}}) (serializedResult, error), """
                ))
            )

          yield StringBuilder.One ") (serializedResult,error) {\n"
          yield StringBuilder.One "  var result serializedResult\n"
          yield StringBuilder.One "  switch streamName {\n"

          yield
            StringBuilder.Many(
              getters.Streams
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
            )

          yield StringBuilder.One "  }\n"

          yield StringBuilder.One $$"""  return result, {{getters.StreamNotFoundErrorConstructor}}(streamName)"""

          yield StringBuilder.One "\n}\n\n"
        }
      )
