import { List, Map, OrderedMap, OrderedSet, Set } from "immutable";
import { BoolExpr, Unit, PromiseRepo, Guid, LeafPredicatesEvaluators, Predicate, FormsConfig, BuiltIns, FormDef, Sum, BasicFun, Template, unit, EditFormState, EditFormTemplate, ApiErrors, CreateFormTemplate, EntityFormTemplate, SharedFormState, CreateFormState, Entity, EditFormContext, CreateFormContext, MappedEntityFormTemplate, Mapping, FormValidationResult, Synchronized, simpleUpdater, PrimitiveType, GenericType, ApiConverter, TypeName, ListFieldState, ListForm, TypeDefinition, ApiConverters, defaultValue, fromAPIRawValue, toAPIRawValue, EditFormForeignMutationsExpected, MapFieldState, MapForm, Type, FieldConfig } from "../../../../main";
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
  (fieldConfig:FieldConfig, fieldViews: any, viewType: any, viewName: any, fieldName: string, label: string, enumFieldConfigs: EnumOptionsSources, enumSources: any, leafPredicates: any): any => // FieldView<Context, FieldViews, ViewType, ViewName> => 
  {
    if (viewType == "maybeBoolean")
      return MaybeBooleanForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<boolean>>(_ => ({ ..._, label: label })) as any
    if (viewType == "boolean")
      return BooleanForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<boolean>>(_ => ({ ..._, label: label })) as any
    if (viewType == "date")
      return DateForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & DateFormState & Value<Date>>(_ => ({ ..._, label: label })) as any
    if (viewType == "number")
      return NumberForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<number>>(_ => ({ ..._, label: label })) as any
    if (viewType == "string")
      return StringForm<any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<string>>(_ => ({ ..._, label: label })) as any
    if (viewType == "enumSingleSelection")
      return EnumForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({
          ..._, label: label, getOptions: () => {
            // console.log(fieldConfig, fieldViews, viewType, viewName, fieldName, label, enumFieldConfigs, enumSources, leafPredicates)
            return ((enumFieldConfigs as any)((fieldConfig as any).options ?? fieldConfig.api.enumOptions)() as Promise<any>).then(options => parseOptions(leafPredicates, options))
          }
        })) as any
    if (viewType == "enumMultiSelection")
      return EnumMultiselectForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({
          ..._, label: label, getOptions: () => ((enumFieldConfigs as any)((fieldConfig as any).options ?? fieldConfig.api.enumOptions)() as Promise<any>).then(options => parseOptions(leafPredicates, options))
        })) as any
    if (viewType == "streamSingleSelection")
      return SearchableInfiniteStreamForm<CollectionReference, any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SearchableInfiniteStreamState<CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({ ..._, label: label })) as any
    if (viewType == "streamMultiSelection")
      return InfiniteMultiselectDropdownForm<CollectionReference, any & FormLabel, Unit>()
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & FormLabel & SharedFormState & SearchableInfiniteStreamState<CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({ ..._, label: label })) as any
    return `error: the view for ${viewType as string}::${viewName as string} cannot be found`;
  }

export const FieldFormState = //<Context, FieldViews extends DefaultFieldViews, InfiniteStreamSources extends {}, InfiniteStreamConfigs extends {}>() => <ViewType extends keyof FieldViews, ViewName extends keyof FieldViews[ViewType]>
  (fieldConfig:FieldConfig, fieldViews: any, viewType: any, viewName: any, fieldName: string, InfiniteStreamSources: any, infiniteStreamConfigs: any): any => {
    if (viewType == "maybeBoolean" || viewType == "boolean" || viewType == "number" || viewType == "string")
      return SharedFormState.Default();
    if (viewType == "date")
      return DateFormState.Default("");
    if (viewType == "enumSingleSelection" || viewType == "enumMultiSelection")
      return ({ ...EnumFormState<any, any>().Default(), ...SharedFormState.Default() });
    if (viewType == "streamSingleSelection" || viewType == "streamMultiSelection") {
      return ({
        ...SearchableInfiniteStreamState<any>().Default("", (InfiniteStreamSources as any)((fieldConfig as any).stream ?? fieldConfig.api.stream)
        ), ...SharedFormState.Default()
      });
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
export const ParseForm = (
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

  const initialFormState: any = SharedFormState.Default();
  Object.keys(fieldsViewsConfig).forEach(fieldName => {
    const viewName = (fieldsViewsConfig as any)[fieldName];
    const fieldConfig = formDef.fields.get(fieldName)!
    initialFormState[fieldName] =
      otherForms.get(viewName)?.initialFormState ??
      FieldFormState(fieldConfig, fieldViews, fieldNameToViewCategory(fieldName) as any, (fieldsViewsConfig as any)[fieldName], fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig);
    if (typeof initialFormState[fieldName] == "string") {
      throw `cannot resolve initial state ${viewName} of field ${fieldName}`
    }
  });
  const formConfig: any = {};
  const fieldNames = Object.keys(fieldsViewsConfig)
  fieldNames.forEach(fieldName => {
    const label = formDef.fields.get(fieldName)!.label
    const fieldConfig = formDef.fields.get(fieldName)!
    const viewName = (fieldsViewsConfig as any)[fieldName];
    const otherForm = otherForms.get(viewName)
    if (otherForm != undefined) {
      formConfig[fieldName] = otherForm.form.withView(nestedContainerFormView).mapContext<any>(_ => ({ ..._, label: label }))
    } else {
      const viewType = fieldNameToViewCategory(fieldName) as any
      if (viewType == "list") {
        const elementRendererName = formFieldElementRenderers[fieldName]
        const field = type.fields.get(fieldName)!
        const initialElementValue = defaultValue(field.kind == "primitive" ? field.value : field.kind == "lookup" ? field.name : field.args[0])
        const elementForm = otherForms.get(elementRendererName)
        if (elementForm != undefined) { // the list argument is a nested form
          const initialFormState = elementForm.initialFormState
          formConfig[fieldName] = ListForm<any, any, any & FormLabel, Unit>(
            { Default: () => ({ ...initialFormState }) },
            { Default: () => ({ ...initialElementValue }) },
            elementForm.form.withView(nestedContainerFormView),
          ).withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any>(_ => ({ ..._, label: label }))
        } else { // the list argument is a primitive
          const elementForm = FieldView(fieldConfig, fieldViews, fieldNameToElementViewCategory(formFieldElementRenderers)(fieldName) as any, elementRendererName, fieldName, label, EnumOptionsSources, fieldsOptionsConfig, leafPredicates)
          const initialFormState = FieldFormState(fieldConfig, fieldViews, fieldNameToElementViewCategory(formFieldElementRenderers)(fieldName) as any, elementRendererName, fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig);
          formConfig[fieldName] = ListForm<any, any, any & FormLabel, Unit>(
            { Default: () => initialFormState },
            { Default: () => initialElementValue },
            elementForm,
          ).withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any>(_ => ({ ..._, label: label }))
        }
      } else {
        if (viewType == "map") {
          const field = type.fields.get(fieldName)!

          const parseType = (t:any) : TypeName | Type | undefined => {
            if (typeof t == "string") return t
            if ("fun" in t && "args" in t && Array.isArray(t.args)) {
              return { kind:"application", value:t.fun, args:t.args }
            }
            return undefined
          }

          const [keyType, valueType] = field.kind == "application" ? [parseType(field.args[0]), parseType(field.args[1])] : (() => {
            throw `error processing field type ${JSON.stringify(field)} of ${fieldName}`
          })()
          if (!keyType || !valueType) {
            throw `error processing field type ${JSON.stringify(field)} of ${fieldName}`
          }
          const initialKeyValue = defaultValue(keyType)
          const initialValueValue = defaultValue(valueType)
          const getFormAndInitialState = (elementRenderers:any, rendererName:any, fieldConfig:FieldConfig) => {
            const formDef = otherForms.get(rendererName)
            if (formDef != undefined) {
              return [
                formDef.form.withView(nestedContainerFormView),
                formDef.initialFormState
              ]
            } else {
              const categoryName = fieldNameToElementViewCategory(elementRenderers)(fieldName) as any
              const form = FieldView(fieldConfig, fieldViews, categoryName, rendererName, fieldName, label, EnumOptionsSources, fieldsOptionsConfig, leafPredicates)
              const initialFormState = FieldFormState(fieldConfig, fieldViews, categoryName, rendererName, fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig);
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
          const [valueForm,valueFormInitialState] = getFormAndInitialState(formFieldValueRenderers, valueRendererName?.renderer ?? valueRendererName, keyRendererName as FieldConfig)
          formConfig[fieldName] = MapForm<any, any, any, any, any & FormLabel, Unit>(
            { Default: () => keyFormInitialState },
            { Default: () => valueFormInitialState },
            { Default: () => initialKeyValue },
            { Default: () => initialValueValue },
            keyForm,
            valueForm
          ).withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any>(_ => ({ ..._, label: label }))
        } else {
          formConfig[fieldName] = FieldView(fieldConfig, fieldViews, viewType, viewName, fieldName, label, EnumOptionsSources, fieldsOptionsConfig, leafPredicates);
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
  leafPredicates: LeafPredicatesEvaluators<any, any>): OrderedMap<string, Predicate<any>> => OrderedMap(
    visibleFields.map(([fieldName, boolExpr]) => ([fieldName, boolExpr.eval<any>(leafPredicates)]) as any)
  );

export type EditLauncherContext<Entity, FormState, ExtraContext> =
  Omit<
    EditFormContext<Entity, FormState> &
    EditFormState<Entity, FormState> & {
      extraContext: ExtraContext,
      containerFormView: any,
      submitButtonWrapper: any
    }, "api" | "actualForm">

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


export type EnumOptionsSources = BasicFun<EnumName, BasicFun<Unit, Promise<Array<[CollectionReference, BoolExpr<Unit>]>>>>
export const parseForms =
  <LeafPredicates,>(
    builtIns: BuiltIns,
    apiConverters: ApiConverters,
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

      let parsedLaunchers: ParsedLaunchers = {
        create: Map(),
        edit: Map(),
        mappings: Map()
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
              if (formsConfig.forms.has(field.elementRenderer))
                traverse(formsConfig.forms.get(field.elementRenderer)!)
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
            defaultValue(formsConfig.types, builtIns),
            formConfig.typeDef,
          )
          const formBuilder = Form<any, any, any, any>().Default<any>()
          const form = formBuilder.template({
            ...(parsedForm.formConfig)
          }).mapContext<Unit>(_ => ({ ..._, disabledFields: parsedForm.disabledFields, visibleFields: parsedForm.visibleFields, layout: formConfig.tabs }))
          parsedForms = parsedForms.set(formName, { ...parsedForm, form })
        } catch (error: any) {
          errors.push(error.message ?? error)
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
          get: (id: string) => entityApis.get(launcher.api)(id).then((raw: any) => {
            // alert(JSON.stringify(raw))
            // alert(JSON.stringify(parsedForm.formDef.type))
            const parsed = fromAPIRawValue({ kind: "lookup", name: parsedForm.formDef.type }, formsConfig.types, builtIns, apiConverters)(raw)
            return parsed
          }),
          update: (value: any) => 
            entityApis.update(launcher.api)(toAPIRawValue({ kind: "lookup", name: parsedForm.formDef.type }, formsConfig.types, builtIns, apiConverters)(value))
        }
        parsedLaunchers.edit = parsedLaunchers.edit.set(
          launcherName,
          <Entity, FormState, ExtraContext, Context extends EditLauncherContext<Entity, FormState, ExtraContext>>() => ({
            form: EditFormTemplate<Entity, FormState>().mapContext((parentContext: Context) =>
              ({
                ...parentContext,
                api: api,
                actualForm: form.withView(containerFormView).mapContext((_: any) => ({ ..._, rootValue: _.value, ...parentContext.extraContext }))
              }) as any)
              .withViewFromProps(props => props.context.submitButtonWrapper)
              .mapForeignMutationsFromProps(props => props.foreignMutations as any),
            initialState: EditFormState<Entity, FormState>().Default(initialState),
          })
        )
      })

      formsConfig.launchers.create.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form
        const initialState = parsedForm.initialFormState
        const api = {
          create: (value: any) => {
            // alert(`type = ${JSON.stringify(parsedForm.formDef.type)}`)
            // alert(`value = ${JSON.stringify(value)}`)
            const raw = toAPIRawValue({ kind: "lookup", name: parsedForm.formDef.type }, formsConfig.types, builtIns, apiConverters)(value)
            // alert(`raw = ${JSON.stringify(raw.interests)}`)
            return entityApis.create(launcher.api)(raw)
          },
          default: (_: Unit) => entityApis.default(launcher.api)(unit)
            .then((raw: any) => {
              const parsed = fromAPIRawValue({ kind: "lookup", name: parsedForm.formDef.type }, formsConfig.types, builtIns, apiConverters)(raw)
              return parsed
            })
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

const OVERRIDE_FIELDS = ["value", "sync"];

export const replaceKeyword = (fieldName: string): string => {
  if (OVERRIDE_FIELDS.includes(fieldName)) {
    return `__keywordreplacement__${fieldName}__`;
  }
  return fieldName;
};

export const revertKeyword = (fieldName: string): string => {
  const overridenFieldNames = OVERRIDE_FIELDS.reduce((acc, field) => {
    const overrideName = `__keywordreplacement__${field}__`;
    acc[overrideName] = field;
    return acc;
  }, {} as any);

  if (fieldName in overridenFieldNames) {
    return overridenFieldNames[fieldName];
  }
  return fieldName;
};

export const replaceKeywords = (obj: any, kind: "from api" | "to api"): any => {
  const replacementFn = kind == "from api" ? replaceKeyword : revertKeyword;
  if (Array.isArray(obj) || List.isList(obj)) {
    return obj.map((item) =>
      typeof item == "string"
        ? replacementFn(item)
        : replaceKeywords(item, kind )
    );
  } else if (typeof obj === "object" && obj !== null) {
    if(OrderedMap.isOrderedMap(obj)) {
      return obj.map((_, key) => 
        replacementFn(key as string)
      )
    }
    if(Map.isMap(obj)) {
      return obj.map((_, key) =>
        replacementFn(key as string)
      )
    }
    const copy = { ...obj };
    Object.keys(copy).forEach((key) => {
      const value = copy[key];
      const newKeyName = replacementFn(key);
      copy[newKeyName] = replaceKeywords(value, kind);
      if(newKeyName !== key) {
        delete copy[key]
      }
    });
    return copy;
  }
  return obj;
};

export type FormsParserContext = {
  containerFormView: any,
  nestedContainerFormView: any,
  fieldViews: any,
  fieldTypeConverters: ApiConverters,
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
