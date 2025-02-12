﻿module BallerinaRuntime

open FSharp.Data
open FSharp.Data.JsonExtensions
open System
open System.IO
open Ballerina.Fun
open Ballerina.BusinessRules
open Ballerina.Option
open Ballerina.Sum
open Ballerina.Errors
open Ballerina.StateWithError
open Ballerina.SeqStateWithError
open Ballerina.Collections.Map
open Ballerina.BusinessRuleTypeChecking
open System.Text.Json
open System.Text.Json.Serialization
open System.Text.RegularExpressions

let dup a = (a,a)
let (<*>) f g = fun (a,b) -> (f a, g b)

type Object with
  member self.ToFSharpString = sprintf "%A" self

type String with
  member self.ReasonablyClamped = Regex.Replace(self.Substring(0, min self.Length 50).ReplaceLineEndings(" "), " +", " ") + "..."
  static member append s2 s1 = s1 + s2
  static member appendNewline s2 s1 = s1 + "\n" + s2

type Utils = class end with
  static member tryFindField name fields = 
    fields |> Seq.tryFind (fst >> (=) name) |> Option.map snd
       |> Sum.fromOption(fun () -> Errors.Singleton $"Error: cannot find field '{name}'")
  static member tryFindFieldSeq prev (n,m) fields = 
    sum{
      let! f = fields |> prev n
      let! g = fields |> Utils.tryFindField m
      return f,g
    }
  static member tryFindField2 names fields = Utils.tryFindFieldSeq Utils.tryFindField names fields
  static member tryFindField3 names fields = Utils.tryFindFieldSeq Utils.tryFindField2 names fields
  static member tryFindField4 names fields = Utils.tryFindFieldSeq Utils.tryFindField3 names fields
  static member tryFindField5 names fields = Utils.tryFindFieldSeq Utils.tryFindField4 names fields
  static member tryFindField6 names fields = Utils.tryFindFieldSeq Utils.tryFindField5 names fields

type JsonValue with
  static member AsEmptyRecord json =
    match json with
    | JsonValue.Record [||] -> sum.Return ()
    | _ -> sum.Throw(Errors.Singleton $"Error: expected empty record, found '{json.ToFSharpString.ReasonablyClamped}'")
  static member AsRecord json =
    match json with
    | JsonValue.Record fields -> sum.Return fields
    | _ -> sum.Throw(Errors.Singleton $"Error: expected record, found '{json.ToFSharpString.ReasonablyClamped}'")
  static member AsArray json =
    match json with
    | JsonValue.Array fields -> sum.Return fields
    | _ -> sum.Throw(Errors.Singleton $"Error: expected array, found '{json.ToFSharpString.ReasonablyClamped}'")
  static member AsSingleton json =
    match json with
    | JsonValue.Array[| firstJson |] -> sum.Return (firstJson)
    | _ -> sum.Throw(Errors.Singleton $"Error: expected singleton (array with one element), found '{json.ToFSharpString.ReasonablyClamped}'")  
  static member AsPair json =
    match json with
    | JsonValue.Array[| firstJson; secondJson |] -> sum.Return (firstJson, secondJson)
    | _ -> sum.Throw(Errors.Singleton $"Error: expected pair, found '{json.ToFSharpString.ReasonablyClamped}'")  
  static member AsString json =
    match json with
    | JsonValue.String fields -> sum.Return fields
    | _ -> sum.Throw(Errors.Singleton $"Error: expected string, found '{json.ToFSharpString.ReasonablyClamped}'")
  static member AsEnum options json =
    match json with
    | JsonValue.String value when options |> Set.contains value -> sum.Return value
    | _ -> sum.Throw(Errors.Singleton $"Error: expected enum in {options.ToFSharpString}, found '{json.ToFSharpString.ReasonablyClamped}'")
  static member AsBoolean json =
    match json with
    | JsonValue.Boolean fields -> sum.Return fields
    | _ -> sum.Throw(Errors.Singleton $"Error: expected boolean, found '{json.ToFSharpString.ReasonablyClamped}'")
  static member AsNumber json =
    match json with
    | JsonValue.Number fields -> sum.Return fields
    | _ -> sum.Throw(Errors.Singleton $"Error: expected number, found '{json.ToFSharpString.ReasonablyClamped}'")

type Errors with
  static member Print (inputFile:string) (e:Errors) =
    do Console.WriteLine $"Errors when processing {inputFile}"
    do Console.ForegroundColor <- ConsoleColor.Red
    for error in e.Errors do
      do Console.WriteLine error
    do Console.ResetColor()

type StateBuilder with
  member state.WithErrorContext err =
    state.MapError(Errors.Map(String.appendNewline err))

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
}
and GenericType = Option | List | Set | Map
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
and NestedRenderer = { Label:Option<string>; Tooltip:Option<string>; Details:Option<string>; Renderer:Renderer; Visible:Expr; Disabled:Option<Expr> }
and PrimitiveRendererId = { PrimitiveRendererName:string; PrimitiveRendererId:Guid }
and PrimitiveRenderer = { PrimitiveRendererName:string; PrimitiveRendererId:Guid; Type:ExprType } with static member ToPrimitiveRendererId (r:PrimitiveRenderer) = { PrimitiveRendererName=r.PrimitiveRendererName; PrimitiveRendererId=r.PrimitiveRendererId }

type NestedRenderer with
  member self.Type = self.Renderer.Type
and Renderer with
  member self.Type = 
    match self with
    | PrimitiveRenderer p -> p.Type
    | MapRenderer r -> ExprType.MapType(r.Key.Type, r.Value.Type)
    | ListRenderer r -> ExprType.ListType r.Element.Type
    | EnumRenderer (_,r) | StreamRenderer (_,r) -> r.Type
    | FormRenderer (_,t) -> t


let inline extractTypes<'k, 'v when 'v : (static member Type : 'v -> TypeId) and 'k : comparison> (m:Map<'k, 'v>) =
  m |> Map.values |> Seq.map(fun e -> e |> 'v.Type |> Set.singleton) |> Seq.fold (+) Set.empty

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

type GoCodeGenState = {
  UsedImports:Set<string>
} with
  static member Updaters = 
    {|
      UsedImports=fun u -> fun s -> { s with UsedImports = u(s.UsedImports)};
    |}

type NestedRenderer with
  static member Validate (ctx:ParsedFormsContext) (fr:NestedRenderer) : Sum<ExprType, Errors> = 
    Renderer.Validate ctx fr.Renderer

and Renderer with
  static member GetTypesFreeVars (ctx:ParsedFormsContext) (fr:Renderer) : Sum<Set<TypeId>, Errors> = 
    let (+) = sum.Lift2 Set.union
    let (!) = Renderer.GetTypesFreeVars ctx 
    match fr with
    | Renderer.EnumRenderer(e,f) -> 
      (ctx.Apis.Enums |> Map.tryFindWithError e.EnumName "enum" e.EnumName |> Sum.map (EnumApi.Type >> Set.singleton)) + !f
    | Renderer.FormRenderer (f,_) ->
      sum{ 
        let! f = ctx.Forms |> Map.tryFindWithError f.FormName "form" f.FormName
        return! f |> FormConfig.GetTypesFreeVars ctx
      }
    | Renderer.ListRenderer l ->
      !l.Element.Renderer + !l.List
    | Renderer.MapRenderer m ->
      !m.Map + !m.Key.Renderer + !m.Value.Renderer
    | Renderer.PrimitiveRenderer p -> sum{ return p.Type |> ExprType.GetTypesFreeVars }
    | Renderer.StreamRenderer (s,f) ->
      (ctx.Apis.Streams |> Map.tryFindWithError s.StreamName "stream" s.StreamName |> Sum.map (StreamApi.Type >> Set.singleton)) + !f
  static member Validate (ctx:ParsedFormsContext) (fr:Renderer) : Sum<ExprType, Errors> = 
    let (!) = Renderer.Validate ctx
    sum{
      match fr with
      | Renderer.EnumRenderer(enum, enumRenderer) -> 
        let! enum = ctx.Apis.Enums |> Map.tryFindWithError enum.EnumName "enum" enum.EnumName
        let! enumType = ctx.Types |> Map.tryFindWithError enum.TypeId.TypeName "enum type" enum.EnumName
        let! enumRendererType = !enumRenderer
        return ExprType.Substitute (Map.empty |> Map.add { VarName="a1" } enumType.Type) enumRendererType
      | Renderer.FormRenderer (f,_) ->
        let! f = ctx.Forms |> Map.tryFindWithError f.FormName "form" f.FormName
        let! formType = ctx.Types |> Map.tryFindWithError f.TypeId.TypeName "form type" f.FormName
        return formType.Type
      | Renderer.ListRenderer(l) -> 
        let! genericListRenderer = !l.List
        let! elementRendererType = !l.Element.Renderer
        let listRenderer = ExprType.Substitute (Map.empty |> Map.add { VarName="a1" } elementRendererType) genericListRenderer
        return listRenderer
      | Renderer.MapRenderer(m) -> 
        let! genericMapRenderer = !m.Map
        let! keyRendererType = !m.Key.Renderer
        let! valueRendererType = !m.Value.Renderer
        let mapRenderer = ExprType.Substitute (Map.empty |> Map.add { VarName="a1" } keyRendererType |> Map.add { VarName="a2" } valueRendererType) genericMapRenderer
        return mapRenderer
      | Renderer.PrimitiveRenderer p -> 
        return p.Type
      | Renderer.StreamRenderer (stream, streamRenderer) ->
        let! stream = ctx.Apis.Streams |> Map.tryFindWithError stream.StreamName "stream" stream.StreamName
        let streamType = ExprType.LookupType stream.TypeId
        let! streamRendererType = !streamRenderer
        return ExprType.Substitute (Map.empty |> Map.add { VarName="a1" } streamType) streamRendererType
    }

and NestedRenderer with
  static member ValidatePredicates (ctx:ParsedFormsContext) (globalType:ExprType) (rootType:ExprType) (localType:ExprType) (r:NestedRenderer) : Sum<Unit, Errors> = 
    sum{
      let schema = {
        tryFindEntity = fun _ -> None
        tryFindField = fun _ -> None
      }
      let vars = [ ("global",globalType);("root",rootType);("local",localType); ] |> Seq.map (VarName.Create <*> id) |> Map.ofSeq
      let! visibleExprType,_ = Expr.typeCheck (ctx.Types |> Seq.map(fun tb -> tb.Value.TypeId,tb.Value.Type) |> Map.ofSeq) schema vars r.Visible
      do! ExprType.Unify Map.empty (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq) visibleExprType (ExprType.PrimitiveType PrimitiveType.BoolType) |> Sum.map ignore
      match r.Disabled with
      | Some disabled ->
        let! disabledExprType,_ = Expr.typeCheck (ctx.Types |> Seq.map(fun tb -> tb.Value.TypeId,tb.Value.Type) |> Map.ofSeq) schema vars disabled
        do! ExprType.Unify Map.empty (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq) disabledExprType (ExprType.PrimitiveType PrimitiveType.BoolType) |> Sum.map ignore
      |  _ -> return ()
      do! Renderer.ValidatePredicates ctx globalType rootType localType r.Renderer
    }

and Renderer with
  static member ValidatePredicates (ctx:ParsedFormsContext) (globalType:ExprType) (rootType:ExprType) (localType:ExprType) (r:Renderer) : Sum<Unit, Errors> = 
    let (!) = Renderer.ValidatePredicates ctx globalType rootType localType 
    let (!!) = NestedRenderer.ValidatePredicates ctx globalType rootType localType 
    sum{
      match r with
      | Renderer.PrimitiveRenderer p -> return ()
      | Renderer.EnumRenderer(_,e) -> return! !e
      | Renderer.ListRenderer e -> 
        do! !e.List
        do! !!e.Element
      | Renderer.MapRenderer kv -> 
        do! !kv.Map
        do! !!kv.Key
        do! !!kv.Value
      | Renderer.StreamRenderer(_,e) -> return! !e
      | Renderer.FormRenderer(f,e) -> 
        let! f = ctx.Forms |> Map.tryFindWithError f.FormName "form" f.FormName
        do! FormConfig.ValidatePredicates ctx globalType rootType f
    }

and FieldConfig with
  static member Validate (ctx:ParsedFormsContext) (formType:ExprType) (fc:FieldConfig) : Sum<Unit, Errors> = 
    sum{
      match formType with
      | RecordType fields ->
        match fields |> Map.tryFind fc.FieldName with
        | Some fieldType -> 
          let! rendererType = Renderer.Validate ctx fc.Renderer
          let result = ExprType.Unify Map.empty (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq) rendererType fieldType |> Sum.map ignore
          return! result
        | None -> 
          return! sum.Throw(Errors.Singleton(sprintf "Error: field name %A is not found in type %A" fc.FieldName formType))
      | _ ->       
        return! sum.Throw(Errors.Singleton(sprintf "Error: form type %A is not a record type" formType))
    }
  static member ValidatePredicates (ctx:ParsedFormsContext) (globalType:ExprType) (rootType:ExprType) (localType:ExprType) (fc:FieldConfig) : Sum<Unit, Errors> = 
    sum{
      let schema = {
        tryFindEntity = fun _ -> None
        tryFindField = fun _ -> None
      }
      let vars = [ ("global",globalType);("root",rootType);("local",localType); ] |> Seq.map (VarName.Create <*> id) |> Map.ofSeq
      let! visibleExprType,_ = Expr.typeCheck (ctx.Types |> Seq.map(fun tb -> tb.Value.TypeId,tb.Value.Type) |> Map.ofSeq) schema vars fc.Visible
      do! ExprType.Unify Map.empty (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq) visibleExprType (ExprType.PrimitiveType PrimitiveType.BoolType) |> Sum.map ignore
      match fc.Disabled with
      | Some disabled ->
        let! disabledExprType,_ = Expr.typeCheck (ctx.Types |> Seq.map(fun tb -> tb.Value.TypeId,tb.Value.Type) |> Map.ofSeq) schema vars disabled
        do! ExprType.Unify Map.empty (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq) disabledExprType (ExprType.PrimitiveType PrimitiveType.BoolType) |> Sum.map ignore
      |  _ -> return ()
      do! Renderer.ValidatePredicates ctx globalType rootType localType fc.Renderer
    }

and FormConfig with
  static member GetTypesFreeVars (ctx:ParsedFormsContext) (fc:FormConfig) : Sum<Set<TypeId>, Errors> = 
    let (+) = sum.Lift2 Set.union
    sum{ return Set.singleton fc.TypeId } + 
      (
        fc.Fields 
          |> Map.values |> Seq.map(fun f -> f.Renderer |> Renderer.GetTypesFreeVars ctx) 
          |> Seq.fold (+) (sum{ return Set.empty })
      )
  static member Validate (ctx:ParsedFormsContext) (formConfig:FormConfig) : Sum<Unit, Errors> = 
    sum{
      let! formType = ctx.Types |> Map.tryFindWithError formConfig.TypeId.TypeName "form type" formConfig.TypeId.TypeName
      do! sum.All(formConfig.Fields |> Map.values |> Seq.map (FieldConfig.Validate ctx formType.Type) |> Seq.toList) |> Sum.map ignore
    }
  static member ValidatePredicates (ctx:ParsedFormsContext) (globalType:ExprType) (rootType:ExprType) (formConfig:FormConfig) : Sum<Unit, Errors> = 
    sum{
      let! formType = ctx.Types |> Map.tryFindWithError formConfig.TypeId.TypeName "form type" formConfig.TypeId.TypeName
      do! sum.All(formConfig.Fields |> Map.values |> Seq.map (FieldConfig.ValidatePredicates ctx globalType rootType formType.Type) |> Seq.toList) |> Sum.map ignore
    }
    
and FormLauncher with
  static member GetTypesFreeVars (ctx:ParsedFormsContext) (fl:FormLauncher) : Sum<Set<TypeId>, Errors> = 
    let (+) = sum.Lift2 Set.union
    sum{
      let! form = ctx.Forms |> Map.tryFindWithError fl.Form.FormName "form" fl.Form.FormName
      let! entity = ctx.Apis.Entities |> Map.tryFindWithError fl.EntityApi.EntityName "entity api" fl.EntityApi.EntityName
      return! FormConfig.GetTypesFreeVars ctx form
    }
  static member Validate (ctx:ParsedFormsContext) (formLauncher:FormLauncher) : Sum<Unit, Errors> = 
    sum{
      let! formConfig = ctx.Forms |> Map.tryFindWithError formLauncher.Form.FormName "form config" formLauncher.Form.FormName
      let! formType = ctx.Types |> Map.tryFindWithError formConfig.TypeId.TypeName "form type" formConfig.TypeId.TypeName
      let! entityApi = ctx.Apis.Entities |> Map.tryFindWithError formLauncher.EntityApi.EntityName "entity API" formLauncher.EntityApi.EntityName
      let! entityApiType = ctx.Types |> Map.tryFindWithError (entityApi |> fst).TypeId.TypeName "entity API type" (entityApi |> fst).TypeId.TypeName
      let! configEntityApi = ctx.Apis.Entities |> Map.tryFindWithError formLauncher.ConfigEntityApi.EntityName "entity API" formLauncher.ConfigEntityApi.EntityName
      if Set.ofList [CrudMethod.Get] |> Set.isSuperset (configEntityApi |> snd) then
        let! configEntityApiType = ctx.Types |> Map.tryFindWithError (configEntityApi |> fst).TypeId.TypeName "config entity API type" (configEntityApi |> fst).TypeId.TypeName
        do! ExprType.Unify Map.empty (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq) formType.Type entityApiType.Type |> Sum.map ignore
        do! FormConfig.ValidatePredicates ctx configEntityApiType.Type entityApiType.Type formConfig
        match formLauncher.Mode with
        | FormLauncherMode.Create ->
          if Set.ofList [CrudMethod.Create; CrudMethod.Default] |> Set.isSuperset (entityApi |> snd) then
            return ()
          else
            return! sum.Throw(Errors.Singleton(sprintf "Error in launcher %A: entity APIs for 'create' launchers need at least methods CREATE and DEFAULT, found %A" formLauncher.LauncherName (entityApi |> snd)))
        | FormLauncherMode.Edit ->
          if Set.ofList [CrudMethod.Get; CrudMethod.Update] |> Set.isSuperset (entityApi |> snd) then
            return ()
          else
            return! sum.Throw(Errors.Singleton(sprintf "Error in launcher %A: entity APIs for 'edit' launchers need at least methods GET and UPDATE, found %A" formLauncher.LauncherName (entityApi |> snd)))
      else 
        return! sum.Throw(Errors.Singleton(sprintf "Error in launcher %A: entity APIs for 'config' launchers need at least method GET, found %A" formLauncher.LauncherName (configEntityApi |> snd)))
    }
  static member parse (launcherName:string) (json:JsonValue) : State<_, CodeGenConfig, ParsedFormsContext, Errors> =
    state{
      let! launcherFields = JsonValue.AsRecord json |> state.OfSum
      let! ((kindJson,entityApiNameJson),formNameJson), configApiNameJson = launcherFields |> Utils.tryFindField4 ((("kind", "api"),"form"),"configApi") |> state.OfSum
      let! (kind,entityApiName,formName,configApiName) = state.All4 (JsonValue.AsString kindJson |> state.OfSum) (JsonValue.AsString entityApiNameJson |> state.OfSum) (JsonValue.AsString formNameJson |> state.OfSum) (JsonValue.AsString configApiNameJson |> state.OfSum)
      if kind = "create" || kind = "edit" then
        let! s = state.GetState()
        let! form = s.Forms |> Map.tryFindWithError formName "forms" formName |> state.OfSum
        let! api = s.Apis.Entities |> Map.tryFindWithError entityApiName "entity APIs" entityApiName |> state.OfSum
        let! configApi = s.Apis.Entities |> Map.tryFindWithError configApiName "entity APIs" configApiName |> state.OfSum
        return (if kind = "create" then FormLauncherMode.Create else FormLauncherMode.Edit), form |> FormConfig.Id, api |> fst |> EntityApi.Id, configApi |> fst |> EntityApi.Id
      else
        return! $"Error: invalid launcher mode {kind}: it should be either 'create' or 'edit'." |> Errors.Singleton |> state.Throw
    } |> state.WithErrorContext $"...when parsing launcher {launcherName}"

type FormApis with
  static member GetTypesFreeVars (fa:FormApis) : Set<TypeId> = 
    extractTypes fa.Enums + extractTypes fa.Streams + extractTypes (fa.Entities |> Map.map (fun _ -> fst))

type BinaryOperator with
  static member ByName = 
    seq{
      "and",BinaryOperator.And
      "/",BinaryOperator.DividedBy
      "equals",BinaryOperator.Equals
      "=",BinaryOperator.Equals
      ">",BinaryOperator.GreaterThan
      ">=",BinaryOperator.GreaterThanEquals
      "-",BinaryOperator.Minus
      "or",BinaryOperator.Or
      "+",BinaryOperator.Plus
      "*",BinaryOperator.Times
    } |> Map.ofSeq
  static member AllNames = 
    BinaryOperator.ByName |> Map.keys |> Set.ofSeq

type Expr with
  static member parse (json:JsonValue) : State<Expr, CodeGenConfig, ParsedFormsContext, Errors> = 
    let error = $$"""Error: invalid expression {{json}}.""" |> Errors.Singleton |> state.Throw
    state{
      return! state.Any [
        state{ 
          let! v = JsonValue.AsBoolean json |> state.OfSum
          return v |> Value.ConstBool |> Expr.Value
        }
        state{ 
          let! v = JsonValue.AsString json |> state.OfSum
          return v |> Value.ConstString |> Expr.Value
        }
        state{ 
          let! v = JsonValue.AsNumber json |> state.OfSum
          return v |> int |> Value.ConstInt |> Expr.Value
        }
        state{ 
          let! fieldsJson = JsonValue.AsRecord json |> state.OfSum
          return! state.Any([
            state{
              let! kindJson = fieldsJson |> Utils.tryFindField "kind" |> state.OfSum
              let! operator = kindJson |> JsonValue.AsEnum BinaryOperator.AllNames |> state.OfSum
              let! operandsJson = fieldsJson |> Utils.tryFindField "operands" |> state.OfSum
              let! (firstJson, secondJson) = JsonValue.AsPair operandsJson |> state.OfSum
              let! first = Expr.parse firstJson
              let! second = Expr.parse secondJson
              let! operator = BinaryOperator.ByName |> Map.tryFindWithError operator "binary operator" operator |> state.OfSum
              return Expr.Binary(operator, first, second)
            }
            state{
              let! kindJson = fieldsJson |> Utils.tryFindField "kind" |> state.OfSum
              do! kindJson |> JsonValue.AsEnum (Set.singleton "fieldLookup") |> state.OfSum |> state.Map ignore
              let! operandsJson = fieldsJson |> Utils.tryFindField "operands" |> state.OfSum
              let! (firstJson, fieldNameJson) = JsonValue.AsPair operandsJson |> state.OfSum
              let! fieldName = JsonValue.AsString fieldNameJson |> state.OfSum
              let! first = Expr.parse firstJson
              return Expr.RecordFieldLookup(first, fieldName)
            }          
            state{
              let! kindJson = fieldsJson |> Utils.tryFindField "kind" |> state.OfSum
              do! kindJson |> JsonValue.AsEnum (Set.singleton "isCase") |> state.OfSum |> state.Map ignore
              let! operandsJson = fieldsJson |> Utils.tryFindField "operands" |> state.OfSum
              let! (firstJson, caseNameJson) = JsonValue.AsPair operandsJson |> state.OfSum
              let! caseName = JsonValue.AsString caseNameJson |> state.OfSum
              let! first = Expr.parse firstJson
              return Expr.IsCase({ CaseName=caseName }, first)
            }          
            state{
              let! kindJson = fieldsJson |> Utils.tryFindField "kind" |> state.OfSum
              do! kindJson |> JsonValue.AsEnum (Set.singleton "varLookup") |> state.OfSum |> state.Map ignore
              let! varNameJson = fieldsJson |> Utils.tryFindField "varName" |> state.OfSum
              let! varName = JsonValue.AsString varNameJson |> state.OfSum
              return Expr.VarLookup { VarName=varName }
            }          
          ])
        }
      ]
    }

type Renderer with
  static member parse (parentJsonFields:(string*JsonValue)[]) (json:JsonValue) : State<Renderer,CodeGenConfig,ParsedFormsContext,Errors> =
    state{
      let! config = state.GetContext()
      let! formsState = state.GetState()
      let! s = json |> JsonValue.AsString |> state.OfSum
      if config.Bool.SupportedRenderers |> Set.contains s then
        return PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.BoolType }
      elif config.Date.SupportedRenderers |> Set.contains s then
        return PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.DateOnlyType }
      elif config.Guid.SupportedRenderers |> Set.contains s then
        return PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.GuidType }
      elif config.Int.SupportedRenderers |> Set.contains s then
        return PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.IntType }
      elif config.String.SupportedRenderers |> Set.contains s then
        return PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.StringType }
      elif config.Option.SupportedRenderers.Enum |> Set.contains s || config.Set.SupportedRenderers.Enum |> Set.contains s then
        let containerTypeConstructor = if config.Option.SupportedRenderers.Enum |> Set.contains s then ExprType.OptionType else ExprType.SetType
        let! optionJson = parentJsonFields |> Utils.tryFindField "options" |> state.OfSum
        let! enumName = optionJson |> JsonValue.AsString |> state.OfSum
        let! enum = formsState.Apis.Enums |> Map.tryFindWithError enumName "enums" enumName |> state.OfSum
        let! enumType = formsState.Types |> Map.tryFindWithError enum.TypeId.TypeName "types" enum.TypeId.TypeName |> state.OfSum
        return EnumRenderer (enum |> EnumApi.Id, PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=containerTypeConstructor(enumType.Type)  })
      elif config.Option.SupportedRenderers.Stream |> Set.contains s || config.Set.SupportedRenderers.Stream |> Set.contains s then
        let containerTypeConstructor = if config.Option.SupportedRenderers.Stream |> Set.contains s then ExprType.OptionType else ExprType.SetType
        let! streamNameJson = parentJsonFields |> Utils.tryFindField "stream" |> state.OfSum
        let! streamName = streamNameJson |> JsonValue.AsString |> state.OfSum
        let! stream = formsState.Apis.Streams |> Map.tryFindWithError streamName "streams" streamName |> state.OfSum
        let! streamType = formsState.Types |> Map.tryFindWithError stream.TypeId.TypeName "types" stream.TypeId.TypeName |> state.OfSum
        return StreamRenderer (stream |> StreamApi.Id, PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=containerTypeConstructor(streamType.Type)  })
      elif config.Map.SupportedRenderers |> Set.contains s then
        let! (keyRendererJson, valueRendererJson) = parentJsonFields |> Utils.tryFindField2 ("keyRenderer", "valueRenderer") |> state.OfSum
        let! keyRenderer = NestedRenderer.parse keyRendererJson
        let! valueRenderer = NestedRenderer.parse valueRendererJson
        return MapRenderer {| Map=PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.MapType(keyRenderer.Renderer.Type, valueRenderer.Renderer.Type)  }; Key=keyRenderer; Value=valueRenderer |}
      elif config.List.SupportedRenderers |> Set.contains s then
        let! elementRendererJson = parentJsonFields |> Utils.tryFindField "elementRenderer" |> state.OfSum
        let! elementRenderer = NestedRenderer.parse elementRendererJson
        return ListRenderer {| List=PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.ListType elementRenderer.Renderer.Type  }; Element=elementRenderer |}
      else
        return! state.Any([
          state{
            let! c = config.Custom |> Seq.tryFind (fun c -> c.Value.SupportedRenderers |> Set.contains s) |> Sum.fromOption (fun () -> $"Error: cannot find custom type {s}" |> Errors.Singleton) |> state.OfSum
            let! t = formsState.Types |> Map.tryFindWithError c.Key "types" c.Key |> state.OfSum
            return PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=t.Type }
          }
          state{
            let! form = formsState.Forms |> Map.tryFindWithError s "forms" s |> state.OfSum
            let! formType = formsState.Types |> Map.tryFindWithError form.TypeId.TypeName "types" form.TypeId.TypeName |> state.OfSum
            return FormRenderer (form |> FormConfig.Id, formType.Type)
          }
        ])
    } |> state.WithErrorContext $"...when parsing renderer {json.ToString().ReasonablyClamped}"

and NestedRenderer with
  static member parse (json:JsonValue) : State<NestedRenderer,CodeGenConfig,ParsedFormsContext,Errors> =
    state{
      let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum
      let! label = jsonFields |> Utils.tryFindField "label" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
      let! tooltip = jsonFields |> Utils.tryFindField "tooltip" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
      let! details = jsonFields |> Utils.tryFindField "details" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption      
      let expectedFields = ("renderer", "visible")
      let! (rendererJson,visibleJson) = jsonFields |> Utils.tryFindField2 expectedFields |> state.OfSum
      let! disabledJson = jsonFields |> Utils.tryFindField "disabled" |> state.OfSum |> state.Catch
      let! renderer = Renderer.parse jsonFields rendererJson
      let! visible = Expr.parse visibleJson
      let! disabled = disabledJson |> Sum.toOption |> Option.map (Expr.parse) |> state.InsideOption
      return { Label=label; Tooltip=tooltip; Details=details; Renderer=renderer; Visible=visible; Disabled=disabled }
    } |> state.WithErrorContext $"...when parsing renderer {json.ToString().ReasonablyClamped}"

type FieldConfig with
  static member parse (fieldName:string) (json:JsonValue) : State<FieldConfig,CodeGenConfig,ParsedFormsContext,Errors> =
    state{
      let! fields = json |> JsonValue.AsRecord |> state.OfSum
      let! label = fields |> Utils.tryFindField "label" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
      let! tooltip = fields |> Utils.tryFindField "tooltip" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
      let! details = fields |> Utils.tryFindField "details" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
      let! rendererJson, visibleJson = Utils.tryFindField2 ("renderer", "visible") fields |> state.OfSum
      let! disabledJson = Utils.tryFindField "disabled" fields |> state.OfSum |> state.Catch
      let! renderer = Renderer.parse fields rendererJson
      let! visible = Expr.parse visibleJson
      let! disabled = disabledJson |> Sum.toOption |> Option.map (Expr.parse) |> state.InsideOption
      return { 
        FieldName=fieldName; FieldId=Guid.CreateVersion7(); Label= label; Tooltip=tooltip; Details=details; Renderer=renderer; 
        Visible=visible; Disabled=disabled
      }
    } |> state.WithErrorContext $"...when parsing field {fieldName}"

type FormConfig with
  static member parseGroup (groupName:string) (fieldConfigs:Map<string,FieldConfig>) (json:JsonValue) : State<List<FieldConfigId>, CodeGenConfig, ParsedFormsContext, Errors> = 
    state{
      let! fields = json |> JsonValue.AsArray |> state.OfSum
      return!
        seq{
          for fieldJson in fields do
          yield state{
            let! fieldName = fieldJson |> JsonValue.AsString |> state.OfSum
            return! fieldConfigs |> Map.tryFindWithError fieldName "field name" fieldName |> Sum.map (FieldConfig.Id) |> state.OfSum
          }
        } |> state.All
    } |> state.WithErrorContext $"...when parsing group {groupName}"

  static member parseColumn (columnName:string) fieldConfigs (json:JsonValue) : State<FormGroups, CodeGenConfig, ParsedFormsContext, Errors> = 
    state{
      let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum
      match jsonFields with
      | [| "groups",JsonValue.Record groups |] ->
        let! groups = 
          seq{
            for groupName,groupJson in groups do
            yield state{
              let! column = FormConfig.parseGroup groupName fieldConfigs groupJson
              return groupName,column
            }
          } |> state.All |> state.Map Map.ofList
        return { FormGroups=groups }
      | _ -> 
        return! $"Error: cannot parse groups. Expected a single field 'groups', instead found {json}" |> Errors.Singleton |> state.Throw
    } |> state.WithErrorContext $"...when parsing column {columnName}"

  static member parseTab (tabName:string) fieldConfigs (json:JsonValue) : State<FormColumns, CodeGenConfig, ParsedFormsContext, Errors> = 
    state{
      let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum
      match jsonFields with
      | [| "columns",JsonValue.Record columns |] ->
        let! columns = 
          seq{
            for columnName,columnJson in columns do
            yield state{
              let! column = FormConfig.parseColumn columnName fieldConfigs columnJson
              return columnName,column
            }
          } |> state.All |> state.Map Map.ofList
        return { FormColumns=columns }
      | _ -> 
        return! $"Error: cannot parse columns. Expected a single field 'columns', instead found {json}" |> Errors.Singleton |> state.Throw    } |> state.WithErrorContext $"...when parsing tab {tabName}"

  static member parseTabs fieldConfigs (json:JsonValue) : State<FormTabs, CodeGenConfig, ParsedFormsContext, Errors> = 
    state{
      let! tabs = json |> JsonValue.AsRecord |> state.OfSum
      let! tabs = 
        seq{
          for tabName,tabJson in tabs do
          yield state{
            let! column = FormConfig.parseTab tabName fieldConfigs tabJson
            return tabName,column
          }
        } |> state.All |> state.Map Map.ofList
      return { FormTabs=tabs }
    } |> state.WithErrorContext $"...when parsing tabs"

  static member parse (formName:string) (json:JsonValue) : State<{| TypeId:TypeId; Fields:Map<string, FieldConfig>; Tabs:FormTabs |},CodeGenConfig,ParsedFormsContext,Errors> =
    state{
      let! fields = json |> JsonValue.AsRecord |> state.OfSum
      let! ((typeJson, fieldsJson), tabsJson) = fields |> Utils.tryFindField3 (("type", "fields"), "tabs") |> state.OfSum
      let! typeName, formFields =
        state.All2
          (typeJson |> JsonValue.AsString |> state.OfSum)
          (fieldsJson |> JsonValue.AsRecord |> state.OfSum)
      let! fieldConfigs = 
        formFields |> Seq.map(fun (fieldName,fieldJson) ->
          state{
            let! parsedField = FieldConfig.parse fieldName fieldJson
            return fieldName,parsedField
          }
        ) |> state.All
      let fieldConfigs = fieldConfigs |> Map.ofSeq
      let! s = state.GetState()
      let! typeBinding = s.Types |> Map.tryFindWithError typeName "type" typeName |> state.OfSum
      let! tabs = FormConfig.parseTabs fieldConfigs tabsJson
      return {| TypeId=typeBinding.TypeId; Fields=fieldConfigs; Tabs=tabs |}
    } |> state.WithErrorContext $"...when parsing form {formName}"

type ExprType with
  static member parseUnionCase (json:JsonValue) : State<UnionCase,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      let! args = json |> JsonValue.AsRecord |> state.OfSum
      let! caseJson,fieldsJson = args |> Utils.tryFindField2 ("case", "fields") |> state.OfSum
      let! caseName = caseJson |> JsonValue.AsString |> state.OfSum
      let! fieldsType = ExprType.parse fieldsJson
      return { CaseName=caseName; Fields=fieldsType }
    }
  static member parse (json:JsonValue) : State<ExprType,CodeGenConfig,ParsedFormsContext,Errors> = 
    let (!) = ExprType.parse
    state{
      return! state.Any([
        state{
          do! json |> JsonValue.AsEmptyRecord |> state.OfSum
          return ExprType.UnitType
        }
        state{
          do! json |> JsonValue.AsEnum(Set.singleton "guid") |> state.OfSum |> state.Map ignore
          return ExprType.PrimitiveType PrimitiveType.GuidType
        }
        state{
          do! json |> JsonValue.AsEnum(Set.singleton "string") |> state.OfSum |> state.Map ignore
          return ExprType.PrimitiveType PrimitiveType.StringType
        }
        state{
          do! json |> JsonValue.AsEnum(Set.singleton "number") |> state.OfSum |> state.Map ignore
          return ExprType.PrimitiveType PrimitiveType.IntType
        }
        state{
          do! json |> JsonValue.AsEnum(Set.singleton "boolean") |> state.OfSum |> state.Map ignore
          return ExprType.PrimitiveType PrimitiveType.BoolType
        }
        state{
          do! json |> JsonValue.AsEnum(Set.singleton "Date") |> state.OfSum |> state.Map ignore
          return ExprType.PrimitiveType PrimitiveType.DateOnlyType
        }
        state{
          let! typeName = json |> JsonValue.AsString |> state.OfSum
          let! s = state.GetState()
          let! typeId = s.Types |> Map.tryFind typeName |> withError $$"""Error: cannot find type {{typeName}}""" |> state.OfSum
          return ExprType.LookupType typeId.TypeId
        }
        state{
          let! fields = json |> JsonValue.AsRecord |> state.OfSum
          let! funJson,argsJson = fields |> Utils.tryFindField2 ("fun","args") |> state.OfSum
          return! state.Any([
            state{            
              do! funJson |> JsonValue.AsEnum (Set.singleton "SingleSelection") |> state.OfSum |> state.Map (ignore)
              let! arg = JsonValue.AsSingleton argsJson |> state.OfSum
              let! arg = !arg
              return ExprType.OptionType arg
            }
            state{
              do! funJson |> JsonValue.AsEnum (Set.singleton "MultiSelection") |> state.OfSum |> state.Map (ignore)
              let! arg = JsonValue.AsSingleton argsJson |> state.OfSum
              let! arg = !arg
              return ExprType.SetType arg
            }
            state{
              do! funJson |> JsonValue.AsEnum (Set.singleton "List") |> state.OfSum |> state.Map (ignore)
              let! arg = JsonValue.AsSingleton argsJson |> state.OfSum
              let! arg = !arg
              return ExprType.ListType arg
            }
            state{
              do! funJson |> JsonValue.AsEnum (Set.singleton "Map") |> state.OfSum |> state.Map (ignore)
              let! key,value = JsonValue.AsPair argsJson |> state.OfSum
              let! key,value = state.All2 !key !value
              return ExprType.MapType(key,value)
            }
            state{
              do! funJson |> JsonValue.AsEnum (Set.singleton "Union") |> state.OfSum |> state.Map (ignore)
              let! cases = argsJson |> JsonValue.AsArray |> state.OfSum
              let! cases = state.All(cases |> Seq.map (ExprType.parseUnionCase))
              return ExprType.UnionType cases
            }
          ])
        }
      ])
    }
  static member GetFields (t:ExprType) : Sum<List<string * ExprType>, Errors> =
    match t with
    | ExprType.RecordType fs ->
      sum{ return fs |> Seq.map(fun v -> v.Key, v.Value) |> List.ofSeq }
    | _ -> sum.Throw(sprintf "Error: type %A is no record and thus has no fields" t |> Errors.Singleton)
  static member GetCases (t:ExprType) : Sum<List<UnionCase>, Errors> =
    match t with
    | ExprType.UnionType cs ->
      sum{ return cs }
    | _ -> sum.Throw(sprintf "Error: type %A is no union and thus has no cases" t |> Errors.Singleton)    
type ExprType with
  static member ToGolangTypeAnnotation (t:ExprType) : State<string, CodeGenConfig, GoCodeGenState, Errors> =
    let (!) = ExprType.ToGolangTypeAnnotation
    let error = sum.Throw(sprintf "Error: cannot generate type annotation for type %A" t |> Errors.Singleton) |> state.OfSum
    let registerImportAndReturn (t:CodegenConfigTypeDef) = 
      state{
        do! t.RequiredImport |> Option.toList |> Set.ofList |> Set.union |> GoCodeGenState.Updaters.UsedImports |> state.SetState
        return t.GeneratedTypeName
      }
    state{ 
      let! config = state.GetContext()
      match t with
      | ExprType.LookupType t -> return t.TypeName
      | ExprType.PrimitiveType p ->
          match p with
          | PrimitiveType.BoolType -> return! config.Bool |> registerImportAndReturn 
          | PrimitiveType.DateOnlyType -> return! config.Date |> registerImportAndReturn 
          | PrimitiveType.DateTimeType -> return! error
          | PrimitiveType.FloatType -> return! error
          | PrimitiveType.GuidType -> return! config.Guid |> registerImportAndReturn 
          | PrimitiveType.IntType -> return! config.Int |> registerImportAndReturn 
          | PrimitiveType.RefType r -> return r.EntityName
          | PrimitiveType.StringType -> return! config.String |> registerImportAndReturn 
      | ExprType.ListType e -> 
        let! e = !e
        do! config.List.RequiredImport |> Option.toList |> Set.ofList |> Set.union |> GoCodeGenState.Updaters.UsedImports |> state.SetState
        return $"{config.List.GeneratedTypeName}[{e}]"
      | ExprType.SetType e -> 
        let! e = !e
        do! config.Set.RequiredImport |> Option.toList |> Set.ofList |> Set.union |> GoCodeGenState.Updaters.UsedImports |> state.SetState
        return $"{config.Set.GeneratedTypeName}[{e}]"
      | ExprType.OptionType e -> 
        let! e = !e
        do! config.Option.RequiredImport |> Option.toList |> Set.ofList |> Set.union |> GoCodeGenState.Updaters.UsedImports |> state.SetState
        return $"{config.Option.GeneratedTypeName}[{e}]"
      | ExprType.MapType(k,v) -> 
        let! k = !k
        let! v = !v
        do! config.Map.RequiredImport |> Option.toList |> Set.ofList |> Set.union |> GoCodeGenState.Updaters.UsedImports |> state.SetState
        return $"{config.Map.GeneratedTypeName}[{k},{v}]"
      | _ -> return! error
    }
  static member find (ctx:ParsedFormsContext) (typeId:TypeId) : Sum<ExprType,Errors> = 
    sum{
      return! ctx.Types |> Map.tryFindWithError typeId.TypeName "types" typeId.TypeName |> Sum.map(fun tb -> tb.Type)
    }
  static member asLookupId (t:ExprType) : Sum<TypeId,Errors> = 
    sum{
      match t with
      | ExprType.LookupType l -> return l
      | _ -> return! sum.Throw(Errors.Singleton $$"""Error: type {{t}} cannot be converted to a lookup.""")
    }
  static member resolveLookup (ctx:ParsedFormsContext) (t:ExprType) : Sum<ExprType,Errors> = 
    sum{
      match t with
      | ExprType.LookupType l -> 
        return! ExprType.find ctx l
      | _ -> return t
    }

type EnumApi with
  static member validate valueFieldName (ctx:ParsedFormsContext) (enumApi:EnumApi) : Sum<Unit,Errors> = 
    sum{
      let! enumType = ExprType.find ctx enumApi.TypeId
      let! enumType = ExprType.resolveLookup ctx enumType
      let! fields = ExprType.GetFields enumType
      let error = sum.Throw($$"""Error: type {{enumType}} in enum {{enumApi.EnumName}} is invalid: expected only one field '{{valueFieldName}}' of type 'enum' but found {{fields}}""" |> Errors.Singleton)
      match fields with
      | [(value, valuesType)] when value = valueFieldName ->
        let! valuesType = ExprType.resolveLookup ctx valuesType
        let! cases = ExprType.GetCases valuesType
        if cases |> Seq.exists (fun case -> case.Fields.IsUnitType |> not) then
          return! error
        else 
          return ()
      | _ -> 
        return! error
    }
  static member parse valueFieldName (enumName:string) (enumTypeJson:JsonValue) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      let! enumType = ExprType.parse enumTypeJson
      let! enumTypeId = enumType |> ExprType.asLookupId |> state.OfSum
      let! ctx = state.GetState()
      let! enumType = ExprType.resolveLookup ctx enumType |> state.OfSum
      let! fields = ExprType.GetFields enumType |> state.OfSum
      match fields with
      | [(value, ExprType.LookupType underlyingUnion)] when value = valueFieldName ->
        do! state.SetState(
          ParsedFormsContext.Updaters.Apis(
            FormApis.Updaters.Enums(
              Map.add enumName { EnumApi.EnumId=Guid.CreateVersion7(); TypeId=enumTypeId; EnumName=enumName; UnderlyingEnum=underlyingUnion }
            )
          )
        )
      | _ -> return! state.Throw($$"""Error: invalid enum reference type passed to enum '{{enumName}}'. Expected { {{valueFieldName}}:ENUM }, found {{fields}}.""" |> Errors.Singleton)
    }

type StreamApi with
  static member validate (generatedLanguageSpecificConfig:GeneratedLanguageSpecificConfig) (ctx:ParsedFormsContext) (streamApi:StreamApi) : Sum<Unit,Errors> = 
    sum{
      let! streamType = ExprType.find ctx streamApi.TypeId
      let! streamType = ExprType.resolveLookup ctx streamType
      let! fields = ExprType.GetFields streamType
      let error = sum.Throw($$"""Error: type {{streamType}} in stream {{streamApi.StreamName}} is invalid: expected fields id:Guid, displayValue:string but found {{fields}}""" |> Errors.Singleton)
      match fields |> Seq.tryFind (snd >> (function ExprType.PrimitiveType(PrimitiveType.GuidType) -> true | _ -> false)) with
      | Some (id,_) when id = generatedLanguageSpecificConfig.StreamIdFieldName -> 
        match fields |> Seq.tryFind (snd >> (function ExprType.PrimitiveType(PrimitiveType.StringType) -> true | _ -> false)) with
        | Some (displayValue,_) when displayValue = generatedLanguageSpecificConfig.StreamDisplayValueFieldName -> 
          return ()
        | _ -> return! error
      | _ -> return! error
    }
  static member parse (streamName:string) (streamTypeJson:JsonValue) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      let! streamType = ExprType.parse streamTypeJson
      let! streamTypeId = streamType |> ExprType.asLookupId |> state.OfSum
      do! state.SetState(
        ParsedFormsContext.Updaters.Apis(
          FormApis.Updaters.Streams(
            Map.add streamName { StreamApi.StreamId=Guid.CreateVersion7(); TypeId=streamTypeId; StreamName=streamName }
          )
        )
      )
    }

type StringBuilder = | One of string | Many of seq<StringBuilder> with 
  static member ToString (sb:StringBuilder) : string = 
    let acc = new System.Text.StringBuilder()
    let rec traverse : StringBuilder -> Unit = function | One s -> acc.Append s |> ignore | Many sb -> sb |> Seq.iter traverse
    traverse sb
    acc.ToString()

type String with
  static member ToPascalCase (separators:char array) (self:String) =
    let elements = self.Split separators
    let elements = elements |> Seq.map String.ToFirstUpper
    elements |> Seq.fold (+) String.Empty
  member self.ToFirstUpper =  
    if self |> String.IsNullOrEmpty then self
    else String.Concat(self[0].ToString().ToUpper(), self.AsSpan(1))
  static member ToFirstUpper (self:String) = self.ToFirstUpper

type ParsedFormsContext with
  static member GetTypesFreeVars (ctx:ParsedFormsContext) : Sum<Set<TypeId>, Errors> = 
    let (+) = sum.Lift2 Set.union
    let zero = sum{ return Set.empty }
    (ctx.Forms |> Map.values |> Seq.map(FormConfig.GetTypesFreeVars ctx) |> Seq.fold (+) zero) +
    (ctx.Apis |> FormApis.GetTypesFreeVars |> sum.Return) + 
    (ctx.Launchers |> Map.values |> Seq.map(FormLauncher.GetTypesFreeVars ctx) |> Seq.fold (+) zero)
  static member Validate codegenTargetConfig (ctx:ParsedFormsContext) : Sum<Unit, Errors> =
    sum{
      let! usedTypes = ParsedFormsContext.GetTypesFreeVars ctx
      let availableTypes = ctx.Types |> Map.values |> Seq.map(fun tb -> tb.TypeId) |> Set.ofSeq
      if Set.isSuperset availableTypes usedTypes then 
        do! sum.All(ctx.Apis.Enums |> Map.values |> Seq.map (EnumApi.validate codegenTargetConfig.EnumValueFieldName ctx) |> Seq.toList) |> Sum.map ignore
        do! sum.All(ctx.Apis.Streams |> Map.values |> Seq.map (StreamApi.validate codegenTargetConfig ctx) |> Seq.toList) |> Sum.map ignore
        do! sum.All(ctx.Forms |> Map.values |> Seq.map(FormConfig.Validate ctx) |> Seq.toList) |> Sum.map ignore
        do! sum.All(ctx.Launchers |> Map.values |> Seq.map(FormLauncher.Validate ctx) |> Seq.toList) |> Sum.map ignore
      else 
        let missingTypeErrors = (usedTypes - availableTypes) |> Set.map (fun t -> Errors.Singleton (sprintf "Error: missing type definition for %s" t.TypeName)) |> Seq.fold (curry Errors.Concat) (Errors.Zero())
        return! sum.Throw(missingTypeErrors)
    }
  static member ToGolang (codegenConfig:CodeGenConfig) (ctx:ParsedFormsContext) (packageName:string) (formName:string) : Sum<StringBuilder,Errors> = 
    let result = state{
      let identifierAllowedRegex = Regex codegenConfig.IdentifierAllowedRegex
      let (!) (s:string) = identifierAllowedRegex.Replace(s, "_")
      let enumCasesGETters = 
        seq{
          yield One $"func {formName}EnumAutoGETter(enumName string) "
          yield One " ([]string,error) {\n"
          yield One "  switch enumName {\n"
          yield! ctx.Apis.Enums |> Map.values |> Seq.map(fun e -> 
            Many(seq{
              yield One$$"""    case "{{e.EnumName}}": return {{codegenConfig.List.MappingFunction}}(All{{e.UnderlyingEnum.TypeName}}Cases[:], func (c {{e.UnderlyingEnum.TypeName}}) string { return string(c) }), nil"""
              yield One "\n"
            })
          )
          yield One "  }\n"
          yield One "  var result []string\n"
          yield One """  return result, fmt.Errorf("%s is not a valid enum name", enumName )"""
          yield One "\n}\n\n"

          yield One $"func {formName}EnumGETter[result any](enumName string, "
          yield! ctx.Apis.Enums |> Map.values |> Seq.map(fun e -> 
            One($$"""on{{e.EnumName}} func ([]{{e.UnderlyingEnum.TypeName}}) (result,error), """)
          )
          yield One ") (result,error) {\n"
          yield One "  switch enumName {\n"
          yield! ctx.Apis.Enums |> Map.values |> Seq.map(fun e -> 
            Many(seq{
              yield One($$"""    case "{{e.EnumName}}": return on{{e.EnumName}}(All{{e.UnderlyingEnum.TypeName}}Cases[:])""" )
              yield One "\n"
            })
          )
          yield One "  }\n"
          yield One "  var res result\n"
          yield One """  return res, fmt.Errorf("%s is not a valid enum name", enumName )"""
          yield One "\n}\n\n"
        }

      let enumCasesPOSTter = 
        seq{
          yield One $"func {formName}EnumPOSTter(enumName string, enumValue string, "
          yield! ctx.Apis.Enums |> Map.values |> Seq.map(fun e -> 
            One($$"""on{{e.EnumName}} func ({{e.UnderlyingEnum.TypeName}}) ({{codegenConfig.Unit.GeneratedTypeName}},error), """)
          )
          yield One $$""") ({{codegenConfig.Unit.GeneratedTypeName}},error) {"""
          yield One "\n"
          yield One "  switch enumName {\n"
          yield! ctx.Apis.Enums |> Map.values |> Seq.map(fun e -> 
            Many(seq{
              yield One(sprintf "  case \"%s\":\n" e.EnumName)
              yield One($$"""    if slices.Contains(All{{e.UnderlyingEnum.TypeName}}Cases[:], {{e.UnderlyingEnum.TypeName}}(enumValue)) {""")
              yield One("\n")
              yield One($$"""      return on{{e.EnumName}}({{e.UnderlyingEnum.TypeName}}(enumValue))""")
              yield One("\n")
              yield One("    }\n")
            })
          )
          yield One "  }\n"
          yield One $$"""  var result {{codegenConfig.Unit.GeneratedTypeName}}"""
          yield One "\n"
          yield One """  return result, fmt.Errorf("%s,%s is not a valid enum name/value combination", enumName, enumValue )"""
          yield One "\n}\n\n"
        }

      let streamGETter = 
        seq{
          yield One $"func {formName}StreamGETter[searchParams any, serializedResult any](streamName string, searchArgs searchParams, "
          yield! ctx.Apis.Streams |> Map.values |> Seq.map(fun e -> 
            One($$"""get{{e.StreamName}} func(searchParams) ([]{{e.TypeId.TypeName}}, error), serialize{{e.StreamName}} func(searchParams, []{{e.TypeId.TypeName}}) (serializedResult, error), """)
          )
          yield One ") (serializedResult,error) {\n"
          yield One "  var result serializedResult\n"
          yield One "  switch streamName {\n"
          yield! ctx.Apis.Streams |> Map.values |> Seq.map(fun e -> 
            Many(seq{
              One $$"""  case "{{e.StreamName}}":"""
              One "\n"
              One $$"""   var res,err = get{{e.StreamName}}(searchArgs)"""
              One "\n"
              One $$"""   if err != nil { return result,err }"""
              One "\n"
              One $$"""   return serialize{{e.StreamName}}(searchArgs, res)"""
              One "\n"
            })
          )
          yield One "  }\n"
          yield One """return result, fmt.Errorf("%s is not a valid stream name", streamName )"""
          yield One "\n}\n\n"
        }

      let streamPOSTter = 
        seq{
          yield One $"func {formName}StreamPOSTter[serializedResult any](streamName string, id {codegenConfig.Guid.GeneratedTypeName}, "
          yield! ctx.Apis.Streams |> Map.values |> Seq.map(fun e -> 
            One($$"""get{{e.StreamName}} func({{codegenConfig.Guid.GeneratedTypeName}}) ({{e.TypeId.TypeName}}, error), serialize{{e.StreamName}} func({{e.TypeId.TypeName}}) (serializedResult, error), """)
          )
          yield One ") (serializedResult,error) {\n"
          yield One "  var result serializedResult\n"
          yield One "  switch streamName {\n"
          yield! ctx.Apis.Streams |> Map.values |> Seq.map(fun e -> 
            Many(seq{
              One $$"""  case "{{e.StreamName}}":"""
              One "\n"
              One $$"""   var res,err = get{{e.StreamName}}(id)"""
              One "\n"
              One $$"""   if err != nil { return result,err }"""
              One "\n"
              One $$"""   return serialize{{e.StreamName}}(res)"""
              One "\n"
            })
          )
          yield One "  }\n"
          yield One """return result, fmt.Errorf("%s is not a valid stream name", streamName )"""
          yield One "\n}\n\n"
        }

      let! generatedTypes = state.All(ctx.Types |> Seq.map(fun t -> 
        state{
          match t.Value.Type with
          | ExprType.UnionType cases ->
            let! enumCases = 
              cases |> Seq.map (fun case -> 
                sum{
                  if case.Fields.IsUnitType then
                    return case.CaseName
                  else return! sum.Throw($$"""Error: Go only supports enums, meaning unions where the cases have no fields.""" |> Errors.Singleton)
                }) |> sum.All |> state.OfSum
            return StringBuilder.Many(seq{
              yield StringBuilder.One "\n"
              yield StringBuilder.One $$"""type {{t.Key}} string"""
              yield StringBuilder.One "\n"
              yield StringBuilder.One "const ("
              yield StringBuilder.One "\n"
              for enumCase in enumCases do
                yield StringBuilder.One $$"""  {{t.Key}}{{!enumCase}} {{t.Key}} = "{{enumCase}}" """
                yield StringBuilder.One "\n"
              yield StringBuilder.One ")"
              yield StringBuilder.One "\n"
              yield StringBuilder.One $$"""var All{{t.Key}}Cases = [...]{{t.Key}}{ """
              for enumCase in enumCases do
                yield StringBuilder.One $$"""{{t.Key}}{{!enumCase}}, """
              yield StringBuilder.One "}\n"
            })
          | _ ->
            let! fields = ExprType.GetFields t.Value.Type |> state.OfSum
            let typeStart = $$"""type {{t.Value.TypeId.TypeName}} struct {
  """
            let! fieldTypes = state.All(fields |> Seq.map (snd >> ExprType.ToGolangTypeAnnotation) |> List.ofSeq)
            let fieldDeclarations = Many (seq{
              for fieldType,fieldName in fields |> Seq.map fst |> Seq.zip fieldTypes do
                yield One "  "
                yield One fieldName.ToFirstUpper
                yield One " "
                yield One fieldType
                yield One "\n"
            })
            let typeEnd = $$"""}
  """

            let consStart = $$"""func New{{t.Value.TypeId.TypeName}}("""
            let consParams = Many (seq{
              for fieldType,fieldName in fields |> Seq.map fst |> Seq.zip fieldTypes do
                yield One fieldName
                yield One " "
                yield One fieldType
                yield One ", "
            })
            let consDeclEnd = $$""") {{t.Value.TypeId.TypeName}} {
    res := new({{t.Value.TypeId.TypeName}})
  """

            let consBodyEnd = $$"""  return *res
  }

  """
            let consFieldInits = Many (seq{
              for fieldType,fieldName in fields |> Seq.map fst |> Seq.zip fieldTypes do
                yield One "  res."
                yield One fieldName.ToFirstUpper
                yield One " = "
                yield One fieldName
                yield One ";\n"
            })
            return StringBuilder.Many(seq{
              yield One "\n"
              yield One typeStart
              yield fieldDeclarations
              yield One typeEnd
              yield One "\n"
              yield One consStart
              yield consParams
              yield One consDeclEnd
              yield consFieldInits
              yield One consBodyEnd
            })
          }) |> List.ofSeq)
      return StringBuilder.Many(seq{
        yield! enumCasesGETters
        yield! enumCasesPOSTter
        yield! streamGETter
        yield! streamPOSTter
        // yield! entitiesOPSelector "GET" CrudMethod.Get
        // yield! entitiesOPEnum "GET" CrudMethod.Get
        // yield! entitiesOPSelector "POST" CrudMethod.Create
        // yield! entitiesOPEnum "POST" CrudMethod.Create
        // yield! entitiesOPSelector "PATCH" CrudMethod.Update
        // yield! entitiesOPEnum "PATCH" CrudMethod.Update
        // yield! entitiesOPSelector "DEFAULT" CrudMethod.Default
        // yield! entitiesOPEnum "DEFAULT" CrudMethod.Default
        yield! generatedTypes
      })
    }
    match result.run(codegenConfig, { UsedImports=Set.empty }) with
    | Right e -> Right e
    | Left (res,s') -> 
      Left(
        let imports = match s' with | Some s' -> s'.UsedImports | _ -> Set.empty
        let imports = if ctx.Apis.Enums |> Map.isEmpty |> not then imports + (codegenConfig.List.RequiredImport |> Option.toList |> Set.ofList) + (["golang.org/x/exp/slices"] |> Set.ofList) else imports
        let imports = imports + (codegenConfig.Guid.RequiredImport |> Option.toList |> Set.ofList)
        let imports = imports + (codegenConfig.Unit.RequiredImport |> Option.toList |> Set.ofList)
        let heading = StringBuilder.One $$"""package {{packageName}}

    import (
      "fmt"
      {{imports |> Seq.map(sprintf "  \"%s\"\n") |> Seq.fold (+) ""}}
    )
    """
        Many(seq{
          yield heading
          yield res
        }))


type CrudMethod with
  static member parse (crudMethodJson:JsonValue) : State<CrudMethod,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      match crudMethodJson with
      | JsonValue.String "create" -> return CrudMethod.Create
      | JsonValue.String "get" -> return CrudMethod.Get
      | JsonValue.String "update" -> return CrudMethod.Update
      | JsonValue.String "default" -> return CrudMethod.Default
      | _ -> 
        return! state.Throw($$"""Error: a crud methods needs to be one of "create", "get", "update", "default".""" |> Errors.Singleton)
    }



type EntityApi with
  static member parse (entityName:string) (entityTypeJson:JsonValue) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      let! entityTypeFieldJsons = entityTypeJson |> JsonValue.AsRecord |> state.OfSum
      let! typeJson, methodsJson = entityTypeFieldJsons |> Utils.tryFindField2 ("type","methods") |> state.OfSum
      let! methodsJson = methodsJson |> JsonValue.AsArray |> state.OfSum
      let! entityType = ExprType.parse typeJson
      let! entityTypeId = entityType |> ExprType.asLookupId |> state.OfSum
      let! methods = methodsJson |> Seq.map CrudMethod.parse |> state.All |> state.Map Set.ofSeq
      do! state.SetState(
        ParsedFormsContext.Updaters.Apis(
          FormApis.Updaters.Entities(
            Map.add entityName ({ EntityApi.EntityId=Guid.CreateVersion7(); TypeId=entityTypeId; EntityName=entityName }, methods)
          )
        )
      )
    }
type ParsedFormsContext with
  static member parseApis enumValueFieldName (apisJson:seq<string * JsonValue>) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      let! (enumsJson,searchableStreamsJson),entitiesJson = apisJson |> Utils.tryFindField3 (("enumOptions","searchableStreams"),"entities") |> state.OfSum
      let! enums,streams,entities = 
        state.All3 
          (enumsJson |> JsonValue.AsRecord |> state.OfSum)
          (searchableStreamsJson |> JsonValue.AsRecord |> state.OfSum)
          (entitiesJson |> JsonValue.AsRecord |> state.OfSum)
      for enumName,enumJson in enums do
        do! EnumApi.parse enumValueFieldName enumName enumJson
      for streamName,streamJson in streams do
        do! StreamApi.parse streamName streamJson
      for entityName,entityJson in entities do
        do! EntityApi.parse entityName entityJson
      return ()
    } |> state.MapError(Errors.Map(String.append $$"""when parsing APIs {{apisJson.ToString().ReasonablyClamped}}"""))
  static member parseTypes (typesJson:seq<string * JsonValue>) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      for typeName,typeJson in typesJson do
        return! state{
          let! typeJsonArgs = typeJson |> JsonValue.AsRecord |> state.OfSum
          return! state.Any([
            state{
              let extendsJson = typeJsonArgs |> Utils.tryFindField "extends" |> Sum.toOption |> Option.defaultWith (fun () -> JsonValue.Array[||])
              let! fieldsJson = typeJsonArgs |> Utils.tryFindField "fields" |> state.OfSum
              let! extends,fields = 
                state.All2 
                  (extendsJson |> JsonValue.AsArray |> state.OfSum)
                  (fieldsJson |> JsonValue.AsRecord |> state.OfSum)
              let typeId:TypeId = {  TypeName=typeName; TypeId=Guid.CreateVersion7() }
              let! s = state.GetState()
              let! extendedTypes = 
                extends |> Seq.map (fun extendsJson -> state{
                  let! parsed = ExprType.parse extendsJson
                  return! ExprType.resolveLookup s parsed |> state.OfSum
                }) |> state.All
              let! fields = 
                fields |> Seq.map (fun (fieldName, fieldType) -> 
                    state{
                      let! fieldType = ExprType.parse fieldType
                      return fieldName, fieldType
                    }) |> Seq.toList |> state.All
              let fields = fields |> Map.ofList
              let! exprType = 
                extendedTypes |> Seq.fold (fun (t1:Sum<ExprType, Errors>) t2 -> 
                  sum{ 
                    let! t1 = t1
                    return! ExprType.Extend t1 t2 
                  }) (Left(ExprType.RecordType fields))
                |> state.OfSum
              do! state.SetState(
                ParsedFormsContext.Updaters.Types(
                  Map.add typeName { Type=exprType; TypeId=typeId }
                )
              )
              return ()
            }
            state{
              let typeId:TypeId = {  TypeName=typeName; TypeId=Guid.CreateVersion7() }
              let! parsedType = ExprType.parse typeJson
              do! state.SetState(
                ParsedFormsContext.Updaters.Types(
                  Map.add typeName { Type=parsedType; TypeId=typeId }
                )
              )
            }
          ])
        } |> state.MapError(Errors.Map(String.append $"\n...when parsing type {typeName}"))
      } |> state.MapError(Errors.Map(String.append $"\n...when parsing types"))
  static member parseForms (formsJson:(string*JsonValue)[]) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      for formName, formJson in formsJson do
        let! formBody = FormConfig.parse formName formJson
        do! state.SetState(ParsedFormsContext.Updaters.Forms (Map.add formName { FormConfig.Fields=formBody.Fields; FormConfig.Tabs=formBody.Tabs; FormConfig.TypeId=formBody.TypeId; FormId=Guid.CreateVersion7(); FormName = formName }))
    } |> state.WithErrorContext $"...when parsing forms"

  static member parseLaunchers (launchersJson:(string*JsonValue)[]) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      for launcherName, launcherJson in launchersJson do
        let! (mode, formId, apiId, configApiId) = FormLauncher.parse launcherName launcherJson
        do! state.SetState(ParsedFormsContext.Updaters.Launchers (Map.add launcherName { LauncherName=launcherName; LauncherId=Guid.CreateVersion7(); Mode=mode; Form=formId; EntityApi=apiId; ConfigEntityApi=configApiId }))
    } |> state.WithErrorContext $"...when parsing launchers"

  static member parse generatedLanguageSpecificConfig (json:JsonValue) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
    state{
      let! properties = json |> JsonValue.AsRecord |> state.OfSum
      let! (((typesJson,apisJson),formsJson),launchersJson) = properties |> Utils.tryFindField4 ((("types","apis"),"forms"),"launchers") |> state.OfSum
      let! typesJson,apisJson,formsJson,launchersJson = 
        state.All4
          (typesJson |> JsonValue.AsRecord |> state.OfSum)
          (apisJson |> JsonValue.AsRecord |> state.OfSum)
          (formsJson |> JsonValue.AsRecord |> state.OfSum)
          (launchersJson |> JsonValue.AsRecord |> state.OfSum)
      do! ParsedFormsContext.parseTypes typesJson
      do! ParsedFormsContext.parseApis generatedLanguageSpecificConfig.EnumValueFieldName apisJson
      do! ParsedFormsContext.parseForms formsJson
      do! ParsedFormsContext.parseLaunchers launchersJson
    } |> state.WithErrorContext $"...when parsing language config"
  

type FormsGenTarget = 
| csharp = 1
| golang = 2

open System.CommandLine
open System.Text.RegularExpressions

let formsOptions = {|
  mode = new Option<bool>(name= "-validate", description= "Type check the given forms config.");
  language = 
    (new Option<FormsGenTarget>(
      "-codegen",
      "Language to generate form bindings in.", IsRequired=true))
        .FromAmong(
            "ts",
            "golang");
  input = 
    (new Option<string>(
      "-input",
      "Path of json file to process. Use a folder path to process all files in the folder.", IsRequired=true))
  output = 
    (new Option<string>(
      "-output",
      "Relative path of the generated source file(s) directory. Will be created if it does not exist.", IsRequired=true))
  package_name = 
    (new Option<string>(
      "-package_name",
      "Name of the generated package. Inferred from the filename if absent."))
  form_name = 
    (new Option<string>(
      "-form_name",
      "Name of the form, prefixed to disambiguate generated symbols. Inferred from the filename if absent."))
  codegen_config_path = 
    (new Option<string>(
      "-codegen_config",
      "Path of the codegen configuration path.", IsRequired=true))
|}

[<EntryPoint>]
let main args =
  let rootCommand = new RootCommand("Sample app for System.CommandLine");
  let formsCommand = new Command("forms");
  rootCommand.AddCommand(formsCommand)
  formsCommand.AddOption(formsOptions.mode)
  formsCommand.AddOption(formsOptions.language)
  formsCommand.AddOption(formsOptions.input)
  formsCommand.AddOption(formsOptions.output)
  formsCommand.AddOption(formsOptions.package_name)
  formsCommand.AddOption(formsOptions.form_name)
  formsCommand.AddOption(formsOptions.codegen_config_path)

  // dotnet run -- forms -input person-config.json -validate -codegen ts
  formsCommand.SetHandler(Action<_,_,_,_,_,_,_>(fun (validate:bool) (language:FormsGenTarget) (inputPath:string) (outputPath:string) (generatedPackage:string) (formName:string) (codegenConfigPath:string) ->
    let inputPaths = 
      if System.IO.File.Exists inputPath |> not then 
        System.IO.Directory.EnumerateFiles(inputPath, "*.json") |> Seq.toList
      else 
        [inputPath]
    for inputPath in inputPaths do
      let inputFileNameWithoutExtension = System.IO.Path.GetFileNameWithoutExtension inputPath    
      // let inputDirectory = System.IO.Path.GetDirectoryName inputPath
      let inputFileName = inputFileNameWithoutExtension |> String.ToPascalCase [|'-'; '_'|]
      let generatedPackage,formName = 
        (if generatedPackage = null then inputFileName else generatedPackage), 
        (if formName = null then inputFileName else formName)
      if File.Exists inputPath |> not then
        do Errors.Print inputPath (Errors.Singleton "Input file does not exist.")
        System.Environment.Exit -1
      let jsonValue = 
        try
          let inputConfig = File.ReadAllText inputPath
          JsonValue.Parse inputConfig
        with
        | err -> 
          do Errors.Print inputPath (Errors.Singleton $"Error when reading json: {err.Message.ReasonablyClamped}")
          do System.Environment.Exit -1
          failwith ""      
      // samplePrimitiveRenderers
      let codegenConfig = 
        try
          let codegenConfig = System.IO.File.ReadAllText codegenConfigPath
          JsonSerializer.Deserialize<CodeGenConfig>(codegenConfig, JsonFSharpOptions.Default().ToJsonSerializerOptions())
        with
        | err -> 
          do Errors.Print codegenConfigPath (Errors.Singleton $"Error when reading codegen config: {err.Message.ReasonablyClamped}")
          do System.Environment.Exit -1
          failwith ""      
      let injectedTypes:Map<string, TypeBinding> = 
        codegenConfig.Custom |> Seq.map (fun c -> c.Key, (c.Key |> TypeId.Create,ExprType.RecordType Map.empty) |> TypeBinding.Create) |> Map.ofSeq
      let initialContext = { ParsedFormsContext.Empty with Types=injectedTypes }
      let generatedLanguageSpecificConfig = 
        match language with
        | FormsGenTarget.golang -> { EnumValueFieldName="Value"; StreamIdFieldName="Id"; StreamDisplayValueFieldName="DisplayValue" }
        | _ -> { EnumValueFieldName="value"; StreamIdFieldName="id"; StreamDisplayValueFieldName="displayValue" }
      match ((ParsedFormsContext.parse generatedLanguageSpecificConfig jsonValue).run(codegenConfig, initialContext)) with
      | Left(_,Some parsedForms)  -> 
        match ParsedFormsContext.Validate generatedLanguageSpecificConfig parsedForms with
        | Left validatedForms ->
          match language with
          | FormsGenTarget.golang ->
            match ParsedFormsContext.ToGolang codegenConfig parsedForms generatedPackage formName with
            | Left generatedCode -> 
              // do Console.ReadLine() |> ignore
              let outputPath = System.IO.Path.Combine [| outputPath; $$"""{{inputFileNameWithoutExtension}}.gen.go""" |]
              try
                do System.IO.Directory.CreateDirectory (System.IO.Path.GetDirectoryName outputPath) |> ignore
                let generatedCode = generatedCode |> StringBuilder.ToString
                do System.IO.File.WriteAllText(outputPath, generatedCode)
                do Console.ForegroundColor <- ConsoleColor.Green
                do printf $$"""Code for {{inputPath}} is generated at {{outputPath}}.  """
                do Console.ResetColor()
              with
              | err -> 
                do Errors.Print inputPath (Errors.Singleton $"Error when generating output file {{err.Message.ReasonablyClamped}}")
            | Right err -> 
              do eprintfn "\nCode generation errors for {{inputPath}}: %A" err
          | _ -> 
            do Console.ForegroundColor <- ConsoleColor.Red
            do eprintfn "\nUnsupported code generation target for %s: %A" inputPath language
            do Console.ResetColor()
        | Right err -> 
          do Errors.Print inputPath err
      | Right err -> 
        do Errors.Print inputPath err
      | _ -> 
        do Errors.Print inputPath (Errors.Singleton $"Unexpected error: parsing produced no results.")
    ), formsOptions.mode, formsOptions.language, formsOptions.input, formsOptions.output, formsOptions.package_name, formsOptions.form_name, formsOptions.codegen_config_path)

  rootCommand.Invoke(args)

(*
dotnet run -- forms -input ./input-forms/project-room -output ./generated-output/models -validate -codegen golang -codegen_config ./input-forms/go-config.json
*)