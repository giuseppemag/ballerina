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
        yield StringBuilder.One $"func {entities.FunctionName}[Delta ballerina.RawDeltaBase, Result any]("

        for w in generatedWriters do
          yield
            StringBuilder.Many(
              seq { yield StringBuilder.One($"  {!!w} Writer{w.Name.WriterName}[Delta], \n") }
            )

        for w in importedWriters do
          yield
            StringBuilder.Many(
              seq {
                yield
                  StringBuilder.One(
                    $"  {!!w} {w.Name.WriterName}, \n"
                  )
              }
            )

        for w in entities.CommittableWriters do
          yield
            StringBuilder.Many(seq { yield StringBuilder.One($"  commit{w.Name.WriterName} func({w.DeltaTypeName}) (Result, error), \n") })

        yield StringBuilder.One ") func(string, []Delta) (Result, error) { \n"

        yield StringBuilder.One "  var traverse func (entityName string, path []Delta) (ballerina.DeltaBase, error)\n"
        yield StringBuilder.One "  traverse = func (entityName string, path []Delta) (ballerina.DeltaBase, error) {\n"

        yield StringBuilder.One "    var deltaBaseNil ballerina.DeltaBase;\n"

        yield StringBuilder.One $"    switch entityName {{"
        yield StringBuilder.One "\n"

        for w in entities.Writers.Values do
          yield StringBuilder.One $"      case \"{w.Name.WriterName}\":"
          yield StringBuilder.One "\n"
          yield StringBuilder.One $"        if len(path) == 0 {{"
          yield StringBuilder.One "\n"
          yield StringBuilder.One $"          return {!!w}.Zero(), nil"
          yield StringBuilder.One "\n"
          yield StringBuilder.One $"        }}"
          yield StringBuilder.One "\n"
          yield StringBuilder.One $"        switch path[0].GetComponent() {{"
          yield StringBuilder.One "\n"
          for c in w.Components do
            yield StringBuilder.One $"          case \"{c.Key}\":"
            let (cwn,ct) = c.Value
            match entities.Writers |> Map.tryFind c.Value with
            | Some cw -> 
              yield StringBuilder.One $"            // the component is {cwn.WriterName} : {ct} and its writer is {!!cw}"
            | None -> 
              yield StringBuilder.One $"            // Error: cannot find writer {c.Value} : {ct} "
            yield StringBuilder.One "\n"
          yield StringBuilder.One $"        }}"
          yield StringBuilder.One "\n"

        yield StringBuilder.One $"    }}"
        yield StringBuilder.One "\n"
        // yield StringBuilder.One "    switch entityName {\n"

        // for e in entities.Entities do
        //   yield StringBuilder.One $$"""      case "{{e.EntityType}}Entity":  """
        //   yield StringBuilder.One "\n"

        //   yield
        //     StringBuilder.One
        //       $$"""        return serialize{{e.EntityName}}(Default{{e.EntityType}}()); """

        //   yield StringBuilder.One "\n"

        // yield StringBuilder.One "    }\n"

        yield StringBuilder.One $"    return deltaBaseNil, {entities.EntityNotFoundErrorConstructor}(entityName);\n"

        yield StringBuilder.One "  }\n"

        yield StringBuilder.One "  return func(entityName string, path []Delta) (Result, error) {\n"
        yield StringBuilder.One $"    var resultNil Result;\n"
        yield StringBuilder.One $"    print(traverse);\n"
        yield StringBuilder.One $"    return resultNil, ballerina.NewEntityNotFoundError(entityName) \n"
        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n\n"
      }
    )
