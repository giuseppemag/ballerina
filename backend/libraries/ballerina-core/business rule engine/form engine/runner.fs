namespace Ballerina.DSL.FormEngine

module Runner =
  open FSharp.Data
  open System
  open System.IO
  open Ballerina.Collections.Sum
  open Ballerina.Errors
  open Ballerina.State.WithError
  open System.Text.Json
  open System.Text.Json.Serialization
  open System.Text.RegularExpressions
  open Ballerina.Core.Object
  open Ballerina.Core.String
  open Ballerina.Core.StringBuilder
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open Ballerina.DSL.FormEngine.Model
  open Ballerina.DSL.FormEngine.Parser
  open Ballerina.DSL.FormEngine.Validator
  open Ballerina.DSL.FormEngine.Codegen.Golang
  open System.Text.RegularExpressions

  type FormsGenTarget =
    | csharp = 1
    | golang = 2

  let runSingle
    (validate: bool)
    (language: FormsGenTarget)
    (inputPath: string)
    (outputPath: string)
    (generatedPackage: string)
    (formName: string)
    (codegenConfigPath: string)
    =
    let inputFileNameWithoutExtension =
      System.IO.Path.GetFileNameWithoutExtension inputPath
    // let inputDirectory = System.IO.Path.GetDirectoryName inputPath
    let inputFileName =
      inputFileNameWithoutExtension |> String.ToPascalCase [| '-'; '_' |]

    let generatedPackage, formName =
      (if generatedPackage = null then
         inputFileName
       else
         generatedPackage),
      (if formName = null then inputFileName else formName)

    if File.Exists inputPath |> not then
      Right(Errors.Singleton "Input file does not exist.")
    else
      try
        let inputConfig = File.ReadAllText inputPath
        let jsonValue = JsonValue.Parse inputConfig

        try
          let codegenConfig = System.IO.File.ReadAllText codegenConfigPath

          let codegenConfig =
            JsonSerializer.Deserialize<CodeGenConfig>(
              codegenConfig,
              JsonFSharpOptions.Default().ToJsonSerializerOptions()
            )

          let injectedTypes: Map<string, TypeBinding> =
            codegenConfig.Custom
            |> Seq.map (fun c -> c.Key, (c.Key |> TypeId.Create, ExprType.RecordType Map.empty) |> TypeBinding.Create)
            |> Map.ofSeq

          let initialContext =
            { ParsedFormsContext.Empty with
                Types = injectedTypes }

          let generatedLanguageSpecificConfig =
            match language with
            | FormsGenTarget.golang ->
              { EnumValueFieldName = "Value"
                StreamIdFieldName = "Id"
                StreamDisplayValueFieldName = "DisplayValue" }
            | _ ->
              { EnumValueFieldName = "value"
                StreamIdFieldName = "id"
                StreamDisplayValueFieldName = "displayValue" }

          match
            ((ParsedFormsContext.Parse generatedLanguageSpecificConfig jsonValue).run (codegenConfig, initialContext))
          with
          | Left(_, Some parsedForms) ->
            match
              (ParsedFormsContext.Validate generatedLanguageSpecificConfig parsedForms)
                .run ((), { PredicateValidationHistory = Set.empty })
            with
            | Left(validatedForms, _) ->
              match language with
              | FormsGenTarget.golang ->
                match ParsedFormsContext.ToGolang codegenConfig parsedForms generatedPackage formName with
                | Left generatedCode ->
                  // do Console.ReadLine() |> ignore
                  let outputPath =
                    System.IO.Path.Combine [| outputPath; $$"""{{inputFileNameWithoutExtension}}.gen.go""" |]

                  try
                    do
                      System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName outputPath)
                      |> ignore

                    let generatedCode = generatedCode |> StringBuilder.ToString

                    Left(
                      {| OutputPath = outputPath
                         GeneratedCode = generatedCode |}
                    )
                  with err ->
                    Right(Errors.Singleton $"Error when generating output file {{err.Message.ReasonablyClamped}}")
                | Right err -> Right(err)
              | _ ->
                Right(Errors.Singleton $"Unsupported code generation target {language} when processing {inputPath}")
            | Right(err, _) -> Right err
          | Right(err, _) -> Right err
          | _ -> Right(Errors.Singleton $"Unexpected error: parsing produced no results.")
        with err ->
          Right(Errors.Singleton $"Error when reading codegen config: {err.Message}")
      with err ->
        Right(Errors.Singleton $"Error when reading json: {err.Message.ReasonablyClamped}")


  let run
    (validate: bool)
    (language: FormsGenTarget)
    (inputPath: string)
    (outputPath: string)
    (generatedPackage: string)
    (formName: string)
    (codegenConfigPath: string)
    =
    let inputPaths =
      if System.IO.File.Exists inputPath |> not then
        System.IO.Directory.EnumerateFiles(inputPath, "*.json") |> Seq.toList
      else
        [ inputPath ]

    for inputPath in inputPaths do
      match
        runSingle
          (validate: bool)
          (language: FormsGenTarget)
          (inputPath: string)
          (outputPath: string)
          (generatedPackage: string)
          (formName: string)
          (codegenConfigPath: string)
      with
      | Left res ->
        do System.IO.File.WriteAllText(res.OutputPath, res.GeneratedCode)
        do Console.ForegroundColor <- ConsoleColor.Green
        do printf $$"""Code for {{inputPath}} is generated at {{outputPath}}.  """
        do Console.ResetColor()
      | Right err -> do Errors.Print inputPath err


(* Example invocation:
dotnet run -- forms -input ../automatic-tests/input-forms/entity-patch-kitchensink.json -output ./generated-output/models -validate -codegen golang -codegen_config ../automatic-tests/input-forms/go-config.json

dotnet run -- forms -input ../automatic-tests/input-forms/person-config.json -output ./generated-output/models -validate -codegen golang -codegen_config ../automatic-tests/input-forms/go-config.json

dotnet run -- forms -input ../automatic-tests/input-forms/form-config-config.json -output ./generated-output/models -validate -codegen golang -codegen_config ../automatic-tests/input-forms/go-config.json
*)
