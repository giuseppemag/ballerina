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
    static member Validate (ctx: ParsedFormsContext) (formType: ExprType) (fr: Renderer) : Sum<ExprType, Errors> =
      let (!) = Renderer.Validate ctx formType

      let validateChildren (children: RendererChildren) =
        children.Fields
        |> Seq.map (fun e -> e.Value)
        |> Seq.map (FieldConfig.Validate ctx formType)
        |> sum.All
        |> Sum.map ignore

      sum {
        match fr with
        | Renderer.EnumRenderer(enum, enumRenderer) ->
          do! !enumRenderer |> Sum.map ignore
          return fr.Type
        | Renderer.FormRenderer(f, _, children) ->
          do! children |> validateChildren

          return fr.Type
        | Renderer.ListRenderer(l) ->
          do! !l.List |> Sum.map ignore
          do! !l.Element.Renderer |> Sum.map ignore

          do! l.Children |> validateChildren

          return fr.Type
        | Renderer.MapRenderer(m) ->
          do! !m.Map |> Sum.map ignore
          do! !m.Key.Renderer |> Sum.map ignore
          do! !m.Value.Renderer |> Sum.map ignore

          do! m.Children |> validateChildren

          return fr.Type
        | Renderer.SumRenderer(s) ->
          do! !s.Sum |> Sum.map ignore
          do! !s.Left.Renderer |> Sum.map ignore
          do! !s.Right.Renderer |> Sum.map ignore

          do! s.Children |> validateChildren
          return fr.Type
        | Renderer.PrimitiveRenderer p ->
          do! p.Children |> validateChildren

          return fr.Type
        | Renderer.StreamRenderer(stream, streamRenderer) ->

          do! !streamRenderer |> Sum.map ignore
          return fr.Type
        | Renderer.TupleRenderer t ->
          do! t.Children |> validateChildren
          do! t.Elements |> Seq.map (fun e -> !e.Renderer) |> sum.All |> Sum.map ignore
          return fr.Type
        | Renderer.UnionRenderer r ->
          do! r.Children |> validateChildren

          do!
            r.Cases
            |> Seq.map (fun c -> !c.Value |> Sum.map ignore)
            |> sum.All
            |> Sum.map ignore

          return fr.Type
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

      let validateChildrenPredicates (children: RendererChildren) =
        children.Fields
        |> Seq.map (fun e -> e.Value)
        |> Seq.map (FieldConfig.ValidatePredicates ctx globalType rootType localType)
        |> state.All
        |> state.Map ignore

      state {
        match r with
        | Renderer.PrimitiveRenderer p -> do! p.Children |> validateChildrenPredicates
        | Renderer.EnumRenderer(_, e) -> return! !e
        | Renderer.TupleRenderer e ->
          do! !e.Tuple

          for element in e.Elements do
            do! !!element

          do! e.Children |> validateChildrenPredicates
        | Renderer.ListRenderer e ->
          do! !e.List
          do! !!e.Element

          do! e.Children |> validateChildrenPredicates
        | Renderer.MapRenderer kv ->
          do! !kv.Map
          do! !!kv.Key
          do! !!kv.Value

          do! kv.Children |> validateChildrenPredicates
        | Renderer.SumRenderer s ->
          do! !s.Sum
          do! !!s.Left
          do! !!s.Right

          do! s.Children |> validateChildrenPredicates
        | Renderer.StreamRenderer(_, e) -> return! !e
        | Renderer.FormRenderer(f, e, children) ->
          let! f = ctx.TryFindForm f.FormName |> state.OfSum
          let! s = state.GetState()

          do! children |> validateChildrenPredicates

          do! FormConfig.ValidatePredicates ctx globalType rootType f
        | Renderer.UnionRenderer cs ->
          do! !cs.Union

          do! cs.Children |> validateChildrenPredicates

          do!
            cs.Cases
            |> Seq.map (fun e -> e.Value)
            |> Seq.map (fun c -> Renderer.ValidatePredicates ctx globalType rootType c.Type c)
            |> state.All
            |> state.Map ignore
      }

  and FieldConfig with
    static member Validate (ctx: ParsedFormsContext) (formType: ExprType) (fc: FieldConfig) : Sum<Unit, Errors> =
      sum {
        let! rendererType =
          Renderer.Validate ctx formType fc.Renderer
          |> sum.WithErrorContext $"...when validating renderer"

        match formType with
        | RecordType fields ->
          match fields |> Map.tryFind fc.FieldName with
          | Some fieldType ->
            do!
              ExprType.Unify
                Map.empty
                (ctx.Types |> Map.values |> Seq.map (fun v -> v.TypeId, v.Type) |> Map.ofSeq)
                rendererType
                fieldType
              |> Sum.map ignore

            return ()
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

  and FormFields with
    static member ValidatePredicates
      (ctx: ParsedFormsContext)
      (globalType: TypeBinding)
      (rootType: TypeBinding)
      (localType: ExprType)
      (formFields: FormFields)
      : State<Unit, Unit, ValidationState, Errors> =
      state {
        for f in formFields.Fields do
          do!
            FieldConfig.ValidatePredicates ctx globalType rootType localType f.Value
            |> state.Map ignore

        for tab in formFields.Tabs.FormTabs |> Map.values do
          for col in tab.FormColumns |> Map.values do
            for group in col.FormGroups |> Map.values do
              match group with
              | FormGroup.Computed e ->
                let schema =
                  { tryFindEntity = fun _ -> None
                    tryFindField = fun _ -> None }

                let vars =
                  [ ("global", globalType.Type); ("root", rootType.Type); ("local", localType) ]
                  |> Seq.map (VarName.Create <*> id)
                  |> Map.ofSeq

                let! eType, _ =
                  Expr.typeCheck
                    (ctx.Types |> Seq.map (fun tb -> tb.Value.TypeId, tb.Value.Type) |> Map.ofSeq)
                    schema
                    vars
                    e
                  |> state.OfSum

                let! eTypeSetArg = ExprType.AsSet eType |> state.OfSum
                let! eTypeRefId = ExprType.AsLookupId eTypeSetArg |> state.OfSum

                let! eTypeRef =
                  ctx.Types
                  |> Map.tryFindWithError eTypeRefId.TypeName "types" "types"
                  |> state.OfSum

                let! eTypeRefFields = ExprType.AsRecord eTypeRef.Type |> state.OfSum

                let! eTypeEnum = eTypeRefFields |> Map.tryFindWithError "Value" "fields" "fields" |> state.OfSum
                let! eTypeEnumId = ExprType.AsLookupId eTypeEnum |> state.OfSum

                let! eTypeEnum =
                  ctx.Types
                  |> Map.tryFindWithError eTypeEnumId.TypeName "types" "types"
                  |> state.OfSum

                let! eTypeEnumCases = eTypeEnum.Type |> ExprType.AsUnion |> state.OfSum

                match eTypeEnumCases |> Seq.tryFind (fun c -> c.Value.Fields.IsUnitType |> not) with
                | Some nonUnitCaseFields ->
                  return!
                    state.Throw(
                      Errors.Singleton
                        $"Error: all cases of {eTypeEnum.TypeId.TypeName} should be of type unit (ie the type is a proper enum), but {nonUnitCaseFields.Key} has type {nonUnitCaseFields.Value}"
                    )
                | _ ->
                  let caseNames = eTypeEnumCases.Keys |> Seq.map (fun c -> c.CaseName) |> Set.ofSeq
                  let! fields = localType |> ExprType.AsRecord |> state.OfSum
                  let fields = fields |> Seq.map (fun c -> c.Key) |> Set.ofSeq

                  let missingFields = caseNames - fields

                  if missingFields |> Set.isEmpty |> not then
                    return!
                      state.Throw(
                        Errors.Singleton
                          $"Error: the group provides fields {caseNames |> Seq.toList} but the form type has fields {fields |> Seq.toList}: fields {missingFields |> Seq.toList} are missing from the type and so cannot be part of the visibility!"
                      )
                  else
                    return ()
              | _ -> return ()
      }

    static member Validate (ctx: ParsedFormsContext) (rootType: ExprType) (body: FormFields) : Sum<Unit, Errors> =
      sum.All(
        body.Fields
        |> Map.values
        |> Seq.map (FieldConfig.Validate ctx rootType)
        |> Seq.toList
      )
      |> Sum.map ignore

  and FormBody with
    static member Validate (ctx: ParsedFormsContext) (localType: ExprType) (body: FormBody) : Sum<Unit, Errors> =
      sum {
        match localType, body with
        | ExprType.UnionType typeCases, FormBody.Cases formCases ->
          let typeCaseNames =
            typeCases |> Map.values |> Seq.map (fun c -> c.CaseName) |> Set.ofSeq

          let formCaseNames = formCases.Cases |> Map.keys |> Set.ofSeq

          let missingTypeCases = typeCaseNames - formCaseNames
          let missingFormCases = formCaseNames - typeCaseNames

          if missingTypeCases |> Set.isEmpty |> not then
            return! sum.Throw(Errors.Singleton $"Error: missing type cases {missingTypeCases.ToFSharpString}")
          elif missingFormCases |> Set.isEmpty |> not then
            return! sum.Throw(Errors.Singleton $"Error: missing form cases {missingFormCases.ToFSharpString}")
          else
            do!
              typeCases
              |> Seq.map (fun typeCase ->
                match formCases.Cases |> Map.tryFind typeCase.Key.CaseName with
                | None ->
                  sum.Throw(Errors.Singleton $"Error: cannot find form case for type case {typeCase.Key.CaseName}")
                | Some formCase -> Renderer.Validate ctx typeCase.Value.Fields formCase)
              |> sum.All
              |> Sum.map ignore
        | ExprType.UnionType typeCases, _ ->
          return!
            sum.Throw(
              Errors.Singleton $"Error: the form type is a union, expected cases in the body but found fields instead."
            )
        | _, FormBody.Fields fields -> do! FormFields.Validate ctx localType fields
        | _ -> return! sum.Throw(Errors.Singleton $"Error: mismatched form type and form body")
      }

    static member ValidatePredicates
      (ctx: ParsedFormsContext)
      (globalType: TypeBinding)
      (rootType: TypeBinding)
      (localType: ExprType)
      (body: FormBody)
      : State<Unit, Unit, ValidationState, Errors> =
      state {
        match body with
        | FormBody.Fields fields -> do! FormFields.ValidatePredicates ctx globalType rootType localType fields
        | FormBody.Cases cases ->
          let! typeCases = localType |> ExprType.AsUnion |> state.OfSum

          for case in cases.Cases do
            let! typeCase =
              typeCases
              |> Map.tryFind ({ CaseName = case.Key })
              |> Sum.fromOption (fun () -> Errors.Singleton $"Error: cannot find type case {case.Key}")
              |> state.OfSum

            do! Renderer.ValidatePredicates ctx globalType rootType typeCase.Fields case.Value
      }

  and FormConfig with
    static member Validate (ctx: ParsedFormsContext) (formConfig: FormConfig) : Sum<Unit, Errors> =
      sum {
        let! formType = ctx.TryFindType formConfig.TypeId.TypeName

        do! FormBody.Validate ctx formType.Type formConfig.Body

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

          do! FormBody.ValidatePredicates ctx globalType rootType formType.Type formConfig.Body

          return ()
        else
          // do Console.WriteLine($$"""Prevented reprocessing of form {{processedForm}}""")
          // do Console.ReadLine() |> ignore
          return ()
      }
      |> state.WithErrorContext $"...when validating form predicates for {formConfig.FormName}"

  and FormLauncher with
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

          if cases |> Map.values |> Seq.exists (fun case -> case.Fields.IsUnitType |> not) then
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
            $$"""Error: type {{streamType}} in stream {{streamApi.StreamName}} is invalid: expected fields id:(Guid|string), displayValue:string but found {{fields}}"""
            |> Errors.Singleton
          )

        let! id, displayName = sum.All2((fields |> sum.TryFindField "Id"), (fields |> sum.TryFindField "DisplayValue"))

        match id, displayName with
        | ExprType.PrimitiveType(PrimitiveType.GuidType), ExprType.PrimitiveType(PrimitiveType.StringType)
        | ExprType.PrimitiveType(PrimitiveType.StringType), ExprType.PrimitiveType(PrimitiveType.StringType) ->
          return ()
        | _ -> return! error
      }
      |> sum.WithErrorContext $"...when validating stream {streamApi.StreamName}"

  type ParsedFormsContext with
    static member Validate codegenTargetConfig (ctx: ParsedFormsContext) : State<Unit, Unit, ValidationState, Errors> =
      state {
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

        // do System.Console.WriteLine(ctx.Forms.ToFSharpString)
        // do System.Console.ReadLine() |> ignore

        do!
          sum.All(ctx.Forms |> Map.values |> Seq.map (FormConfig.Validate ctx) |> Seq.toList)
          |> Sum.map ignore
          |> state.OfSum

        for launcher in ctx.Launchers |> Map.values do
          do! FormLauncher.Validate ctx launcher
      }
      |> state.WithErrorContext $"...when validating spec"
