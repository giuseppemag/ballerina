namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs


open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum

type GolangTablePOSTters =
  { FunctionName: string
    TableNotFoundErrorConstructor: string
    Tables:
      List<
        {| TableName: string
           TableRowType: string |}
       > }

  static member Generate (_: GolangContext) (tables: GolangTablePOSTters) =
    StringBuilder.Many(
      seq {
        yield StringBuilder.One $"func {tables.FunctionName}[Body any, Result any]("

        for t in tables.Tables do
          yield
            StringBuilder.Many(
              seq {
                yield
                  StringBuilder.One($$"""  deserializeRow{{t.TableName}} func (Body) ({{t.TableRowType}},error), """)

                yield StringBuilder.One "\n"
                yield StringBuilder.One($$"""  upsertRow{{t.TableName}} func ({{t.TableRowType}}) (Result,error), """)
                yield StringBuilder.One "\n"
              }
            )

        yield
          StringBuilder.One
            ") func (string, Body) (Result, error) { return func (tableName string, body Body) (Result, error) {\n"

        yield StringBuilder.One "    var resultNil Result;\n"
        yield StringBuilder.One "    switch tableName {\n"

        for t in tables.Tables do
          yield StringBuilder.One $$"""      case "{{t.TableName}}":  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        var row,err = deserializeRow{{t.TableName}}(body); """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        if err != nil { return resultNil, err }  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        upsertRow{{t.TableName}}(row); """

          yield StringBuilder.One "\n"

        yield StringBuilder.One "    }\n"

        yield StringBuilder.One $"    return resultNil, {tables.TableNotFoundErrorConstructor}(tableName);\n"

        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n\n"
      }
    )
