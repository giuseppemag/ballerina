namespace Ballerina.DSL.FormEngine.Codegen.Golang.Generator

module Model =

  open Ballerina.DSL.Expr.Types.Model

  type GoCodeGenState =
    { UsedImports: Set<string> }

    static member Updaters =
      {| UsedImports =
          fun u ->
            fun s ->
              { s with
                  UsedImports = u (s.UsedImports) } |}

  type Writer =
    { Fields: Map<string, WriterField>
      Type: ExprType
      Name: WriterName
      DeltaTypeName: string
      Kind: WriterKind }

  and WriterKind =
    | Imported
    | Generated

  and WriterField =
    | Primitive of {| DeltaTypeName: string |}
    | Nested of WriterName

  and WriterName = { WriterName: string }
