namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Ballerina.Core.String
open Enum
open Ballerina.DSL.FormEngine.Codegen.Golang.Generator.Model

type GolangEntityPATCHers =
  { FunctionName: string
    EntityNotFoundErrorConstructor: string
    Writers: Map<WriterName, Writer>
    CommittableWriters: List<Writer> }

  static member ToGolang (_: GolangContext) (entities: GolangEntityPATCHers) =
    let generatedWriters, importedWriters =
      entities.Writers
      |> Map.values
      |> List.ofSeq
      |> List.partition (fun w -> w.Kind = WriterKind.Generated)

    StringBuilder.Many(
      seq {
        yield StringBuilder.One $"func {entities.FunctionName}[Delta any, Result any]("

        for w in generatedWriters do
          yield
            StringBuilder.Many(
              seq { yield StringBuilder.One($"  writer{w.Name.WriterName} Writer{w.Name.WriterName}[Delta], \n") }
            )

        for w in importedWriters do
          yield
            StringBuilder.Many(
              seq {
                yield
                  StringBuilder.One(
                    $"  writer{w.Path |> List.rev |> System.String.JoinSeq '_'} {w.Name.WriterName}, \n"
                  )
              }
            )

        for w in entities.CommittableWriters do
          yield
            StringBuilder.Many(seq { yield StringBuilder.One($"  commit{w.Name.WriterName} func({w.DeltaTypeName}) (Result, error), \n") })

        yield StringBuilder.One ") func(string, []Delta) (Result, error) { "
        // var traverse func (entityName string, path []Delta) (Result, error)
        // traverse = func (entityName string, path []Delta) (Result, error) {

        yield StringBuilder.One "  var traverse func (entityName string, path []Delta) (Result, error)\n"
        yield StringBuilder.One "  traverse = func (entityName string, path []Delta) (Result, error) {\n"

        yield StringBuilder.One "    var resultNil Result;\n"

        yield StringBuilder.One $"    switch entityName {{"
        yield StringBuilder.One "\n"

        for w in generatedWriters do
          yield StringBuilder.One $"      case \"{w.Name.WriterName}\":"
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

        yield StringBuilder.One $"    return resultNil, {entities.EntityNotFoundErrorConstructor}(entityName);\n"

        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "return traverse\n"
        yield StringBuilder.One "}\n\n"
      }
    )
