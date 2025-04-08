namespace Ballerina.DSL.FormEngine.Codegen.Golang.LanguageConstructs

open Ballerina.DSL.FormEngine.Model
open Ballerina.DSL.Expr.Types.Model
open Ballerina.Core
open Enum
open System

module Header =

  let Generate
    (ctx: ParsedFormsContext, codegenConfig: CodeGenConfig, packageName: string, formName: string)
    (imports: Set<string>)
    =
    let imports =
      if ctx.Apis.Enums |> Map.isEmpty |> not then
        imports
        + (codegenConfig.List.RequiredImport |> Option.toList |> Set.ofList)
        + ([ "golang.org/x/exp/slices" ] |> Set.ofList)
      else
        imports

    let imports =
      if ctx.Apis.Enums |> Map.isEmpty |> not then
        imports
        + (codegenConfig.EnumNotFoundError.RequiredImport |> Option.toList |> Set.ofList)
        + (codegenConfig.InvalidEnumValueCombinationError.RequiredImport
           |> Option.toList
           |> Set.ofList)
      else
        imports

    let imports =
      if ctx.Apis.Entities |> Map.isEmpty |> not then
        imports
        + (codegenConfig.EntityNotFoundError.RequiredImport |> Option.toList |> Set.ofList)
      else
        imports

    let imports =
      if ctx.Apis.Streams |> Map.isEmpty |> not then
        imports
        + (codegenConfig.StreamNotFoundError.RequiredImport |> Option.toList |> Set.ofList)
      else
        imports

    let imports =
      if
        ctx.Types
        |> Map.values
        |> Seq.map (fun t -> t.Type)
        |> Seq.exists (function
          | ExprType.UnionType cases -> cases |> Map.values |> Seq.exists (fun c -> c.Fields.IsUnitType |> not)
          | _ -> false)
      then
        imports + Set.singleton "fmt"
      else
        imports

    let imports =
      imports + (codegenConfig.Guid.RequiredImport |> Option.toList |> Set.ofList)

    let imports =
      imports + (codegenConfig.Unit.RequiredImport |> Option.toList |> Set.ofList)

    let imports =
      imports
      + (codegenConfig.Custom
         |> Map.values
         |> Seq.map (fun v -> v.RequiredImport |> Option.toList)
         |> List.concat
         |> Set.ofSeq)

    StringBuilder.One
      $$"""// Code generated by ballerina, DO NOT EDIT.
              
package {{packageName}}

import (
{{imports
  |> Seq.filter ((fun s -> String.IsNullOrEmpty s || String.IsNullOrWhiteSpace s) >> not)
  |> Seq.map (sprintf "  \"%s\"\n")
  |> Seq.fold (+) ""}})

"""
