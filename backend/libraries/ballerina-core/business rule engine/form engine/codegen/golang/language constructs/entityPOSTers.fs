namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum

type GolangEntityPOSTers =
  { FunctionName: string
    EntityNotFoundErrorConstructor: string
    Entities:
      List<
        {| EntityName: string
           EntityType: string |}
       > }

  static member Generate (_: GolangContext) (entities: GolangEntityPOSTers) =
    StringBuilder.Many(
      seq {
        yield StringBuilder.One $"func {entities.FunctionName}[id any, payload any]("

        for e in entities.Entities do
          yield
            StringBuilder.Many(
              seq {
                yield
                  StringBuilder.One($$"""deserialize{{e.EntityName}} func (id, payload) ({{e.EntityType}},error), """)

                yield StringBuilder.One($$"""process{{e.EntityName}} func (id, {{e.EntityType}}) error, """)
              }
            )


        yield
          StringBuilder.One
            ") func (string, id, payload) error { return func(entityName string, entityId id, entityValue payload) error {\n"

        yield StringBuilder.One "    switch entityName {\n"

        for e in entities.Entities do
          yield StringBuilder.One $$"""      case "{{e.EntityName}}":  """
          yield StringBuilder.One "\n"

          yield StringBuilder.One $$"""        var res, err = deserialize{{e.EntityName}}(entityId, entityValue);  """

          yield StringBuilder.One "\n"

          yield StringBuilder.One $$"""        if err != nil { return err; }  """

          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        return process{{e.EntityName}}(entityId, res);  """

          yield StringBuilder.One "\n"

        yield StringBuilder.One "    }\n"

        yield StringBuilder.One $"    return {entities.EntityNotFoundErrorConstructor}(entityName);\n"

        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n"

      }
    )
