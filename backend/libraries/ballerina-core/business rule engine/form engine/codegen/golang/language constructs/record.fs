namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.Expr.Types.Model

module Record =

  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open Ballerina.State.WithError
  open Ballerina.DSL.FormEngine.Model
  open Ballerina.DSL.FormEngine.Parser
  open Ballerina.Errors
  open Ballerina.Collections.Sum
  open Ballerina.Core.Object
  open Ballerina.Core.String
  open Ballerina.Core.StringBuilder
  open Ballerina.Core.Json
  open System.Text.RegularExpressions
  open Ballerina.Fun
  open Ballerina.Collections
  open Ballerina.Collections.NonEmptyList
  open Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs.Enum

  type GolangRecord =
    { Name: string
      Fields:
        List<
          {| FieldName: string
             FieldType: string
             FieldDefaultValue: string |}
         > }

    static member ToGolang
      (ctx: ParsedFormsContext, codegenConfig: CodeGenConfig, formName: string)
      (record: GolangRecord)
      =
      StringBuilder.Many(
        seq {

          let fieldsEnum: GolangEnum =
            { Name = $"{record.Name}FieldsEnum"
              Cases =
                record.Fields
                |> Seq.map (fun field ->
                  {| Name = $"{record.Name}{field.FieldName}FieldsEnum"
                     Value = field.FieldName |})
                |> Seq.toList }

          let fieldsEnum = GolangEnum.ToGolang () fieldsEnum

          let typeStart = $$"""type {{record.Name}} struct {""" + "\n"

          let fieldDeclarations =
            StringBuilder.Many(
              seq {
                for field in record.Fields do
                  yield StringBuilder.One "  "
                  yield StringBuilder.One field.FieldName.ToFirstUpper
                  yield StringBuilder.One " "
                  yield StringBuilder.One field.FieldType
                  yield StringBuilder.One "\n"
              }
            )

          let typeEnd =
            $$"""}
  """

          let consStart = $$"""func New{{record.Name}}("""

          let consParams =
            StringBuilder.Many(
              seq {
                for field in record.Fields do
                  yield StringBuilder.One field.FieldName
                  yield StringBuilder.One " "
                  yield StringBuilder.One field.FieldType
                  yield StringBuilder.One ", "
              }
            )

          let consDeclEnd =
            $$""") {{record.Name}} {
  var res {{record.Name}}
  """

          let consBodyEnd =
            $$"""  return res
}

"""

          let consFieldInits =
            StringBuilder.Many(
              seq {
                for field in record.Fields do
                  yield StringBuilder.One "  res."
                  yield StringBuilder.One field.FieldName.ToFirstUpper
                  yield StringBuilder.One " = "
                  yield StringBuilder.One field.FieldName
                  yield StringBuilder.One ";\n"
              }
            )

          let defaultValue: StringBuilder =
            StringBuilder.Many(
              seq {
                yield StringBuilder.One $"func Default{record.Name}() {record.Name} {{"

                yield StringBuilder.One "\n"
                yield StringBuilder.One $"  return New{record.Name}("

                for field in record.Fields do
                  yield StringBuilder.One(field.FieldDefaultValue)
                  yield StringBuilder.One ", "

                yield StringBuilder.One ");"
                yield StringBuilder.One "\n}\n"
                yield StringBuilder.One "\n"
              }
            )

          yield StringBuilder.One "\n"
          yield fieldsEnum
          yield StringBuilder.One "\n"
          yield StringBuilder.One typeStart
          yield fieldDeclarations
          yield StringBuilder.One typeEnd
          yield StringBuilder.One "\n"
          yield StringBuilder.One consStart
          yield consParams
          yield StringBuilder.One consDeclEnd
          yield consFieldInits
          yield StringBuilder.One consBodyEnd
          yield defaultValue
        }
      )
