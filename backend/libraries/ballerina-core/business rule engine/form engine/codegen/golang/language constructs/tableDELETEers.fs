namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs


open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum

type GolangTableDELETEters =
  { FunctionName: string
    TableNotFoundErrorConstructor: string
    Tables: List<{| TableName: string |}> }

  static member Generate (_: GolangContext) (tables: GolangTableDELETEters) =
    StringBuilder.Many(
      seq {
        yield StringBuilder.One $"func {tables.FunctionName}[Id any, Result any](\n"

        for t in tables.Tables do
          yield
            StringBuilder.Many(
              seq {
                yield StringBuilder.One($$"""  deleteRow{{t.TableName}} func (Id) (Result, error), """)
                yield StringBuilder.One "\n"
              }
            )

        yield
          StringBuilder.One
            ") func (string, Id) (Result, error) { return func (tableName string, id Id) (Result, error) {\n"

        yield StringBuilder.One "    var ResultNil Result;\n"
        yield StringBuilder.One "    switch tableName {\n"

        for t in tables.Tables do
          yield StringBuilder.One $$"""      case "{{t.TableName}}":  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        deleteRow{{t.TableName}}(id); """

          yield StringBuilder.One "\n"

        yield StringBuilder.One "    }\n"

        yield StringBuilder.One $"    return ResultNil, {tables.TableNotFoundErrorConstructor}(tableName);\n"

        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n\n"
      }
    )
