namespace Ballerina.DSL.FormEngine
module Parser =

  open Ballerina.DSL.FormEngine.Model
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open System
  open Ballerina.Collections.Sum
  open Ballerina.State.WithError
  open Ballerina.Errors
  open Ballerina.Core.Json
  open Ballerina.Core.String
  open Ballerina.Core.Object
  open FSharp.Data
  open Ballerina.Collections.NonEmptyList

  type SumBuilder with
    member sum.TryFindField name fields = 
      fields |> Seq.tryFind (fst >> (=) name) |> Option.map snd
        |> Sum.fromOption(fun () -> Errors.Singleton $"Error: cannot find field '{name}'")

  type StateBuilder with
    member state.TryFindField name fields =  
      fields |> sum.TryFindField name |> state.OfSum

  type ParsedFormsContext with
    member ctx.TryFindEnum name =
      ctx.Apis.Enums |> Map.tryFindWithError name "enum" name
    member ctx.TryFindStream name =
      ctx.Apis.Streams |> Map.tryFindWithError name "stream" name
    member ctx.TryFindEntityApi name =
      ctx.Apis.Entities |> Map.tryFindWithError name "entity api" name
    member ctx.TryFindType name =
      ctx.Types |> Map.tryFindWithError name "type" name
    member ctx.TryFindForm name =
      ctx.Forms |> Map.tryFindWithError name "form" name
    member ctx.TryFindLauncher name =
      ctx.Launchers |> Map.tryFindWithError name "launcher" name

  type FormLauncher with
    static member Parse (launcherName:string) (json:JsonValue) : State<_, CodeGenConfig, ParsedFormsContext, Errors> =
      state{
        let! launcherFields = JsonValue.AsRecord json |> state.OfSum
        let! kindJson,entityApiNameJson,formNameJson,configApiNameJson = 
          state.All4
            (launcherFields |> state.TryFindField "kind")
            (launcherFields |> state.TryFindField "api")
            (launcherFields |> state.TryFindField "form")
            (launcherFields |> state.TryFindField "configApi")
        let! (kind,entityApiName,formName,configApiName) = state.All4 (JsonValue.AsString kindJson |> state.OfSum) (JsonValue.AsString entityApiNameJson |> state.OfSum) (JsonValue.AsString formNameJson |> state.OfSum) (JsonValue.AsString configApiNameJson |> state.OfSum)
        if kind = "create" || kind = "edit" then
          let! (s:ParsedFormsContext) = state.GetState()
          let! form = s.TryFindForm formName |> state.OfSum
          let! api = s.TryFindEntityApi entityApiName |> state.OfSum
          let! configApi = s.TryFindEntityApi configApiName |> state.OfSum
          return (if kind = "create" then FormLauncherMode.Create else FormLauncherMode.Edit), form |> FormConfig.Id, api |> fst |> EntityApi.Id, configApi |> fst |> EntityApi.Id
        else
          return! $"Error: invalid launcher mode {kind}: it should be either 'create' or 'edit'." |> Errors.Singleton |> state.Throw
      } |> state.WithErrorContext $"...when parsing launcher {launcherName}"

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


  type Expr with
    static member Parse (json:JsonValue) : State<Expr, CodeGenConfig, ParsedFormsContext, Errors> = 
      let error = $$"""Error: invalid expression {{json}}.""" |> Errors.Singleton |> state.Throw
      state{
        return! state.Any (
            NonEmptyList.OfList(
              state{ 
                let! v = JsonValue.AsBoolean json |> state.OfSum
                return v |> Value.ConstBool |> Expr.Value
              },
              [
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
                return! state.Any(
                  NonEmptyList.OfList(
                    state{
                      let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum
                      let! operator = kindJson |> JsonValue.AsEnum BinaryOperator.AllNames |> state.OfSum
                      let! operandsJson = fieldsJson |> sum.TryFindField "operands" |> state.OfSum
                      let! (firstJson, secondJson) = JsonValue.AsPair operandsJson |> state.OfSum
                      let! first = Expr.Parse firstJson
                      let! second = Expr.Parse secondJson
                      let! operator = BinaryOperator.ByName |> Map.tryFindWithError operator "binary operator" operator |> state.OfSum
                      return Expr.Binary(operator, first, second)
                    },
                    [
                    state{
                      let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum
                      do! kindJson |> JsonValue.AsEnum (Set.singleton "fieldLookup") |> state.OfSum |> state.Map ignore
                      let! operandsJson = fieldsJson |> sum.TryFindField "operands" |> state.OfSum
                      let! (firstJson, fieldNameJson) = JsonValue.AsPair operandsJson |> state.OfSum
                      let! fieldName = JsonValue.AsString fieldNameJson |> state.OfSum
                      let! first = Expr.Parse firstJson
                      return Expr.RecordFieldLookup(first, fieldName)
                    }
                    state{
                      let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum
                      do! kindJson |> JsonValue.AsEnum (Set.singleton "isCase") |> state.OfSum |> state.Map ignore
                      let! operandsJson = fieldsJson |> sum.TryFindField "operands" |> state.OfSum
                      let! (firstJson, caseNameJson) = JsonValue.AsPair operandsJson |> state.OfSum
                      let! caseName = JsonValue.AsString caseNameJson |> state.OfSum
                      let! first = Expr.Parse firstJson
                      return Expr.IsCase(caseName, first)
                    }
                    state{
                      let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum
                      do! kindJson |> JsonValue.AsEnum (Set.singleton "varLookup") |> state.OfSum |> state.Map ignore
                      let! varNameJson = fieldsJson |> sum.TryFindField "varName" |> state.OfSum
                      let! varName = JsonValue.AsString varNameJson |> state.OfSum
                      return Expr.VarLookup { VarName=varName }
                    }]
                  )
                )
              }]
            )
        )
      }


  type Renderer with
    static member Parse (parentJsonFields:(string*JsonValue)[]) (json:JsonValue) : State<Renderer,CodeGenConfig,ParsedFormsContext,Errors> =
      state{
        let! config = state.GetContext()
        let! (formsState:ParsedFormsContext) = state.GetState()
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
          let! optionJson = parentJsonFields |> sum.TryFindField "options" |> state.OfSum
          let! enumName = optionJson |> JsonValue.AsString |> state.OfSum
          let! enum = formsState.TryFindEnum enumName |> state.OfSum
          let! enumType = formsState.TryFindType enum.TypeId.TypeName |> state.OfSum
          return EnumRenderer (enum |> EnumApi.Id, PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=containerTypeConstructor(enumType.Type)  })
        elif config.Option.SupportedRenderers.Stream |> Set.contains s || config.Set.SupportedRenderers.Stream |> Set.contains s then
          let containerTypeConstructor = if config.Option.SupportedRenderers.Stream |> Set.contains s then ExprType.OptionType else ExprType.SetType
          let! streamNameJson = parentJsonFields |> sum.TryFindField "stream" |> state.OfSum
          let! streamName = streamNameJson |> JsonValue.AsString |> state.OfSum
          let! stream = formsState.TryFindStream streamName |> state.OfSum
          let! streamType = formsState.TryFindType stream.TypeId.TypeName |> state.OfSum
          return StreamRenderer (stream |> StreamApi.Id, PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=containerTypeConstructor(streamType.Type)  })
        elif config.Map.SupportedRenderers |> Set.contains s then
          let! (keyRendererJson, valueRendererJson) = 
            state.All2
              (parentJsonFields  |> state.TryFindField "keyRenderer")
              (parentJsonFields  |> state.TryFindField "valueRenderer")
          let! keyRenderer = NestedRenderer.Parse keyRendererJson
          let! valueRenderer = NestedRenderer.Parse valueRendererJson
          return MapRenderer {| Map=PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.MapType(keyRenderer.Renderer.Type, valueRenderer.Renderer.Type)  }; Key=keyRenderer; Value=valueRenderer |}
        elif config.List.SupportedRenderers |> Set.contains s then
          let! elementRendererJson = parentJsonFields |> sum.TryFindField "elementRenderer" |> state.OfSum
          let! elementRenderer = NestedRenderer.Parse elementRendererJson
          return ListRenderer {| List=PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=ExprType.ListType elementRenderer.Renderer.Type  }; Element=elementRenderer |}
        else
          return! state.Any(
            NonEmptyList.OfList(
            state{
              let! c = config.Custom |> Seq.tryFind (fun c -> c.Value.SupportedRenderers |> Set.contains s) |> Sum.fromOption (fun () -> $"Error: cannot find custom type {s}" |> Errors.Singleton) |> state.OfSum
              let! t = formsState.TryFindType c.Key |> state.OfSum
              return PrimitiveRenderer { PrimitiveRendererName=s; PrimitiveRendererId=Guid.CreateVersion7(); Type=t.Type }
            },
            [state{
              let! form = formsState.TryFindForm s |> state.OfSum
              let! formType = formsState.TryFindType form.TypeId.TypeName |> state.OfSum
              return FormRenderer (form |> FormConfig.Id, formType.Type)
            }]
          )
        )
      } |> state.WithErrorContext $"...when parsing renderer {json.ToString().ReasonablyClamped}"

  and NestedRenderer with
    static member Parse (json:JsonValue) : State<NestedRenderer,CodeGenConfig,ParsedFormsContext,Errors> =
      state{
        let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum
        let! label = jsonFields |> sum.TryFindField "label" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
        let! tooltip = jsonFields |> sum.TryFindField "tooltip" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
        let! details = jsonFields |> sum.TryFindField "details" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption      
        let! rendererJson = jsonFields |> state.TryFindField "renderer"
        let! renderer = Renderer.Parse jsonFields rendererJson
        return { Label=label; Tooltip=tooltip; Details=details; Renderer=renderer }
      } |> state.WithErrorContext $"...when parsing renderer {json.ToString().ReasonablyClamped}"

  type FieldConfig with
    static member Parse (fieldName:string) (json:JsonValue) : State<FieldConfig,CodeGenConfig,ParsedFormsContext,Errors> =
      state{
        let! fields = json |> JsonValue.AsRecord |> state.OfSum
        let! label = fields |> sum.TryFindField "label" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
        let! tooltip = fields |> sum.TryFindField "tooltip" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
        let! details = fields |> sum.TryFindField "details" |> Sum.toOption |> Option.map (JsonValue.AsString >> state.OfSum) |> state.InsideOption
        let! rendererJson, visibleJson = 
          state.All2
            (fields |> state.TryFindField "renderer")
            (fields |> state.TryFindField "visible")
        let! disabledJson = sum.TryFindField "disabled" fields |> state.OfSum |> state.Catch
        let! renderer = Renderer.Parse fields rendererJson
        let! visible = Expr.Parse visibleJson
        let! disabled = disabledJson |> Sum.toOption |> Option.map (Expr.Parse) |> state.InsideOption
        return { 
          FieldName=fieldName; FieldId=Guid.CreateVersion7(); Label= label; Tooltip=tooltip; Details=details; Renderer=renderer; 
          Visible=visible; Disabled=disabled
        }
      } |> state.WithErrorContext $"...when parsing field {fieldName}"

  type FormConfig with
    static member ParseGroup (groupName:string) (fieldConfigs:Map<string,FieldConfig>) (json:JsonValue) : State<List<FieldConfigId>, CodeGenConfig, ParsedFormsContext, Errors> = 
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

    static member ParseColumn (columnName:string) fieldConfigs (json:JsonValue) : State<FormGroups, CodeGenConfig, ParsedFormsContext, Errors> = 
      state{
        let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum
        match jsonFields with
        | [| "groups",JsonValue.Record groups |] ->
          let! groups = 
            seq{
              for groupName,groupJson in groups do
              yield state{
                let! column = FormConfig.ParseGroup groupName fieldConfigs groupJson
                return groupName,column
              }
            } |> state.All |> state.Map Map.ofList
          return { FormGroups=groups }
        | _ -> 
          return! $"Error: cannot parse groups. Expected a single field 'groups', instead found {json}" |> Errors.Singleton |> state.Throw
      } |> state.WithErrorContext $"...when parsing column {columnName}"

    static member ParseTab (tabName:string) fieldConfigs (json:JsonValue) : State<FormColumns, CodeGenConfig, ParsedFormsContext, Errors> = 
      state{
        let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum
        match jsonFields with
        | [| "columns",JsonValue.Record columns |] ->
          let! columns = 
            seq{
              for columnName,columnJson in columns do
              yield state{
                let! column = FormConfig.ParseColumn columnName fieldConfigs columnJson
                return columnName,column
              }
            } |> state.All |> state.Map Map.ofList
          return { FormColumns=columns }
        | _ -> 
          return! $"Error: cannot parse columns. Expected a single field 'columns', instead found {json}" |> Errors.Singleton |> state.Throw    } |> state.WithErrorContext $"...when parsing tab {tabName}"

    static member ParseTabs fieldConfigs (json:JsonValue) : State<FormTabs, CodeGenConfig, ParsedFormsContext, Errors> = 
      state{
        let! tabs = json |> JsonValue.AsRecord |> state.OfSum
        let! tabs = 
          seq{
            for tabName,tabJson in tabs do
            yield state{
              let! column = FormConfig.ParseTab tabName fieldConfigs tabJson
              return tabName,column
            }
          } |> state.All |> state.Map Map.ofList
        return { FormTabs=tabs }
      } |> state.WithErrorContext $"...when parsing tabs"

    static member Parse (formName:string) (json:JsonValue) : State<{| TypeId:TypeId; Fields:Map<string, FieldConfig>; Tabs:FormTabs |},CodeGenConfig,ParsedFormsContext,Errors> =
      state{
        let! fields = json |> JsonValue.AsRecord |> state.OfSum
        let! typeJson, fieldsJson, tabsJson = 
          state.All3
            (fields |> state.TryFindField "type")
            (fields |> state.TryFindField "fields")
            (fields |> state.TryFindField "tabs")
        let! typeName, formFields =
          state.All2
            (typeJson |> JsonValue.AsString |> state.OfSum)
            (fieldsJson |> JsonValue.AsRecord |> state.OfSum)
        let! fieldConfigs = 
          formFields |> Seq.map(fun (fieldName,fieldJson) ->
            state{
              let! parsedField = FieldConfig.Parse fieldName fieldJson
              return fieldName,parsedField
            }
          ) |> state.All
        let fieldConfigs = fieldConfigs |> Map.ofSeq
        let! s = state.GetState()
        let! typeBinding = s.TryFindType typeName |> state.OfSum
        let! tabs = FormConfig.ParseTabs fieldConfigs tabsJson
        return {| TypeId=typeBinding.TypeId; Fields=fieldConfigs; Tabs=tabs |}
      } |> state.WithErrorContext $"...when parsing form {formName}"

  type ExprType with
    static member ParseUnionCase (json:JsonValue) : State<UnionCase,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        let! args = json |> JsonValue.AsRecord |> state.OfSum
        let! caseJson,fieldsJson = 
          state.All2 
            (args |> state.TryFindField "case")
            (args |> state.TryFindField "fields")
        let! caseName = caseJson |> JsonValue.AsString |> state.OfSum
        let! fieldsType = ExprType.Parse fieldsJson
        return { CaseName=caseName; Fields=fieldsType }
      }
    static member Parse (json:JsonValue) : State<ExprType,CodeGenConfig,ParsedFormsContext,Errors> = 
      let (!) = ExprType.Parse
      state{
        return! state.Any(
          NonEmptyList.OfList(
          state{
            do! json |> JsonValue.AsEmptyRecord |> state.OfSum
            return ExprType.UnitType
          },
          [
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
            return! state{
              let! (s:ParsedFormsContext) = state.GetState()
              let! typeId = s.TryFindType typeName |> state.OfSum
              return ExprType.LookupType typeId.TypeId
            } |> state.MapError (Errors.WithPriority ErrorPriority.High)
          }
          state{
            let! fields = json |> JsonValue.AsRecord |> state.OfSum
            let! funJson,argsJson = 
              state.All2
                (fields |> state.TryFindField "fun")
                (fields |> state.TryFindField "args")
            return! state.Any(
              NonEmptyList.OfList(
              state{            
                do! funJson |> JsonValue.AsEnum (Set.singleton "SingleSelection") |> state.OfSum |> state.Map (ignore)
                let! arg = JsonValue.AsSingleton argsJson |> state.OfSum
                return! state{
                  let! arg = !arg
                  return ExprType.OptionType arg
                } |> state.MapError(Errors.WithPriority ErrorPriority.High)
              },
              [
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
                let! cases = state.All(cases |> Seq.map (ExprType.ParseUnionCase))
                return ExprType.UnionType cases
              }
            ])) |> state.MapError(Errors.HighestPriority)
          }
        ]))
      } |> state.MapError(Errors.HighestPriority)

  type ExprType with
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
    static member Find (ctx:ParsedFormsContext) (typeId:TypeId) : Sum<ExprType,Errors> = 
      sum{
        return! ctx.TryFindType typeId.TypeName |> Sum.map(fun tb -> tb.Type)
      }
    static member AsLookupId (t:ExprType) : Sum<TypeId,Errors> = 
      sum{
        match t with
        | ExprType.LookupType l -> return l
        | _ -> return! sum.Throw(Errors.Singleton $$"""Error: type {{t}} cannot be converted to a lookup.""")
      }
    static member ResolveLookup (ctx:ParsedFormsContext) (t:ExprType) : Sum<ExprType,Errors> = 
      sum{
        match t with
        | ExprType.LookupType l -> 
          return! ExprType.Find ctx l
        | _ -> return t
      }

  type EnumApi with
    static member Parse valueFieldName (enumName:string) (enumTypeJson:JsonValue) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        let! enumType = ExprType.Parse enumTypeJson
        let! enumTypeId = enumType |> ExprType.AsLookupId |> state.OfSum
        let! ctx = state.GetState()
        let! enumType = ExprType.ResolveLookup ctx enumType |> state.OfSum
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
    static member Parse (streamName:string) (streamTypeJson:JsonValue) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        let! streamType = ExprType.Parse streamTypeJson
        let! streamTypeId = streamType |> ExprType.AsLookupId |> state.OfSum
        do! state.SetState(
          ParsedFormsContext.Updaters.Apis(
            FormApis.Updaters.Streams(
              Map.add streamName { StreamApi.StreamId=Guid.CreateVersion7(); TypeId=streamTypeId; StreamName=streamName }
            )
          )
        )
      } |> state.WithErrorContext $"...when parsing stream {streamName}"

  type CrudMethod with
    static member Parse (crudMethodJson:JsonValue) : State<CrudMethod,CodeGenConfig,ParsedFormsContext,Errors> = 
      let crudCase name value = 
        state{
          do! crudMethodJson |> JsonValue.AsEnum (Set.singleton name) |> state.OfSum |> state.Map ignore
          return value
        }
      state.Any(
        NonEmptyList.OfList(
        crudCase "create" CrudMethod.Create,
        [
        crudCase "get" CrudMethod.Get
        crudCase "update" CrudMethod.Update
        crudCase "default" CrudMethod.Default
        ])
      )

  type EntityApi with
    static member Parse (entityName:string) (entityTypeJson:JsonValue) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        let! entityTypeFieldJsons = entityTypeJson |> JsonValue.AsRecord |> state.OfSum
        let! typeJson, methodsJson = 
          state.All2
            (entityTypeFieldJsons |> state.TryFindField "type")
            (entityTypeFieldJsons |> state.TryFindField "methods")
        let! methodsJson = methodsJson |> JsonValue.AsArray |> state.OfSum
        let! entityType = ExprType.Parse typeJson
        let! entityTypeId = entityType |> ExprType.AsLookupId |> state.OfSum
        let! methods = methodsJson |> Seq.map CrudMethod.Parse |> state.All |> state.Map Set.ofSeq
        do! state.SetState(
          ParsedFormsContext.Updaters.Apis(
            FormApis.Updaters.Entities(
              Map.add entityName ({ EntityApi.EntityId=Guid.CreateVersion7(); TypeId=entityTypeId; EntityName=entityName }, methods)
            )
          )
        )
      } |> state.WithErrorContext $"...when parsing entity api {entityName}"

  type ParsedFormsContext with
    static member ParseApis enumValueFieldName (apisJson:seq<string * JsonValue>) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        let! enumsJson,searchableStreamsJson,entitiesJson = 
          state.All3 
            (apisJson |> state.TryFindField "enumOptions")
            (apisJson |> state.TryFindField "searchableStreams")
            (apisJson |> state.TryFindField "entities")
        let! enums,streams,entities = 
          state.All3 
            (enumsJson |> JsonValue.AsRecord |> state.OfSum)
            (searchableStreamsJson |> JsonValue.AsRecord |> state.OfSum)
            (entitiesJson |> JsonValue.AsRecord |> state.OfSum)
        for enumName,enumJson in enums do
          do! EnumApi.Parse enumValueFieldName enumName enumJson
        for streamName,streamJson in streams do
          do! StreamApi.Parse streamName streamJson
        for entityName,entityJson in entities do
          do! EntityApi.Parse entityName entityJson
        return ()
      } |> state.MapError(Errors.Map(String.append $$"""when parsing APIs {{apisJson.ToString().ReasonablyClamped}}"""))
    static member ParseTypes (typesJson:seq<string * JsonValue>) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        for typeName,typeJson in typesJson do
          return! state{
            let! typeJsonArgs = typeJson |> JsonValue.AsRecord |> state.OfSum
            return! state.Any(
              NonEmptyList.OfList(
              state{
                let extendsJson = typeJsonArgs |> sum.TryFindField "extends" |> Sum.toOption |> Option.defaultWith (fun () -> JsonValue.Array[||])
                let! fieldsJson = typeJsonArgs |> sum.TryFindField "fields" |> state.OfSum
                let! extends,fields = 
                  state.All2 
                    (extendsJson |> JsonValue.AsArray |> state.OfSum)
                    (fieldsJson |> JsonValue.AsRecord |> state.OfSum)
                let typeId:TypeId = {  TypeName=typeName; TypeId=Guid.CreateVersion7() }
                let! s = state.GetState()
                let! extendedTypes = 
                  extends |> Seq.map (fun extendsJson -> state{
                    let! parsed = ExprType.Parse extendsJson
                    return! ExprType.ResolveLookup s parsed |> state.OfSum
                  }) |> state.All
                let! fields = 
                  fields |> Seq.map (fun (fieldName, fieldType) -> 
                      state{
                        let! fieldType = ExprType.Parse fieldType
                        return fieldName, fieldType
                      } |> state.MapError(Errors.Map(String.append $"\n...when parsing field {fieldName}"))
                    ) |> Seq.toList |> state.All
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
              },
              [
              state{
                let typeId:TypeId = {  TypeName=typeName; TypeId=Guid.CreateVersion7() }
                let! parsedType = ExprType.Parse typeJson
                do! state.SetState(
                  ParsedFormsContext.Updaters.Types(
                    Map.add typeName { Type=parsedType; TypeId=typeId }
                  )
                )
              }
            ]))
          } |> state.MapError(Errors.Map(String.append $"\n...when parsing type {typeName}"))
        } |> state.MapError(Errors.Map(String.append $"\n...when parsing types"))
    static member ParseForms (formsJson:(string*JsonValue)[]) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        for formName, formJson in formsJson do
          let! formBody = FormConfig.Parse formName formJson
          do! state.SetState(ParsedFormsContext.Updaters.Forms (Map.add formName { FormConfig.Fields=formBody.Fields; FormConfig.Tabs=formBody.Tabs; FormConfig.TypeId=formBody.TypeId; FormId=Guid.CreateVersion7(); FormName = formName }))
      } |> state.WithErrorContext $"...when parsing forms"

    static member ParseLaunchers (launchersJson:(string*JsonValue)[]) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        for launcherName, launcherJson in launchersJson do
          let! (mode, formId, apiId, configApiId) = FormLauncher.Parse launcherName launcherJson
          do! state.SetState(ParsedFormsContext.Updaters.Launchers (Map.add launcherName { LauncherName=launcherName; LauncherId=Guid.CreateVersion7(); Mode=mode; Form=formId; EntityApi=apiId; ConfigEntityApi=configApiId }))
      } |> state.WithErrorContext $"...when parsing launchers"

    static member Parse generatedLanguageSpecificConfig (json:JsonValue) : State<Unit,CodeGenConfig,ParsedFormsContext,Errors> = 
      state{
        let! properties = json |> JsonValue.AsRecord |> state.OfSum
        let! typesJson,apisJson,formsJson,launchersJson = 
          state.All4 
            (properties |> state.TryFindField "types")
            (properties |> state.TryFindField "apis")
            (properties |> state.TryFindField "forms")
            (properties |> state.TryFindField "launchers")
        let! typesJson,apisJson,formsJson,launchersJson = 
          state.All4
            (typesJson |> JsonValue.AsRecord |> state.OfSum)
            (apisJson |> JsonValue.AsRecord |> state.OfSum)
            (formsJson |> JsonValue.AsRecord |> state.OfSum)
            (launchersJson |> JsonValue.AsRecord |> state.OfSum)
        do! ParsedFormsContext.ParseTypes typesJson
        do! ParsedFormsContext.ParseApis generatedLanguageSpecificConfig.EnumValueFieldName apisJson
        do! ParsedFormsContext.ParseForms formsJson
        do! ParsedFormsContext.ParseLaunchers launchersJson
      } |> state.WithErrorContext $"...when parsing language config"
