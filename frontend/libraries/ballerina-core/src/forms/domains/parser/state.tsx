import { List, Map, OrderedMap, OrderedSet, Set } from "immutable";
import { BoolExpr, Unit, Guid, LeafPredicatesEvaluators, Predicate, FormsConfig, BuiltIns, FormDef, Sum, BasicFun, Template, unit, EditFormState, EditFormTemplate, ApiErrors, CreateFormTemplate, EntityFormTemplate, CommonFormState, CreateFormState, EditFormContext, CreateFormContext, Synchronized, simpleUpdater, TypeName, ListFieldState, ListForm, TypeDefinition, BuiltInApiConverters, defaultValue, fromAPIRawValue, toAPIRawValue, EditFormForeignMutationsExpected, MapFieldState, MapForm, Type, FieldConfig, Base64FileForm, SecretForm, InjectedPrimitives, Injectables, ApiConverters, Maybe, ApiResponseChecker, Debounced } from "../../../../main";
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

const parseOptions = (leafPredicates: any, options: any) => {
  const result = options.map((_: any) => ([_[0].id, [_[0], (_[1] as BoolExpr<any>).eval<any>(leafPredicates)]]));
  const resultMap = result.reduce((a: any, b: any) => a.set(b[0], b[1]), OrderedMap<any, any>());
  return resultMap;
};

export const FieldView = //<Context, FieldViews extends DefaultFieldViews, EnumFieldConfigs extends {}, EnumSources extends {}>() => <ViewType extends keyof FieldViews, ViewName extends keyof FieldViews[ViewType]>
  <T,>(fieldConfig:FieldConfig, fieldViews: any, viewType: any, viewName: any, label: string | undefined, tooltip: string | undefined, enumFieldConfigs: EnumOptionsSources, enumSources: any, leafPredicates: any, injectedPrimitives?: InjectedPrimitives<T>): any =>
  {
    if (viewType == "maybeBoolean")
      return MaybeBooleanForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & CommonFormState & Value<boolean>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewType == "boolean")
      return BooleanForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & CommonFormState & Value<boolean>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewType == "date")
      return DateForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & DateFormState & Value<Maybe<Date>>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewType == "number")
      return NumberForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & CommonFormState & Value<number>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewType == "string")
      return StringForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewType == "enumSingleSelection")
      return EnumForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({
          ..._, label: label, tooltip, getOptions: () => {
            return ((enumFieldConfigs as any)((fieldConfig as any).options ?? fieldConfig.api.enumOptions)() as Promise<any>).then(options => parseOptions(leafPredicates, options))
          }
        })) as any
    if (viewType == "enumMultiSelection")
      return EnumMultiselectForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({
          ..._, label: label, tooltip, getOptions: () => ((enumFieldConfigs as any)((fieldConfig as any).options ?? fieldConfig.api.enumOptions)() as Promise<any>).then(options => parseOptions(leafPredicates, options))
        })) as any
    if (viewType == "streamSingleSelection")
      return SearchableInfiniteStreamForm<CollectionReference, any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SearchableInfiniteStreamState<CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewType == "streamMultiSelection")
      return InfiniteMultiselectDropdownForm<CollectionReference, any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & FormLabel & CommonFormState & SearchableInfiniteStreamState<CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewType == "base64File")
      return Base64FileForm<any & FormLabel, Unit>()
      .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & FormLabel & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip })) as any
    if (viewType == "secret")
      return SecretForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & FormLabel & CommonFormState & Value<string>>(_ => ({ ..._, label: label, tooltip })) as any
    // check injectedViews
    if (injectedPrimitives?.injectedPrimitives.has(viewType)) {
      const injectedPrimitive = injectedPrimitives.injectedPrimitives.get(viewType)
      return injectedPrimitive?.fieldView(fieldViews, viewType, viewName, label, tooltip) as any
    }
    return `error: the view for ${viewType as string}::${viewName as string} cannot be found`;
  }

export const FieldFormState = //<Context, FieldViews extends DefaultFieldViews, InfiniteStreamSources extends {}, InfiniteStreamConfigs extends {}>() => <ViewType extends keyof FieldViews, ViewName extends keyof FieldViews[ViewType]>
  <T,>(fieldConfig:FieldConfig, fieldViews: any, viewType: any, viewName: any, fieldName: string, InfiniteStreamSources: any, infiniteStreamConfigs: any, injectedPrimitives?: InjectedPrimitives<T>): any => {
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
      return SearchableInfiniteStreamState<any>().Default("", (InfiniteStreamSources as any)((fieldConfig as any).stream ?? fieldConfig.api.stream));
    }
    if (viewType == "list")
      return ListFieldState<any, any>().Default(Map())
    if (viewType == "map")
      return MapFieldState<any, any, any, any>().Default(Map())
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
  containerFormView: any,
  nestedContainerFormView: any,
  fieldViews: any,
  otherForms: ParsedForms,
  fieldsViewsConfig: any,
  formFieldElementRenderers: any,
  formFieldKeyRenderers: any,
  formFieldValueRenderers: any,
  fieldsInfiniteStreamsConfig: any,
  fieldsOptionsConfig: any,
  InfiniteStreamSources: any,
  EnumOptionsSources: EnumOptionsSources,
  leafPredicates: any,
  visibleFieldsBoolExprs: any,
  disabledFieldsBoolExprs: any,
  defaultValue: BasicFun<TypeName | Type, any>,
  type: TypeDefinition,
  injectedPrimitives?: InjectedPrimitives<T>
): ParsedForm => {
  const fieldNameToViewCategory = (fieldName: string) => {
    const fieldViewCategories = Object.keys(fieldViews)
    const viewName = (fieldsViewsConfig as any)[fieldName];
    for (const categoryName of fieldViewCategories) {
      const viewCategory = (fieldViews as any)[categoryName];
      if (viewName in viewCategory) {
        return categoryName;
      }
    }
    throw `cannot resolve view ${viewName} of field ${fieldName}`
  };
  const fieldNameToElementViewCategory = (formFieldKeyOrValueRenderers:any) => (fieldName: string) => {
    const fieldViewCategories = Object.keys(fieldViews)
    let viewName = (formFieldKeyOrValueRenderers as any)[fieldName];
    viewName = viewName?.renderer ?? viewName
    for (const categoryName of fieldViewCategories) {
      const viewCategory = (fieldViews as any)[categoryName];
      if (viewName in viewCategory) {
        return categoryName;
      }
    }
    throw `cannot resolve view ${viewName} of field ${fieldName}`
  };

  const initialFormState: any = {
    commonFormState: CommonFormState.Default(),
    formFieldStates: {},
  };
  Object.keys(fieldsViewsConfig).forEach(fieldName => {
    const viewName = (fieldsViewsConfig as any)[fieldName];
    const fieldConfig = formDef.fields.get(fieldName)!
    initialFormState.formFieldStates[fieldName] =
      otherForms.get(viewName)?.initialFormState ??
      FieldFormState(fieldConfig, fieldViews, fieldNameToViewCategory(fieldName) as any, (fieldsViewsConfig as any)[fieldName], fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig, injectedPrimitives);
    if (typeof initialFormState.formFieldStates[fieldName] == "string") {
      throw `cannot resolve initial state ${viewName} of field ${fieldName}`
    }
  });
  const formConfig: any = {};
  const fieldNames = Object.keys(fieldsViewsConfig)
  fieldNames.forEach(fieldName => {
    const label = formDef.fields.get(fieldName)!.label
    const tooltip = formDef.fields.get(fieldName)!.tooltip
    const fieldConfig = formDef.fields.get(fieldName)!
    const viewName = (fieldsViewsConfig as any)[fieldName];
    const otherForm = otherForms.get(viewName)
    if (otherForm != undefined) {
      formConfig[fieldName] = otherForm.form.withView(nestedContainerFormView).mapContext<any>(_ => ({ ..._, label, tooltip }))
    } else {
      const viewType = fieldNameToViewCategory(fieldName) as any
      if (viewType == "list") {
        const elementRenderer = formFieldElementRenderers[fieldName]
        const elementRendererName = elementRenderer?.renderer
        const field = type.fields.get(fieldName)!
        
        const initialElementValue = defaultValue(field.kind == "primitive" ? field.value : field.kind == "lookup" ? field.name : field.args[0])
        const elementLabel = elementRenderer?.label
        const elementTooltip = elementRenderer?.tooltip
        const elementForm = otherForms.get(elementRenderer.renderer)

        if (elementForm != undefined) { // the list argument is a nested form
          const initialFormState = elementForm.initialFormState
          formConfig[fieldName] = ListForm<any, any, any & FormLabel, Unit>(
            { Default: () => ({ ...initialFormState }) },
            { Default: () => ({ ...initialElementValue }) },
            elementForm.form.withView(nestedContainerFormView).mapContext<any>(_ => ({ ..._, label: elementLabel, tooltip: elementTooltip }))
          ).withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any>(_ => ({ ..._, label, tooltip }))
        } else { // the list argument is a primitive
          const elementForm = FieldView(fieldConfig, fieldViews, fieldNameToElementViewCategory(formFieldElementRenderers)(fieldName) as any, elementRendererName, elementLabel, elementTooltip, EnumOptionsSources, fieldsOptionsConfig, leafPredicates, injectedPrimitives)
          const initialFormState = FieldFormState(fieldConfig, fieldViews, fieldNameToElementViewCategory(formFieldElementRenderers)(fieldName) as any, elementRendererName, fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig, injectedPrimitives);
          formConfig[fieldName] = ListForm<any, any, any & FormLabel, Unit>(
            { Default: () => initialFormState },
            { Default: () => initialElementValue },
            elementForm,
          ).withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any>(_ => ({ ..._, label, tooltip, }))
        }
      } else {
        if (viewType == "map") {
          const field = type.fields.get(fieldName)!
          // TODO - reconsider error handling approach here in general
          if(field.kind != "application") {
            throw `error processing field type ${JSON.stringify(field)} of ${fieldName}`
          }

          const [keyType, valueType] =  [field.args[0], field.args[1]]
          const initialKeyValue = defaultValue(keyType)
          const initialValueValue = defaultValue(valueType)
          const getFormAndInitialState = (elementRenderers:any, rendererName:any, fieldConfig:FieldConfig) => {
            const formDef = otherForms.get(rendererName)
            const elementLabel = elementRenderers[fieldName].label
            const elementTooltip = elementRenderers[fieldName].tooltip
            if (formDef != undefined) {
              return [
                formDef.form.withView(nestedContainerFormView).mapContext<any>(_ => ({ ..._, label: elementLabel, tooltip: elementTooltip })),
                formDef.initialFormState
              ]
            } else {
              const categoryName = fieldNameToElementViewCategory(elementRenderers)(fieldName) as any
              const form = FieldView(fieldConfig, fieldViews, categoryName, rendererName, elementLabel, elementTooltip, EnumOptionsSources, fieldsOptionsConfig, leafPredicates, injectedPrimitives)
              const initialFormState = FieldFormState(fieldConfig, fieldViews, categoryName, rendererName, fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig, injectedPrimitives);
              return [
                form,
                initialFormState
              ]
            }
          }
          // alert(JSON.stringify([formFieldKeyValueRenderers[fieldName]]))
          // alert(JSON.stringify([formFieldKeyValueRenderers]))
          const keyRendererName = formFieldKeyRenderers[fieldName]
          const valueRendererName = formFieldValueRenderers[fieldName]
          const [keyForm,keyFormInitialState] = getFormAndInitialState(formFieldKeyRenderers, keyRendererName?.renderer ?? keyRendererName, keyRendererName as FieldConfig)
          const [valueForm,valueFormInitialState] = getFormAndInitialState(formFieldValueRenderers, valueRendererName?.renderer ?? valueRendererName, valueRendererName as FieldConfig)
          formConfig[fieldName] = MapForm<any, any, any, any, any & FormLabel, Unit>(
            { Default: () => keyFormInitialState },
            { Default: () => valueFormInitialState },
            { Default: () => initialKeyValue },
            { Default: () => initialValueValue },
            keyForm,
            valueForm
          ).withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any>(_ => ({ ..._, label, tooltip }))
        } else {
          formConfig[fieldName] = FieldView(fieldConfig, fieldViews, viewType, viewName, label, tooltip, EnumOptionsSources, fieldsOptionsConfig, leafPredicates, injectedPrimitives);
        }
      }
    }
    if (typeof formConfig[fieldName] == "string") {
      const err = formConfig[fieldName]
      console.error(`error processing field ${fieldName}`, err)
      formConfig[fieldName] = (props: any) => <>Error: field {fieldName} with {viewName} could not be instantiated</>
      throw err
    }
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
            if (fieldType?.kind == "application" && fieldType?.value == "Map" && fieldType?.args.length == 2 && field.mapRenderer != undefined) {
              const mapRenderer = field.mapRenderer
              if (mapRenderer && formsConfig.forms.has(mapRenderer.keyRenderer.renderer)) {
                traverse(formsConfig.forms.get(mapRenderer.keyRenderer.renderer)!)
              }
              if (mapRenderer && formsConfig.forms.has(mapRenderer.valueRenderer.renderer)) {
                traverse(formsConfig.forms.get(mapRenderer.valueRenderer.renderer)!)
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
        const formFieldStreams = formConfig.fields.filter(field => field.api.stream != undefined).map(field => field.api.stream).toObject()
        const formFieldEnumOptions = formConfig.fields.filter(field => field.api.enumOptions != undefined).map(field => field.api.enumOptions).toObject()
        const formFieldElementRenderers = formConfig.fields.filter(field => field.elementRenderer != undefined).map(field => field.elementRenderer).toObject()
        const formFieldKeyRenderers = formConfig.fields.filter(field => field.mapRenderer != undefined).map(field => field.mapRenderer?.keyRenderer).toObject()
        const formFieldValueRenderers = formConfig.fields.filter(field => field.mapRenderer != undefined).map(field => field.mapRenderer?.valueRenderer).toObject()
        try {
          const parsedForm = ParseForm(
            formName,
            formConfig,
            containerFormView,
            nestedContainerFormView,
            fieldViews,
            parsedForms,
            formFieldRenderers,
            formFieldElementRenderers,
            formFieldKeyRenderers,
            formFieldValueRenderers,
            formFieldStreams,
            formFieldEnumOptions,
            infiniteStreamSources,
            enumOptionsSources,
            leafPredicates,
            formFieldVisibilities,
            formFieldDisabled,
            defaultValue(formsConfig.types, builtIns, injectedPrimitives),
            formConfig.typeDef,
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
                  //  ..._, rootValue: _.value, ...parentContext.extraContext
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
