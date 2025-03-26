namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Ballerina.Core.String
open Ballerina.Core.Object
open Enum
open Ballerina.DSL.FormEngine.Codegen.Golang.Generator.Model
open Ballerina.DSL.Expr.Types.Model
open System.Text.RegularExpressions

type GolangEntityPATCHers =
  { FunctionName: string
    EntityNotFoundErrorConstructor: string
    Writers: Map<WriterName * ExprType, Writer>
    CommittableWriters: List<Writer> }

  static member ToGolang (_: GolangContext) (entities: GolangEntityPATCHers) =
    let (!) (s:string) = Regex.Replace(s, "[\(\)\.\[\],\s<>]", "_")
    let (!!) (w:Writer) = 
      match w.Kind with
      | WriterKind.Generated ->
        $"writer{w.Name.WriterName}"
      | WriterKind.Imported ->
        !w.Name.WriterName
    let generatedWriters, importedWriters =
      entities.Writers
      |> Map.values
      |> List.ofSeq
      |> List.partition (fun w -> w.Kind = WriterKind.Generated)

    StringBuilder.Many(
      seq {
        yield StringBuilder.One $"func {entities.FunctionName}[Result any](\n"

        for w in entities.CommittableWriters do
          yield
            StringBuilder.Many(seq { yield StringBuilder.One($"  commit{w.Name.WriterName} func({w.DeltaTypeName}) (Result, error), \n") })

        yield StringBuilder.One ") func(string, ballerina.DeltaBase) (Result, error) { \n"

        yield StringBuilder.One "  return func(entityName string, delta ballerina.DeltaBase) (Result, error) {\n"
        yield StringBuilder.One $"    var resultNil Result;\n"
        yield StringBuilder.One $"    switch entityName {{\n"
        for e in entities.CommittableWriters do
          yield StringBuilder.One $"      case \"{e.Name.WriterName}\":\n"
          yield StringBuilder.One $"        if delta{e.Name.WriterName},ok := delta.({e.DeltaTypeName}); ok {{\n"
          yield StringBuilder.One $"          return commit{e.Name.WriterName}(delta{e.Name.WriterName}) \n"
          yield StringBuilder.One $"        }} else {{ \n"
          yield StringBuilder.One $"          return resultNil, ballerina.NewEntityNameAndDeltaTypeMismatch(entityName, delta)\n"
          yield StringBuilder.One $"        }}\n"
        yield StringBuilder.One $"    }}\n"
        yield StringBuilder.One $"    return resultNil, ballerina.NewEntityNotFoundError(entityName) \n"
        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n\n"
      }
    )
