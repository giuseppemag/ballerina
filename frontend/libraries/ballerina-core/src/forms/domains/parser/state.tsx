import { Collection, Map, OrderedMap, OrderedSet, Set } from "immutable";
import { BoolExpr, Unit, PromiseRepo, Guid, LeafPredicatesEvaluators, Predicate, FormsConfig, BuiltIns, FormDef, Sum, BasicFun, Template, unit, EditFormState, EditFormTemplate, ApiErrors, CreateFormTemplate, EntityFormTemplate, SharedFormState, CreateFormState, Entity, EditFormContext, CreateFormContext, MappedEntityFormTemplate, Mapping, FormValidationResult, Synchronized, simpleUpdater, PrimitiveBuiltIn, GenericBuiltIn, TypeName, ListFieldState, ListForm, TypeDefinition } from "../../../../main";
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
  (fieldViews: any, viewType: any, viewName: any, fieldName: string, label: string, enumFieldConfigs: any, enumSources: any, leafPredicates: any): any => // FieldView<Context, FieldViews, ViewType, ViewName> => 
  {
    if (viewType == "MaybeBooleanViews")
      return MaybeBooleanForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<boolean>>(_ => ({ ..._, label: label })) as any
    if (viewType == "BooleanViews")
      return BooleanForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<boolean>>(_ => ({ ..._, label: label })) as any
    if (viewType == "DateViews")
      return DateForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & DateFormState & Value<Date>>(_ => ({ ..._, label: label })) as any
    if (viewType == "NumberViews")
      return NumberForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<number>>(_ => ({ ..._, label: label })) as any
    if (viewType == "StringViews")
      return StringForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<string>>(_ => ({ ..._, label: label })) as any
    if (viewType == "EnumViews")
      return EnumForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({
          ..._, label: label, getOptions: () => ((enumFieldConfigs as any)((enumSources as any)[fieldName]) as Promise<any>).then(options => parseOptions(leafPredicates, options))
        })) as any
    if (viewType == "EnumMultiselectViews")
      return EnumMultiselectForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({
          ..._, label: label, getOptions: () => ((enumFieldConfigs as any)((enumSources as any)[fieldName]) as Promise<any>).then(options => parseOptions(leafPredicates, options))
        })) as any
    if (viewType == "InfiniteStreamViews")
      return SearchableInfiniteStreamForm<CollectionReference, any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SearchableInfiniteStreamState<CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({ ..._, label: label })) as any
    if (viewType == "InfiniteStreamMultiselectViews")
      return InfiniteMultiselectDropdownForm<CollectionReference, any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & FormLabel & SharedFormState & SearchableInfiniteStreamState<CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({ ..._, label: label })) as any
    return `error: the view for ${viewType as string}::${viewName as string} cannot be found`;
  }

export const FieldFormState = //<Context, FieldViews extends DefaultFieldViews, InfiniteStreamSources extends {}, InfiniteStreamConfigs extends {}>() => <ViewType extends keyof FieldViews, ViewName extends keyof FieldViews[ViewType]>
  (fieldViews: any, viewType: any, viewName: any, fieldName: string, InfiniteStreamSources: any, infiniteStreamConfigs: any): any => {
    if (viewType == "MaybeBooleanViews" || viewType == "BooleanViews" || viewType == "NumberViews" || viewType == "StringViews")
      return SharedFormState.Default();
    if (viewType == "DateViews")
      return DateFormState.Default("");
    if (viewType == "EnumViews" || viewType == "EnumMultiselectViews")
      return ({ ...EnumFormState<any, any>().Default(), ...SharedFormState.Default() });
    if (viewType == "InfiniteStreamViews" || viewType == "InfiniteStreamMultiselectViews") {
      return ({
        ...SearchableInfiniteStreamState<any>().Default("", (InfiniteStreamSources as any)((infiniteStreamConfigs as any)[fieldName])
        ), ...SharedFormState.Default()
      });
    }
    if (viewType == "ListViews")
      return ListFieldState<any, any>().Default(Map())
    return `error: the view for ${viewType as string}::${viewName as string} cannot be found when creating the corresponding field form state`;
  };

export type ParsedForm = {
  initialFormState: any,
  formConfig: any,
  visibleFields: any,
  disabledFields: any,
}
export const ParseForm = (
  formDef: FormDef,
  containerFormView: any,
  nestedContainerFormView: any,
  fieldViews: any,
  otherForms: ParsedForms,
  fieldsViewsConfig: any,
  formFieldElementRenderers: any,
  fieldsInfiniteStreamsConfig: any,
  fieldsOptionsConfig: any,
  InfiniteStreamSources: any,
  EnumOptionsSources: any,
  leafPredicates: any,
  visibleFieldsBoolExprs: any,
  disabledFieldsBoolExprs: any,
  defaultValue: BasicFun<TypeName, any>,
  type: TypeDefinition
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
  const fieldNameToElementViewCategory = (fieldName: string) => {
    const fieldViewCategories = Object.keys(fieldViews)
    const viewName = (formFieldElementRenderers as any)[fieldName];
    for (const categoryName of fieldViewCategories) {
      const viewCategory = (fieldViews as any)[categoryName];
      if (viewName in viewCategory) {
        return categoryName;
      }
    }
    throw `cannot resolve view ${viewName} of field ${fieldName}`
  };

  const initialFormState: any = SharedFormState.Default();
  Object.keys(fieldsViewsConfig).forEach(fieldName => {
    const viewName = (fieldsViewsConfig as any)[fieldName];
    initialFormState[fieldName] =
      otherForms.get(viewName)?.initialFormState ??
      FieldFormState(fieldViews, fieldNameToViewCategory(fieldName) as any, (fieldsViewsConfig as any)[fieldName], fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig);
    if (typeof initialFormState[fieldName] == "string") {
      throw `cannot resolve initial state ${viewName} of field ${fieldName}`
    }
  });
  const formConfig: any = {};
  console.log(fieldsViewsConfig)
  console.log(Object.keys(fieldsViewsConfig))
  Object.keys(fieldsViewsConfig).forEach(fieldName => {
    const label = formDef.fields.get(fieldName)!.label
    const viewName = (fieldsViewsConfig as any)[fieldName];
    const otherForm = otherForms.get(viewName)
    if (otherForm != undefined) {
      formConfig[fieldName] = otherForm.form.withView(nestedContainerFormView).mapContext<any>(_ => ({ ..._, label: label }))
    } else {
      const viewType = fieldNameToViewCategory(fieldName) as any
      if (viewType == "ListViews") {
        const elementRendererName = formFieldElementRenderers[fieldName]
        const field = type.fields.get(fieldName)!
        const initialElementValue = defaultValue(field.kind == "primitive" ? field.value : field.kind == "lookup" ? field.name : field.args[0])
        const elementForm = otherForms.get(elementRendererName)
        if (elementForm != undefined) { // the list argument is a nested form
          const initialFormState = elementForm.initialFormState
          formConfig[fieldName] = ListForm<any, any, any & FormLabel, Unit>(
            { Default: () => ({ ...initialFormState }) },
            { Default: () => ({ ...initialElementValue }) },
            _ => PromiseRepo.Default.mock(() => []),
            elementForm.form.withView(nestedContainerFormView)
          ).withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any>(_ => ({ ..._, label: label }))
        } else { // the list argument is a primitive
          const elementForm = FieldView(fieldViews, fieldNameToElementViewCategory(fieldName) as any, elementRendererName, fieldName, label, EnumOptionsSources, fieldsOptionsConfig, leafPredicates)
          const initialFormState = FieldFormState(fieldViews, fieldNameToElementViewCategory(fieldName) as any, elementRendererName, fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig);
          formConfig[fieldName] = ListForm<any, any, any & FormLabel, Unit>(
            { Default: () => initialFormState },
            { Default: () => initialElementValue },
            _ => PromiseRepo.Default.mock(() => []),
            elementForm
          ).withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any>(_ => ({ ..._, label: label }))
        }
      } else {
        formConfig[fieldName] = FieldView(fieldViews, viewType, viewName, fieldName, label, EnumOptionsSources, fieldsOptionsConfig, leafPredicates);
      }
    }
    if (typeof formConfig[fieldName] == "string") {
      debugger
      const err = formConfig[fieldName]
      console.log(`error processing field ${fieldName}`, err)
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
    formConfig,
    visibleFields,
    disabledFields,
  });
};

export const parseVisibleFields = (
  visibleFields: Array<[string, BoolExpr<any>]>,
  leafPredicates: LeafPredicatesEvaluators<any, any>): OrderedMap<string, Predicate<any>> => OrderedMap(
    visibleFields.map(([fieldName, boolExpr]) => ([fieldName, boolExpr.eval<any>(leafPredicates)]) as any)
  );

export const builtInsFromFieldViews = (fieldViews: any): BuiltIns => {
  let builtins: BuiltIns = {
    "primitives": Map([
      ["string", { renderers: Set(["StringViews"]), defaultValue: "" }] as [string, PrimitiveBuiltIn],
      ["number", { renderers: Set(["NumberViews"]), defaultValue: 0 }],
      ["boolean", { renderers: Set(["BooleanViews"]), defaultValue: false }],
      ["maybeBoolean", { renderers: Set(["MaybeBooleanViews"]), defaultValue: undefined }],
      ["Date", { renderers: Set(["DateViews"]), defaultValue: new Date(Date.now()) }],
      ["CollectionReference", { renderers: Set(["EnumViews"]), defaultValue: CollectionReference.Default("", "") }]]),
    "generics": Map([
      ["SingleSelection", { defaultValue: CollectionSelection().Default.right("no selection") }] as [string, GenericBuiltIn],
      ["Multiselection", { defaultValue: Map() }],
      ["List", { defaultValue: [] }]
    ]),
    "renderers": {
      "BooleanViews": Set(),
      "MaybeBooleanViews": Set(),
      "DateViews": Set(),
      "EnumMultiselectViews": Set(),
      "EnumViews": Set(),
      "InfiniteStreamMultiselectViews": Set(),
      "InfiniteStreamViews": Set(),
      "NumberViews": Set(),
      "StringViews": Set(),
      "ListViews": Set(),
    }
  }
  Object.keys(builtins.renderers).forEach((_categoryName) => {
    const categoryName = _categoryName as keyof BuiltIns["renderers"]
    if (categoryName in fieldViews) {
      Object.keys(fieldViews[categoryName]).forEach(viewName => {
        builtins.renderers[categoryName] = builtins.renderers[categoryName].add(viewName)
      })
    }
  })
  return builtins
}

export type EditLauncherContext<Entity, FormState, ExtraContext> =
  Omit<
    EditFormContext<Entity, FormState> &
    EditFormState<Entity, FormState> & {
      extraContext: ExtraContext,
      containerFormView: any
    }, "api" | "actualForm">

export type CreateLauncherContext<Entity, FormState, ExtraContext> =
  Omit<
    CreateFormContext<Entity, FormState> &
    CreateFormState<Entity, FormState> & {
      extraContext: ExtraContext,
      containerFormView: any
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
        EditFormState<Entity, FormState>, Unit>,
      initialState: EditFormState<Entity, FormState>
    }>,
  mappings: Map<string, <Source, Target, FormState, ExtraContext>() =>
    {
      form:
      MappedEntityFormTemplate<
        Source, Target, FormState, ExtraContext, Unit>,
      initialState: EditFormState<Target, FormState>,
      mapping: Mapping<any, any>
    }>
}
export type ParsedForms = Map<string, ParsedForm & { form: EntityFormTemplate<any, any, any, any, any> }>
export type FormParsingErrors = Array<string>
export type FormParsingResult = Sum<ParsedLaunchers, FormParsingErrors>
export type StreamName = string
export type InfiniteStreamSources = BasicFun<StreamName, SearchableInfiniteStreamState<CollectionReference>["getChunk"]>
export type EntityName = string
export type EntityApis = {
  create: BasicFun<EntityName, BasicFun<any, Promise<Unit>>>
  default: BasicFun<EntityName, BasicFun<Unit, Promise<any>>>
  update: BasicFun<EntityName, BasicFun<any, Promise<ApiErrors>>>
  get: BasicFun<EntityName, BasicFun<Guid, Promise<any>>>
}
export type EnumName = string
export type EnumOptionsSources = BasicFun<EnumName, Promise<Array<[CollectionReference, BoolExpr<Unit>]>>>
export const parseForms =
  <LeafPredicates,>(
    builtIns: BuiltIns,
    containerFormView: any,
    nestedContainerFormView: any,
    fieldViews: any,
    infiniteStreamSources: InfiniteStreamSources,
    enumOptionsSources: EnumOptionsSources,
    entityApis: EntityApis,
    leafPredicates: LeafPredicates) =>
    (formsConfig: FormsConfig):
      FormParsingResult => {
      let errors: FormParsingErrors = []
      let seen = Set<string>()
      let formProcessingOrder = OrderedSet<string>()

      const defaultValue = (t: TypeName): any => {
        let primitive = builtIns.primitives.get(t)
        if (primitive != undefined) {
          return primitive.defaultValue
        } else {
          let generic = builtIns.generics.get(t)
          if (generic != undefined) {
            return generic.defaultValue
          } else {
            let custom = formsConfig.types.get(t)
            if (custom != undefined) {
              let res = {} as any
              custom.fields.forEach((field, fieldName) => {
                res[fieldName] = defaultValue(field.kind == "primitive" ? field.value : field.kind == "lookup" ? field.name : field.value)
              }
              )
              return res
            } else {
              errors.push(`cannot find type ${t} when resolving defaultValue`)
              return undefined
            }
          }
        }
      }

      let parsedLaunchers: ParsedLaunchers = {
        create: Map(),
        edit: Map(),
        mappings: Map()
      }
      let parsedForms: ParsedForms = Map()
      const traverse = (formDef: FormDef) => {
        if (formProcessingOrder.has(formDef.name)) return
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
        })
        formProcessingOrder = formProcessingOrder.add(formDef.name)
      }
      formsConfig.forms.forEach(form => traverse(form))

      formProcessingOrder.forEach(formName => {
        const formConfig = formsConfig.forms.get(formName)!
        const formFieldRenderers = formConfig.fields.map(field => field.renderer).toObject()
        const formFieldVisibilities = formConfig.fields.map(field => field.visible).toObject()
        const formFieldDisabled = formConfig.fields.map(field => field.disabled).toObject()
        const formFieldStreams = formConfig.fields.filter(field => field.api.stream != undefined).map(field => field.api.stream).toObject()
        const formFieldEnumOptions = formConfig.fields.filter(field => field.api.enumOptions != undefined).map(field => field.api.enumOptions).toObject()
        const formFieldElementRenderers = formConfig.fields.filter(field => field.elementRenderer != undefined).map(field => field.elementRenderer).toObject()

        try {
          const parsedForm = ParseForm(
            formConfig,
            containerFormView,
            nestedContainerFormView,
            fieldViews,
            parsedForms,
            formFieldRenderers,
            formFieldElementRenderers,
            formFieldStreams,
            formFieldEnumOptions,
            infiniteStreamSources,
            enumOptionsSources,
            leafPredicates,
            formFieldVisibilities,
            formFieldDisabled,
            defaultValue,
            formConfig.typeDef,
          )
          const formBuilder = Form<any, any, any, any>().Default<any>()
          const form = formBuilder.template({
            ...(parsedForm.formConfig)
          }, _ => PromiseRepo.Default.mock(() =>
            [
            ])).mapContext<Unit>(_ => ({ ..._, disabledFields: parsedForm.disabledFields, visibleFields: parsedForm.visibleFields, layout: formConfig.tabs }))
          parsedForms = parsedForms.set(formName, { ...parsedForm, form })
        } catch (error: any) {
          errors.push(error)
        }
      })

      if (errors.length > 0) {
        return Sum.Default.right(errors)
      }

      formsConfig.launchers.edit.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form
        const initialState = parsedForm.initialFormState
        const api = {
          get: entityApis.get(launcher.api),
          update: entityApis.update(launcher.api)
        }
        parsedLaunchers.edit = parsedLaunchers.edit.set(
          launcherName,
          <Entity, FormState, ExtraContext, Context extends EditLauncherContext<Entity, FormState, ExtraContext>>() => ({
            form: EditFormTemplate<Entity, FormState>().mapContext((parentContext: Context) =>
              ({
                ...parentContext,
                api: api,
                actualForm: form.withView(containerFormView).mapContext((_: any) => ({ ..._, rootValue: _.value, ...parentContext.extraContext }))
              }) as any),
            initialState: EditFormState<Entity, FormState>().Default(initialState),
          })
        )
      })

      formsConfig.launchers.create.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form
        const initialState = parsedForm.initialFormState
        const api = {
          create: entityApis.create(launcher.api),
          default: entityApis.default(launcher.api)
        }
        parsedLaunchers.create = parsedLaunchers.create.set(
          launcherName,
          <Entity, FormState, ExtraContext, Context extends CreateLauncherContext<Entity, FormState, ExtraContext>>() => ({
            form: CreateFormTemplate<Entity, FormState>().mapContext((parentContext: Context) =>
              ({
                ...parentContext,
                api: api,
                actualForm: form.withView(containerFormView).mapContext((_: any) => ({ ..._, rootValue: _.value, ...parentContext.extraContext }))
              }) as any)
              .withViewFromProps(props => props.context.submitButtonWrapper)
              .mapForeignMutationsFromProps(props => props.foreignMutations as any),
            initialState: CreateFormState<any, any>().Default(initialState),
            actualForm: form,
          })
        )
      })

      formsConfig.launchers.mappings.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form.withView(containerFormView)
        const initialState = parsedForm.initialFormState
        const mappingConfig = formsConfig.mappings.get(launcher.mapping)! as any
        const mapping =
          Mapping.Default.fromPaths<any, any>(
            mappingConfig.paths
          )
        parsedLaunchers.mappings = parsedLaunchers.mappings.set(
          launcherName,
          <Source, Target, FormState, ExtraContext>() => ({
            form:
              MappedEntityFormTemplate<Source, Target, FormState, ExtraContext, Unit>(
                mapping,
                (form as any).mapContext((parentContext: any) => {
                  return ({ ...parentContext, ...parentContext.extraContext })
                }))
                .mapForeignMutationsFromProps(props => props.foreignMutations as any),
            initialState: initialState,
            mapping: mapping,
            actualForm: form,
          })
        )
      })

      if (errors.length > 0) {
        return Sum.Default.right(errors)
      }
      return Sum.Default.left(parsedLaunchers)
    }



export type FormsParserContext = {
  containerFormView: any,
  nestedContainerFormView: any,
  fieldViews: any,
  infiniteStreamSources: InfiniteStreamSources,
  enumOptionsSources: EnumOptionsSources,
  entityApis: EntityApis,
  leafPredicates: any,
  getFormsConfig: BasicFun<void, Promise<any>>
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
