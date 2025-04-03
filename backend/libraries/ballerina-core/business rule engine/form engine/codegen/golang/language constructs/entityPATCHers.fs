namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.FormEngine.Model
open Ballerina.Core
open Ballerina.Core.String
open Ballerina.Core.Object
open Enum
open Ballerina.DSL.FormEngine.Codegen.Golang.Generator.Model
open Ballerina.DSL.Expr.Types.Model
open System.Text.RegularExpressions

type GolangEntityPATCHers =
  { FunctionName: string
    EntityNotFoundErrorConstructor: string
    Writers: Map<WriterName, Writer>
    CommittableWriters:
      List<
        {| Writer: Writer
           EntityApiName: string |}
       > }

  static member Generate
    (ctx: ParsedFormsContext, codegenConfig: CodeGenConfig, formName: string)
    (entities: GolangEntityPATCHers)
    =
    let (!) (s: string) =
      Regex.Replace(s, "[\(\)\.\[\],\s<>]", "_")

    let (!!) (w: Writer) =
      match w.Kind with
      | WriterKind.Generated -> $"writer{w.Name.WriterName}"
      | WriterKind.Imported -> !w.Name.WriterName

    let generatedWriters, importedWriters =
      entities.Writers
      |> Map.values
      |> List.ofSeq
      |> List.partition (fun w -> w.Kind = WriterKind.Generated)

    let deltas =
      seq {
        for wkv in entities.Writers |> Seq.filter (fun w -> w.Value.Kind.IsGenerated) do
          let w = wkv.Value

          let patterns =
            seq {
              for wf in w.Components do
                match entities.Writers |> Map.tryFind (wf.Value |> fst) with
                | Some nw ->
                  yield
                    {| Name = wf.Key
                       Type = nw.DeltaTypeName |}
                | _ -> ()

              if ctx.Types |> Map.containsKey (wkv.Key).WriterName then
                yield
                  {| Name = "Replace"
                     Type = (wkv.Key).WriterName |}
            }

          let casesEnum: GolangEnum =
            { Name = $"{formName}Delta{w.Name.WriterName}EffectsEnum"
              Cases =
                patterns
                |> Seq.map (fun p ->
                  {| Name = $"{formName}{w.Name.WriterName}{p.Name}"
                     Value = $"{w.Name.WriterName}{p.Name}" |})
                |> Seq.toList }

          yield GolangEnum.Generate () casesEnum

          yield StringBuilder.One $"type {w.DeltaTypeName} struct {{\n"
          yield StringBuilder.One $"  {codegenConfig.DeltaBase.GeneratedTypeName}\n"
          yield StringBuilder.One $"  Discriminator {casesEnum.Name}\n"

          for p in patterns do
            yield StringBuilder.One $"  {p.Name} {p.Type}\n"

          yield StringBuilder.One $"}}"
          yield StringBuilder.One "\n"

          for p in patterns do
            yield StringBuilder.One $"func New{w.DeltaTypeName}{p.Name}(value {p.Type}) {w.DeltaTypeName} {{\n"
            yield StringBuilder.One $"  return {w.DeltaTypeName} {{\n"
            yield StringBuilder.One $"    Discriminator:{formName}{w.Name.WriterName}{p.Name},\n"
            yield StringBuilder.One $"    {p.Name}:value,\n"
            yield StringBuilder.One $" }}\n"
            yield StringBuilder.One $"}}\n"

          yield StringBuilder.One $"func Match{w.DeltaTypeName}[Result any](\n"

          for wf in w.Components do
            match entities.Writers |> Map.tryFind (wf.Value |> fst) with
            | Some nw -> yield StringBuilder.One $"  on{wf.Key} func({nw.DeltaTypeName}) (Result, error),\n"
            | _ ->
              yield
                StringBuilder.One
                  $"  // ERROR: cannot find writer {wf.Value} in {(entities.Writers |> Map.keys |> List.ofSeq).ToFSharpString},\n"
          // { WriterName = t.TypeId.TypeName }
          if ctx.Types |> Map.containsKey (wkv.Key).WriterName then
            yield StringBuilder.One $"  onReplace func({(wkv.Key).WriterName}) (Result, error),\n"

          yield StringBuilder.One $") func ({w.DeltaTypeName}) (Result, error) {{\n"
          yield StringBuilder.One $"  return func (delta {w.DeltaTypeName}) (Result,error) {{\n"
          yield StringBuilder.One $"    var result Result\n"
          yield StringBuilder.One $"    switch delta.Discriminator {{\n"

          for p in patterns do
            yield StringBuilder.One $"      case \"{w.Name.WriterName}{p.Name}\":\n"
            yield StringBuilder.One $"        return on{p.Name}(delta.{p.Name})\n"

          yield StringBuilder.One $"    }}\n"
          yield StringBuilder.One $"    return result, nil\n"
          yield StringBuilder.One $"  }}\n"
          yield StringBuilder.One $"}}\n"

      }
      |> StringBuilder.Many


    StringBuilder.Many(
      seq {
        yield deltas

        yield StringBuilder.One $"func {entities.FunctionName}[Result any](\n"

        for w in entities.CommittableWriters do
          yield
            StringBuilder.Many(
              seq {
                yield
                  StringBuilder.One(
                    $"  commit{w.Writer.Name.WriterName} func({w.Writer.DeltaTypeName}) (Result, error), \n"
                  )
              }
            )

        yield StringBuilder.One $") func(string, {codegenConfig.DeltaBase.GeneratedTypeName}) (Result, error) {{ \n"

        yield
          StringBuilder.One
            $"  return func(entityName string, delta {codegenConfig.DeltaBase.GeneratedTypeName}) (Result, error) {{\n"

        yield StringBuilder.One $"    var resultNil Result;\n"
        yield StringBuilder.One $"    switch entityName {{\n"

        for e in entities.CommittableWriters do
          yield StringBuilder.One $"      case \"{e.EntityApiName}\":\n"

          yield
            StringBuilder.One
              $"        if delta{e.Writer.Name.WriterName},ok := delta.({e.Writer.DeltaTypeName}); ok {{\n"

          yield
            StringBuilder.One $"          return commit{e.Writer.Name.WriterName}(delta{e.Writer.Name.WriterName}) \n"

          yield StringBuilder.One $"        }} else {{ \n"

          yield
            StringBuilder.One
              $"          return resultNil, {codegenConfig.EntityNameAndDeltaTypeMismatchError.Constructor}(entityName, delta)\n"

          yield StringBuilder.One $"        }}\n"

        yield StringBuilder.One $"    }}\n"
        yield StringBuilder.One $"    return resultNil, {codegenConfig.EntityNotFoundError.Constructor}(entityName) \n"
        yield StringBuilder.One "  }\n"
        yield StringBuilder.One "}\n\n"
      }
    )
