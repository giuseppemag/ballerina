namespace Ballerina.DSL.FormEngine

module Model =
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open System
  open FSharp.Data

  type CodeGenConfig =
    { Int: CodegenConfigTypeDef
      Bool: CodegenConfigTypeDef
      String: CodegenConfigTypeDef
      Date: CodegenConfigTypeDef
      Guid: CodegenConfigTypeDef
      Unit: CodegenConfigUnitDef
      Option: CodegenConfigOptionDef
      Set: CodegenConfigSetDef
      List: CodegenConfigListDef
      Map: CodegenConfigMapDef
      Sum: CodegenConfigSumDef
      Tuple: List<TupleCodegenConfigTypeDef>
      Union: CodegenConfigUnionDef
      Custom: Map<string, CodegenConfigCustomDef>
      Generic: List<GenericTypeDef>
      IdentifierAllowedRegex: string
      EntityNotFoundError: CodegenConfigErrorDef
      EnumNotFoundError: CodegenConfigErrorDef
      InvalidEnumValueCombinationError: CodegenConfigErrorDef
      StreamNotFoundError: CodegenConfigErrorDef }

  and GenericType =
    | Option
    | List
    | Set
    | Map

  and GenericTypeDef = {| Type:string; SupportedRenderers: Set<string> |}

  and CodegenConfigErrorDef =
    { GeneratedTypeName: string
      Constructor: string
      RequiredImport: Option<string> }

  and TupleCodegenConfigTypeDef =
    { Ariety: int
      GeneratedTypeName: string
      WriterTypeName: string
      DeltaTypeName: string
      SupportedRenderers: Set<string>
      Constructor: string
      RequiredImport: Option<string> }

  and CodegenConfigUnionDef = { SupportedRenderers: Set<string> }

  and CodegenConfigUnitDef =
    { GeneratedTypeName: string
      WriterTypeName: string
      DeltaTypeName: string
      RequiredImport: Option<string>
      DefaultConstructor: string
      SupportedRenderers: Set<string> }

  and CodegenConfigListDef =
    { GeneratedTypeName: string
      RequiredImport: Option<string>
      WriterTypeName: string
      DeltaTypeName: string
      SupportedRenderers: Set<string>
      DefaultConstructor: string
      MappingFunction: string }

  and CodegenConfigMapDef =
    { GeneratedTypeName: string
      RequiredImport: Option<string>
      WriterTypeName: string
      DeltaTypeName: string
      DefaultConstructor: string
      SupportedRenderers: Set<string> }

  and CodegenConfigSumDef =
    { GeneratedTypeName: string
      RequiredImport: Option<string>
      WriterTypeName: string
      DeltaTypeName: string
      LeftConstructor: string
      RightConstructor: string
      SupportedRenderers: Set<string> }

  and CodegenConfigTypeDef =
    { GeneratedTypeName: string
      WriterTypeName: string
      DeltaTypeName: string
      DefaultValue: string
      RequiredImport: Option<string>
      SupportedRenderers: Set<string> }

  and CodegenConfigCustomDef =
    { GeneratedTypeName: string
      DefaultConstructor: string
      WriterTypeName: string
      DeltaTypeName: string
      RequiredImport: Option<string>
      SupportedRenderers: Set<string> }

  and CodegenConfigOptionDef =
    { GeneratedTypeName: string
      RequiredImport: Option<string>
      DefaultConstructor: string
      WriterTypeName: string
      DeltaTypeName: string
      SupportedRenderers:
        {| Enum: Set<string>
           Stream: Set<string> |} }

  and CodegenConfigSetDef =
    { GeneratedTypeName: string
      RequiredImport: Option<string>
      DefaultConstructor: string
      WriterTypeName: string
      DeltaTypeName: string
      SupportedRenderers:
        {| Enum: Set<string>
           Stream: Set<string> |} }

  type CrudMethod =
    | Create
    | Get
    | Update
    | Default

  type FormLauncherId =
    { LauncherName: string
      LauncherId: Guid }

  and FormLauncher =
    { LauncherName: string
      LauncherId: Guid
      Form: FormConfigId
      Mode: FormLauncherMode }

    static member Name(l: FormLauncher) : string = l.LauncherName

    static member Id(l: FormLauncher) : FormLauncherId =
      { LauncherName = l.LauncherName
        LauncherId = l.LauncherId }

  and FormLauncherApis =
    { EntityApi: EntityApiId
      ConfigEntityApi: EntityApiId }

  and FormLauncherMode =
    | Create of FormLauncherApis
    | Edit of FormLauncherApis
    | Passthrough of {| ConfigType: TypeId |}

  and EnumApiId = { EnumName: string; EnumId: Guid }

  and EnumApi =
    { EnumName: string
      EnumId: Guid
      TypeId: TypeId
      UnderlyingEnum: TypeId }

    static member Id(e: EnumApi) =
      { EnumName = e.EnumName
        EnumId = e.EnumId }

    static member Create(n, t, c) : EnumApi =
      { EnumName = n
        TypeId = t
        EnumId = Guid.CreateVersion7()
        UnderlyingEnum = c }

    static member Type(a: EnumApi) : TypeId = a.TypeId

  and StreamApiId = { StreamName: string; StreamId: Guid }

  and StreamApi =
    { StreamName: string
      StreamId: Guid
      TypeId: TypeId }

    static member Id(e: StreamApi) =
      { StreamName = e.StreamName
        StreamId = e.StreamId }

    static member Create(n, t) : StreamApi =
      { StreamName = n
        TypeId = t
        StreamId = Guid.CreateVersion7() }

    static member Type(a: StreamApi) : TypeId = a.TypeId

  and EntityApiId = { EntityName: string; EntityId: Guid }

  and EntityApi =
    { EntityName: string
      EntityId: Guid
      TypeId: TypeId }

    static member Id(e: EntityApi) =
      { EntityName = e.EntityName
        EntityId = e.EntityId }

    static member Create(n, t) : EntityApi =
      { EntityName = n
        TypeId = t
        EntityId = Guid.CreateVersion7() }

    static member Type(a: EntityApi) : TypeId = a.TypeId

  and FormApis =
    { Enums: Map<string, EnumApi>
      Streams: Map<string, StreamApi>
      Entities: Map<string, EntityApi * Set<CrudMethod>> }

    static member Empty =
      { Enums = Map.empty
        Streams = Map.empty
        Entities = Map.empty }

    static member Updaters =
      {| Enums = fun u s -> { s with FormApis.Enums = u (s.Enums) }
         Streams =
          fun u s ->
            { s with
                FormApis.Streams = u (s.Streams) }
         Entities =
          fun u s ->
            { s with
                FormApis.Entities = u (s.Entities) } |}

  and FormConfigId = { FormName: string; FormId: Guid }

  and FormConfig =
    { FormName: string
      FormId: Guid
      TypeId: TypeId
      Body: FormBody }

    static member Name f = f.FormName

    static member Id f =
      { FormName = f.FormName
        FormId = f.FormId }

  and FormBody =
    | Fields of FormFields
    | Cases of
      {| Renderer: Renderer
         Cases: Map<string, Renderer> |}

  and FormFields =
    { Fields: Map<string, FieldConfig>
      Tabs: FormTabs }

  and FormTabs = { FormTabs: Map<string, FormColumns> }

  and FormColumns =
    { FormColumns: Map<string, FormGroups> }

  and FormGroups =
    { FormGroups: Map<string, List<FieldConfigId>> }

  and FieldConfigId = { FieldName: string; FieldId: Guid }

  and FieldConfig =
    { FieldName: string
      FieldId: Guid
      Label: Option<string>
      Tooltip: Option<string>
      Details: Option<string>
      Renderer: Renderer
      Visible: Expr
      Disabled: Option<Expr> }

    static member Id(f: FieldConfig) : FieldConfigId =
      { FieldName = f.FieldName
        FieldId = f.FieldId }

    static member Name(f: FieldConfig) = f.FieldName

  and Renderer =
    | PrimitiveRenderer of PrimitiveRenderer
    | MapRenderer of
      {| Map: Renderer
         Key: NestedRenderer
         Value: NestedRenderer
         Children: RendererChildren |}
    | TupleRenderer of
      {| Tuple: Renderer
         Elements: List<NestedRenderer>
         Children: RendererChildren |}
    | ListRenderer of
      {| List: Renderer
         Element: NestedRenderer
         Children: RendererChildren |}
    | SumRenderer of
      {| Sum: Renderer
         Left: NestedRenderer
         Right: NestedRenderer
         Children: RendererChildren |}
    | EnumRenderer of EnumApiId * Renderer
    | StreamRenderer of StreamApiId * Renderer
    | FormRenderer of FormConfigId * ExprType * RendererChildren
    | UnionRenderer of
      {| Union: Renderer
         Cases: Map<CaseName, Renderer>
         Children: RendererChildren |}

  and NestedRenderer =
    { Label: Option<string>
      Tooltip: Option<string>
      Details: Option<string>
      Renderer: Renderer }

  and PrimitiveRendererId =
    { PrimitiveRendererName: string
      PrimitiveRendererId: Guid }

  and PrimitiveRenderer =
    { PrimitiveRendererName: string
      PrimitiveRendererId: Guid
      Type: ExprType
      Children: RendererChildren }

    static member ToPrimitiveRendererId(r: PrimitiveRenderer) =
      { PrimitiveRendererName = r.PrimitiveRendererName
        PrimitiveRendererId = r.PrimitiveRendererId }

  and RendererChildren = { Fields: Map<string, FieldConfig> }

  type FormPredicateValidationHistoryItem =
    { Form: FormConfigId
      GlobalType: TypeId
      RootType: TypeId }

  type ValidationState =
    { PredicateValidationHistory: Set<FormPredicateValidationHistoryItem> }

    static member Updaters =
      {| PredicateValidationHistory =
          fun u s ->
            { s with
                PredicateValidationHistory = u (s.PredicateValidationHistory) } |}

  type GeneratedLanguageSpecificConfig =
    { EnumValueFieldName: string
      StreamIdFieldName: string
      StreamDisplayValueFieldName: string }

  type ParsedFormsContext =
    { Types: Map<string, TypeBinding>
      Apis: FormApis
      Forms: Map<string, FormConfig>      
      GenericRenderers: List<{| Type:ExprType; SupportedRenderers:Set<string> |}>
      Launchers: Map<string, FormLauncher> }

    static member Empty: ParsedFormsContext =
      { Types = Map.empty
        Apis = FormApis.Empty
        Forms = Map.empty
        GenericRenderers = []
        Launchers = Map.empty }

    static member Updaters =
      {| Types =
          fun u ->
            fun s ->
              { s with
                  ParsedFormsContext.Types = u (s.Types) }
         Apis =
          fun u ->
            fun s ->
              { s with
                  ParsedFormsContext.Apis = u (s.Apis) }
         Forms =
          fun u ->
            fun s ->
              { s with
                  ParsedFormsContext.Forms = u (s.Forms) }
         GenericRenderers =
          fun u ->
            fun s ->
              { s with
                  ParsedFormsContext.GenericRenderers = u (s.GenericRenderers) }
         Launchers =
          fun u ->
            fun s ->
              { s with
                  ParsedFormsContext.Launchers = u (s.Launchers) } |}
