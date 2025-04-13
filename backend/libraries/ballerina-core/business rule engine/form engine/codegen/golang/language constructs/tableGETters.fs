namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs


open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Enum

type GolangTableGETters =
  { FunctionName: string
    TableNotFoundErrorConstructor: string
    Tables:
      List<
        {| TableName: string
           TableType: string |}
       > }

  static member Generate (_: GolangContext) (tables: GolangTableGETters) =
    StringBuilder.Many(
      seq {
        yield StringBuilder.One $"func {tables.FunctionName}[SearchParams any, Result any]("

        for t in tables.Tables do
          yield
            StringBuilder.Many(
              seq {
                yield StringBuilder.One($$"""  get{{t.TableName}} func (SearchParams) ({{t.TableType}},error), """)
                yield StringBuilder.One "\n"
                yield StringBuilder.One($$"""  serialize{{t.TableName}} func ({{t.TableType}}) (Result,error), """)
                yield StringBuilder.One "\n"
              }
            )

        yield
          StringBuilder.One
            ") func (string, SearchParams) (Result,error) { return func (tableName string, searchParams SearchParams) (Result, error) {\n"

        yield StringBuilder.One "    var resultNil Result;\n"
        yield StringBuilder.One "    switch tableName {\n"

        for t in tables.Tables do
          yield StringBuilder.One $$"""      case "{{t.TableName}}":  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        var res, err = get{{t.TableName}}(searchParams);  """
          yield StringBuilder.One "\n"

          yield StringBuilder.One $$"""        if err != nil { return resultNil, err }  """
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""        return serialize{{t.TableName}}(res); """

          yield StringBuilder.One "\n"

        yield StringBuilder.One "    }\n"

        yield StringBuilder.One $"    return resultNil, {tables.TableNotFoundErrorConstructor}(tableName);\n"

        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n\n"
      }
    )
