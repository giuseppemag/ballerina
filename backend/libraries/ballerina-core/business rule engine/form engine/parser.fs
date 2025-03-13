namespace Ballerina.DSL.FormEngine

module Parser =

  open Ballerina.DSL.FormEngine.Model
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open System
  open Ballerina.Collections.Sum
  open Ballerina.Collections.Map
  open Ballerina.State.WithError
  open Ballerina.Errors
  open Ballerina.Core.Json
  open Ballerina.Core.String
  open Ballerina.Core.Object
  open FSharp.Data
  open Ballerina.Collections.NonEmptyList

  type SumBuilder with
    member sum.TryFindField name fields =
      fields
      |> Seq.tryFind (fst >> (=) name)
      |> Option.map snd
      |> Sum.fromOption (fun () -> Errors.Singleton $"Error: cannot find field '{name}'")

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

  type StateBuilder with
    member state.TryFindType name =
      state {
        let! (s: ParsedFormsContext) = state.GetState()
        return! s.TryFindType name |> state.OfSum
      }

    member state.TryFindForm name =
      state {
        let! (s: ParsedFormsContext) = state.GetState()
        return! s.TryFindForm name |> state.OfSum
      }

    member state.AsFormBodyFields fb =
      match fb with
      | FormBody.Fields fs -> state { return fs }
      | FormBody.Cases _ -> state.Throw(Errors.Singleton $"Error: expected fields in form body, found cases.")

  type FormLauncher with
    static member Parse (launcherName: string) (json: JsonValue) : State<_, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! launcherFields = JsonValue.AsRecord json |> state.OfSum

        let! kindJson, formNameJson =
          state.All2 (launcherFields |> state.TryFindField "kind") (launcherFields |> state.TryFindField "form")
        // (launcherFields |> state.TryFindField "api")
        // (launcherFields |> state.TryFindField "configApi")
        let! (kind, formName) =
          state.All2 (JsonValue.AsString kindJson |> state.OfSum) (JsonValue.AsString formNameJson |> state.OfSum)

        let! (s: ParsedFormsContext) = state.GetState()
        let! form = s.TryFindForm formName |> state.OfSum

        if kind = "create" || kind = "edit" then
          let! entityApiJson, configApiJson =
            state.All2 (launcherFields |> state.TryFindField "api") (launcherFields |> state.TryFindField "configApi")

          let! entityApiName, configApiName =
            state.All2
              (entityApiJson |> JsonValue.AsString |> state.OfSum)
              (configApiJson |> JsonValue.AsString |> state.OfSum)

          let! api = s.TryFindEntityApi entityApiName |> state.OfSum
          let! configApi = s.TryFindEntityApi configApiName |> state.OfSum
          let api, configApi = api |> fst |> EntityApi.Id, configApi |> fst |> EntityApi.Id

          return
            (if kind = "create" then
               FormLauncherMode.Create
                 { EntityApi = api
                   ConfigEntityApi = configApi }
             else
               FormLauncherMode.Edit
                 { EntityApi = api
                   ConfigEntityApi = configApi }),
            form |> FormConfig.Id
        elif kind = "passthrough" then
          let! configTypeJson = launcherFields |> state.TryFindField "configType"
          let! configTypeName = configTypeJson |> JsonValue.AsString |> state.OfSum
          let! configType = state.TryFindType configTypeName
          return FormLauncherMode.Passthrough {| ConfigType = configType.TypeId |}, form |> FormConfig.Id
        else
          return!
            $"Error: invalid launcher mode {kind}: it should be either 'create' or 'edit'."
            |> Errors.Singleton
            |> state.Throw
      }
      |> state.WithErrorContext $"...when parsing launcher {launcherName}"

  type Expr with
    static member AsLambda(e: Expr) =
      match e with
      | Expr.Value(Value.Lambda(v, b)) -> sum { return (v, b) }
      | _ -> sum.Throw(Errors.Singleton $"Error: expected lambda, found {e.ToString()}")

  type BinaryOperator with
    static member ByName =
      seq {
        "and", BinaryOperator.And
        "/", BinaryOperator.DividedBy
        "equals", BinaryOperator.Equals
        "=", BinaryOperator.Equals
        ">", BinaryOperator.GreaterThan
        ">=", BinaryOperator.GreaterThanEquals
        "-", BinaryOperator.Minus
        "or", BinaryOperator.Or
        "+", BinaryOperator.Plus
        "*", BinaryOperator.Times
      }
      |> Map.ofSeq

    static member AllNames = BinaryOperator.ByName |> Map.keys |> Set.ofSeq

  type NestedRenderer with
    member self.Type = self.Renderer.Type

  and Renderer with
    member self.Type =
      match self with
      | PrimitiveRenderer p -> p.Type
      | MapRenderer r -> ExprType.MapType(r.Key.Type, r.Value.Type)
      | SumRenderer r -> ExprType.SumType(r.Left.Type, r.Right.Type)
      | ListRenderer r -> ExprType.ListType r.Element.Type
      | EnumRenderer(_, r)
      | StreamRenderer(_, r) -> r.Type
      | TupleRenderer i -> ExprType.TupleType(i.Elements |> Seq.map (fun e -> e.Type) |> List.ofSeq)
      | FormRenderer(_, t, _) -> t
      | UnionRenderer r ->
        ExprType.UnionType(
          r.Cases
          |> Map.map (fun cn c ->
            { CaseName = cn.CaseName
              Fields = c.Type })
        )
      | UnitRenderer r -> r.Type

  type Expr with
    static member ParseMatchCase
      (json: JsonValue)
      : State<string * VarName * Expr, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! json = json |> JsonValue.AsRecord |> state.OfSum
        let! caseJson = json |> sum.TryFindField "caseName" |> state.OfSum

        return!
          state {
            let! caseName = caseJson |> JsonValue.AsString |> state.OfSum
            let! handlerJson = json |> sum.TryFindField "handler" |> state.OfSum
            let! handler = handlerJson |> Expr.Parse
            let! varName, body = handler |> Expr.AsLambda |> state.OfSum
            return caseName, varName, body
          }
          |> state.MapError(Errors.WithPriority ErrorPriority.High)
      }

    static member Parse(json: JsonValue) : State<Expr, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        return!
          state.Any(
            NonEmptyList.OfList(
              state {
                let! v = JsonValue.AsBoolean json |> state.OfSum
                return v |> Value.ConstBool |> Expr.Value
              },
              [ state {
                  let! v = JsonValue.AsString json |> state.OfSum
                  return v |> Value.ConstString |> Expr.Value
                }
                state {
                  let! v = JsonValue.AsNumber json |> state.OfSum
                  return v |> int |> Value.ConstInt |> Expr.Value
                }
                state {
                  let! fieldsJson = JsonValue.AsRecord json |> state.OfSum

                  return!
                    state.Any(
                      NonEmptyList.OfList(
                        state {
                          let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum

                          let! operator = kindJson |> JsonValue.AsEnum BinaryOperator.AllNames |> state.OfSum

                          return!
                            state {
                              let! operandsJson = fieldsJson |> sum.TryFindField "operands" |> state.OfSum

                              let! (firstJson, secondJson) = JsonValue.AsPair operandsJson |> state.OfSum

                              let! first = Expr.Parse firstJson
                              let! second = Expr.Parse secondJson

                              let! operator =
                                BinaryOperator.ByName
                                |> Map.tryFindWithError operator "binary operator" operator
                                |> state.OfSum

                              return Expr.Binary(operator, first, second)
                            }
                            |> state.MapError(Errors.WithPriority ErrorPriority.High)
                        },
                        [ state {
                            let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum

                            do!
                              kindJson
                              |> JsonValue.AsEnum(Set.singleton "lambda")
                              |> state.OfSum
                              |> state.Map ignore

                            return!
                              state {
                                let! parameterJson = fieldsJson |> sum.TryFindField "parameter" |> state.OfSum

                                let! parameterName = parameterJson |> JsonValue.AsString |> state.OfSum

                                let! bodyJson = fieldsJson |> sum.TryFindField "body" |> state.OfSum

                                let! body = bodyJson |> Expr.Parse

                                return Expr.Value(Value.Lambda({ VarName = parameterName }, body))
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum

                            do!
                              kindJson
                              |> JsonValue.AsEnum(Set.singleton "matchCase")
                              |> state.OfSum
                              |> state.Map ignore

                            return!
                              state {
                                let! operandsJson = fieldsJson |> sum.TryFindField "operands" |> state.OfSum

                                let! operandsJson = JsonValue.AsArray operandsJson |> state.OfSum

                                if operandsJson.Length < 1 then
                                  return!
                                    state.Throw(
                                      Errors.Singleton
                                        $"Error: matchCase needs at least one operand, the value to match. Instead, found zero operands."
                                    )
                                else
                                  let valueJson = operandsJson.[0]
                                  let! value = Expr.Parse valueJson
                                  let casesJson = operandsJson |> Seq.skip 1 |> Seq.toList

                                  let! cases = state.All(casesJson |> Seq.map (Expr.ParseMatchCase))

                                  let cases = cases |> Seq.map (fun (c, v, b) -> (c, (v, b))) |> Map.ofSeq

                                  return Expr.MatchCase(value, cases)
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum

                            do!
                              kindJson
                              |> JsonValue.AsEnum(Set.singleton "fieldLookup")
                              |> state.OfSum
                              |> state.Map ignore

                            return!
                              state {
                                let! operandsJson = fieldsJson |> sum.TryFindField "operands" |> state.OfSum

                                let! (firstJson, fieldNameJson) = JsonValue.AsPair operandsJson |> state.OfSum

                                let! fieldName = JsonValue.AsString fieldNameJson |> state.OfSum

                                let! first = Expr.Parse firstJson
                                return Expr.RecordFieldLookup(first, fieldName)
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum

                            do!
                              kindJson
                              |> JsonValue.AsEnum(Set.singleton "isCase")
                              |> state.OfSum
                              |> state.Map ignore

                            return!
                              state {
                                let! operandsJson = fieldsJson |> sum.TryFindField "operands" |> state.OfSum

                                let! (firstJson, caseNameJson) = JsonValue.AsPair operandsJson |> state.OfSum

                                let! caseName = JsonValue.AsString caseNameJson |> state.OfSum

                                let! first = Expr.Parse firstJson
                                return Expr.IsCase(caseName, first)
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum

                            do!
                              kindJson
                              |> JsonValue.AsEnum(Set.singleton "varLookup")
                              |> state.OfSum
                              |> state.Map ignore

                            return!
                              state {
                                let! varNameJson = fieldsJson |> sum.TryFindField "varName" |> state.OfSum

                                let! varName = JsonValue.AsString varNameJson |> state.OfSum
                                return Expr.VarLookup { VarName = varName }
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            let! kindJson = fieldsJson |> sum.TryFindField "kind" |> state.OfSum

                            do!
                              kindJson
                              |> JsonValue.AsEnum(Set.singleton "itemLookup")
                              |> state.OfSum
                              |> state.Map ignore


                            return!
                              state {
                                let! operandsJson = fieldsJson |> sum.TryFindField "operands" |> state.OfSum

                                let! (firstJson, itemIndexJson) = JsonValue.AsPair operandsJson |> state.OfSum

                                let! itemIndex = JsonValue.AsNumber itemIndexJson |> state.OfSum

                                let! first = Expr.Parse firstJson
                                return Expr.Project(first, itemIndex |> int)
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state.Throw(
                            Errors.Singleton
                              $"Error: cannot parse expression {fieldsJson.ToFSharpString.ReasonablyClamped}."
                          ) ]
                      )
                    )
                }
                |> state.MapError(Errors.HighestPriority) ]
            )
          )
      }
      |> state.MapError(Errors.HighestPriority)


  type Renderer with
    static member ParseChildren(json: JsonValue) : State<RendererChildren, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! fieldsJson = json |> JsonValue.AsRecord |> state.OfSum

        let! parsedFields =
          fieldsJson
          |> Seq.map (fun (name, body) ->
            state {
              let! res = FieldConfig.Parse name body
              return name, res
            })
          |> state.All

        return { Fields = parsedFields |> Map.ofSeq }
      }

    static member Parse
      (parentJsonFields: (string * JsonValue)[])
      (json: JsonValue)
      : State<Renderer, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! config = state.GetContext()
        let! (formsState: ParsedFormsContext) = state.GetState()

        let! childrenJson =
          parentJsonFields
          |> sum.TryFindField "children"
          |> sum.Catch(fun () -> JsonValue.Record([||]))
          |> state.OfSum

        let! children = Renderer.ParseChildren childrenJson
        let! s = json |> JsonValue.AsString |> state.OfSum

        if config.Bool.SupportedRenderers |> Set.contains s then
          return
            PrimitiveRenderer
              { PrimitiveRendererName = s
                PrimitiveRendererId = Guid.CreateVersion7()
                Type = ExprType.PrimitiveType PrimitiveType.BoolType
                Children = children }
        elif config.Date.SupportedRenderers |> Set.contains s then
          return
            PrimitiveRenderer
              { PrimitiveRendererName = s
                PrimitiveRendererId = Guid.CreateVersion7()
                Type = ExprType.PrimitiveType PrimitiveType.DateOnlyType
                Children = children }
        elif config.Unit.SupportedRenderers |> Set.contains s then
          return
            PrimitiveRenderer
              { PrimitiveRendererName = s
                PrimitiveRendererId = Guid.CreateVersion7()
                Type = ExprType.UnitType
                Children = children }
        elif config.Guid.SupportedRenderers |> Set.contains s then
          return
            PrimitiveRenderer
              { PrimitiveRendererName = s
                PrimitiveRendererId = Guid.CreateVersion7()
                Type = ExprType.PrimitiveType PrimitiveType.GuidType
                Children = children }
        elif config.Int.SupportedRenderers |> Set.contains s then
          return
            PrimitiveRenderer
              { PrimitiveRendererName = s
                PrimitiveRendererId = Guid.CreateVersion7()
                Type = ExprType.PrimitiveType PrimitiveType.IntType
                Children = children }
        elif config.String.SupportedRenderers |> Set.contains s then
          return
            PrimitiveRenderer
              { PrimitiveRendererName = s
                PrimitiveRendererId = Guid.CreateVersion7()
                Type = ExprType.PrimitiveType PrimitiveType.StringType
                Children = children }
        elif
          config.Option.SupportedRenderers.Enum |> Set.contains s
          || config.Set.SupportedRenderers.Enum |> Set.contains s
        then
          let containerTypeConstructor =
            if config.Option.SupportedRenderers.Enum |> Set.contains s then
              ExprType.OptionType
            else
              ExprType.SetType

          let! optionJson = parentJsonFields |> sum.TryFindField "options" |> state.OfSum
          let! enumName = optionJson |> JsonValue.AsString |> state.OfSum
          let! enum = formsState.TryFindEnum enumName |> state.OfSum
          let! enumType = formsState.TryFindType enum.TypeId.TypeName |> state.OfSum

          return
            EnumRenderer(
              enum |> EnumApi.Id,
              PrimitiveRenderer
                { PrimitiveRendererName = s
                  PrimitiveRendererId = Guid.CreateVersion7()
                  Type = containerTypeConstructor (enumType.Type)
                  Children = children }
            )
        elif
          config.Option.SupportedRenderers.Stream |> Set.contains s
          || config.Set.SupportedRenderers.Stream |> Set.contains s
        then
          let containerTypeConstructor =
            if config.Option.SupportedRenderers.Stream |> Set.contains s then
              ExprType.OptionType
            else
              ExprType.SetType

          let! streamNameJson = parentJsonFields |> sum.TryFindField "stream" |> state.OfSum
          let! streamName = streamNameJson |> JsonValue.AsString |> state.OfSum
          let! stream = formsState.TryFindStream streamName |> state.OfSum
          let! streamType = formsState.TryFindType stream.TypeId.TypeName |> state.OfSum

          return
            StreamRenderer(
              stream |> StreamApi.Id,
              PrimitiveRenderer
                { PrimitiveRendererName = s
                  PrimitiveRendererId = Guid.CreateVersion7()
                  Type = containerTypeConstructor (streamType.Type)
                  Children = children }
            )
        elif config.Map.SupportedRenderers |> Set.contains s then
          let! (keyRendererJson, valueRendererJson) =
            state.All2
              (parentJsonFields |> state.TryFindField "keyRenderer")
              (parentJsonFields |> state.TryFindField "valueRenderer")

          let! keyRenderer = NestedRenderer.Parse keyRendererJson
          let! valueRenderer = NestedRenderer.Parse valueRendererJson

          return
            MapRenderer
              {| Map =
                  PrimitiveRenderer
                    { PrimitiveRendererName = s
                      PrimitiveRendererId = Guid.CreateVersion7()
                      Type = ExprType.MapType(keyRenderer.Renderer.Type, valueRenderer.Renderer.Type)
                      Children = { Fields = Map.empty } }
                 Key = keyRenderer
                 Value = valueRenderer
                 Children = children |}
        elif config.Sum.SupportedRenderers |> Set.contains s then
          let! (leftRendererJson, rightRendererJson) =
            state.All2
              (parentJsonFields |> state.TryFindField "leftRenderer")
              (parentJsonFields |> state.TryFindField "rightRenderer")

          let! leftRenderer = NestedRenderer.Parse leftRendererJson
          let! rightRenderer = NestedRenderer.Parse rightRendererJson

          return
            SumRenderer
              {| Sum =
                  PrimitiveRenderer
                    { PrimitiveRendererName = s
                      PrimitiveRendererId = Guid.CreateVersion7()
                      Type = ExprType.SumType(leftRenderer.Renderer.Type, rightRenderer.Renderer.Type)
                      Children = { Fields = Map.empty } }
                 Left = leftRenderer
                 Right = rightRenderer
                 Children = children |}
        elif config.List.SupportedRenderers |> Set.contains s then
          let! elementRendererJson = parentJsonFields |> sum.TryFindField "elementRenderer" |> state.OfSum
          let! elementRenderer = NestedRenderer.Parse elementRendererJson

          return
            ListRenderer
              {| List =
                  PrimitiveRenderer
                    { PrimitiveRendererName = s
                      PrimitiveRendererId = Guid.CreateVersion7()
                      Type = ExprType.ListType elementRenderer.Renderer.Type
                      Children = { Fields = Map.empty } }
                 Element = elementRenderer
                 Children = children |}
        elif config.Union.SupportedRenderers |> Set.contains s then
          let! casesJson = parentJsonFields |> sum.TryFindField "cases" |> state.OfSum
          let! casesJson = casesJson |> JsonValue.AsRecord |> state.OfSum

          let! cases =
            casesJson
            |> Seq.map (fun (caseName, caseJson) ->
              state {
                let! caseRenderer = NestedRenderer.Parse caseJson
                return caseName, caseRenderer
              })
            |> state.All

          return
            UnionRenderer
              {| Union =
                  PrimitiveRenderer
                    { PrimitiveRendererName = s
                      PrimitiveRendererId = Guid.CreateVersion7()
                      Type =
                        ExprType.UnionType(
                          cases
                          |> Seq.map (fun (n, t) -> ({ CaseName = n }, { CaseName = n; Fields = t.Type }))
                          |> Map.ofSeq
                        )
                      Children = { Fields = Map.empty } }
                 Cases = cases |> Seq.map (fun (n, t) -> { CaseName = n }, t) |> Map.ofSeq
                 Children = children |}
        else
          return!
            state.Any(
              NonEmptyList.OfList(
                state {
                  let! c =
                    config.Custom
                    |> Seq.tryFind (fun c -> c.Value.SupportedRenderers |> Set.contains s)
                    |> Sum.fromOption (fun () -> $"Error: cannot find custom type {s}" |> Errors.Singleton)
                    |> state.OfSum

                  let! t = formsState.TryFindType c.Key |> state.OfSum

                  return
                    PrimitiveRenderer
                      { PrimitiveRendererName = s
                        PrimitiveRendererId = Guid.CreateVersion7()
                        Type = t.Type
                        Children = children }
                },
                [ state {
                    let! tupleConfig =
                      config.Tuple
                      |> List.tryFind (fun t -> t.SupportedRenderers.Contains s)
                      |> Sum.fromOption (fun () -> Errors.Singleton $"Error: cannot find tuple config for renderer {s}")
                      |> state.OfSum

                    return!
                      state {
                        let! itemRenderersJson = parentJsonFields |> sum.TryFindField "itemRenderers" |> state.OfSum
                        let! itemRenderersJson = itemRenderersJson |> JsonValue.AsArray |> state.OfSum
                        let! itemRenderers = itemRenderersJson |> Seq.map (NestedRenderer.Parse) |> state.All

                        if itemRenderers.Length <> tupleConfig.Ariety then
                          return!
                            state.Throw(
                              Errors.Singleton
                                $"Error: mismatched tuple size. Expected {tupleConfig.Ariety}, found {itemRenderers.Length}."
                            )
                        else
                          return
                            TupleRenderer
                              {| Tuple =
                                  PrimitiveRenderer
                                    { PrimitiveRendererName = s
                                      PrimitiveRendererId = Guid.CreateVersion7()
                                      Type =
                                        ExprType.TupleType(itemRenderers |> Seq.map (fun nr -> nr.Type) |> List.ofSeq)
                                      Children = { Fields = Map.empty } }
                                 Elements = itemRenderers
                                 Children = children |}
                      }
                      |> state.MapError(Errors.WithPriority ErrorPriority.High)
                  }
                  state {
                    let! form = formsState.TryFindForm s |> state.OfSum
                    let! formType = formsState.TryFindType form.TypeId.TypeName |> state.OfSum
                    return FormRenderer(form |> FormConfig.Id, formType.Type, children)
                  }
                  state.Throw(
                    Errors.Singleton
                      $"Error: cannot resolve field renderer {s} in {(formsState.Forms
                                                                      |> Map.values
                                                                      |> Seq.map (fun v -> v.FormName, v.TypeId.TypeName)
                                                                      |> List.ofSeq)
                                                                       .ToFSharpString}"
                    |> Errors.WithPriority ErrorPriority.High
                  ) ]
              )
            )
            |> state.MapError(Errors.HighestPriority)
      }
      |> state.WithErrorContext $"...when parsing renderer {json.ToString().ReasonablyClamped}"

  and NestedRenderer with
    static member Parse(json: JsonValue) : State<NestedRenderer, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum

        let! label =
          jsonFields
          |> sum.TryFindField "label"
          |> Sum.toOption
          |> Option.map (JsonValue.AsString >> state.OfSum)
          |> state.RunOption

        let! tooltip =
          jsonFields
          |> sum.TryFindField "tooltip"
          |> Sum.toOption
          |> Option.map (JsonValue.AsString >> state.OfSum)
          |> state.RunOption

        let! details =
          jsonFields
          |> sum.TryFindField "details"
          |> Sum.toOption
          |> Option.map (JsonValue.AsString >> state.OfSum)
          |> state.RunOption

        let! rendererJson = jsonFields |> state.TryFindField "renderer"
        let! renderer = Renderer.Parse jsonFields rendererJson

        return
          { Label = label
            Tooltip = tooltip
            Details = details
            Renderer = renderer }
      }
      |> state.WithErrorContext $"...when parsing renderer {json.ToString().ReasonablyClamped}"

  and FieldConfig with
    static member Parse
      (fieldName: string)
      (json: JsonValue)
      : State<FieldConfig, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! fields = json |> JsonValue.AsRecord |> state.OfSum

        let! label =
          fields
          |> sum.TryFindField "label"
          |> Sum.toOption
          |> Option.map (JsonValue.AsString >> state.OfSum)
          |> state.RunOption

        let! tooltip =
          fields
          |> sum.TryFindField "tooltip"
          |> Sum.toOption
          |> Option.map (JsonValue.AsString >> state.OfSum)
          |> state.RunOption

        let! details =
          fields
          |> sum.TryFindField "details"
          |> Sum.toOption
          |> Option.map (JsonValue.AsString >> state.OfSum)
          |> state.RunOption

        let! rendererJson, visibleJson =
          state.All2 (fields |> state.TryFindField "renderer") (fields |> state.TryFindField "visible" |> state.Catch)

        let! disabledJson = sum.TryFindField "disabled" fields |> state.OfSum |> state.Catch
        let! renderer = Renderer.Parse fields rendererJson
        let! visible = visibleJson |> Sum.toOption |> Option.map Expr.Parse |> state.RunOption

        let visible =
          visible |> Option.defaultWith (fun () -> Expr.Value(Value.ConstBool true))

        let! disabled = disabledJson |> Sum.toOption |> Option.map (Expr.Parse) |> state.RunOption

        return
          { FieldName = fieldName
            FieldId = Guid.CreateVersion7()
            Label = label
            Tooltip = tooltip
            Details = details
            Renderer = renderer
            Visible = visible
            Disabled = disabled }
      }
      |> state.WithErrorContext $"...when parsing field {fieldName}"

  type FormFields with
    static member Parse(fields: (string * JsonValue)[]) =
      state {
        let! fieldsJson, tabsJson =
          state.All2 (fields |> state.TryFindField "fields") (fields |> state.TryFindField "tabs")

        let! extendsJson = fields |> state.TryFindField "extends" |> state.Catch |> state.Map Sum.toOption

        let! extendedForms =
          extendsJson
          |> Option.map (fun extendsJson ->
            state {
              let! extendsJson = extendsJson |> JsonValue.AsArray |> state.OfSum

              return!
                extendsJson
                |> Seq.map (fun extendJson ->
                  state {
                    let! extendsFormName = extendJson |> JsonValue.AsString |> state.OfSum
                    return! state.TryFindForm extendsFormName
                  })
                |> state.All
            })
          |> state.RunOption

        let! extendedFields =
          match extendedForms with
          | None -> state.Return []
          | Some fs ->
            fs
            |> Seq.map (fun f -> state.AsFormBodyFields f.Body)
            |> state.All
            |> state.Map(List.map (fun f -> f.Fields))

        let! formFields = fieldsJson |> JsonValue.AsRecord |> state.OfSum

        let! fieldConfigs =
          formFields
          |> Seq.map (fun (fieldName, fieldJson) ->
            state {
              let! parsedField = FieldConfig.Parse fieldName fieldJson
              return fieldName, parsedField
            })
          |> state.All

        let fieldConfigs = fieldConfigs |> Map.ofSeq
        let fieldConfigs = Map.mergeMany (fun x y -> x) (fieldConfigs :: extendedFields)
        let! tabs = FormConfig.ParseTabs fieldConfigs tabsJson

        return
          { FormFields.Fields = fieldConfigs
            FormFields.Tabs = tabs }
      }

  and FormBody with
    static member Parse(fields: (string * JsonValue)[]) =
      state.Either

        (state {
          let! formFields = FormFields.Parse fields
          return FormBody.Fields formFields
        })
        (state {
          let! casesJson = fields |> state.TryFindField "cases"

          return!
            state {
              let! casesJson = casesJson |> JsonValue.AsRecord |> state.OfSum

              let! cases =
                casesJson
                |> Seq.map (fun (caseName, caseJson) ->
                  state {
                    let! caseJson = caseJson |> JsonValue.AsRecord |> state.OfSum
                    let! caseBody = FormFields.Parse caseJson
                    return caseName, caseBody
                  }
                  |> state.MapError(Errors.Map(String.appendNewline $"\n...when parsing form case {caseName}")))
                |> state.All
                |> state.Map(Map.ofSeq)

              return FormBody.Cases cases
            }
            |> state.MapError(Errors.WithPriority ErrorPriority.High)
        })

  and FormConfig with
    static member ParseGroup
      (groupName: string)
      (fieldConfigs: Map<string, FieldConfig>)
      (json: JsonValue)
      : State<List<FieldConfigId>, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! fields = json |> JsonValue.AsArray |> state.OfSum

        return!
          seq {
            for fieldJson in fields do
              yield
                state {
                  let! fieldName = fieldJson |> JsonValue.AsString |> state.OfSum

                  return!
                    fieldConfigs
                    |> Map.tryFindWithError fieldName "field name" fieldName
                    |> Sum.map (FieldConfig.Id)
                    |> state.OfSum
                }
          }
          |> state.All
      }
      |> state.WithErrorContext $"...when parsing group {groupName}"

    static member ParseColumn
      (columnName: string)
      fieldConfigs
      (json: JsonValue)
      : State<FormGroups, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum

        match jsonFields with
        | [| "groups", JsonValue.Record groups |] ->
          let! groups =
            seq {
              for groupName, groupJson in groups do
                yield
                  state {
                    let! column = FormConfig.ParseGroup groupName fieldConfigs groupJson
                    return groupName, column
                  }
            }
            |> state.All
            |> state.Map Map.ofList

          return { FormGroups = groups }
        | _ ->
          return!
            $"Error: cannot parse groups. Expected a single field 'groups', instead found {json}"
            |> Errors.Singleton
            |> state.Throw
      }
      |> state.WithErrorContext $"...when parsing column {columnName}"

    static member ParseTab
      (tabName: string)
      fieldConfigs
      (json: JsonValue)
      : State<FormColumns, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! jsonFields = json |> JsonValue.AsRecord |> state.OfSum

        match jsonFields with
        | [| "columns", JsonValue.Record columns |] ->
          let! columns =
            seq {
              for columnName, columnJson in columns do
                yield
                  state {
                    let! column = FormConfig.ParseColumn columnName fieldConfigs columnJson
                    return columnName, column
                  }
            }
            |> state.All
            |> state.Map Map.ofList

          return { FormColumns = columns }
        | _ ->
          return!
            $"Error: cannot parse columns. Expected a single field 'columns', instead found {json}"
            |> Errors.Singleton
            |> state.Throw
      }
      |> state.WithErrorContext $"...when parsing tab {tabName}"

    static member ParseTabs
      fieldConfigs
      (json: JsonValue)
      : State<FormTabs, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! tabs = json |> JsonValue.AsRecord |> state.OfSum

        let! tabs =
          seq {
            for tabName, tabJson in tabs do
              yield
                state {
                  let! column = FormConfig.ParseTab tabName fieldConfigs tabJson
                  return tabName, column
                }
          }
          |> state.All
          |> state.Map Map.ofList

        return { FormTabs = tabs }
      }
      |> state.WithErrorContext $"...when parsing tabs"

    static member PreParse
      (formName: string)
      (json: JsonValue)
      : State<TypeBinding, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! fields = json |> JsonValue.AsRecord |> state.OfSum

        let! typeJson = (fields |> state.TryFindField "type")
        let! typeName = typeJson |> JsonValue.AsString |> state.OfSum
        let! (s: ParsedFormsContext) = state.GetState()
        let! typeBinding = s.TryFindType typeName |> state.OfSum

        return typeBinding
      }

    static member Parse
      (formName: string)
      (json: JsonValue)
      : State<{| TypeId: TypeId; Body: FormBody |}, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! fields = json |> JsonValue.AsRecord |> state.OfSum

        let! typeJson = (fields |> state.TryFindField "type")
        let! typeName = typeJson |> JsonValue.AsString |> state.OfSum
        let! (s: ParsedFormsContext) = state.GetState()
        let! typeBinding = s.TryFindType typeName |> state.OfSum
        let! body = FormBody.Parse fields

        return
          {| TypeId = typeBinding.TypeId
             Body = body |}
      }
      |> state.WithErrorContext $"...when parsing form {formName}"

  type ExprType with
    static member ParseUnionCase(json: JsonValue) : State<UnionCase, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! args = json |> JsonValue.AsRecord |> state.OfSum

        let! caseJson, fieldsJson =
          state.All2 (args |> state.TryFindField "caseName") (args |> state.TryFindField "fields")

        let! caseName = caseJson |> JsonValue.AsString |> state.OfSum

        let! fieldsType =
          state.Either
            (state {
              let! fieldsJson = fieldsJson |> JsonValue.AsRecord |> state.OfSum

              let! fields =
                fieldsJson
                |> Seq.map (fun (fieldName, fieldType) ->
                  state {
                    let! fieldType = ExprType.Parse fieldType
                    return fieldName, fieldType
                  }
                  |> state.MapError(Errors.Map(String.appendNewline $"\n...when parsing field {fieldName}")))
                |> Seq.toList
                |> state.All

              let fields = fields |> Map.ofList

              if fields |> Map.isEmpty then
                ExprType.UnitType
              else
                ExprType.RecordType fields
            })
            (ExprType.Parse fieldsJson)

        return
          { CaseName = caseName
            Fields = fieldsType }
      }

    static member Parse(json: JsonValue) : State<ExprType, CodeGenConfig, ParsedFormsContext, Errors> =
      let (!) = ExprType.Parse

      state {
        return!
          state.Any(
            NonEmptyList.OfList(
              state {
                do!
                  json
                  |> JsonValue.AsEnum(Set.singleton "unit")
                  |> state.OfSum
                  |> state.Map ignore

                return ExprType.UnitType
              },
              [ state {
                  do!
                    json
                    |> JsonValue.AsEnum(Set.singleton "guid")
                    |> state.OfSum
                    |> state.Map ignore

                  return ExprType.PrimitiveType PrimitiveType.GuidType
                }
                state {
                  do!
                    json
                    |> JsonValue.AsEnum(Set.singleton "string")
                    |> state.OfSum
                    |> state.Map ignore

                  return ExprType.PrimitiveType PrimitiveType.StringType
                }
                state {
                  do!
                    json
                    |> JsonValue.AsEnum(Set.singleton "number")
                    |> state.OfSum
                    |> state.Map ignore

                  return ExprType.PrimitiveType PrimitiveType.IntType
                }
                state {
                  do!
                    json
                    |> JsonValue.AsEnum(Set.singleton "boolean")
                    |> state.OfSum
                    |> state.Map ignore

                  return ExprType.PrimitiveType PrimitiveType.BoolType
                }
                state {
                  do!
                    json
                    |> JsonValue.AsEnum(Set.singleton "Date")
                    |> state.OfSum
                    |> state.Map ignore

                  return ExprType.PrimitiveType PrimitiveType.DateOnlyType
                }
                state {
                  let! typeName = json |> JsonValue.AsString |> state.OfSum

                  return!
                    state {
                      let! (s: ParsedFormsContext) = state.GetState()
                      let! typeId = s.TryFindType typeName |> state.OfSum
                      return ExprType.LookupType typeId.TypeId
                    }
                    |> state.MapError(Errors.WithPriority ErrorPriority.High)
                }
                state {
                  let! fields = json |> JsonValue.AsRecord |> state.OfSum
                  let! funJson = (fields |> state.TryFindField "fun")

                  return!
                    state.Any(
                      NonEmptyList.OfList(
                        state {
                          do!
                            funJson
                            |> JsonValue.AsEnum(Set.singleton "SingleSelection")
                            |> state.OfSum
                            |> state.Map(ignore)

                          return!
                            state {
                              let! argsJson = (fields |> state.TryFindField "args")
                              let! arg = JsonValue.AsSingleton argsJson |> state.OfSum
                              let! arg = !arg
                              return ExprType.OptionType arg
                            }
                            |> state.MapError(Errors.WithPriority ErrorPriority.High)
                        },
                        [ state {
                            do!
                              funJson
                              |> JsonValue.AsEnum(Set.singleton "MultiSelection")
                              |> state.OfSum
                              |> state.Map(ignore)

                            return!
                              state {
                                let! argsJson = (fields |> state.TryFindField "args")
                                let! arg = JsonValue.AsSingleton argsJson |> state.OfSum
                                let! arg = !arg
                                return ExprType.SetType arg
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            do!
                              funJson
                              |> JsonValue.AsEnum(Set.singleton "Tuple")
                              |> state.OfSum
                              |> state.Map(ignore)

                            return!
                              state {
                                let! argsJson = (fields |> state.TryFindField "args")
                                let! args = JsonValue.AsArray argsJson |> state.OfSum
                                let! args = args |> Seq.map (!) |> state.All
                                return ExprType.TupleType args
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            do!
                              funJson
                              |> JsonValue.AsEnum(Set.singleton "List")
                              |> state.OfSum
                              |> state.Map(ignore)

                            return!
                              state {
                                let! argsJson = (fields |> state.TryFindField "args")
                                let! arg = JsonValue.AsSingleton argsJson |> state.OfSum
                                let! arg = !arg
                                return ExprType.ListType arg
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            do!
                              funJson
                              |> JsonValue.AsEnum(Set.singleton "Map")
                              |> state.OfSum
                              |> state.Map(ignore)

                            return!
                              state {
                                let! argsJson = (fields |> state.TryFindField "args")
                                let! key, value = JsonValue.AsPair argsJson |> state.OfSum
                                let! key, value = state.All2 !key !value
                                return ExprType.MapType(key, value)
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            do!
                              funJson
                              |> JsonValue.AsEnum(Set.singleton "Sum")
                              |> state.OfSum
                              |> state.Map(ignore)

                            return!
                              state {
                                let! argsJson = (fields |> state.TryFindField "args")
                                let! leftJson, rightJson = JsonValue.AsPair argsJson |> state.OfSum
                                let! left, right = state.All2 !leftJson !rightJson
                                return ExprType.SumType(left, right)
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state {
                            do!
                              funJson
                              |> JsonValue.AsEnum(Set.singleton "Union")
                              |> state.OfSum
                              |> state.Map(ignore)

                            return!
                              state {
                                let! argsJson = (fields |> state.TryFindField "args")
                                let! cases = argsJson |> JsonValue.AsArray |> state.OfSum

                                let! cases = state.All(cases |> Seq.map (ExprType.ParseUnionCase))

                                return
                                  ExprType.UnionType(
                                    cases |> Seq.map (fun c -> { CaseName = c.CaseName }, c) |> Map.ofSeq
                                  )
                              }
                              |> state.MapError(Errors.WithPriority ErrorPriority.High)
                          }
                          state.Throw(Errors.Singleton $"Error: cannot parse generic type {funJson}")
                          |> state.MapError(Errors.WithPriority ErrorPriority.High) ]
                      )
                    )
                    |> state.MapError(Errors.HighestPriority)
                } ]
            )
          )
      }
      |> state.MapError(Errors.HighestPriority)

  type ExprType with
    static member GetFields(t: ExprType) : Sum<List<string * ExprType>, Errors> =
      match t with
      | ExprType.RecordType fs -> sum { return fs |> Seq.map (fun v -> v.Key, v.Value) |> List.ofSeq }
      | _ ->
        sum.Throw(
          sprintf "Error: type %A is no record and thus has no fields" t
          |> Errors.Singleton
        )

    static member GetCases(t: ExprType) : Sum<Map<CaseName, UnionCase>, Errors> =
      match t with
      | ExprType.UnionType cs -> sum { return cs }
      | _ -> sum.Throw(sprintf "Error: type %A is no union and thus has no cases" t |> Errors.Singleton)

    static member Find (ctx: ParsedFormsContext) (typeId: TypeId) : Sum<ExprType, Errors> =
      sum { return! ctx.TryFindType typeId.TypeName |> Sum.map (fun tb -> tb.Type) }

    static member AsLookupId(t: ExprType) : Sum<TypeId, Errors> =
      sum {
        match t with
        | ExprType.LookupType l -> return l
        | _ -> return! sum.Throw(Errors.Singleton $$"""Error: type {{t}} cannot be converted to a lookup.""")
      }

    static member AsRecord(t: ExprType) : Sum<Map<string, ExprType>, Errors> =
      sum {
        match t with
        | ExprType.RecordType l -> return l
        | _ -> return! sum.Throw(Errors.Singleton $$"""Error: type {{t}} cannot be converted to a record.""")
      }

    static member AsUnion(t: ExprType) : Sum<_, Errors> =
      sum {
        match t with
        | ExprType.UnionType c -> return c
        | _ -> return! sum.Throw(Errors.Singleton $$"""Error: type {{t}} cannot be converted to a union.""")
      }

    static member AsUnit(t: ExprType) : Sum<Unit, Errors> =
      sum {
        match t with
        | ExprType.UnitType -> return ()
        | _ -> return! sum.Throw(Errors.Singleton $$"""Error: type {{t}} cannot be converted to a lookup.""")
      }

    static member ResolveLookup (ctx: ParsedFormsContext) (t: ExprType) : Sum<ExprType, Errors> =
      sum {
        match t with
        | ExprType.LookupType l -> return! ExprType.Find ctx l
        | _ -> return t
      }

  type EnumApi with
    static member Parse
      valueFieldName
      (enumName: string)
      (enumTypeJson: JsonValue)
      : State<Unit, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! enumType = ExprType.Parse enumTypeJson
        let! enumTypeId = enumType |> ExprType.AsLookupId |> state.OfSum
        let! ctx = state.GetState()
        let! enumType = ExprType.ResolveLookup ctx enumType |> state.OfSum
        let! fields = ExprType.GetFields enumType |> state.OfSum

        match fields with
        | [ (value, ExprType.LookupType underlyingUnion) ] when value = valueFieldName ->
          do!
            state.SetState(
              ParsedFormsContext.Updaters.Apis(
                FormApis.Updaters.Enums(
                  Map.add
                    enumName
                    { EnumApi.EnumId = Guid.CreateVersion7()
                      TypeId = enumTypeId
                      EnumName = enumName
                      UnderlyingEnum = underlyingUnion }
                )
              )
            )
        | _ ->
          return!
            state.Throw(
              $$"""Error: invalid enum reference type passed to enum '{{enumName}}'. Expected { {{valueFieldName}}:ENUM }, found {{fields}}."""
              |> Errors.Singleton
            )
      }

  type StreamApi with
    static member Parse
      (streamName: string)
      (streamTypeJson: JsonValue)
      : State<Unit, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! streamType = ExprType.Parse streamTypeJson
        let! streamTypeId = streamType |> ExprType.AsLookupId |> state.OfSum

        do!
          state.SetState(
            ParsedFormsContext.Updaters.Apis(
              FormApis.Updaters.Streams(
                Map.add
                  streamName
                  { StreamApi.StreamId = Guid.CreateVersion7()
                    TypeId = streamTypeId
                    StreamName = streamName }
              )
            )
          )
      }
      |> state.WithErrorContext $"...when parsing stream {streamName}"

  type CrudMethod with
    static member Parse(crudMethodJson: JsonValue) : State<CrudMethod, CodeGenConfig, ParsedFormsContext, Errors> =
      let crudCase name value =
        state {
          do!
            crudMethodJson
            |> JsonValue.AsEnum(Set.singleton name)
            |> state.OfSum
            |> state.Map ignore

          return value
        }

      state.Any(
        NonEmptyList.OfList(
          crudCase "create" CrudMethod.Create,
          [ crudCase "get" CrudMethod.Get
            crudCase "update" CrudMethod.Update
            crudCase "default" CrudMethod.Default ]
        )
      )

  type EntityApi with
    static member Parse
      (entityName: string)
      (entityTypeJson: JsonValue)
      : State<Unit, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! entityTypeFieldJsons = entityTypeJson |> JsonValue.AsRecord |> state.OfSum

        let! typeJson, methodsJson =
          state.All2
            (entityTypeFieldJsons |> state.TryFindField "type")
            (entityTypeFieldJsons |> state.TryFindField "methods")

        let! methodsJson = methodsJson |> JsonValue.AsArray |> state.OfSum
        let! entityType = ExprType.Parse typeJson
        let! entityTypeId = entityType |> ExprType.AsLookupId |> state.OfSum
        let! methods = methodsJson |> Seq.map CrudMethod.Parse |> state.All |> state.Map Set.ofSeq

        do!
          state.SetState(
            ParsedFormsContext.Updaters.Apis(
              FormApis.Updaters.Entities(
                Map.add
                  entityName
                  ({ EntityApi.EntityId = Guid.CreateVersion7()
                     TypeId = entityTypeId
                     EntityName = entityName },
                   methods)
              )
            )
          )
      }
      |> state.WithErrorContext $"...when parsing entity api {entityName}"

  type ParsedFormsContext with
    static member ParseApis
      enumValueFieldName
      (apisJson: seq<string * JsonValue>)
      : State<Unit, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! enumsJson, searchableStreamsJson, entitiesJson =
          state.All3
            (state.Either (apisJson |> state.TryFindField "enumOptions") (state.Return(JsonValue.Record [||])))
            (state.Either (apisJson |> state.TryFindField "searchableStreams") (state.Return(JsonValue.Record [||])))
            (state.Either (apisJson |> state.TryFindField "entities") (state.Return(JsonValue.Record [||])))

        let! enums, streams, entities =
          state.All3
            (enumsJson |> JsonValue.AsRecord |> state.OfSum)
            (searchableStreamsJson |> JsonValue.AsRecord |> state.OfSum)
            (entitiesJson |> JsonValue.AsRecord |> state.OfSum)

        for enumName, enumJson in enums do
          do! EnumApi.Parse enumValueFieldName enumName enumJson

        for streamName, streamJson in streams do
          do! StreamApi.Parse streamName streamJson

        for entityName, entityJson in entities do
          do! EntityApi.Parse entityName entityJson

        return ()
      }
      |> state.MapError(
        Errors.Map(String.appendNewline $$"""...when parsing APIs {{apisJson.ToFSharpString.ReasonablyClamped}}""")
      )

    static member ParseTypes
      (typesJson: seq<string * JsonValue>)
      : State<Unit, CodeGenConfig, ParsedFormsContext, Errors> =
      state {

        let! typesJson =
          typesJson
          |> Seq.map (fun (name, json) ->
            state {
              let typeId: TypeId = { TypeName = name }

              do!
                state.SetState(
                  ParsedFormsContext.Updaters.Types(
                    Map.add
                      name
                      { Type = ExprType.UnitType
                        TypeId = typeId }
                  )
                )

              return name, typeId, json
            })
          |> state.All

        for typeName, typeId, typeJson in typesJson do
          return!
            state {
              let! typeJsonArgs = typeJson |> JsonValue.AsRecord |> state.OfSum

              return!
                state.Any(
                  NonEmptyList.OfList(
                    state {
                      let extendsJson =
                        typeJsonArgs
                        |> sum.TryFindField "extends"
                        |> Sum.toOption
                        |> Option.defaultWith (fun () -> JsonValue.Array [||])

                      let! fieldsJson = typeJsonArgs |> sum.TryFindField "fields" |> state.OfSum

                      return!
                        state {
                          let! extends, fields =
                            state.All2
                              (extendsJson |> JsonValue.AsArray |> state.OfSum)
                              (fieldsJson |> JsonValue.AsRecord |> state.OfSum)

                          let! s = state.GetState()

                          let! extendedTypes =
                            extends
                            |> Seq.map (fun extendsJson ->
                              state {
                                let! parsed = ExprType.Parse extendsJson
                                return! ExprType.ResolveLookup s parsed |> state.OfSum
                              })
                            |> state.All

                          let! fields =
                            fields
                            |> Seq.map (fun (fieldName, fieldType) ->
                              state {
                                let! fieldType = ExprType.Parse fieldType
                                return fieldName, fieldType
                              }
                              |> state.MapError(
                                Errors.Map(String.appendNewline $"\n...when parsing field {fieldName}")
                              ))
                            |> Seq.toList
                            |> state.All

                          let fields = fields |> Map.ofList

                          let! exprType =
                            extendedTypes
                            |> Seq.fold
                              (fun (t1: Sum<ExprType, Errors>) t2 ->
                                sum {
                                  let! t1 = t1
                                  return! ExprType.Extend t1 t2
                                })
                              (Left(ExprType.RecordType fields))
                            |> state.OfSum

                          do!
                            state.SetState(
                              ParsedFormsContext.Updaters.Types(Map.add typeName { Type = exprType; TypeId = typeId })
                            )

                          return ()
                        }
                        |> state.MapError(Errors.WithPriority ErrorPriority.High)
                    },
                    [ state {
                        let typeId: TypeId = { TypeName = typeName }

                        let! parsedType = ExprType.Parse typeJson

                        do!
                          state.SetState(
                            ParsedFormsContext.Updaters.Types(Map.add typeName { Type = parsedType; TypeId = typeId })
                          )
                      }
                      state.Throw(
                        Errors.Singleton
                          $"...unexpected json shape for a type body {typeJson.ToFSharpString.ReasonablyClamped}"
                        |> Errors.WithPriority ErrorPriority.High
                      ) ]
                  )
                )
            }
            |> state.MapError(Errors.Map(String.appendNewline $"\n...when parsing type {typeName}"))
      }
      |> state.MapError(Errors.Map(String.appendNewline $"\n...when parsing types"))

    static member ParseForms
      (formsJson: (string * JsonValue)[])
      : State<Unit, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        for formName, formJson in formsJson do
          let! formType = FormConfig.PreParse formName formJson

          do!
            state.SetState(
              ParsedFormsContext.Updaters.Forms(
                Map.add
                  formName
                  { Body = FormBody.Cases Map.empty
                    FormConfig.TypeId = formType.TypeId
                    FormId = Guid.CreateVersion7()
                    FormName = formName }
              )
            )

        for formName, formJson in formsJson do
          let! formBody = FormConfig.Parse formName formJson
          let! form = state.TryFindForm formName

          do! state.SetState(ParsedFormsContext.Updaters.Forms(Map.add formName { form with Body = formBody.Body }))
      }
      |> state.WithErrorContext $"...when parsing forms"

    static member ParseLaunchers
      (launchersJson: (string * JsonValue)[])
      : State<Unit, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        for launcherName, launcherJson in launchersJson do
          let! (mode, formId) = FormLauncher.Parse launcherName launcherJson

          do!
            state.SetState(
              ParsedFormsContext.Updaters.Launchers(
                Map.add
                  launcherName
                  { LauncherName = launcherName
                    LauncherId = Guid.CreateVersion7()
                    Mode = mode
                    Form = formId }
              )
            )
      }
      |> state.WithErrorContext $"...when parsing launchers"

    static member Parse
      generatedLanguageSpecificConfig
      (json: JsonValue)
      : State<Unit, CodeGenConfig, ParsedFormsContext, Errors> =
      state {
        let! properties = json |> JsonValue.AsRecord |> state.OfSum

        let! typesJson, apisJson, formsJson, launchersJson =
          state.All4
            (properties |> state.TryFindField "types")
            (state.Either (properties |> state.TryFindField "apis") (state.Return(JsonValue.Record [||])))
            (state.Either (properties |> state.TryFindField "forms") (state.Return(JsonValue.Record [||])))
            (state.Either (properties |> state.TryFindField "launchers") (state.Return(JsonValue.Record [||])))

        let! typesJson, apisJson, formsJson, launchersJson =
          state.All4
            (typesJson |> JsonValue.AsRecord |> state.OfSum)
            (apisJson |> JsonValue.AsRecord |> state.OfSum)
            (formsJson |> JsonValue.AsRecord |> state.OfSum)
            (launchersJson |> JsonValue.AsRecord |> state.OfSum)

        do! ParsedFormsContext.ParseTypes typesJson
        do! ParsedFormsContext.ParseApis generatedLanguageSpecificConfig.EnumValueFieldName apisJson
        do! ParsedFormsContext.ParseForms formsJson
        do! ParsedFormsContext.ParseLaunchers launchersJson
      }
