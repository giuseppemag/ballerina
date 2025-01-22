module BallerinaRuntime

open FSharp.Data
open FSharp.Data.JsonExtensions
open System
open System.IO
open Ballerina.BusinessRules
open Ballerina.Option
open Ballerina.Sum

let dup a = (a,a)
let (<*>) f g = fun (a,b) -> (f a, g b)

type CrudMethod = Create | Get | Update | Default
type EnumApiName = { EnumName:string } with static member Create n = { EnumName=n }
type StreamApiName = { StreamName:string } with static member Create n = { StreamName=n }
type EntityApiName = { EntityName:string } with static member Create n = { EntityName=n }
type FormApis = {
  Enums:Map<string, EnumApiName * TypeName>
  Streams:Map<string, StreamApiName * TypeName>
  Entities:Map<string, EntityApiName * (TypeName * Set<CrudMethod>)>
}
type FormConfigId = { FormName:string; FormId:Guid }
type FormConfig = { 
  FormName:string; 
  FormId:Guid; 
  Type:ExprType;
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
  | EnumRenderer of EnumApiName * FieldRenderer
  | StreamRenderer of StreamApiName * FieldRenderer
  | FormRenderer of FormConfigId
and KeyRenderer = { Label:Option<string>; Tooltip:Option<string>; Renderer:FieldRenderer; Visible:Expr; Disabled:Option<Expr> }
and ValueRenderer = { Label:Option<string>; Tooltip:Option<string>; Renderer:FieldRenderer; Visible:Expr; Disabled:Option<Expr> }
and ElementRenderer = { Label:Option<string>; Tooltip:Option<string>; Renderer:FieldRenderer; Visible:Expr; Disabled:Option<Expr> }
and PrimitiveRendererId = { PrimitiveRendererName:string; PrimitiveRendererId:Guid }
and PrimitiveRenderer = { PrimitiveRendererName:string; PrimitiveRendererId:Guid; Type:ExprType } with static member ToPrimitiveRendererId (r:PrimitiveRenderer) = { PrimitiveRendererName=r.PrimitiveRendererName; PrimitiveRendererId=r.PrimitiveRendererId }

type Errors = { Errors:List<string> } with
  static member Zero()  = { Errors=[] }
  static member Concat(e1,e2)  = { Errors=e1.Errors @ e2.Errors }

let inline withError (e:string) (o:Option<'res>) : Sum<'res,Errors> = o |> Sum.fromOption<'res,Errors> (fun () -> { Errors=[e] })

let sampleTypes injectedTypes = 
  let injectedTypes = injectedTypes |> Seq.map (fun injectedTypeName -> injectedTypeName, (injectedTypeName |> TypeName.Create, ExprType.RecordType []) |> TypeBinding.Create) |> Map.ofSeq
  let collectionReferenceType = ExprType.RecordType [
          { FieldName="Id"; Type=ExprType.PrimitiveType PrimitiveType.GuidType }
          { FieldName="DisplayValue"; Type=ExprType.PrimitiveType PrimitiveType.StringType }
        ]
  sum{
    let CityRefName = "CityRef" |> TypeName.Create
    let AddressName = "Address" |> TypeName.Create
    let GenderRefName = "GenderRef" |> TypeName.Create
    let ColorRefName = "ColorRef" |> TypeName.Create
    let InterestRefName = "InterestRef" |> TypeName.Create
    let DepartmentRefName = "DepartmentRef" |> TypeName.Create
    let PermissionRefName = "PermissionRef" |> TypeName.Create
    let PersonName = "Person" |> TypeName.Create
    let! injectedCategoryName = injectedTypes |> Map.tryFind "injectedCategory" |> Option.map (fun tb -> tb.Name) |> withError "Error: missing injectedCategory from injected types"

    let! cityRef = ExprType.Extends collectionReferenceType (ExprType.RecordType []) |> withError "Error: cannot create CityRef"
    let address = 
      ExprType.RecordType [
          { FieldName="street"; Type=ExprType.PrimitiveType PrimitiveType.StringType }
          { FieldName="number"; Type=ExprType.PrimitiveType PrimitiveType.IntType }
          { FieldName="city"; Type=cityRef }
        ]
    let! genderRef = ExprType.Extends collectionReferenceType (ExprType.RecordType []) |> withError "Error: cannot create GenderRef"
    let! colorRef = ExprType.Extends collectionReferenceType (ExprType.RecordType []) |> withError "Error: cannot create ColorRef"
    let! interestRef = ExprType.Extends collectionReferenceType (ExprType.RecordType []) |> withError "Error: cannot create InterestRef"
    let! departmentRef = ExprType.Extends collectionReferenceType (ExprType.RecordType []) |> withError "Error: cannot create DepartmentRef"
    let! permissionRef = ExprType.Extends collectionReferenceType (ExprType.RecordType []) |> withError "Error: cannot create PermissionRef"
    let person = 
      ExprType.RecordType [
          { FieldName="name"; Type=ExprType.PrimitiveType PrimitiveType.StringType }
          { FieldName="surname"; Type=ExprType.PrimitiveType PrimitiveType.StringType }
          { FieldName="birthday"; Type=ExprType.PrimitiveType PrimitiveType.DateOnlyType }
          { FieldName="subscribeToNewsletter"; Type=ExprType.PrimitiveType PrimitiveType.BoolType }
          { FieldName="favoriteColor"; Type=ExprType.ReferenceType ColorRefName |> ExprType.OptionType }
          { FieldName="gender"; Type=ExprType.ReferenceType GenderRefName |> ExprType.OptionType }
          { FieldName="interests"; Type=ExprType.SetType(ExprType.ReferenceType InterestRefName) }
          { FieldName="departments"; Type=ExprType.SetType(ExprType.ReferenceType DepartmentRefName) }
          { FieldName="mainAddress"; Type=ExprType.SetType(ExprType.ReferenceType AddressName) }
          { FieldName="dependants"; Type=ExprType.MapType(ExprType.PrimitiveType PrimitiveType.StringType, ExprType.ReferenceType injectedCategoryName) }
          { FieldName="friendsByCategory"; Type=ExprType.MapType(ExprType.ReferenceType injectedCategoryName, ExprType.PrimitiveType PrimitiveType.StringType) }
          { FieldName="relatives"; Type=ExprType.ListType(ExprType.ReferenceType injectedCategoryName) }
          { FieldName="addresses"; Type=ExprType.ListType(ExprType.ReferenceType AddressName) }
          { FieldName="emails"; Type=ExprType.ListType(ExprType.PrimitiveType PrimitiveType.StringType) }
          { FieldName="addressesWithLabel"; Type=ExprType.MapType(ExprType.PrimitiveType PrimitiveType.StringType, ExprType.ReferenceType AddressName) }
          { FieldName="addressesByCity"; Type=ExprType.MapType(ExprType.ReferenceType CityRefName |> ExprType.OptionType, ExprType.ReferenceType AddressName) }
          { FieldName="addressesWithColorLabel"; Type=ExprType.MapType(ExprType.ReferenceType ColorRefName |> ExprType.OptionType, ExprType.ReferenceType AddressName) }
          { FieldName="permissions"; Type=ExprType.MapType(ExprType.ReferenceType PermissionRefName |> ExprType.OptionType, ExprType.PrimitiveType PrimitiveType.BoolType) }
          { FieldName="cityByDepartment"; Type=ExprType.MapType(ExprType.ReferenceType DepartmentRefName |> ExprType.OptionType, ExprType.ReferenceType CityRefName |> ExprType.OptionType) }
          { FieldName="shoeColours"; Type=ExprType.SetType(ExprType.ReferenceType ColorRefName) }
          { FieldName="friendsBirthdays"; Type=ExprType.MapType(ExprType.PrimitiveType PrimitiveType.StringType, ExprType.PrimitiveType PrimitiveType.DateOnlyType) }
          { FieldName="holidays"; Type=ExprType.ListType(ExprType.PrimitiveType PrimitiveType.DateOnlyType) }
          { FieldName="category"; Type=ExprType.ReferenceType injectedCategoryName }
        ]
    return [
      yield! injectedTypes |> Seq.map (fun t -> t.Key, t.Value)
      CityRefName.TypeName,(CityRefName, cityRef) |> TypeBinding.Create
      AddressName.TypeName,(AddressName, address) |> TypeBinding.Create
      GenderRefName.TypeName,(GenderRefName, genderRef) |> TypeBinding.Create
      ColorRefName.TypeName,(ColorRefName, colorRef) |> TypeBinding.Create
      InterestRefName.TypeName,(InterestRefName, interestRef) |> TypeBinding.Create
      DepartmentRefName.TypeName,(DepartmentRefName, departmentRef) |> TypeBinding.Create
      PermissionRefName.TypeName,(PermissionRefName, permissionRef) |> TypeBinding.Create
      PersonName.TypeName,(PersonName, permissionRef) |> TypeBinding.Create
    ] |> Map.ofList
  }

let formApis = 
  sum{
    let! instantiatedSampleTypes = sampleTypes ["injectedCategory"]
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
          ("genders", genderRefType.Name)
          ("colors", colorRefType.Name)
          ("interests", interestRefType.Name)
          ("permissions", permissionRefType.Name)
        ] |> Seq.map (dup >> (fst <*> (EnumApiName.Create <*> id))) |> Map.ofSeq;
      Streams=
        [
          ("cities", cityRefType.Name)
          ("departments", departmentRefType.Name)
        ] |> Seq.map (dup >> (fst <*> (StreamApiName.Create <*> id))) |> Map.ofSeq;
      Entities=
        [
          ("person", (personType.Name, [Create; Get; Update; Default] |> Set.ofList))
        ] |> Seq.map (dup >> (fst <*> id) >> (id <*> (EntityApiName.Create <*> id))) |> Map.ofSeq;
    }
  }

let sampleForms (primitiveRenderers:Map<string, PrimitiveRenderer>) = 
  sum{
    let! types, apis = formApis
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
          Renderer=StreamRenderer(citiesStream |> fst, PrimitiveRenderer defaultInfiniteStream); 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }            
      ] |> Seq.map (dup >> (FieldConfig.Name <*> id)) |> Map.ofSeq;
    let! streetField = addressFields |> Map.tryFind "street" |> withError "Cannot find 'street' field in form 'address'"
    let! numberField = addressFields |> Map.tryFind "number" |> withError "Cannot find 'number' field in form 'address'"
    let! cityField = addressFields |> Map.tryFind "city" |> withError "Cannot find 'city' field in form 'address'"
    let addressForm:FormConfig = {
      FormName="address"; 
      FormId=Guid.CreateVersion7(); 
      Type=addressType.Type;
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
          Renderer=FieldRenderer.EnumRenderer(colorOptions |> fst, PrimitiveRenderer defaultEnum); 
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=None }
        { FieldName="gender"; FieldId=Guid.CreateVersion7(); 
          Label=None; Tooltip=None;
          Renderer=FieldRenderer.EnumRenderer(genderOptions |> fst, PrimitiveRenderer defaultEnum); 
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
          Renderer=FieldRenderer.EnumRenderer(interestOptions |> fst, PrimitiveRenderer defaultEnumMultiselect);
          Visible=
            Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter");
          Disabled=None }
        { FieldName="departments"; FieldId=Guid.CreateVersion7(); 
          Label=Some "departments"; Tooltip=None;
          Renderer=FieldRenderer.StreamRenderer(departmentsStream |> fst, PrimitiveRenderer defaultInfiniteStreamMultiselect);
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
              Renderer=FieldRenderer.StreamRenderer(citiesStream |> fst, PrimitiveRenderer defaultInfiniteStream); 
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
              Renderer=FieldRenderer.EnumRenderer(colorOptions |> fst, PrimitiveRenderer defaultEnum); 
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
              Renderer=FieldRenderer.EnumRenderer(permissionOptions |> fst, PrimitiveRenderer defaultEnum); 
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
              Renderer=FieldRenderer.StreamRenderer(departmentsStream |> fst, FieldRenderer.PrimitiveRenderer defaultInfiniteStream); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
            Value={
              Label=Some "city"; Tooltip=None;
              Renderer=FieldRenderer.StreamRenderer(citiesStream |> fst, FieldRenderer.PrimitiveRenderer defaultInfiniteStream); 
              Visible=Expr.Value(Value.ConstBool true);
              Disabled=None
            };
          |});
          Visible=Expr.Value(Value.ConstBool true);
          Disabled=Some(Expr.Unary(Not,Expr.RecordFieldLookup(Expr.VarLookup({ VarName="local" }), "subscribeToNewsletter"))) }
        { FieldName="shoeColors"; FieldId=Guid.CreateVersion7(); 
          Label=Some "shoe colors"; Tooltip=None;
          Renderer=FieldRenderer.EnumRenderer(colorOptions |> fst, FieldRenderer.PrimitiveRenderer defaultEnumMultiselect);
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
    let! shoeColoursField = personFields |> Map.tryFind "shoeColours" |> withError "Error: cannot find field 'shoeColours'"
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
      Type=personType.Type;
      Fields=personFields
      Tabs=
        {
          FormTabs=[
            ("main", {
              FormColumns= [
                ("demographics", {
                  FormGroups= [
                    ("main", [categoryField; nameField; surnameField; birthdayField; genderField; emailsField; dependantsField; friendsByCategoryField; relativesField; friendsBirthdaysField; shoeColoursField] |> List.map FieldConfig.Id)
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
    return types, apis, [
      addressForm,
      personForm
    ] |> Seq.map(FormConfig.Name <*> id) |> Map.ofSeq
  }

//   "launchers": {
//     "create-person": {
//       "kind": "create",
//       "form": "person",
//       "api": "person"
//     },
//     "edit-person": {
//       "kind": "edit",
//       "form": "person",
//       "api": "person"
//     }


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
    printfn "Forms it is - input path=%A validate=%A language=%A" inputPath validate language
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