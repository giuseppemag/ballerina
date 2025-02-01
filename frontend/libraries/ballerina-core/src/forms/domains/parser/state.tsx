import { List, Map, OrderedMap, OrderedSet, Set } from "immutable";
import { BoolExpr, Unit, Guid, LeafPredicatesEvaluators, Predicate, FormsConfig, BuiltIns, FormDef, Sum, BasicFun, Template, unit, EditFormState, EditFormTemplate, ApiErrors, CreateFormTemplate, EntityFormTemplate, CommonFormState, CreateFormState, EditFormContext, CreateFormContext, Synchronized, simpleUpdater, TypeName, ListFieldState, ListForm, TypeDefinition, BuiltInApiConverters, defaultValue, fromAPIRawValue, toAPIRawValue, EditFormForeignMutationsExpected, MapFieldState, MapForm, Type, Base64FileForm, SecretForm, InjectedPrimitives, Injectables, ApiConverters, Maybe, ApiResponseChecker, Debounced, RendererConfig } from "../../../../main";
import { Value } from "../../../value/state";
import { CollectionReference } from "../collection/domains/reference/state";
import { CollectionSelection } from "../collection/domains/selection/state";
import { BooleanForm, MaybeBooleanForm } from "../primitives/domains/boolean/template";
import { DateFormState } from "../primitives/domains/date/state";
import { DateForm } from "../primitives/domains/date/template";
import { EnumMultiselectForm } from "../primitives/domains/enum-multiselect/template";
import { BaseEnumContext, EnumFormState } from "../primitives/domains/enum/state";
import { EnumForm } from "../primitives/domains/enum/template";
import { NumberForm } from "../primitives/domains/number/template";
import { InfiniteMultiselectDropdownForm } from "../primitives/domains/searchable-infinite-stream-multiselect/template";
import { SearchableInfiniteStreamState } from "../primitives/domains/searchable-infinite-stream/state";
import { SearchableInfiniteStreamForm } from "../primitives/domains/searchable-infinite-stream/template";
import { StringForm } from "../primitives/domains/string/template";
import { FormLabel } from "../singleton/domains/form-label/state";
import { Form } from "../singleton/template";
import { ValueOrErrors } from "../../../collections/domains/valueOrErrors/state";

export type ParsedRenderer = {renderer: any, initialValue: any, initialState: any}


const parseOptions = (leafPredicates: any, options: any) => {
  const result = options.map((_: any) => ([_[0].id, [_[0], (_[1] as BoolExpr<any>).eval<any>(leafPredicates)]]));
  const resultMap = result.reduce((a: any, b: any) => a.set(b[0], b[1]), OrderedMap<any, any>());
  return resultMap;
};

const formViewToViewKind = (viewName: string | undefined, formViews: Record<string, any>, formNames: Set<string>) => {
  if (viewName == undefined) {
    throw `cannot resolve view ${viewName}` // TODO -- better error handling
  }
  if(formNames.has(viewName)){
    return "form";
  }
  const viewTypes = Object.keys(formViews) 
  for (const viewType of viewTypes) {
    if (viewName in formViews[viewType]) {
      return viewType;
    }
  }
  throw `cannot resolve view ${viewName}` // TODO -- better error handling
};

export const RendererParser = <T,>(parsingContext: { formViews: Record<string, Record<string, any>>, forms: ParsedForms, nestedContainerFormView: any, defaultValue: BasicFun<TypeName | Type, any>, enumOptionsSources: EnumOptionsSources, infiniteStreamSources: any, leafPredicates: any, injectedPrimitives?: InjectedPrimitives<T> },
  rendererConfig: RendererConfig): ValueOrErrors<ParsedRenderer, string> => {
    
  const viewKind = formViewToViewKind(rendererConfig.renderer, parsingContext.formViews, parsingContext.forms.keySeq().toSet())
  const rendererKind = viewKind == "form" ? "form" : viewKind == "map" ? "map" : viewKind == "list" ? "list" : "primitive"
  // TODO: improve the default value function to avoid this
  const defaultValueKind = rendererKind == "form" ? rendererConfig.renderer :
                             rendererKind == "map" ? {kind: "application", value: "Map", args: []} as Type:
                               rendererKind == "list" ? {kind: "application", value: "List", args: []} as Type:
                                  viewKind == "enumSingleSelection"  || viewKind == "streamSingleSelection" ? {kind: "application", value: "SingleSelection", args: []} as Type :
                                    viewKind == "enumMultiSelection"  || viewKind == "streamMultiSelection" ? {kind: "application", value: "Multiselection", args: []}  as Type:
                                      rendererKind == "primitive" ? viewKind : undefined;
                                      
  if (defaultValueKind == undefined) {
    return ValueOrErrors.Default.throw(List([`error: the default value for ${viewKind}::${rendererConfig.renderer} cannot be found`]));
  }

  switch (rendererKind) {
    case "primitive":
      return ValueOrErrors.Default.return({
        renderer: FormRenderers(rendererConfig, parsingContext.formViews, viewKind, rendererConfig.renderer, rendererConfig.label, rendererConfig.tooltip, parsingContext.enumOptionsSources, parsingContext.leafPredicates, parsingContext.injectedPrimitives),
        initialValue: parsingContext.defaultValue(defaultValueKind),
        initialState: FormStates(rendererConfig, viewKind, rendererConfig.renderer, parsingContext.infiniteStreamSources, parsingContext.injectedPrimitives)
      })
    case "form":
      return ValueOrErrors.Default.return({
          renderer: parsingContext.forms.get(rendererConfig.renderer)!.form.withView(parsingContext.nestedContainerFormView).mapContext<any>(_ => ({ ..._, label: rendererConfig.label, tooltip: rendererConfig.tooltip })),
          initialValue: parsingContext.defaultValue(defaultValueKind),
          initialState: parsingContext.forms.get(rendererConfig.renderer)!.initialFormState //TODO error handling instead of cast,
      })
    case "list":
        //TODO error handling instead of cast
        return RendererParser(parsingContext, (rendererConfig.elementRenderer as RendererConfig)).Then(parsedElementRenderer => 
                ValueOrErrors.Default.return({renderer: ListForm<any, any, any & FormLabel, Unit>(
                  { Default: () => parsedElementRenderer.initialState },
                  { Default: () => parsedElementRenderer.initialValue },
                  parsedElementRenderer.renderer,
                ).withView(((parsingContext.formViews)[viewKind])[rendererConfig.renderer]() as any)
                  .mapContext<any>(_ => ({ ..._, label: rendererConfig.label, tooltip: rendererConfig.tooltip })),
                    initialValue: parsingContext.defaultValue(defaultValueKind),
                    initialState: ListFieldState<any, any>().Default(Map())
                  })
        )
    case "map":
        //TODO error handling instead of cast
        return RendererParser(parsingContext, (rendererConfig.keyRenderer as RendererConfig)).Then(parsedKeyRenderer =>
                RendererParser(parsingContext, (rendererConfig.valueRenderer as RendererConfig)).Then(parsedValueRenderer => 
                  ValueOrErrors.Default.return({renderer: MapForm<any, any, any, any, any & FormLabel, Unit>(
                    { Default: () => parsedKeyRenderer.initialState },
                    { Default: () => parsedValueRenderer.initialState },
                    { Default: () => parsedKeyRenderer.initialValue },
                    { Default: () => parsedValueRenderer.initialValue },
                    parsedKeyRenderer.renderer,
                    parsedValueRenderer.renderer
                  ).withView(((parsingContext.formViews)[viewKind])[rendererConfig.renderer]() as any)
                    .mapContext<any>(_ => ({ ..._, label: rendererConfig.label, tooltip: rendererConfig.tooltip })),
                    initialValue: parsingContext.defaultValue(defaultValueKind),
                    initialState: MapFieldState<any, any, any, any>().Default(Map())
                  })
                )
          )
      }
}

export const FormRenderers =
  <T,>(rendererConfig: RendererConfig, formViews: Record<string, Record<string, any>>, viewKind: string, viewName: any, label: string | undefined, tooltip: string | undefined, enumOptionsSources: EnumOptionsSources, leafPredicates: any, injectedPrimitives?: InjectedPrimitives<T>): any =>
  {
    if (viewKind == "maybeBoolean")
      return MaybeBooleanForm<any & FormLabel, Unit>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & CommonFormState & Value<boolean>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewKind == "boolean")
      return BooleanForm<any & FormLabel, Unit>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & CommonFormState & Value<boolean>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewKind == "date")
      return DateForm<any & FormLabel, Unit>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & DateFormState & Value<Maybe<Date>>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewKind == "number")
      return NumberForm<any & FormLabel, Unit>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & CommonFormState & Value<number>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewKind == "string")
      return StringForm<any & FormLabel, Unit>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewKind == "enumSingleSelection")
      return EnumForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({
          ..._, label: label, tooltip, getOptions: () => {
            return ((enumOptionsSources as any)((rendererConfig as any).options ?? rendererConfig.api?.enumOptions)() as Promise<any>).then(options => parseOptions(leafPredicates, options))
          }
        })) as any
    if (viewKind == "enumMultiSelection")
      return EnumMultiselectForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({
          ..._, label: label, tooltip, getOptions: () => ((enumOptionsSources as any)(rendererConfig.options ?? rendererConfig.api?.enumOptions)() as Promise<any>).then(options => parseOptions(leafPredicates, options))
        })) as any
    if (viewKind == "streamSingleSelection")
      return SearchableInfiniteStreamForm<CollectionReference, any & FormLabel, Unit>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & SearchableInfiniteStreamState<CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewKind == "streamMultiSelection")
      return InfiniteMultiselectDropdownForm<CollectionReference, any & FormLabel, Unit>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & FormLabel & CommonFormState & SearchableInfiniteStreamState<CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewKind == "base64File")
      return Base64FileForm<any & FormLabel, Unit>()
      .withView(((formViews as any)[viewKind] as any)[viewName]() as any)
        .mapContext<any & FormLabel & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewKind == "secret")
      return SecretForm<any & FormLabel, Unit>()
        .withView(formViews[viewKind][viewName]() as any)
        .mapContext<any & FormLabel & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip })) as any
    // check injectedViews
    if (injectedPrimitives?.injectedPrimitives.has(viewKind as keyof T)) { //TODO error handling instead of cast
      const injectedPrimitive = injectedPrimitives.injectedPrimitives.get(viewKind as keyof T) //TODO error handling instead of cast
      return injectedPrimitive?.fieldView(formViews, viewKind, viewName, label, tooltip) as any
    }
    return `error: the view for ${viewKind as string}::${viewName as string} cannot be found`;
  }

export const FormStates = //<Context, FieldViews extends DefaultFieldViews, InfiniteStreamSources extends {}, InfiniteStreamConfigs extends {}>() => <ViewType extends keyof FieldViews, ViewName extends keyof FieldViews[ViewType]>
<T,>(renderer: RendererConfig, viewType: any, viewName: any, InfiniteStreamSources: any, injectedPrimitives?: InjectedPrimitives<T>): any => {
  if (viewType == "maybeBoolean" || viewType == "boolean" || viewType == "number" || viewType == "string" || viewType == "base64File" || viewType == "secret")
    return {commonFormState: CommonFormState.Default()};
  if( injectedPrimitives?.injectedPrimitives.has(viewType)){
    const injectedPrimitiveDefaultState = injectedPrimitives.injectedPrimitives.get(viewType)?.defaultState;
    return injectedPrimitiveDefaultState != undefined ?
    ({
      customFormState: injectedPrimitiveDefaultState,
      commonFormState: CommonFormState.Default()
    }) : {commonFormState: CommonFormState.Default()};
  }
  if (viewType == "date")
    return DateFormState.Default();
  if (viewType == "enumSingleSelection" || viewType == "enumMultiSelection")
    return EnumFormState<any, any>().Default();
  if (viewType == "streamSingleSelection" || viewType == "streamMultiSelection") {
    return SearchableInfiniteStreamState<any>().Default("", (InfiniteStreamSources as any)(renderer?.stream ?? renderer.api?.stream)); //TODO Error handling
  }
  return `error: the view for ${viewType as string}::${viewName as string} cannot be found when creating the corresponding field form state`;
};

export type ParsedForm = {
  initialFormState: any,
  formConfig: any,
  formName: string,
  formDef: FormDef,
  visibleFields: any,
  disabledFields: any,
}
export const ParseForm = <T,>(
  formName: string,
  formDef: FormDef,
  nestedContainerFormView: any,
  formViews: Record<string, Record<string, any>>,
  forms: ParsedForms,
  fieldsViewsConfig: any,
  infiniteStreamSources: any,
  enumOptionsSources: EnumOptionsSources,
  leafPredicates: any,
  visibleFieldsBoolExprs: any,
  disabledFieldsBoolExprs: any,
  defaultValue: BasicFun<TypeName | Type, any>,
  injectedPrimitives?: InjectedPrimitives<T>
): ParsedForm => {

  const formConfig: any = {};
  const initialFormState: any = {
    commonFormState: CommonFormState.Default(),
    formFieldStates: {},
  };

  const fieldNames = Object.keys(fieldsViewsConfig)

  fieldNames.forEach(fieldName => {
    const parsedFormConfig  = RendererParser(
      {formViews, forms, nestedContainerFormView, defaultValue, enumOptionsSources, leafPredicates, infiniteStreamSources, injectedPrimitives },
      formDef.fields.get(fieldName)! 
    )
    
    if(parsedFormConfig.kind == "errors") throw Error(`Error parsing form ${fieldsViewsConfig[fieldName]}`) // TODO - better error handling

    formConfig[fieldName] = parsedFormConfig.value.renderer
    initialFormState["formFieldStates"][fieldName] = parsedFormConfig.value.initialState

  });
  const visibleFields = parseVisibleFields(
    Object.entries(visibleFieldsBoolExprs), leafPredicates
  );
  const disabledFields = parseVisibleFields(
    Object.entries(disabledFieldsBoolExprs), leafPredicates
  );

  return ({
    initialFormState,
    formName,
    formDef,
    formConfig,
    visibleFields,
    disabledFields,
  });
};

export const parseVisibleFields = (
  visibleFields: Array<[string, BoolExpr<any>]>,
  leafPredicates: LeafPredicatesEvaluators<any, any>): OrderedMap<string, Predicate<any>> => 
{ 
  return OrderedMap(
    visibleFields.map(([fieldName, boolExpr]) => ([fieldName, boolExpr.eval<any>(leafPredicates)]) as any)
  );}

export type EditLauncherContext<Entity, FormState, ExtraContext> =
  Omit<
    EditFormContext<Entity, FormState> &
    EditFormState<Entity, FormState> & {
      extraContext: ExtraContext,
      containerFormView: any,
      submitButtonWrapper: any
    }, "api" | "parser" | "actualForm">

export type CreateLauncherContext<Entity, FormState, ExtraContext> =
  Omit<
    CreateFormContext<Entity, FormState> &
    CreateFormState<Entity, FormState> & {
      extraContext: ExtraContext,
      containerFormView: any,
      submitButtonWrapper: any
    }, "api" | "actualForm">

export type ParsedLaunchers = {
  create: Map<string, <Entity, FormState, ExtraContext, Context extends CreateLauncherContext<Entity, FormState, ExtraContext>>() =>
    {
      form:
      Template<CreateLauncherContext<Entity, FormState, ExtraContext> & CreateFormState<Entity, FormState>,
        CreateFormState<Entity, FormState>, Unit>,
      initialState: CreateFormState<Entity, FormState>
    }>,
  edit: Map<string, <Entity, FormState, ExtraContext, Context extends EditLauncherContext<Entity, FormState, ExtraContext>>() =>
    {
      form:
      Template<EditLauncherContext<Entity, FormState, ExtraContext> & EditFormState<Entity, FormState>,
        EditFormState<Entity, FormState>, EditFormForeignMutationsExpected<Entity, FormState>>,
      initialState: EditFormState<Entity, FormState>
    }>,
}
export type ParsedForms = Map<string, ParsedForm & { form: EntityFormTemplate<any, any, any, any, any> }>
export type FormParsingErrors = List<string>
export type FormParsingResult = Sum<ParsedLaunchers, FormParsingErrors>
export type StreamName = string
export type InfiniteStreamSources = BasicFun<StreamName, SearchableInfiniteStreamState<CollectionReference>["customFormState"]["getChunk"]>
export type EntityName = string
export type EntityApis = {
  create: BasicFun<EntityName, BasicFun<any, Promise<Unit>>>
  default: BasicFun<EntityName, BasicFun<Unit, Promise<any>>>
  update: BasicFun<EntityName, (id: Guid, entity: any) => Promise<ApiErrors>>
  get: BasicFun<EntityName, BasicFun<Guid, Promise<any>>>
}
export type EnumName = string


export type EnumOptionsSources = BasicFun<EnumName, BasicFun<Unit, Promise<Array<[CollectionReference, BoolExpr<Unit>]>>>>
export const parseForms =
  <LeafPredicates, T,>(
    builtIns: BuiltIns,
    injectedPrimitives: InjectedPrimitives<T> | undefined,
    apiConverters: BuiltInApiConverters,
    containerFormView: any,
    nestedContainerFormView: any,
    fieldViews: any,
    infiniteStreamSources: InfiniteStreamSources,
    enumOptionsSources: EnumOptionsSources,
    entityApis: EntityApis,
    leafPredicates: LeafPredicates) =>
    (formsConfig: FormsConfig):
      FormParsingResult => {
      let errors: FormParsingErrors = List()
      let seen = Set<string>()
      let formProcessingOrder = OrderedSet<string>()

      let parsedLaunchers: ParsedLaunchers = {
        create: Map(),
        edit: Map(),
      }
      let parsedForms: ParsedForms = Map()
      const traverse = (formDef: FormDef) => {
        if (formProcessingOrder.has(formDef.name)) {
          return
        }
        if (seen.has(formDef.name)) {
          errors.push(`aborting: cycle detected when parsing forms: ${JSON.stringify(formProcessingOrder.reverse().toArray())} -> ${formDef.name}`)
          return
        }
        seen = seen.add(formDef.name)
        const formType = formsConfig.types.get(formDef.type)!
        formDef.fields.forEach((field, fieldName) => {
          const fieldType = formType.fields.get(fieldName)
          if (fieldType?.kind == "lookup") {
            traverse(formsConfig.forms.get(field.renderer)!)
          }
          try {
            if (fieldType?.kind == "application" && fieldType?.value == "List" && fieldType?.args.length == 1 && field.elementRenderer != undefined) {
              if (typeof field.elementRenderer == "string") throw Error("Deprecated element renderer as string, use a render object instead - check parser.")
              if (formsConfig.forms.has(field.elementRenderer.renderer))
                traverse(formsConfig.forms.get(field.elementRenderer.renderer)!)
            }
            if (fieldType?.kind == "application" && fieldType?.value == "Map" && fieldType?.args.length == 2) {
              const keyRenderer = field.keyRenderer
              const valueRenderer = field.valueRenderer
              if (keyRenderer && formsConfig.forms.has(keyRenderer.renderer)) {
                traverse(formsConfig.forms.get(keyRenderer.renderer)!)
              }
              if (valueRenderer && formsConfig.forms.has(valueRenderer.renderer)) {
                traverse(formsConfig.forms.get(valueRenderer.renderer)!)
              }
            }
          } catch (error) {
            errors.push(`unhandled error: ${JSON.stringify(error)} -> ${formDef.name}`)
          }
        })
        formProcessingOrder = formProcessingOrder.add(formDef.name)
      }
      const allForms = formsConfig.forms.valueSeq().toArray()
      allForms.forEach(form => {
        seen = seen.clear()
        traverse(form)
      })

      formProcessingOrder.forEach(formName => {
        const formConfig = formsConfig.forms.get(formName)!
        const formFieldRenderers = formConfig.fields.map(field => field.renderer).toObject()
        const formFieldVisibilities = formConfig.fields.map(field => field.visible).toObject()
        const formFieldDisabled = formConfig.fields.map(field => field.disabled).toObject()
        try {
          const parsedForm = ParseForm(
            formName,
            formConfig,
            nestedContainerFormView,
            fieldViews,
            parsedForms,
            formFieldRenderers,
            infiniteStreamSources,
            enumOptionsSources,
            leafPredicates,
            formFieldVisibilities,
            formFieldDisabled,
            defaultValue(formsConfig.types, builtIns, injectedPrimitives),
            injectedPrimitives
          )
          const formBuilder = Form<any, any, any, any>().Default<any>()
          const form = formBuilder.template({
            ...(parsedForm.formConfig)
          })
          .mapContext<Unit>(_ => {
            return ({ 
                      value: (_ as any).value,
                      commonFormState: (_ as any).commonFormState,
                      formFieldStates: (_ as any).formFieldStates,
                      rootValue: (_ as any).rootValue,
                      extraContext: (_ as any).extraContext,
                      disabledFields: parsedForm.disabledFields,
                      visibleFields: parsedForm.visibleFields,
                      layout: formConfig.tabs })})

          parsedForms = parsedForms.set(formName, { ...parsedForm, form })
        } catch (error: any) {
          errors.push(error.message ?? error)
        }
      })

      if (errors.size > 0) {
        // TODO: these errors are not being conveyed well anywhere
        return Sum.Default.right(errors)
      }

      formsConfig.launchers.edit.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form
        const initialState = parsedForm.initialFormState
        const api = {
          get: (id: string) => entityApis.get(launcher.api)(id).then((raw: any) => {
            return fromAPIRawValue({ kind: "lookup", name: parsedForm.formDef.type }, formsConfig.types, builtIns, apiConverters, injectedPrimitives)(raw)
          }),
          update: (id: any, parsed: any) => {
            return parsed.kind =="errors" ? Promise.reject(parsed.errors) : entityApis.update(launcher.api)(id, parsed.value)  
          }
        }
        parsedLaunchers.edit = parsedLaunchers.edit.set(
          launcherName,
          <Entity, FormState, ExtraContext, Context extends EditLauncherContext<Entity, FormState, ExtraContext>>() => ({
            form: EditFormTemplate<Entity, FormState>().mapContext((parentContext: Context) =>
              ({
                value: parentContext.entity.sync.kind == "loaded" ? parentContext.entity.sync.value : undefined,
                entity: parentContext.entity,
                entityId: parentContext.entityId,
                commonFormState: parentContext.commonFormState,
                customFormState: parentContext.customFormState,
                formFieldStates: parentContext.formFieldStates,
                extraContext: parentContext.extraContext,
                api: api,
                parser: (value: any, formState: any) => toAPIRawValue({ kind: "lookup", name: parsedForm.formDef.type }, formsConfig.types, builtIns, apiConverters, injectedPrimitives)(value, formState),
                actualForm: form.withView(containerFormView).mapContext((_: any) => ({
                  value: _.value,
                  formFieldStates: parentContext.formFieldStates, 
                  rootValue: _.value,
                  extraContext: parentContext.extraContext,
                  commonFormState: parentContext.commonFormState
                   }))
              }) as any)
              .withViewFromProps(props => props.context.submitButtonWrapper)
              .mapForeignMutationsFromProps(props => props.foreignMutations as any),
            initialState: EditFormState<Entity, FormState>().Default(initialState.formFieldStates, initialState.commonFormState, {
              initApiChecker: ApiResponseChecker.Default(true),
              updateApiChecker: ApiResponseChecker.Default(true),
              apiRunner: Debounced.Default(Synchronized.Default(unit))
            }),
          })
        )
      })

      formsConfig.launchers.create.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form
        const initialState = parsedForm.initialFormState
        const api = {
          default: (_: Unit) => entityApis.default(launcher.api)(unit)
            .then((raw: any) => {
              return fromAPIRawValue({ kind: "lookup", name: parsedForm.formDef.type }, formsConfig.types, builtIns, apiConverters, injectedPrimitives)(raw)
            }),
          create: (parsed: any) => {
            return parsed.kind == "errors" ? Promise.reject(parsed.errors) : entityApis.create(launcher.api)(parsed.value)
          },
        }
        parsedLaunchers.create = parsedLaunchers.create.set(
          launcherName,
          <Entity, FormState, ExtraContext, Context extends CreateLauncherContext<Entity, FormState, ExtraContext>>() => ({
            form: CreateFormTemplate<Entity, FormState>().mapContext((parentContext: Context) =>
              { 
                return ({
                  apiRunner: parentContext.customFormState.apiRunner,
                  parser: (value: any, formState: any) => toAPIRawValue({ kind: "lookup", name: parsedForm.formDef.type }, formsConfig.types, builtIns, apiConverters, injectedPrimitives)(value, formState),
                  value: parentContext.entity.sync.kind == "loaded" ? parentContext.entity.sync.value : undefined,
                  entity: parentContext.entity,
                  commonFormState: parentContext.commonFormState,
                  customFormState: parentContext.customFormState,
                  formFieldStates: parentContext.formFieldStates,
                  api: api,
                  actualForm: form.withView(containerFormView)
                  .mapContext((_: any) => {
                    return ({ 
                      value: _.value,
                      formFieldStates: parentContext.formFieldStates, 
                      rootValue: _.value,
                      extraContext: parentContext.extraContext,
                      commonFormState: parentContext.commonFormState })
                  })
              }) as any})
              .withViewFromProps(props => props.context.submitButtonWrapper)
              .mapForeignMutationsFromProps(props => props.foreignMutations as any),
            initialState: CreateFormState<any, any>().Default(initialState.formFieldStates, initialState.commonFormState,
             {
              initApiChecker:ApiResponseChecker.Default(true),
              createApiChecker:ApiResponseChecker.Default(true),
              apiRunner: Debounced.Default(Synchronized.Default(unit))
            }),
          })
        )
      })

      if (errors.size > 0) {
        return Sum.Default.right(errors)
      }
      return Sum.Default.left(parsedLaunchers)
    }

export type FormsParserContext<T extends {[key in keyof T] : {type: any, state: any}}> = {
  containerFormView: any,
  nestedContainerFormView: any,
  fieldViews: any,
  fieldTypeConverters: ApiConverters<T>,
  infiniteStreamSources: InfiniteStreamSources,
  enumOptionsSources: EnumOptionsSources,
  entityApis: EntityApis,
  leafPredicates: any,
  getFormsConfig: BasicFun<void, Promise<any>>
  injectedPrimitives?: Injectables<T>,
}
export type FormsParserState = {
  formsConfig: Synchronized<Unit, FormParsingResult>
}
export const FormsParserState = {
  Default: (): FormsParserState => ({
    formsConfig: Synchronized.Default(unit)
  }),
  Updaters: {
    ...simpleUpdater<FormsParserState>()("formsConfig")
  }
}
