namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs


open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum

type GolangTablePATCHters =
  { FunctionName: string
    TableNotFoundErrorConstructor: string
    Tables:
      List<
        {| TableName: string
           TableDeltaType: string |}
       > }

  static member Generate (_: GolangContext) (tables: GolangTablePATCHters) =
    StringBuilder.Many(
      seq {
        yield StringBuilder.One $"func {tables.FunctionName}[Id any, Body any, Result any](\n"

        for t in tables.Tables do
          yield
            StringBuilder.Many(
              seq {
                yield
                  StringBuilder.One(
                    $$"""  deserializeDelta{{t.TableName}} func (Body) ({{t.TableDeltaType}},error), """
                  )

                yield StringBuilder.One "\n"

                yield
                  StringBuilder.One(
                    $$"""  applyDelta{{t.TableName}} func (Id, {{t.TableDeltaType}}) (Result,error), """
                  )

                yield StringBuilder.One "\n"
              }
            )

        yield
          StringBuilder.One
            ") func (string, Id, Body) (Result, error) { return func (tableName string, id Id, body Body) (Result, error) {\n"

        yield StringBuilder.One "    var ResultNil Result;\n"
        yield StringBuilder.One "    switch tableName {\n"

        for t in tables.Tables do
          yield StringBuilder.One $$"""      case "{{t.TableName}}":  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        var delta,err = deserializeDelta{{t.TableName}}(body); """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        if err != nil { return ResultNil, err }  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        applyDelta{{t.TableName}}(id, delta); """

          yield StringBuilder.One "\n"

        yield StringBuilder.One "    }\n"

        yield StringBuilder.One $"    return ResultNil, {tables.TableNotFoundErrorConstructor}(tableName);\n"

        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n\n"
      }
    )
