module BallerinaRuntime

open FSharp.Data
open FSharp.Data.JsonExtensions
open System
open System.IO
open Ballerina.Fun
open Ballerina.BusinessRules
open Ballerina.Option
open Ballerina.Sum
open Ballerina.Errors
let dup a = (a,a)
let (<*>) f g = fun (a,b) -> (f a, g b)


type CrudMethod = Create | Get | Update | Default
type FormLauncherId = { LauncherName:string; LauncherId:Guid }
and FormLauncher = { LauncherName:string; LauncherId:Guid; Form:FormConfigId; EntityApi:EntityApiId; Mode:FormLauncherMode } with static member Name (l:FormLauncher) : string = l.LauncherName; static member Id (l:FormLauncher) : FormLauncherId = { LauncherName=l.LauncherName; LauncherId=l.LauncherId }
and FormLauncherMode = | Create | Edit
and EnumApiId = { EnumName:string; EnumId:Guid }
and EnumApi = { EnumName:string; EnumId:Guid; TypeId:TypeId } with static member Id (e:EnumApi) = { EnumName=e.EnumName; EnumId=e.EnumId }; static member Create (n,t) : EnumApi = { EnumName=n; TypeId=t; EnumId=Guid.CreateVersion7() }; static member Type (a:EnumApi) : TypeId = a.TypeId
and StreamApiId = { StreamName:string; StreamId:Guid }
and StreamApi = { StreamName:string; StreamId:Guid; TypeId:TypeId } with static member Id (e:StreamApi) = { StreamName=e.StreamName; StreamId=e.StreamId }; static member Create (n,t) : StreamApi = { StreamName=n; TypeId=t; StreamId=Guid.CreateVersion7() }; static member Type (a:StreamApi) : TypeId = a.TypeId
and EntityApiId = { EntityName:string; EntityId:Guid }
and EntityApi = { EntityName:string; EntityId:Guid; TypeId:TypeId } with static member Id (e:EntityApi) = { EntityName=e.EntityName; EntityId=e.EntityId }; static member Create (n,t) : EntityApi = { EntityName=n; TypeId=t; EntityId=Guid.CreateVersion7() }; static member Type (a:EntityApi) : TypeId = a.TypeId

and FormApis = {
  Enums:Map<string, EnumApi>
  Streams:Map<string, StreamApi>
  Entities:Map<string, EntityApi * Set<CrudMethod>>
}
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
and FieldConfig = { FieldName:string; FieldId:Guid; Label:Option<string>; Tooltip:Option<string>; Renderer:FieldRenderer; Visible:Expr; Disabled:Option<Expr> } with 
  static member Id (f:FieldConfig) : FieldConfigId = { FieldName=f.FieldName; FieldId=f.FieldId }
  static member Name (f:FieldConfig) = f.FieldName
and FieldRenderer = 
  | PrimitiveRenderer of PrimitiveRenderer
  | MapRenderer of {| Map:FieldRenderer; Key:KeyRenderer; Value:ValueRenderer |}
  | ListRenderer of {| List:FieldRenderer; Element:ElementRenderer |}
  | EnumRenderer of EnumApiId * FieldRenderer
  | StreamRenderer of StreamApiId * FieldRenderer
  | FormRenderer of FormConfigId
and KeyRenderer = { Label:Option<string>; Tooltip:Option<string>; Renderer:FieldRenderer; Visible:Expr; Disabled:Option<Expr> }
and ValueRenderer = { Label:Option<string>; Tooltip:Option<string>; Renderer:FieldRenderer; Visible:Expr; Disabled:Option<Expr> }
and ElementRenderer = { Label:Option<string>; Tooltip:Option<string>; Renderer:FieldRenderer; Visible:Expr; Disabled:Option<Expr> }
and PrimitiveRendererId = { PrimitiveRendererName:string; PrimitiveRendererId:Guid }
and PrimitiveRenderer = { PrimitiveRendererName:string; PrimitiveRendererId:Guid; Type:ExprType } with static member ToPrimitiveRendererId (r:PrimitiveRenderer) = { PrimitiveRendererName=r.PrimitiveRendererName; PrimitiveRendererId=r.PrimitiveRendererId }

let inline extractTypes<'k, 'v when 'v : (static member Type : 'v -> TypeId) and 'k : comparison> (m:Map<'k, 'v>) =
  m |> Map.values |> Seq.map(fun e -> e |> 'v.Type |> Set.singleton) |> Seq.fold (+) Set.empty

type ParsedFormsContext = {
  Types:Map<string, TypeBinding>
  Apis:FormApis
  Forms:Map<string, FormConfig>
  Launchers:Map<string, FormLauncher>
}

type FieldRenderer with
  static member GetTypesFreeVars (ctx:ParsedFormsContext) (fr:FieldRenderer) : Sum<Set<TypeId>, Errors> = 
    let (+) = sum.Lift2 Set.union
    let (!) = FieldRenderer.GetTypesFreeVars ctx 
    match fr with
    | FieldRenderer.EnumRenderer(e,f) -> 
      (ctx.Apis.Enums |> Map.tryFindWithError e.EnumName "enum" e.EnumName |> Sum.map (EnumApi.Type >> Set.singleton)) + !f
    | FieldRenderer.FormRenderer f ->
      sum{ 
        let! f = ctx.Forms |> Map.tryFindWithError f.FormName "form" f.FormName
        return! f |> FormConfig.GetTypesFreeVars ctx
      }
    | FieldRenderer.ListRenderer l ->
      !l.Element.Renderer + !l.List
    | FieldRenderer.MapRenderer m ->
      !m.Map + !m.Key.Renderer + !m.Value.Renderer
    | FieldRenderer.PrimitiveRenderer p -> sum{ return p.Type |> ExprType.GetTypesFreeVars }
    | FieldRenderer.StreamRenderer (s,f) ->
      (ctx.Apis.Streams |> Map.tryFindWithError s.StreamName "stream" s.StreamName |> Sum.map (StreamApi.Type >> Set.singleton)) + !f
  static member Validate (ctx:ParsedFormsContext) (fr:FieldRenderer) : Sum<ExprType, Errors> = 
    let (!) = FieldRenderer.Validate ctx
    sum{
      match fr with
      | FieldRenderer.EnumRenderer(enum, enumRenderer) -> 
        let! enum = ctx.Apis.Enums |> Map.tryFindWithError enum.EnumName "enum" enum.EnumName
        let! enumType = ctx.Types |> Map.tryFindWithError enum.TypeId.TypeName "enum type" enum.EnumName
        let! enumRendererType = !enumRenderer
        return ExprType.Substitute (Map.empty |> Map.add { VarName="a1" } enumType.Type) enumRendererType
      | FieldRenderer.FormRenderer f ->
        let! f = ctx.Forms |> Map.tryFindWithError f.FormName "form" f.FormName
        let! formType = ctx.Types |> Map.tryFindWithError f.TypeId.TypeName "form type" f.FormName
        return formType.Type
      | FieldRenderer.ListRenderer(l) -> 
        let! genericListRenderer = !l.List
        let! elementRendererType = !l.Element.Renderer
        let listRenderer = ExprType.Substitute (Map.empty |> Map.add { VarName="a1" } elementRendererType) genericListRenderer
        return listRenderer
      | FieldRenderer.MapRenderer(m) -> 
        let! genericMapRenderer = !m.Map
        let! keyRendererType = !m.Key.Renderer
        let! valueRendererType = !m.Value.Renderer
        let mapRenderer = ExprType.Substitute (Map.empty |> Map.add { VarName="a1" } keyRendererType |> Map.add { VarName="a2" } valueRendererType) genericMapRenderer
        return mapRenderer
      | FieldRenderer.PrimitiveRenderer p -> 
        return p.Type
      | FieldRenderer.StreamRenderer (stream, streamRenderer) ->
        let! stream = ctx.Apis.Streams |> Map.tryFindWithError stream.StreamName "stream" stream.StreamName
        let! streamType = ctx.Types |> Map.tryFindWithError stream.TypeId.TypeName "stream type" stream.StreamName
        let! streamRendererType = !streamRenderer
        return ExprType.Substitute (Map.empty |> Map.add { VarName="a1" } streamType.Type) streamRendererType
    }

and FieldConfig with
  static member Validate (ctx:ParsedFormsContext) (formType:ExprType) (fc:FieldConfig) : Sum<Unit, Errors> = 
    sum{
      match formType with
      | RecordType fields ->
        match fields |> Map.tryFind fc.FieldName with
        | Some fieldType -> 
          let! rendererType = FieldRenderer.Validate ctx fc.Renderer
          let result = ExprType.Unify Map.empty (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq) rendererType fieldType |> Sum.map ignore
          if result.IsRight then
            return! result
          else
            return! result
        | None -> 
          return! sum.Throw(Errors.Singleton(sprintf "Error: field name %A is not found in type %A" fc.FieldName formType))
      | _ ->       
        return! sum.Throw(Errors.Singleton(sprintf "Error: form type %A is not a record type" formType))
    }

and FormConfig with
  static member GetTypesFreeVars (ctx:ParsedFormsContext) (fc:FormConfig) : Sum<Set<TypeId>, Errors> = 
    let (+) = sum.Lift2 Set.union
    sum{ return Set.singleton fc.TypeId } + 
      (
        fc.Fields 
          |> Map.values |> Seq.map(fun f -> f.Renderer |> FieldRenderer.GetTypesFreeVars ctx) 
          |> Seq.fold (+) (sum{ return Set.empty })
      )
  static member Validate (ctx:ParsedFormsContext) (formConfig:FormConfig) : Sum<Unit, Errors> = 
    sum{
      let! formType = ctx.Types |> Map.tryFindWithError formConfig.TypeId.TypeName "form type" formConfig.TypeId.TypeName
      return! sum.All(formConfig.Fields |> Map.values |> Seq.map (FieldConfig.Validate ctx formType.Type) |> Seq.toList) |> Sum.map ignore
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
      do! ExprType.Unify Map.empty (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq) formType.Type entityApiType.Type |> Sum.map ignore
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
    }

type FormApis with
  static member GetTypesFreeVars (fa:FormApis) : Set<TypeId> = 
    extractTypes fa.Enums + extractTypes fa.Streams + extractTypes (fa.Entities |> Map.map (fun _ -> fst))

type ParsedFormsContext with
  static member GetTypesFreeVars (ctx:ParsedFormsContext) : Sum<Set<TypeId>, Errors> = 
    let (+) = sum.Lift2 Set.union
    let zero = sum{ return Set.empty }
    (ctx.Forms |> Map.values |> Seq.map(FormConfig.GetTypesFreeVars ctx) |> Seq.fold (+) zero) +
    (ctx.Apis |> FormApis.GetTypesFreeVars |> sum.Return) + 
    (ctx.Launchers |> Map.values |> Seq.map(FormLauncher.GetTypesFreeVars ctx) |> Seq.fold (+) zero)
  static member Validate (ctx:ParsedFormsContext) : Sum<Unit, Errors> =
    sum{
      let! usedTypes = ParsedFormsContext.GetTypesFreeVars ctx
      let availableTypes = ctx.Types |> Map.values |> Seq.map(fun tb -> tb.TypeId) |> Set.ofSeq
      if availableTypes |> Set.isSuperset usedTypes then 
        do! sum.All(ctx.Forms |> Map.values |> Seq.map(FormConfig.Validate ctx) |> Seq.toList) |> Sum.map ignore
        do! sum.All(ctx.Launchers |> Map.values |> Seq.map(FormLauncher.Validate ctx) |> Seq.toList) |> Sum.map ignore
        return ()
      else 
        let missingTypeErrors = (usedTypes - availableTypes) |> Set.map (fun t -> Errors.Singleton (sprintf "Error: missing type definition for %s" t.TypeName)) |> Seq.fold (curry Errors.Concat) (Errors.Zero())
        return! sum.Throw(missingTypeErrors)
    }

let sampleTypes injectedTypes = 
  let injectedTypes = injectedTypes |> Seq.map (fun injectedTypeName -> injectedTypeName.TypeName, (injectedTypeName, ExprType.VarType({ VarName="'a1" })) |> TypeBinding.Create) |> Map.ofSeq
  let collectionReferenceType = 
    ExprType.RecordType(
      [
        ("Id", ExprType.PrimitiveType PrimitiveType.GuidType)
        ("DisplayValue", ExprType.PrimitiveType PrimitiveType.StringType)
      ] |> Map.ofList)
  sum{
    let CityRefName = "CityRef" |> TypeId.Create
    let AddressName = "Address" |> TypeId.Create
    let GenderRefName = "GenderRef" |> TypeId.Create
    let ColorRefName = "ColorRef" |> TypeId.Create
    let InterestRefName = "InterestRef" |> TypeId.Create
    let DepartmentRefName = "DepartmentRef" |> TypeId.Create
    let PermissionRefName = "PermissionRef" |> TypeId.Create
    let PersonName = "Person" |> TypeId.Create
    let! injectedCategoryName = injectedTypes |> Map.tryFind "injectedCategory" |> Option.map (fun tb -> tb.TypeId) |> withError "Error: missing injectedCategory from injected types"

    let! cityRef = ExprType.Extend collectionReferenceType (ExprType.RecordType Map.empty) |> withError "Error: cannot create CityRef"
    let address = 
      ExprType.RecordType ([
          "street", ExprType.PrimitiveType PrimitiveType.StringType
          "number", ExprType.PrimitiveType PrimitiveType.IntType
          "city", cityRef
      ] |> Map.ofList)
    let! genderRef = ExprType.Extend collectionReferenceType (ExprType.RecordType Map.empty) |> withError "Error: cannot create GenderRef"
    let! colorRef = ExprType.Extend collectionReferenceType (ExprType.RecordType Map.empty) |> withError "Error: cannot create ColorRef"
    let! interestRef = ExprType.Extend collectionReferenceType (ExprType.RecordType Map.empty) |> withError "Error: cannot create InterestRef"
    let! departmentRef = ExprType.Extend collectionReferenceType (ExprType.RecordType Map.empty) |> withError "Error: cannot create DepartmentRef"
    let! permissionRef = ExprType.Extend collectionReferenceType (ExprType.RecordType Map.empty) |> withError "Error: cannot create PermissionRef"
    let person = 
      ExprType.RecordType([
          "name", ExprType.PrimitiveType PrimitiveType.StringType
          "surname", ExprType.PrimitiveType PrimitiveType.StringType
          "birthday", ExprType.PrimitiveType PrimitiveType.DateOnlyType
          "subscribeToNewsletter", ExprType.PrimitiveType PrimitiveType.BoolType
          "favoriteColor", ExprType.LookupType ColorRefName |> ExprType.OptionType
          "gender", ExprType.LookupType GenderRefName |> ExprType.OptionType
          "interests", ExprType.SetType(ExprType.LookupType InterestRefName)
          "departments", ExprType.SetType(ExprType.LookupType DepartmentRefName)
          "mainAddress", ExprType.LookupType AddressName
          "dependants", ExprType.MapType(ExprType.PrimitiveType PrimitiveType.StringType, ExprType.LookupType injectedCategoryName)
          "friendsByCategory", ExprType.MapType(ExprType.LookupType injectedCategoryName, ExprType.PrimitiveType PrimitiveType.StringType)
          "relatives", ExprType.ListType(ExprType.LookupType injectedCategoryName)
          "addresses", ExprType.ListType(ExprType.LookupType AddressName)
          "emails", ExprType.ListType(ExprType.PrimitiveType PrimitiveType.StringType)
          "addressesWithLabel", ExprType.MapType(ExprType.PrimitiveType PrimitiveType.StringType, ExprType.LookupType AddressName)
          "addressesByCity", ExprType.MapType(ExprType.LookupType CityRefName |> ExprType.OptionType, ExprType.LookupType AddressName)
          "addressesWithColorLabel", ExprType.MapType(ExprType.LookupType ColorRefName |> ExprType.OptionType, ExprType.LookupType AddressName)
          "permissions", ExprType.MapType(ExprType.LookupType PermissionRefName |> ExprType.OptionType, ExprType.PrimitiveType PrimitiveType.BoolType)
          "cityByDepartment", ExprType.MapType(ExprType.LookupType DepartmentRefName |> ExprType.OptionType, ExprType.LookupType CityRefName |> ExprType.OptionType)
          "shoeColors", ExprType.SetType(ExprType.LookupType ColorRefName)
          "friendsBirthdays", ExprType.MapType(ExprType.PrimitiveType PrimitiveType.StringType, ExprType.PrimitiveType PrimitiveType.DateOnlyType)
          "holidays", ExprType.ListType(ExprType.PrimitiveType PrimitiveType.DateOnlyType)
          "category", ExprType.LookupType injectedCategoryName
        ] |> Map.ofList)
    return [
      yield! injectedTypes |> Seq.map (fun t -> t.Key, t.Value)
      CityRefName.TypeName,(CityRefName, cityRef) |> TypeBinding.Create
      AddressName.TypeName,(AddressName, address) |> TypeBinding.Create
      GenderRefName.TypeName,(GenderRefName, genderRef) |> TypeBinding.Create
      ColorRefName.TypeName,(ColorRefName, colorRef) |> TypeBinding.Create
      InterestRefName.TypeName,(InterestRefName, interestRef) |> TypeBinding.Create
      DepartmentRefName.TypeName,(DepartmentRefName, departmentRef) |> TypeBinding.Create
      PermissionRefName.TypeName,(PermissionRefName, permissionRef) |> TypeBinding.Create
      PersonName.TypeName,(PersonName, person) |> TypeBinding.Create
    ] |> Map.ofList
  }

let formApis injectedTypes = 
  sum{
    let! instantiatedSampleTypes = sampleTypes injectedTypes
    let! genderRefType = instantiatedSampleTypes |> Map.tryFind "GenderRef" |> withError "Error: cannot find type  GenderRef"
    let! colorRefType = instantiatedSampleTypes |> Map.tryFind "ColorRef" |> withError "Error: cannot find type  ColorRef"
    let! interestRefType = instantiatedSampleTypes |> Map.tryFind "InterestRef" |> withError "Error: cannot find type  InterestRef"
    let! permissionRefType = instantiatedSampleTypes |> Map.tryFind "PermissionRef" |> withError "Error: cannot find type 
     PermissionRef"
    let! cityRefType = instantiatedSampleTypes |> Map.tryFind "CityRef" |> withError "Error: cannot find CityRef"
    let! departmentRefType = instantiatedSampleTypes |> Map.tryFind "DepartmentRef" |> withError "Error: cannot find type 
     DepartmentRef"
    let! personType = instantiatedSampleTypes |> Map.tryFind "Person" |> withError "Error: cannot find type Person"
    return instantiatedSampleTypes,{
      Enums=
        [
          ("genders", genderRefType.TypeId)
          ("colors", colorRefType.TypeId)
          ("interests", interestRefType.TypeId)
          ("permissions", permissionRefType.TypeId)
        ] |> Seq.map (dup >> (fst <*> EnumApi.Create)) |> Map.ofSeq;
      Streams=
        [
          ("cities", cityRefType.TypeId)
          ("departments", departmentRefType.TypeId)
        ] |> Seq.map (dup >> (fst <*> StreamApi.Create)) |> Map.ofSeq;
      Entities=
        [
          ("person", personType.TypeId, [CrudMethod.Create; Get; Update; Default] |> Set.ofList)
        ] |> Seq.map (fun (n,tn,m) -> n,(EntityApi.Create(n,tn),m)) |> Map.ofSeq;
    }
  }

let instantiateSampleForms injectedTypes (primitiveRenderers:Map<string, PrimitiveRenderer>) = 
  sum{
    let! types, apis = formApis injectedTypes
    let! defaultString = primitiveRenderers |> Map.tryFind "defaultString" |> withError "Cannot find primitive renderer defaultString"
    let! defaultNumber = primitiveRenderers |> Map.tryFind "defaultNumber" |> withError "Cannot find primitive renderer defaultNumber"
    let! defaultDate = primitiveRenderers |> Map.tryFind "defaultDate" |> withError "Cannot find primitive renderer defaultDate"
    let! defaultInfiniteStream = primitiveRenderers |> Map.tryFind "defaultInfiniteStream" |> withError "Cannot find primitive     
renderer defaultInfiniteStream"
    let! defaultEnum = primitiveRenderers |> Map.tryFind "defaultEnum" |> withError "Cannot find primitive renderer defaultEnum"
    let! defaultEnumMultiselect = primitiveRenderers |> Map.tryFind "defaultEnumMultiselect" |> withError "Cannot find primitive renderer defaultEnumMultiselect"
    let! defaultInfiniteStreamMultiselect = primitiveRenderers |> Map.tryFind "defaultInfiniteStreamMultiselect" |> withError "Cannot find primitive renderer 'defaultInfiniteStreamMultiselect'"
    let! defaultMap = primitiveRenderers |> Map.tryFind "defaultMap" |> withError "Cannot find primitive renderer defaultMap"
    let! defaultList = primitiveRenderers |> Map.tryFind "defaultList" |> withError "Cannot find primitive renderer defaultList"
    let! defaultBoolean = primitiveRenderers |> Map.tryFind "defaultBoolean" |> withError "Cannot find primitive renderer defaultBoolean"
    let! defaultCategory = primitiveRenderers |> Map.tryFind "defaultCategory" |> withError "Cannot find primitive renderer defaultCategory"
    let! citiesStream = apis.Streams |> Map.tryFind "cities" |> withError "Cannot find stream API for cities"
    let! addressType = types |> Map.tryFind "Address" |> withError "Cannot find type Address"
    let! personType = types |> Map.tryFind "Person" |> withError "Cannot find type Person"
    let addressFields = 
      [
        { FieldName="street"; FieldId=Guid.CreateVersion7(); 
           Label=None; Tooltip=None;
          Renderer=PrimitiveRenderer defaultString; 
          Visible=Expr.Binary(Or, 
            Expr.RecordFieldLookup(Expr.VarLookup({ VarName = "root" }), "subscribeToNewsletter"),
            Expr.Binary(Equals, 
              Expr.RecordFieldLookup(Expr.VarLookup({ VarName = "local" }), "number"),
              Expr.Value(Value.ConstInt 10)
            )
          ); 
          Disabled=None }
        { FieldName="number"; FieldId=Guid.CreateVersion7(); 
          Label=None; Tooltip=None;
          Renderer=PrimitiveRenderer defaultNumber; 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }            
        { FieldName="city"; FieldId=Guid.CreateVersion7(); 
          Label=None; Tooltip=None;
          Renderer=StreamRenderer(citiesStream |> StreamApi.Id, PrimitiveRenderer defaultInfiniteStream); 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }            
      ] |> Seq.map (dup >> (FieldConfig.Name <*> id)) |> Map.ofSeq;
    let! streetField = addressFields |> Map.tryFind "street" |> withError "Cannot find 'street' field in form 'address'"
    let! numberField = addressFields |> Map.tryFind "number" |> withError "Cannot find 'number' field in form 'address'"
    let! cityField = addressFields |> Map.tryFind "city" |> withError "Cannot find 'city' field in form 'address'"
    let addressForm:FormConfig = {
      FormName="address"; 
      FormId=Guid.CreateVersion7(); 
      TypeId=addressType.TypeId;
      Fields=addressFields
      Tabs=
        {
          FormTabs=[
            ("main", {
              FormColumns= [
                ("main", {
                  FormGroups= [
                    ("main", [streetField; numberField; cityField] |> List.map FieldConfig.Id)
                  ] |> Map.ofSeq
                })
              ] |> Map.ofSeq
            })
          ] |> Map.ofSeq
        }
    }
    let! colorOptions = apis.Enums |> Map.tryFind "colors" |> withError "Cannot find 'colors' enum api"
    let! genderOptions = apis.Enums |> Map.tryFind "genders" |> withError "Cannot find 'genders' enum api"
    let! interestOptions = apis.Enums |> Map.tryFind "interests" |> withError "Cannot find 'interests' enum api"
    let! departmentsStream = apis.Streams |> Map.tryFind "departments" |> withError "Cannot find 'departments' stream api"
    let! permissionOptions = apis.Enums |> Map.tryFind "permissions" |> withError "Cannot find 'permissions' enum api"
    let personFields = 
      [
        { FieldName="category"; FieldId=Guid.CreateVersion7(); 
          Label=Some "category"; Tooltip=None;
          Renderer=PrimitiveRenderer defaultCategory; 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="name"; FieldId=Guid.CreateVersion7(); 
          Label=Some "first name"; Tooltip=Some "Any name will do";
          Renderer=PrimitiveRenderer defaultString; 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="surname"; FieldId=Guid.CreateVersion7(); 
          Label=Some "last name"; Tooltip=None;
          Renderer=PrimitiveRenderer defaultString; 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="birthday"; FieldId=Guid.CreateVersion7(); 
          Label=None; Tooltip=Some "Happy birthday!";
          Renderer=PrimitiveRenderer defaultDate; 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="favoriteColor"; FieldId=Guid.CreateVersion7(); 
          Label=None; Tooltip=None;
          Renderer=FieldRenderer.EnumRenderer(colorOptions |> EnumApi.Id, PrimitiveRenderer defaultEnum); 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="gender"; FieldId=Guid.CreateVersion7(); 
          Label=None; Tooltip=None;
          Renderer=FieldRenderer.EnumRenderer(genderOptions |> EnumApi.Id, PrimitiveRenderer defaultEnum); 
          Visible=
            Expr.Binary(
              Or,
              Expr.RecordFieldLookup(Expr.VarLookup({ VarName = "flag" }), "X"),
              Expr.RecordFieldLookup(Expr.VarLookup({ VarName = "flag" }), "Y")
            );
          Disabled=None }
        { FieldName="dependants"; FieldId=Guid.CreateVersion7(); 
          Label=Some "dependants"; Tooltip=None;
          Renderer=FieldRenderer.MapRenderer({| 
            Map=PrimitiveRenderer defaultMap; 
            Key={
              Label=Some "name"; Tooltip=Some "their name";
              Renderer=FieldRenderer.PrimitiveRenderer defaultString; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            }; 
            Value={
              Label=Some "category"; Tooltip=Some "their category";
              Renderer=FieldRenderer.PrimitiveRenderer defaultCategory; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            }; 
          |}); 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="friendsByCategory"; FieldId=Guid.CreateVersion7(); 
          Label=Some "friends by category"; Tooltip=None;
          Renderer=FieldRenderer.MapRenderer({| 
            Map=PrimitiveRenderer defaultMap; 
            Key={
              Label=Some "category"; Tooltip=None;
              Renderer=FieldRenderer.PrimitiveRenderer defaultDate; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            }; 
            Value={
              Label=Some "name"; Tooltip=None;
              Renderer=FieldRenderer.PrimitiveRenderer defaultString; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            }; 
          |}); 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="relatives"; FieldId=Guid.CreateVersion7(); 
          Label=Some "relatives"; Tooltip=Some "someone whom you are related to";
          Renderer=FieldRenderer.ListRenderer {| 
            List=FieldRenderer.PrimitiveRenderer defaultList;
            Element={
              Label=Some "relative"; Tooltip=Some "one relative";
              Renderer=FieldRenderer.PrimitiveRenderer defaultDate; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            }
          |}; 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="subscribeToNewsletter"; FieldId=Guid.CreateVersion7(); 
          Label=Some "subscribe to newsletter"; Tooltip=None;
          Renderer=PrimitiveRenderer defaultBoolean;
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="interests"; FieldId=Guid.CreateVersion7(); 
          Label=Some "interests"; Tooltip=None;
          Renderer=FieldRenderer.EnumRenderer(interestOptions |> EnumApi.Id, PrimitiveRenderer defaultEnumMultiselect);
          Visible=
            Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter");
          Disabled=None }
        { FieldName="departments"; FieldId=Guid.CreateVersion7(); 
          Label=Some "departments"; Tooltip=None;
          Renderer=FieldRenderer.StreamRenderer(departmentsStream |> StreamApi.Id, PrimitiveRenderer defaultInfiniteStreamMultiselect);
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="mainAddress"; FieldId=Guid.CreateVersion7(); 
          Label=Some "main address"; Tooltip=None;
          Renderer=FieldRenderer.FormRenderer(FormConfig.Id addressForm);
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="addresses"; FieldId=Guid.CreateVersion7(); 
          Label=Some "other addresses"; Tooltip=None;
          Renderer=FieldRenderer.ListRenderer({|
            List=PrimitiveRenderer defaultList;
            Element={
              Label=Some "address"; Tooltip=None;
              Renderer=FieldRenderer.FormRenderer(FormConfig.Id addressForm); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="emails"; FieldId=Guid.CreateVersion7(); 
          Label=Some "emails"; Tooltip=None;
          Renderer=FieldRenderer.ListRenderer({|
            List=PrimitiveRenderer defaultList;
            Element={
              Label=Some "email"; Tooltip=None;
              Renderer=FieldRenderer.PrimitiveRenderer defaultString; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="addressesWithLabel"; FieldId=Guid.CreateVersion7(); 
          Label=Some "addresses with label"; Tooltip=None;
          Renderer=FieldRenderer.MapRenderer({|
            Map=PrimitiveRenderer defaultMap;
            Key={
              Label=Some "address label"; Tooltip=None;
              Renderer=FieldRenderer.PrimitiveRenderer defaultString; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
            Value={
              Label=Some "address"; Tooltip=None;
              Renderer=FieldRenderer.FormRenderer(FormConfig.Id addressForm); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="addressesByCity"; FieldId=Guid.CreateVersion7(); 
          Label=Some "addresses by city"; Tooltip=None;
          Renderer=FieldRenderer.MapRenderer({|
            Map=PrimitiveRenderer defaultMap;
            Key={
              Label=Some "city"; Tooltip=Some "a nice place to live";
              Renderer=FieldRenderer.StreamRenderer(citiesStream |> StreamApi.Id, PrimitiveRenderer defaultInfiniteStream); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
            Value={
              Label=Some "address"; Tooltip=None;
              Renderer=FieldRenderer.FormRenderer(FormConfig.Id addressForm); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="addressesWithColorLabel"; FieldId=Guid.CreateVersion7(); 
          Label=Some "addresses with color label"; Tooltip=None;
          Renderer=FieldRenderer.MapRenderer({|
            Map=PrimitiveRenderer defaultMap;
            Key={
              Label=Some "color"; Tooltip=None;
              Renderer=FieldRenderer.EnumRenderer(colorOptions |> EnumApi.Id, PrimitiveRenderer defaultEnum); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
            Value={
              Label=Some "address"; Tooltip=None;
              Renderer=FieldRenderer.FormRenderer(FormConfig.Id addressForm); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="permissions"; FieldId=Guid.CreateVersion7(); 
          Label=Some "permissions"; Tooltip=None;
          Renderer=FieldRenderer.MapRenderer({|
            Map=PrimitiveRenderer defaultMap;
            Key={
              Label=Some "permission"; Tooltip=None;
              Renderer=FieldRenderer.EnumRenderer(permissionOptions |> EnumApi.Id, PrimitiveRenderer defaultEnum); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
            Value={
              Label=Some "granted"; Tooltip=None;
              Renderer=FieldRenderer.PrimitiveRenderer defaultBoolean; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="cityByDepartment"; FieldId=Guid.CreateVersion7(); 
          Label=Some "city by department"; Tooltip=None;
          Renderer=FieldRenderer.MapRenderer({|
            Map=PrimitiveRenderer defaultMap;
            Key={
              Label=Some "department"; Tooltip=None;
              Renderer=FieldRenderer.StreamRenderer(departmentsStream |> StreamApi.Id, FieldRenderer.PrimitiveRenderer defaultInfiniteStream); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
            Value={
              Label=Some "city"; Tooltip=None;
              Renderer=FieldRenderer.StreamRenderer(citiesStream |> StreamApi.Id, FieldRenderer.PrimitiveRenderer defaultInfiniteStream); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="shoeColors"; FieldId=Guid.CreateVersion7(); 
          Label=Some "shoe colors"; Tooltip=None;
          Renderer=FieldRenderer.EnumRenderer(colorOptions |> EnumApi.Id, FieldRenderer.PrimitiveRenderer defaultEnumMultiselect);
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="friendsBirthdays"; FieldId=Guid.CreateVersion7(); 
          Label=Some "friends' birthdays"; Tooltip=None;
          Renderer=FieldRenderer.MapRenderer({|
            Map=PrimitiveRenderer defaultMap;
            Key={
              Label=Some "name"; Tooltip=None;
              Renderer=FieldRenderer.PrimitiveRenderer defaultString; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
            Value={
              Label=Some "birthday"; Tooltip=None;
              Renderer=FieldRenderer.PrimitiveRenderer defaultDate; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="holidays"; FieldId=Guid.CreateVersion7(); 
          Label=Some "holidays"; Tooltip=None;
          Renderer=FieldRenderer.ListRenderer({|
            List=PrimitiveRenderer defaultList;
            Element={
              Label=Some "holiday"; Tooltip=None;
              Renderer=FieldRenderer.PrimitiveRenderer defaultDate; 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
      ] |> Seq.map (dup >> (FieldConfig.Name <*> id)) |> Map.ofSeq;
    let! categoryField = personFields |> Map.tryFind "category" |> withError "Error: cannot find field 'category'"
    let! nameField = personFields |> Map.tryFind "name" |> withError "Error: cannot find field 'name'"
    let! surnameField = personFields |> Map.tryFind "surname" |> withError "Error: cannot find field 'surname'"
    let! birthdayField = personFields |> Map.tryFind "birthday" |> withError "Error: cannot find field 'birthday'"
    let! genderField = personFields |> Map.tryFind "gender" |> withError "Error: cannot find field 'gender'"
    let! emailsField = personFields |> Map.tryFind "emails" |> withError "Error: cannot find field 'emails'"
    let! dependantsField = personFields |> Map.tryFind "dependants" |> withError "Error: cannot find field 'dependants'"
    let! friendsByCategoryField = personFields |> Map.tryFind "friendsByCategory" |> withError "Error: cannot find field 'friendsByCategory'"
    let! relativesField = personFields |> Map.tryFind "relatives" |> withError "Error: cannot find field 'relatives'"
    let! friendsBirthdaysField = personFields |> Map.tryFind "friendsBirthdays" |> withError "Error: cannot find field 'friendsBirthdays'"
    let! shoeColorsField = personFields |> Map.tryFind "shoeColors" |> withError "Error: cannot find field 'shoeColors'"
    let! subscribeToNewsletterField = personFields |> Map.tryFind "subscribeToNewsletter" |> withError "Error: cannot find field 'subscribeToNewsletter'"
    let! interestsField = personFields |> Map.tryFind "interests" |> withError "Error: cannot find field 'interests'"
    let! favoriteColorField = personFields |> Map.tryFind "favoriteColor" |> withError "Error: cannot find field 'favoriteColor'"
    let! departmentsField = personFields |> Map.tryFind "departments" |> withError "Error: cannot find field 'departments'"
    let! mainAddressField = personFields |> Map.tryFind "mainAddress" |> withError "Error: cannot find field 'mainAddress'"
    let! addressesField = personFields |> Map.tryFind "addresses" |> withError "Error: cannot find field 'addresses'"
    let! addressesWithLabelField = personFields |> Map.tryFind "addressesWithLabel" |> withError "Error: cannot find field 'addressesWithLabel'"
    let! addressesByCityField = personFields |> Map.tryFind "addressesByCity" |> withError "Error: cannot find field 'addressesByCity'"
    let! addressesWithColorLabelField = personFields |> Map.tryFind "addressesWithColorLabel" |> withError "Error: cannot find field 'addressesWithColorLabel'"
    let! permissionsField = personFields |> Map.tryFind "permissions" |> withError "Error: cannot find field 'permissions'"
    let! cityByDepartmentField = personFields |> Map.tryFind "cityByDepartment" |> withError "Error: cannot find field 'cityByDepartment'"
    let! holidaysField = personFields |> Map.tryFind "holidays" |> withError "Error: cannot find field 'holidays'"
    let personForm:FormConfig = {
      FormName="person"; 
      FormId=Guid.CreateVersion7(); 
      TypeId=personType.TypeId;
      Fields=personFields
      Tabs=
        {
          FormTabs=[
            ("main", {
              FormColumns= [
                ("demographics", {
                  FormGroups= [
                    ("main", [categoryField; nameField; surnameField; birthdayField; genderField; emailsField; dependantsField; friendsByCategoryField; relativesField; friendsBirthdaysField; shoeColorsField] |> List.map FieldConfig.Id)
                  ] |> Map.ofSeq
                })
                ("mailing", {
                  FormGroups= [
                  ("main", [subscribeToNewsletterField; interestsField; favoriteColorField] |> List.map FieldConfig.Id)
                  ] |> Map.ofSeq
                })
                ("addresses", {
                  FormGroups= [
                    ("main", [departmentsField; mainAddressField; addressesField; addressesWithLabelField; addressesByCityField; addressesWithColorLabelField; permissionsField; cityByDepartmentField; holidaysField] |> List.map FieldConfig.Id)
                  ] |> Map.ofSeq
                })                         
              ] |> Map.ofSeq
            })
          ] |> Map.ofSeq
        }
    }
    let! personApi = apis.Entities |> Map.tryFind "person" |> withError "Error: cannot find entity api 'person'"
    let createPerson:FormLauncher = {
      LauncherName="create-person"; LauncherId=Guid.CreateVersion7();
      Mode=FormLauncherMode.Create; 
      Form=personForm |> FormConfig.Id;
      EntityApi=personApi |> fst |> EntityApi.Id
    }
    let editPerson:FormLauncher = {
      LauncherName="edit-person"; LauncherId=Guid.CreateVersion7();
      Mode=FormLauncherMode.Edit; 
      Form=personForm |> FormConfig.Id;
      EntityApi=personApi |> fst |> EntityApi.Id
    }
    return {
      Types=types;
      Apis=apis;
      Forms=[
        addressForm
        personForm
      ] |> Seq.map(dup >> (FormConfig.Name <*> id)) |> Map.ofSeq;
      Launchers=[ 
        createPerson
        editPerson
      ] |> Seq.map(dup >> (FormLauncher.Name <*> id)) |> Map.ofSeq
    }
  }

let injectedCategoryType:TypeId = { TypeName="injectedCategory"; TypeId=Guid.CreateVersion7() }
let sampleInjectedTypes = [injectedCategoryType]
let samplePrimitiveRenderers:Map<string, PrimitiveRenderer> =
  [
    "defaultBoolean", { PrimitiveRendererName="defaultBoolean"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.BoolType }
    "defaultString", { PrimitiveRendererName="defaultString"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.StringType }
    "defaultNumber", { PrimitiveRendererName="defaultNumber"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.IntType }
    "defaultDate", { PrimitiveRendererName="defaultDate"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.PrimitiveType PrimitiveType.DateOnlyType }
    "defaultInfiniteStream", { PrimitiveRendererName="defaultInfiniteStream"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.VarType({ VarName="'a1"}) }
    "defaultInfiniteStreamMultiselect", { PrimitiveRendererName="defaultInfiniteStreamMultiselect"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.SetType(ExprType.VarType({ VarName="'a1"})) }
    "defaultEnum", { PrimitiveRendererName="defaultEnum"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.VarType({ VarName="'a1"}) }
    "defaultEnumMultiselect", { PrimitiveRendererName="defaultEnumMultiselect"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.SetType(ExprType.VarType({ VarName="'a1"})) }    
    "defaultMap", { PrimitiveRendererName="defaultMap"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.MapType(ExprType.VarType({ VarName="'a1"}), ExprType.VarType({ VarName="'a2"})) }
    "defaultList", { PrimitiveRendererName="defaultList"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.ListType(ExprType.VarType({ VarName="'a1"})) }    
    "defaultCategory", { PrimitiveRendererName="defaultCategory"; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.LookupType injectedCategoryType }    
  ] |> Map.ofSeq
let sampleForms = instantiateSampleForms sampleInjectedTypes samplePrimitiveRenderers

match sampleForms with
| Left sampleForms -> 
  do printfn "%A" (ParsedFormsContext.Validate sampleForms)
  do Console.ReadLine() |> ignore
| Right _ -> ()

type FormsGenTarget = 
| ts = 1
| golang = 2

open System.CommandLine

let formsOptions = {|
  mode = new Option<bool>(name= "-validate", description= "Type check the given forms config.");
  language = 
    (new Option<FormsGenTarget>(
      "-codegen",
      "Language to generate form bindings in."))
        .FromAmong(
            "ts",
            "golang");
  input = 
    (new Option<string>(
      "-input",
      "Relative path of json form config."))
|}

[<EntryPoint>]
let main args =
  let rootCommand = new RootCommand("Sample app for System.CommandLine");
  let formsCommand = new Command("forms");
  rootCommand.AddCommand(formsCommand)
  formsCommand.AddOption(formsOptions.mode)
  formsCommand.AddOption(formsOptions.language)
  formsCommand.AddOption(formsOptions.input)

  // dotnet run -- forms -input person-config.json -validate -codegen ts
  formsCommand.SetHandler(Action<_,_,_>(fun (validate:bool) (language:FormsGenTarget) (inputPath:string) ->
    if File.Exists inputPath |> not then
      eprintfn "Fatal error: the input file %A does not exist" inputPath
      System.Environment.Exit -1
    let inputConfig = File.ReadAllText inputPath
    let parsed = JsonValue.Parse inputConfig
    match parsed with
    | JsonValue.Record r ->
      do printfn "%A" r
    | v -> 
      do eprintfn "%A" v
    ), formsOptions.mode, formsOptions.language, formsOptions.input)

  rootCommand.Invoke(args)
