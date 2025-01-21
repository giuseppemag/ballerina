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
  enums:Map<string, EnumApiName * TypeName>
  streams:Map<string, StreamApiName * TypeName>
  entities:Map<string, EntityApiName * (TypeName * Set<CrudMethod>)>
}
type FormConfigId = { FormName:string; FormId:Guid }
type FormConfig = { 
  FormName:string; 
  FormId:Guid; 
  Type:ExprType;
  Fields:Map<string, FieldConfig>;
  Tabs:FormTabs } with static member Name f = f.FormName
and FormTabs = { FormTabs:Map<string, FormColumns> }
and FormColumns = { FormColumns: Map<string, FormGroups> }
and FormGroups = { FormGroups:Map<string, List<FieldConfigId>> }
and FieldConfigId = { FieldName:string; FieldId:Guid }
and FieldConfig = { FieldName:string; FieldId:Guid; Label:Option<string>; Tooltip:Option<string>; Renderer:FieldRenderer; Visible:Expr; Disabled:Option<Expr> } with 
  static member Id (f:FieldConfig) : FieldConfigId = { FieldName=f.FieldName; FieldId=f.FieldId }
  static member Name (f:FieldConfig) = f.FieldName
and FieldRenderer = 
  | PrimitiveRenderer of PrimitiveRenderer
  | EnumRenderer of EnumApiName * FieldRenderer
  | StreamRenderer of StreamApiName * FieldRenderer
and PrimitiveRendererId = { PrimitiveRendererName:string; PrimitiveRendererId:Guid }
and PrimitiveRenderer = { PrimitiveRendererName:string; PrimitiveRendererId:Guid; Type:ExprType } with static member ToPrimitiveRendererId (r:PrimitiveRenderer) = { PrimitiveRendererName=r.PrimitiveRendererName; PrimitiveRendererId=r.PrimitiveRendererId }

let inline withError (e:'err) (o:Option<'res>) = o |> Sum.fromOption<'res,'err> (fun () -> e)

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
      enums=
        [
          ("genders", genderRefType.Name)
          ("colors", colorRefType.Name)
          ("interests", interestRefType.Name)
          ("permissions", permissionRefType.Name)
        ] |> Seq.map (dup >> (fst <*> (EnumApiName.Create <*> id))) |> Map.ofSeq;
      streams=
        [
          ("cities", cityRefType.Name)
          ("departments", departmentRefType.Name)
        ] |> Seq.map (dup >> (fst <*> (StreamApiName.Create <*> id))) |> Map.ofSeq;
      entities=
        [
          ("person", (personType.Name, [Create; Get; Update; Default] |> Set.ofList))
        ] |> Seq.map (dup >> (fst <*> id) >> (id <*> (EntityApiName.Create <*> id))) |> Map.ofSeq;
    }
  }

let sampleForms (primitiveRenderers:Map<string, PrimitiveRenderer>) = 
  sum{
    let! types, apis = formApis
    let! defaultString = primitiveRenderers |> Map.tryFind "defaultString" |> withError "TODO"
    let! defaultNumber = primitiveRenderers |> Map.tryFind "defaultNumber" |> withError "TODO"
    let! defaultDate = primitiveRenderers |> Map.tryFind "defaultDate" |> withError "TODO"
    let! defaultInfiniteStream = primitiveRenderers |> Map.tryFind "defaultInfiniteStream" |> withError "TODO"
    let! defaultCategory = primitiveRenderers |> Map.tryFind "defaultCategory" |> withError "TODO"
    let! citiesStream = apis.streams |> Map.tryFind "cities" |> withError "TODO"
    let! addressType = types |> Map.tryFind "Address" |> withError "TODO"
    let! personType = types |> Map.tryFind "Person" |> withError "TODO"
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
    let! streetField = addressFields |> Map.tryFind "street" |> withError "TODO"
    let! numberField = addressFields |> Map.tryFind "number" |> withError "TODO"
    let! cityField = addressFields |> Map.tryFind "city" |> withError "TODO"
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
      ] |> Seq.map (dup >> (FieldConfig.Name <*> id)) |> Map.ofSeq;

//         "favoriteColor": {
//           "renderer": "defaultEnum", "options": "colors", "visible": { "kind": "true" }
//         },
//         "gender": {
//           "label": "gender",
//           "renderer": "defaultEnum", "options": "genders", "visible": {
//             "kind": "or",
//             "operands": [
//               { "kind": "leaf", "operation": "flag", "arguments": "X" },
//               { "kind": "leaf", "operation": "flag", "arguments": "Y" }
//             ]
//           }
//         },
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
    return types, apis, [
      addressForm,
      personForm
    ] |> Seq.map(FormConfig.Name <*> id) |> Map.ofSeq
  }   

//         "dependants": {
//           "label": "dependants",
//           "renderer": "defaultMap",
//           "tooltip": "someone who depends on you",
//           "keyRenderer": { "label": "name", "tooltip": "their name", "renderer": "defaultString", "visible": { "kind": "true" } },
//           "valueRenderer": { "label": "category", "tooltip": "their category", "renderer": "defaultCategory", "visible": { "kind": "true" } },
//           "visible": { "kind": "true" }
//         },
//         "friendsByCategory": {
//           "label": "friends by category",
//           "renderer": "defaultMap",
//           "keyRenderer": { "label": "category", "renderer": "defaultCategory", "visible": { "kind": "true" } },
//           "valueRenderer": { "label": "name", "renderer": "defaultString", "visible": { "kind": "true" } },
//           "visible": { "kind": "true" }
//         },
//         "relatives": { "label": "relatives", "tooltip": "someone who you are related to", "elementTooltip": "one relative", "elementLabel": "relative", "renderer": "defaultList", "elementRenderer":"defaultCategory", "visible": { "kind": "true" } },
//         "subscribeToNewsletter": { "label": "subscribe to newsletter", "renderer": "defaultBoolean", "visible": { "kind": "true" } },
//         "interests": {
//           "label": "interests",
//           "renderer": "defaultEnumMultiselect", "options": "interests",
//           "visible": 
//           { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "subscribeToNewsletter", "value": true } }
//         },
//         "departments": { 
//           "label": "departments",
//           "renderer": "defaultInfiniteStreamMultiselect", "stream": "departments", 
//           "visible": { "kind": "true" }, 
//           "disabled": 
//             { "kind": "leaf", "operation": "field", "arguments": { "location": "local", "field": "subscribeToNewsletter", "value": false } }
//         },
//         "mainAddress": { "label": "main address", "renderer": "address", "visible": { "kind": "true" }},
//         "addresses": { "label": "other addresses", "renderer": "defaultList", "elementLabel": "address", "elementRenderer":"address", "visible": { "kind": "true" } },
//         "emails": { "label": "emails", "renderer": "defaultList", "elementLabel": "email", "elementRenderer":"defaultString", "visible": { "kind": "true" } },
//         "addressesWithLabel": {
//           "label": "addresses with label",
//           "renderer": "defaultMap",
//           "keyRenderer":{ "label": "address label", "renderer": "defaultString", "visible": { "kind": "true" } },
//           "valueRenderer":{ "label": "address", "renderer": "address", "visible": { "kind": "true" } },
//           "visible": { "kind": "true" } },
//         "addressesByCity": {
//             "label": "addresses by city",
//             "renderer": "defaultMap",
//             "keyRenderer":{ "label": "city", "tooltip": "a nice place to live", "renderer": "defaultInfiniteStream", "stream": "cities", "visible": { "kind": "true" } }, 
//             "valueRenderer":{"label": "address", "renderer": "address", "visible": { "kind": "true" } }, 
//             "visible": { "kind": "true" } },
//         "addressesWithColorLabel": {
//             "renderer": "defaultMap",
//             "label": "addresses with color label",
//             "keyRenderer":{ "label":"color", "renderer": "defaultEnum", "options": "colors", "visible": { "kind": "true" } }, 
//             "valueRenderer":{ "label": "address", "renderer": "address", "visible": { "kind": "true" } }, 
//             "visible": { "kind": "true" } },
//         "permissions": {
//             "label": "permissions",
//             "renderer": "defaultMap",
//             "keyRenderer":{ "label": "permission", "renderer": "defaultEnum", "options": "permissions", "visible": { "kind": "true" } },
//             "valueRenderer":{ "label": "granted", "renderer": "defaultBoolean", "visible": { "kind": "true" } },
//             "visible": { "kind": "true" } },
//         "cityByDepartment": {
//             "label": "city by department",
//             "renderer": "defaultMap",
//             "keyRenderer":{ "label": "department", "renderer": "defaultInfiniteStream", "stream": "departments", "visible": { "kind": "true" } },
//             "valueRenderer":{ "label": "city", "renderer": "defaultInfiniteStream", "stream": "cities", "visible": { "kind": "true" } },
//             "visible": { "kind": "true" } },
//         "shoeColours": {
//             "label": "shoe colours",
//             "renderer": "defaultEnumMultiselect", "options": "colors", "visible": { "kind": "true" }
//           },
//         "friendsBirthdays": {
//             "renderer": "defaultMap",
//             "label": "friends birthdays",
//             "keyRenderer":{ "label": "name", "renderer": "defaultString", "visible": { "kind": "true" } },
//             "valueRenderer":{ "label": "birthday", "renderer": "defaultDate", "visible": { "kind": "true" } },
//             "visible": { "kind": "true" }
//           },
//         "holidays": {
//             "label": "holidays",
//             "renderer": "defaultList",
//             "elementLabel": "holiday",
//             "elementRenderer": "defaultDate",
//             "visible": { "kind": "true" }
//         }
//       },
//       "tabs": {
//         "main": {
//           "columns": {
//             "demographics": {
//               "groups": {
//                 "main": ["category", "name", "surname", "birthday", "gender", "emails", "dependants", "friendsByCategory", "relatives", "friendsBirthdays", "shoeColours"]
//               }
//             },
//             "mailing": {
//               "groups": {
//                 "main": ["subscribeToNewsletter", "interests", "favoriteColor"]
//               }
//             },
//             "addresses": {
//               "groups": {
//                 "main": ["departments", "mainAddress", "addresses", "addressesWithLabel", "addressesByCity", "addressesWithColorLabel", "permissions", "cityByDepartment", "holidays"]
//               }
//             }
//           }
//         }
//       }
//     }
//   },


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
//   }
// }

  rootCommand.Invoke(args)