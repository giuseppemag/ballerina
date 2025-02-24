namespace Ballerina.DSL.FormEngine
module Model =
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open System

  type CodeGenConfig = {
    Int:CodegenConfigTypeDef
    Bool:CodegenConfigTypeDef
    String:CodegenConfigTypeDef
    Date:CodegenConfigTypeDef
    Guid:CodegenConfigTypeDef
    Unit:CodegenConfigTypeDef
    Option:EnumStreamCodegenConfigTypeDef
    Set:EnumStreamCodegenConfigTypeDef
    List:CodegenConfigListDef
    Map:CodegenConfigTypeDef
    Custom:Map<string, CodegenConfigTypeDef>
    IdentifierAllowedRegex:string
    EnumNotFoundError:CodegenConfigErrorDef
    InvalidEnumValueCombinationError:CodegenConfigErrorDef
    StreamNotFoundError:CodegenConfigErrorDef
  }
  and GenericType = Option | List | Set | Map
  and CodegenConfigErrorDef = {
    GeneratedTypeName: string
    Constructor: string
    RequiredImport:Option<string>
  }    
  and CodegenConfigListDef = {
    GeneratedTypeName: string
    RequiredImport:Option<string>
    SupportedRenderers:Set<string>
    MappingFunction:string
  }    
  and CodegenConfigTypeDef = {
    GeneratedTypeName: string
    RequiredImport:Option<string>
    SupportedRenderers:Set<string>
  }
  and EnumStreamCodegenConfigTypeDef = {
    GeneratedTypeName: string
    RequiredImport:Option<string>
    SupportedRenderers:{| Enum:Set<string>; Stream:Set<string> |}
  }

  type CrudMethod = Create | Get | Update | Default
  type FormLauncherId = { LauncherName:string; LauncherId:Guid }
  and FormLauncher = { LauncherName:string; LauncherId:Guid; Form:FormConfigId; EntityApi:EntityApiId; ConfigEntityApi:EntityApiId; Mode:FormLauncherMode } with static member Name (l:FormLauncher) : string = l.LauncherName; static member Id (l:FormLauncher) : FormLauncherId = { LauncherName=l.LauncherName; LauncherId=l.LauncherId }
  and FormLauncherMode = | Create | Edit
  and EnumApiId = { EnumName:string; EnumId:Guid }
  and EnumApi = { EnumName:string; EnumId:Guid; TypeId:TypeId; UnderlyingEnum:TypeId } with static member Id (e:EnumApi) = { EnumName=e.EnumName; EnumId=e.EnumId }; static member Create (n,t,c) : EnumApi = { EnumName=n; TypeId=t; EnumId=Guid.CreateVersion7(); UnderlyingEnum=c }; static member Type (a:EnumApi) : TypeId = a.TypeId
  and StreamApiId = { StreamName:string; StreamId:Guid }
  and StreamApi = { StreamName:string; StreamId:Guid; TypeId:TypeId } with static member Id (e:StreamApi) = { StreamName=e.StreamName; StreamId=e.StreamId }; static member Create (n,t) : StreamApi = { StreamName=n; TypeId=t; StreamId=Guid.CreateVersion7() }; static member Type (a:StreamApi) : TypeId = a.TypeId
  and EntityApiId = { EntityName:string; EntityId:Guid }
  and EntityApi = { EntityName:string; EntityId:Guid; TypeId:TypeId } with static member Id (e:EntityApi) = { EntityName=e.EntityName; EntityId=e.EntityId }; static member Create (n,t) : EntityApi = { EntityName=n; TypeId=t; EntityId=Guid.CreateVersion7() }; static member Type (a:EntityApi) : TypeId = a.TypeId

  and FormApis = {
    Enums:Map<string, EnumApi>
    Streams:Map<string, StreamApi>
    Entities:Map<string, EntityApi * Set<CrudMethod>>
  } with 
    static member Empty = { Enums=Map.empty; Streams=Map.empty; Entities=Map.empty }
    static member Updaters = 
      {|
        Enums = fun u s -> { s with FormApis.Enums=u(s.Enums)}
        Streams = fun u s -> { s with FormApis.Streams=u(s.Streams)}
        Entities = fun u s -> { s with FormApis.Entities=u(s.Entities)}
      |}

  and FormConfigId = { FormName:string; FormId:Guid }
  and FormConfig = { 
    FormName:string; 
    FormId:Guid; 
    TypeId:TypeId;
    Fields:Map<string, FieldConfig>;
    Tabs:FormTabs } with static member Name f = f.FormName; static member Id f = { FormName=f.FormName; FormId=f.FormId }
  and FormTabs = { FormTabs:Map<string, FormColumns> }
  and FormColumns = { FormColumns: Map<string, FormGroups> }
  and FormGroups = { FormGroups:Map<string, List<FieldConfigId>> }
  and FieldConfigId = { FieldName:string; FieldId:Guid }
  and FieldConfig = { FieldName:string; FieldId:Guid; Label:Option<string>; Tooltip:Option<string>; Details:Option<string>; Renderer:Renderer; Visible:Expr; Disabled:Option<Expr> } with 
    static member Id (f:FieldConfig) : FieldConfigId = { FieldName=f.FieldName; FieldId=f.FieldId }
    static member Name (f:FieldConfig) = f.FieldName
  and Renderer = 
    | PrimitiveRenderer of PrimitiveRenderer
    | MapRenderer of {| Map:Renderer; Key:NestedRenderer; Value:NestedRenderer |}
    | ListRenderer of {| List:Renderer; Element:NestedRenderer |}
    | EnumRenderer of EnumApiId * Renderer
    | StreamRenderer of StreamApiId * Renderer
    | FormRenderer of FormConfigId * ExprType
  and NestedRenderer = { Label:Option<string>; Tooltip:Option<string>; Details:Option<string>; Renderer:Renderer }
  and PrimitiveRendererId = { PrimitiveRendererName:string; PrimitiveRendererId:Guid }
  and PrimitiveRenderer = { PrimitiveRendererName:string; PrimitiveRendererId:Guid; Type:ExprType } with static member ToPrimitiveRendererId (r:PrimitiveRenderer) = { PrimitiveRendererName=r.PrimitiveRendererName; PrimitiveRendererId=r.PrimitiveRendererId }

  type FormPredicateValidationHistoryItem = { Form:FormConfigId; GlobalType:TypeId; RootType:TypeId }
  type ValidationState = { PredicateValidationHistory:Set<FormPredicateValidationHistoryItem> } with 
    static member Updaters = 
      {|
        PredicateValidationHistory = fun u s -> { s with PredicateValidationHistory=u(s.PredicateValidationHistory)}
      |}

  type GeneratedLanguageSpecificConfig = { 
    EnumValueFieldName:string
    StreamIdFieldName:string
    StreamDisplayValueFieldName:string
  }
  type ParsedFormsContext = {
    Types:Map<string, TypeBinding>
    Apis:FormApis
    Forms:Map<string, FormConfig>
    Launchers:Map<string, FormLauncher>
  } with 
    static member Empty : ParsedFormsContext = { Types=Map.empty; Apis=FormApis.Empty; Forms=Map.empty; Launchers=Map.empty } 
    static member Updaters = 
      {|
        Types=fun u -> fun s -> { s with ParsedFormsContext.Types = u(s.Types)};
        Apis=fun u -> fun s -> { s with ParsedFormsContext.Apis = u(s.Apis)};
        Forms=fun u -> fun s -> { s with ParsedFormsContext.Forms = u(s.Forms)};
        Launchers=fun u -> fun s -> { s with ParsedFormsContext.Launchers = u(s.Launchers)};
      |}  
