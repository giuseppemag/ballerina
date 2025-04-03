namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum

type GolangEntityGETters =
  { FunctionName: string
    EntityNotFoundErrorConstructor: string
    Entities:
      List<
        {| EntityName: string
           EntityType: string |}
       > }

  static member Generate (_: GolangContext) (entities: GolangEntityGETters) =
    StringBuilder.Many(
      seq {
        yield StringBuilder.One $"func {entities.FunctionName}[id any, result any]("

        for e in entities.Entities do
          yield
            StringBuilder.Many(
              seq {
                yield StringBuilder.One($$"""get{{e.EntityName}} func (id) ({{e.EntityType}},error), """)

                yield StringBuilder.One($$"""serialize{{e.EntityName}} func ({{e.EntityType}}) (result,error), """)
              }
            )

        yield
          StringBuilder.One
            ") func (string, id) (result,error) { return func (entityName string, entityId id) (result,error) {\n"

        yield StringBuilder.One "    var resultNil result;\n"
        yield StringBuilder.One "    switch entityName {\n"

        for e in entities.Entities do
          yield StringBuilder.One $$"""      case "{{e.EntityName}}":  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        var res, err = get{{e.EntityName}}(entityId);  """
          yield StringBuilder.One "\n"

          yield StringBuilder.One $$"""        if err != nil { return resultNil, err }  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        return serialize{{e.EntityName}}(res); """

          yield StringBuilder.One "\n"

        yield StringBuilder.One "    }\n"

        yield StringBuilder.One $"    return resultNil, {entities.EntityNotFoundErrorConstructor}(entityName);\n"

        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n\n"
      }
    )
