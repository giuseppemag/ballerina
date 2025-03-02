namespace Ballerina.DSL.FormEngine

module Validator =

  open Ballerina.Core.Object
  open Ballerina.DSL.FormEngine.Model
  open Ballerina.DSL.FormEngine.Parser
  open Ballerina.DSL.Model
  open Ballerina.Collections.Tuple
  open Ballerina.DSL.Expr.Model
  open Ballerina.DSL.Expr.Types.Model
  open Ballerina.DSL.Expr.Types.TypeCheck
  open Ballerina.DSL.Expr.Types.Unification
  open Ballerina.Collections.Sum
  open Ballerina.State.WithError
  open Ballerina.Errors
  open Ballerina.Collections.NonEmptyList
  open Ballerina.Fun

  type NestedRenderer with
    static member Validate (ctx: ParsedFormsContext) (formType: ExprType) (fr: NestedRenderer) : Sum<ExprType, Errors> =
      Renderer.Validate ctx formType fr.Renderer

  and Renderer with
    static member GetTypesFreeVars (ctx: ParsedFormsContext) (fr: Renderer) : Sum<Set<TypeId>, Errors> =
      let (+) = sum.Lift2 Set.union
      let (!) = Renderer.GetTypesFreeVars ctx

      match fr with
      | Renderer.EnumRenderer(e, f) -> (ctx.TryFindEnum e.EnumName |> Sum.map (EnumApi.Type >> Set.singleton)) + !f
      | Renderer.FormRenderer(f, _, children) ->
        sum {
          let! f = ctx.TryFindForm f.FormName
          let! (fvars: Set<TypeId>) = f |> FormConfig.GetTypesFreeVars ctx

          let! (cvars: List<Set<TypeId>>) =
            children.Fields
            |> Seq.map (fun e -> e.Value.Renderer)
            |> Seq.map (Renderer.GetTypesFreeVars ctx)
            |> sum.All

          return cvars |> List.fold (Set.union) fvars
        }
      | Renderer.ListRenderer l ->
        sum {
          let! (cvars: List<Set<TypeId>>) =
            l.Children.Fields
            |> Seq.map (fun e -> e.Value.Renderer)
            |> Seq.map (Renderer.GetTypesFreeVars ctx)
            |> sum.All

          let! zero = !l.Element.Renderer + !l.List
          return cvars |> List.fold (Set.union) zero
        }
      | Renderer.MapRenderer m ->
        sum {
          let! (cvars: List<Set<TypeId>>) =
            m.Children.Fields
            |> Seq.map (fun e -> e.Value.Renderer)
            |> Seq.map (Renderer.GetTypesFreeVars ctx)
            |> sum.All

          let! zero = (!m.Map + !m.Key.Renderer + !m.Value.Renderer)
          return cvars |> List.fold (Set.union) zero
        }
      | Renderer.PrimitiveRenderer p ->
        sum {
          let! (cvars: List<Set<TypeId>>) =
            p.Children.Fields
            |> Seq.map (fun e -> e.Value.Renderer)
            |> Seq.map (Renderer.GetTypesFreeVars ctx)
            |> sum.All

          return cvars |> List.fold (Set.union) (p.Type |> ExprType.GetTypesFreeVars)
        }
      | Renderer.StreamRenderer(s, f) ->
        (ctx.TryFindStream s.StreamName |> Sum.map (StreamApi.Type >> Set.singleton))
        + !f
      | Renderer.UnionRenderer cs ->
        sum {
          let! (cvars: List<Set<TypeId>>) =
            cs.Children.Fields
            |> Seq.map (fun e -> e.Value.Renderer)
            |> Seq.map (Renderer.GetTypesFreeVars ctx)
            |> sum.All

          let! (csvars: List<Set<TypeId>>) =
            cs.Cases
            |> Seq.map (fun e -> e.Value.Renderer)
            |> Seq.map (Renderer.GetTypesFreeVars ctx)
            |> sum.All

          return (cvars @ csvars) |> List.fold (Set.union) Set.empty
        }


    static member Validate (ctx: ParsedFormsContext) (formType: ExprType) (fr: Renderer) : Sum<ExprType, Errors> =
      let (!) = Renderer.Validate ctx formType

      sum {
        match fr with
        | Renderer.EnumRenderer(enum, enumRenderer) ->
          let! enum = ctx.TryFindEnum enum.EnumName
          let! enumType = ctx.TryFindType enum.TypeId.TypeName
          let! enumRendererType = !enumRenderer
          return ExprType.Substitute (Map.empty |> Map.add { VarName = "a1" } enumType.Type) enumRendererType
        | Renderer.FormRenderer(f, _, children) ->
          let! f = ctx.TryFindForm f.FormName
          let! localFormType = ctx.TryFindType f.TypeId.TypeName

          do!
            children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.Validate ctx formType)
            |> sum.All
            |> Sum.map ignore

          return localFormType.Type
        | Renderer.ListRenderer(l) ->
          let! genericListRenderer = !l.List
          let! elementRendererType = !l.Element.Renderer

          let listRenderer =
            ExprType.Substitute (Map.empty |> Map.add { VarName = "a1" } elementRendererType) genericListRenderer

          do!
            l.Children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.Validate ctx formType)
            |> sum.All
            |> Sum.map ignore

          return listRenderer
        | Renderer.MapRenderer(m) ->
          let! genericMapRenderer = !m.Map
          let! keyRendererType = !m.Key.Renderer
          let! valueRendererType = !m.Value.Renderer

          let mapRenderer =
            ExprType.Substitute
              (Map.empty
               |> Map.add { VarName = "a1" } keyRendererType
               |> Map.add { VarName = "a2" } valueRendererType)
              genericMapRenderer

          do!
            m.Children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.Validate ctx formType)
            |> sum.All
            |> Sum.map ignore

          return mapRenderer
        | Renderer.PrimitiveRenderer p ->
          do!
            p.Children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.Validate ctx formType)
            |> sum.All
            |> Sum.map ignore

          return p.Type
        | Renderer.StreamRenderer(stream, streamRenderer) ->
          let! stream = ctx.TryFindStream stream.StreamName
          let streamType = ExprType.LookupType stream.TypeId
          let! streamRendererType = !streamRenderer
          return ExprType.Substitute (Map.empty |> Map.add { VarName = "a1" } streamType) streamRendererType
        | Renderer.UnionRenderer r ->
          do!
            r.Children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.Validate ctx formType)
            |> sum.All
            |> Sum.map ignore

          let! caseTypes =
            r.Cases
            |> Seq.map (fun c ->
              sum {
                let! caseType = !c.Value.Renderer

                return
                  { CaseName = c.Key.CaseName
                    Fields = caseType }
              })
            |> sum.All

          let rType = ExprType.UnionType(caseTypes |> List.ofSeq)
          return rType
      }

  and NestedRenderer with
    static member ValidatePredicates
      (ctx: ParsedFormsContext)
      (globalType: TypeBinding)
      (rootType: TypeBinding)
      (localType: ExprType)
      (r: NestedRenderer)
      : State<Unit, Unit, ValidationState, Errors> =
      state {
        let schema =
          { tryFindEntity = fun _ -> None
            tryFindField = fun _ -> None }

        let vars =
          [ ("global", globalType.Type); ("root", rootType.Type); ("local", localType) ]
          |> Seq.map (VarName.Create <*> id)
          |> Map.ofSeq

        do! Renderer.ValidatePredicates ctx globalType rootType localType r.Renderer
      }

  and Renderer with
    static member ValidatePredicates
      (ctx: ParsedFormsContext)
      (globalType: TypeBinding)
      (rootType: TypeBinding)
      (localType: ExprType)
      (r: Renderer)
      : State<Unit, Unit, ValidationState, Errors> =
      let (!) = Renderer.ValidatePredicates ctx globalType rootType localType
      let (!!) = NestedRenderer.ValidatePredicates ctx globalType rootType localType

      state {
        match r with
        | Renderer.PrimitiveRenderer p ->
          do!
            p.Children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.ValidatePredicates ctx globalType rootType localType)
            |> state.All
            |> state.Map ignore
        | Renderer.EnumRenderer(_, e) -> return! !e
        | Renderer.ListRenderer e ->
          do! !e.List
          do! !!e.Element

          do!
            e.Children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.ValidatePredicates ctx globalType rootType localType)
            |> state.All
            |> state.Map ignore
        | Renderer.MapRenderer kv ->
          do! !kv.Map
          do! !!kv.Key
          do! !!kv.Value

          do!
            kv.Children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.ValidatePredicates ctx globalType rootType localType)
            |> state.All
            |> state.Map ignore
        | Renderer.StreamRenderer(_, e) -> return! !e
        | Renderer.FormRenderer(f, e, children) ->
          let! f = ctx.TryFindForm f.FormName |> state.OfSum
          let! s = state.GetState()

          do!
            children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.ValidatePredicates ctx globalType rootType localType)
            |> state.All
            |> state.Map ignore

          do! FormConfig.ValidatePredicates ctx globalType rootType f
        | Renderer.UnionRenderer cs ->
          do! !cs.Union

          do!
            cs.Children.Fields
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (FieldConfig.ValidatePredicates ctx globalType rootType localType)
            |> state.All
            |> state.Map ignore

          do!
            cs.Cases
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (NestedRenderer.ValidatePredicates ctx globalType rootType localType)
            |> state.All
            |> state.Map ignore
      }

  and FieldConfig with
    static member Validate (ctx: ParsedFormsContext) (formType: ExprType) (fc: FieldConfig) : Sum<Unit, Errors> =
      sum {
        match formType with
        | RecordType fields ->
          match fields |> Map.tryFind fc.FieldName with
          | Some fieldType ->
            let! rendererType =
              Renderer.Validate ctx formType fc.Renderer
              |> sum.WithErrorContext $"...when validating renderer"

            let result =
              ExprType.Unify
                Map.empty
                (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq)
                rendererType
                fieldType
              |> Sum.map ignore

            return! result
          | None ->
            return!
              sum.Throw(Errors.Singleton(sprintf "Error: field name %A is not found in type %A" fc.FieldName formType))
        | _ -> return! sum.Throw(Errors.Singleton(sprintf "Error: form type %A is not a record type" formType))
      }
      |> sum.WithErrorContext $"...when validating field {fc.FieldName}"

    static member ValidatePredicates
      (ctx: ParsedFormsContext)
      (globalType: TypeBinding)
      (rootType: TypeBinding)
      (localType: ExprType)
      (fc: FieldConfig)
      : State<Unit, Unit, ValidationState, Errors> =
      state {
        let schema =
          { tryFindEntity = fun _ -> None
            tryFindField = fun _ -> None }

        let vars =
          [ ("global", globalType.Type); ("root", rootType.Type); ("local", localType) ]
          |> Seq.map (VarName.Create <*> id)
          |> Map.ofSeq

        let! visibleExprType, _ =
          Expr.typeCheck
            (ctx.Types |> Seq.map (fun tb -> tb.Value.TypeId, tb.Value.Type) |> Map.ofSeq)
            schema
            vars
            fc.Visible
          |> state.OfSum
        // do System.Console.WriteLine $"{fc.Visible.ToFSharpString}"
        // do System.Console.WriteLine $"{visibleExprType}"
        do!
          ExprType.Unify
            Map.empty
            (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq)
            visibleExprType
            (ExprType.PrimitiveType PrimitiveType.BoolType)
          |> Sum.map ignore
          |> state.OfSum

        match fc.Disabled with
        | Some disabled ->
          let! disabledExprType, _ =
            Expr.typeCheck
              (ctx.Types |> Seq.map (fun tb -> tb.Value.TypeId, tb.Value.Type) |> Map.ofSeq)
              schema
              vars
              disabled
            |> state.OfSum

          do!
            ExprType.Unify
              Map.empty
              (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq)
              disabledExprType
              (ExprType.PrimitiveType PrimitiveType.BoolType)
            |> Sum.map ignore
            |> state.OfSum
        | _ -> return ()

        do! Renderer.ValidatePredicates ctx globalType rootType localType fc.Renderer
      }
      |> state.WithErrorContext $"...when validating field predicates for {fc.FieldName}"

  and FormConfig with
    static member GetTypesFreeVars (ctx: ParsedFormsContext) (fc: FormConfig) : Sum<Set<TypeId>, Errors> =
      let (+) = sum.Lift2 Set.union

      sum { return Set.singleton fc.TypeId }
      + (fc.Fields
         |> Map.values
         |> Seq.map (fun f -> f.Renderer |> Renderer.GetTypesFreeVars ctx)
         |> Seq.fold (+) (sum { return Set.empty }))

    static member Validate (ctx: ParsedFormsContext) (formConfig: FormConfig) : Sum<Unit, Errors> =
      sum {
        let! formType = ctx.TryFindType formConfig.TypeId.TypeName

        do!
          sum.All(
            formConfig.Fields
            |> Map.values
            |> Seq.map (FieldConfig.Validate ctx formType.Type)
            |> Seq.toList
          )
          |> Sum.map ignore
      }
      |> sum.WithErrorContext $"...when validating form config {formConfig.FormName}"

    static member ValidatePredicates
      (ctx: ParsedFormsContext)
      (globalType: TypeBinding)
      (rootType: TypeBinding)
      (formConfig: FormConfig)
      : State<Unit, Unit, ValidationState, Errors> =
      state {
        let! s = state.GetState()

        let processedForm =
          { Form = formConfig |> FormConfig.Id
            GlobalType = globalType.TypeId
            RootType = rootType.TypeId }

        if s.PredicateValidationHistory |> Set.contains processedForm |> not then
          do! state.SetState(ValidationState.Updaters.PredicateValidationHistory(Set.add processedForm))
          let! formType = ctx.TryFindType formConfig.TypeId.TypeName |> state.OfSum

          for f in formConfig.Fields do
            do!
              FieldConfig.ValidatePredicates ctx globalType rootType formType.Type f.Value
              |> state.Map ignore

          return ()
        else
          // do Console.WriteLine($$"""Prevented reprocessing of form {{processedForm}}""")
          // do Console.ReadLine() |> ignore
          return ()
      }
      |> state.WithErrorContext $"...when validating form predicates for {formConfig.FormName}"

  and FormLauncher with
    static member GetTypesFreeVars (ctx: ParsedFormsContext) (fl: FormLauncher) : Sum<Set<TypeId>, Errors> =
      let (+) = sum.Lift2 Set.union

      sum {
        let! form = ctx.TryFindForm fl.Form.FormName
        return! FormConfig.GetTypesFreeVars ctx form
      }

    static member Validate
      (ctx: ParsedFormsContext)
      (formLauncher: FormLauncher)
      : State<Unit, Unit, ValidationState, Errors> =
      state {
        let! formConfig = ctx.TryFindForm formLauncher.Form.FormName |> state.OfSum
        let! formType = ctx.TryFindType formConfig.TypeId.TypeName |> state.OfSum

        match formLauncher.Mode with
        | FormLauncherMode.Create({ EntityApi = entityApi
                                    ConfigEntityApi = configEntityApi })
        | FormLauncherMode.Edit({ EntityApi = entityApi
                                  ConfigEntityApi = configEntityApi }) ->
          let! entityApi = ctx.TryFindEntityApi entityApi.EntityName |> state.OfSum
          let! entityApiType = ctx.TryFindType (entityApi |> fst).TypeId.TypeName |> state.OfSum
          let! configEntityApi = ctx.TryFindEntityApi configEntityApi.EntityName |> state.OfSum

          if Set.ofList [ CrudMethod.Get ] |> Set.isSuperset (configEntityApi |> snd) then
            let! configEntityApiType = ctx.TryFindType (configEntityApi |> fst).TypeId.TypeName |> state.OfSum

            do!
              ExprType.Unify
                Map.empty
                (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq)
                formType.Type
                entityApiType.Type
              |> Sum.map ignore
              |> state.OfSum

            do!
              FormConfig.ValidatePredicates ctx configEntityApiType entityApiType formConfig
              |> state.Map ignore

            match formLauncher.Mode with
            | FormLauncherMode.Create _ ->
              if
                Set.ofList [ CrudMethod.Create; CrudMethod.Default ]
                |> Set.isSuperset (entityApi |> snd)
              then
                return ()
              else
                return!
                  sum.Throw(
                    Errors.Singleton(
                      sprintf
                        "Error in launcher %A: entity APIs for 'create' launchers need at least methods CREATE and DEFAULT, found %A"
                        formLauncher.LauncherName
                        (entityApi |> snd)
                    )
                  )
                  |> state.OfSum
            | _ ->
              if
                Set.ofList [ CrudMethod.Get; CrudMethod.Update ]
                |> Set.isSuperset (entityApi |> snd)
              then
                return ()
              else
                return!
                  sum.Throw(
                    Errors.Singleton(
                      sprintf
                        "Error in launcher %A: entity APIs for 'edit' launchers need at least methods GET and UPDATE, found %A"
                        formLauncher.LauncherName
                        (entityApi |> snd)
                    )
                  )
                  |> state.OfSum
          else
            return!
              sum.Throw(
                Errors.Singleton(
                  sprintf
                    "Error in launcher %A: entity APIs for 'config' launchers need at least method GET, found %A"
                    formLauncher.LauncherName
                    (configEntityApi |> snd)
                )
              )
              |> state.OfSum
        | FormLauncherMode.Passthrough m ->
          let! configEntityType = ctx.TryFindType m.ConfigType.TypeName |> state.OfSum
          let! entityType = ctx.TryFindType formConfig.TypeId.TypeName |> state.OfSum

          do!
            FormConfig.ValidatePredicates ctx configEntityType entityType formConfig
            |> state.Map ignore
      }
      |> state.WithErrorContext $"...when validating launcher {formLauncher.LauncherName}"

  type FormApis with
    static member inline private extractTypes<'k, 'v when 'v: (static member Type: 'v -> TypeId) and 'k: comparison>
      (m: Map<'k, 'v>)
      =
      m
      |> Map.values
      |> Seq.map (fun e -> e |> 'v.Type |> Set.singleton)
      |> Seq.fold (+) Set.empty

    static member GetTypesFreeVars(fa: FormApis) : Set<TypeId> =

      FormApis.extractTypes fa.Enums
      + FormApis.extractTypes fa.Streams
      + FormApis.extractTypes (fa.Entities |> Map.map (fun _ -> fst))

  type EnumApi with
    static member Validate valueFieldName (ctx: ParsedFormsContext) (enumApi: EnumApi) : Sum<Unit, Errors> =
      sum {
        let! enumType = ExprType.Find ctx enumApi.TypeId
        let! enumType = ExprType.ResolveLookup ctx enumType
        let! fields = ExprType.GetFields enumType

        let error =
          sum.Throw(
            $$"""Error: type {{enumType}} in enum {{enumApi.EnumName}} is invalid: expected only one field '{{valueFieldName}}' of type 'enum' but found {{fields}}"""
            |> Errors.Singleton
          )

        match fields with
        | [ (value, valuesType) ] when value = valueFieldName ->
          let! valuesType = ExprType.ResolveLookup ctx valuesType
          let! cases = ExprType.GetCases valuesType

          if cases |> Seq.exists (fun case -> case.Fields.IsUnitType |> not) then
            return! error
          else
            return ()
        | _ -> return! error
      }
      |> sum.WithErrorContext $"...when validating enum {enumApi.EnumName}"

  type StreamApi with
    static member Validate
      (generatedLanguageSpecificConfig: GeneratedLanguageSpecificConfig)
      (ctx: ParsedFormsContext)
      (streamApi: StreamApi)
      : Sum<Unit, Errors> =
      sum {
        let! streamType = ExprType.Find ctx streamApi.TypeId
        let! streamType = ExprType.ResolveLookup ctx streamType
        let! fields = ExprType.GetFields streamType

        let error =
          sum.Throw(
            $$"""Error: type {{streamType}} in stream {{streamApi.StreamName}} is invalid: expected fields id:Guid, displayValue:string but found {{fields}}"""
            |> Errors.Singleton
          )

        match
          fields
          |> Seq.tryFind (
            snd
            >> (function
            | ExprType.PrimitiveType(PrimitiveType.GuidType) -> true
            | _ -> false)
          )
        with
        | Some(id, _) when id = generatedLanguageSpecificConfig.StreamIdFieldName ->
          match
            fields
            |> Seq.tryFind (
              snd
              >> (function
              | ExprType.PrimitiveType(PrimitiveType.StringType) -> true
              | _ -> false)
            )
          with
          | Some(displayValue, _) when displayValue = generatedLanguageSpecificConfig.StreamDisplayValueFieldName ->
            return ()
          | _ -> return! error
        | _ -> return! error
      }
      |> sum.WithErrorContext $"...when validating stream {streamApi.StreamName}"

  type ParsedFormsContext with
    static member GetTypesFreeVars(ctx: ParsedFormsContext) : Sum<Set<TypeId>, Errors> =
      let (+) = sum.Lift2 Set.union
      let zero = sum { return Set.empty }

      (ctx.Forms
       |> Map.values
       |> Seq.map (FormConfig.GetTypesFreeVars ctx)
       |> Seq.fold (+) zero)
      + (ctx.Apis |> FormApis.GetTypesFreeVars |> sum.Return)
      + (ctx.Launchers
         |> Map.values
         |> Seq.map (FormLauncher.GetTypesFreeVars ctx)
         |> Seq.fold (+) zero)

    static member Validate codegenTargetConfig (ctx: ParsedFormsContext) : State<Unit, Unit, ValidationState, Errors> =
      state {
        let! usedTypes = ParsedFormsContext.GetTypesFreeVars ctx |> state.OfSum

        let availableTypes =
          ctx.Types |> Map.values |> Seq.map (fun tb -> tb.TypeId) |> Set.ofSeq

        let missingTypes = (usedTypes - availableTypes) |> Set.toList

        match missingTypes with
        | [] ->
          do!
            sum.All(
              ctx.Apis.Enums
              |> Map.values
              |> Seq.map (EnumApi.Validate codegenTargetConfig.EnumValueFieldName ctx)
              |> Seq.toList
            )
            |> Sum.map ignore
            |> state.OfSum

          do!
            sum.All(
              ctx.Apis.Streams
              |> Map.values
              |> Seq.map (StreamApi.Validate codegenTargetConfig ctx)
              |> Seq.toList
            )
            |> Sum.map ignore
            |> state.OfSum

          do!
            sum.All(ctx.Forms |> Map.values |> Seq.map (FormConfig.Validate ctx) |> Seq.toList)
            |> Sum.map ignore
            |> state.OfSum

          for launcher in ctx.Launchers |> Map.values do
            do! FormLauncher.Validate ctx launcher
        | missingType :: missingTypes ->
          let missingTypeErrors =
            NonEmptyList.OfList(missingType, missingTypes)
            |> NonEmptyList.map (fun t -> Errors.Singleton(sprintf "Error: missing type definition for %s" t.TypeName))
            |> NonEmptyList.reduce (curry Errors.Concat)

          return! state.Throw(missingTypeErrors)
      }
      |> state.WithErrorContext $"...when validating spec"
