namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs
open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum
open Ballerina.DSL.FormEngine.Codegen.Golang.Generator.Model

  type GolangEntityPATCHers = { FunctionName:string; EntityNotFoundErrorConstructor:string; Entities:List<{| EntityName:string; EntityType:string; EntityWriter:string; EntityDelta:string |}>; Writers:Map<WriterName, Writer>; CommittableWriters:List<Writer> } with
    static member ToGolang (_:GolangContext) (entities:GolangEntityPATCHers) = 
      StringBuilder.Many(
        seq {
          yield StringBuilder.One $"func {entities.FunctionName}[Delta any, Result any]("

          for w in entities.Writers |> Map.values do
            if w.Kind = WriterKind.Generated then
              yield StringBuilder.Many(
                  seq {
                    yield
                      StringBuilder.One(
                        $"writer{w.Name.WriterName} Writer{w.Name.WriterName}[Delta], \n"
                      )
                  }
              )
          for w in entities.Writers |> Map.values do
            if w.Kind = WriterKind.Imported then
              yield StringBuilder.Many(
                  seq {
                    yield
                      StringBuilder.One(
                        $"writer{System.String.Join('_', w.Path |> List.rev)} {w.Name.WriterName}, \n"
                      )
                  }
              )
          for w in entities.CommittableWriters do
            yield StringBuilder.Many(
                seq {
                  yield
                    StringBuilder.One(
                      $"commit{w.Name.WriterName} {w.DeltaTypeName}, \n"
                    )
                }
            )

          yield
            StringBuilder.One ") func(string) (Result, error) { return func(entityName string) (Result, error) {\n"

          yield StringBuilder.One "    var resultNil Result;\n"
          // yield StringBuilder.One "    switch entityName {\n"

          // for e in entities.Entities do
          //   yield StringBuilder.One $$"""      case "{{e.EntityType}}Entity":  """
          //   yield StringBuilder.One "\n"

          //   yield
          //     StringBuilder.One
          //       $$"""        return serialize{{e.EntityName}}(Default{{e.EntityType}}()); """

          //   yield StringBuilder.One "\n"

          // yield StringBuilder.One "    }\n"

          yield
            StringBuilder.One
              $"    return resultNil, {entities.EntityNotFoundErrorConstructor}(entityName);\n"

          yield StringBuilder.One "  }\n"
          yield StringBuilder.One "}\n\n"
        })
