namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs
open Ballerina.DSL.Expr.Types.Model

module Union =

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

  type GolangUnion =
    { Name: string
      Cases: NonEmptyList<{| CaseName:string; Fields:List<{| FieldName:string; FieldType:string; FieldDefaultValue:string |}> |}> }
    static member ToGolang (ctx:GolangContext) (union:GolangUnion) = 
      let cases = union.Cases
      let firstUnionCaseName = union.Cases.Head.CaseName

      StringBuilder.Many(
        seq {
          yield StringBuilder.One "\n"

          for case in cases do
            let caseValue = case.Fields
            yield StringBuilder.One $"type {union.Name}{case.CaseName}Value struct {{\n"

            for field in case.Fields do
              yield StringBuilder.One $"  {field.FieldName} {field.FieldType}; \n"

            yield StringBuilder.One $"}}\n"

            yield StringBuilder.One $"func New{union.Name}{case.CaseName}Value("

            for field in caseValue do
              yield StringBuilder.One $"{field.FieldName} {field.FieldType}, "

            yield StringBuilder.One $") {union.Name}{case.CaseName}Value {{\n"

            yield StringBuilder.One $"  var res {union.Name}{case.CaseName}Value;\n"

            for field in caseValue do
              yield StringBuilder.One $"  res.{field.FieldName} = {field.FieldName}; \n"

            yield StringBuilder.One $"  return res;\n"
            yield StringBuilder.One $"}}\n"

            yield
              StringBuilder.One
                $"func Default{union.Name}{case.CaseName}Value() {union.Name}{case.CaseName}Value {{"

            yield StringBuilder.One "\n"

            yield StringBuilder.One $" return New{union.Name}{case.CaseName}Value("

            for field in caseValue do
              yield StringBuilder.One $"{field.FieldDefaultValue}, "

            yield StringBuilder.One $");"
            yield StringBuilder.One "\n"

            yield StringBuilder.One $"}}\n"


          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""type {{union.Name}}Cases string"""
          yield StringBuilder.One "\n"
          yield StringBuilder.One "const ("
          yield StringBuilder.One "\n"

          for case in cases do
            yield
              StringBuilder.One
                $$"""  {{union.Name}}{{case.CaseName}} {{union.Name}}Cases = "{{case.CaseName}}"; """

            yield StringBuilder.One "\n"

          yield StringBuilder.One ")"
          yield StringBuilder.One "\n"
          yield StringBuilder.One "\n"
          yield StringBuilder.One $$"""type {{union.Name}} struct {"""
          yield StringBuilder.One "\n"
          yield StringBuilder.One $"  Discriminator {union.Name}Cases\n"

          for case in cases do
            yield StringBuilder.One $"  {union.Name}{case.CaseName} {union.Name}{case.CaseName}Value; "

            yield StringBuilder.One "\n"

          yield StringBuilder.One "}"
          yield StringBuilder.One "\n"

          yield StringBuilder.One $"func Default{union.Name}() {union.Name} {{"
          yield StringBuilder.One "\n"

          yield
            StringBuilder.One
              $"  return New{union.Name}{firstUnionCaseName}(Default{union.Name}{firstUnionCaseName}Value());"

          yield StringBuilder.One "\n"
          yield StringBuilder.One "}"
          yield StringBuilder.One "\n"

          // func Default{UnionName}() {UnionName} {
          // 	return New{FirstUnionCaseName}(Default{FirstUnionCaseName}Value());
          // }

          for case in cases do
            yield StringBuilder.One $$"""func New{{union.Name}}{{case.CaseName}}( """

            yield StringBuilder.One $"value {union.Name}{case.CaseName}Value, "
            yield StringBuilder.One $") {union.Name} {{\n"
            yield StringBuilder.One $"  var res {union.Name};\n"

            yield StringBuilder.One $$"""  res.Discriminator = {{union.Name}}{{case.CaseName}};"""

            yield StringBuilder.One $"\n"

            yield StringBuilder.One $$"""  res.{{union.Name}}{{case.CaseName}} = value;"""

            yield StringBuilder.One $"\n"
            yield StringBuilder.One $"  return res;\n"
            yield StringBuilder.One $"}}\n"

          yield StringBuilder.One "\n"

          yield StringBuilder.One $"func Match{union.Name}[result any](value {union.Name}, "

          // BUILD HERE THE DEFAULTING BASED ON THE INVOCATION OF THE CONSTRUCTOR OF THE FIRST CASE

          for case in cases do
            yield
              StringBuilder.One
                $"on{union.Name}{case.CaseName} func({union.Name}{case.CaseName}Value) (result,error), "

          yield StringBuilder.One $") (result,error) {{\n"
          yield StringBuilder.One $"  switch value.Discriminator {{\n"

          for case in cases do
            yield StringBuilder.One $"    case {union.Name}{case.CaseName}: \n"

            yield
              StringBuilder.One
                $"      return on{union.Name}{case.CaseName}(value.{union.Name}{case.CaseName}) \n"

          yield StringBuilder.One $"  }}\n"
          yield StringBuilder.One "  var res result\n"

          yield
            StringBuilder.One
              """  return res, fmt.Errorf("%s is not a valid discriminator value", value.Discriminator );"""

          yield StringBuilder.One $"\n"
          yield StringBuilder.One $"}}\n"
        }
      )
