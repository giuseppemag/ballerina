namespace Ballerina.DSL.FormEngine.Codegen.Golang.Generator

module Model =

  open Ballerina.DSL.Expr.Types.Model
  open Ballerina.DSL.FormEngine.Model

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
      Path: List<string>
      DeltaTypeName: string
      Kind: WriterKind }

  and WriterKind =
    | Imported
    | Generated

  and WriterField =
    | Primitive of {| DeltaTypeName: string |}
    | Nested of WriterName

  and WriterName = { WriterName: string }

  type PrimitiveType with
    static member GetConfig (config: CodeGenConfig) (p: PrimitiveType) : CodegenConfigTypeDef =
      match p with
      | PrimitiveType.BoolType -> config.Bool
      | PrimitiveType.DateOnlyType -> config.Date
      | PrimitiveType.DateTimeType -> failwith "not implemented - add a CodeGenConfig for float"
      | PrimitiveType.FloatType -> failwith "not implemented - add a CodeGenConfig for float"
      | PrimitiveType.GuidType -> config.Guid
      | PrimitiveType.IntType -> config.Int
      | PrimitiveType.RefType _ -> config.Guid
      | PrimitiveType.StringType -> config.String
