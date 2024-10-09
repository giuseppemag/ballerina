import { Collection, Map, OrderedMap, OrderedSet, Set } from "immutable";
import { BoolExpr, Unit, PromiseRepo, Guid, LeafPredicatesEvaluators, Predicate, FormsConfig, BuiltIns, FormDef, Sum, BasicFun, Template, unit, EditFormState, EditFormTemplate, ApiErrors, CreateFormTemplate, EntityFormTemplate, SharedFormState } from "../../../../main";
import { Value } from "../../../value/state";
import { CollectionReference } from "../collection/domains/reference/state";
import { CollectionSelection } from "../collection/domains/selection/state";
import { BooleanForm } from "../primitives/domains/boolean/template";
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
  (fieldViews: any, viewType: any, viewName: any, fieldName: string, enumFieldConfigs: any, enumSources: any, leafPredicates: any): any => // FieldView<Context, FieldViews, ViewType, ViewName> =>
    viewType == "BooleanViews" ?
      BooleanForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
        .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
        .mapContext<any & SharedFormState & Value<boolean>>(_ => ({ ..._, label: fieldName })) as any
      : viewType == "DateViews" ?
        DateForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
          .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
          .mapContext<any & DateFormState & Value<Date>>(_ => ({ ..._, label: fieldName })) as any
        : viewType == "NumberViews" ?
          NumberForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
            .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
            .mapContext<any & SharedFormState & Value<number>>(_ => ({ ..._, label: fieldName })) as any
          : viewType == "StringViews" ?
            StringForm<any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
              .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
              .mapContext<any & SharedFormState & Value<string>>(_ => ({ ..._, label: fieldName })) as any
            : viewType == "EnumViews" ?
              EnumForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>(_ => PromiseRepo.Default.mock(() => []))
                .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
                .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({
                  ..._, label: fieldName, getOptions: () => ((enumFieldConfigs as any)((enumSources as any)[fieldName]) as Promise<any>).then(options => parseOptions(leafPredicates, options))
                })) as any
              : viewType == "EnumMultiselectViews" ?
                EnumMultiselectForm<any & FormLabel & BaseEnumContext<any, CollectionReference>, Unit, CollectionReference>(_ => PromiseRepo.Default.mock(() => []))
                  .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
                  .mapContext<any & EnumFormState<any & BaseEnumContext<any, CollectionReference>, CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({
                    ..._, label: fieldName, getOptions: () => ((enumFieldConfigs as any)((enumSources as any)[fieldName]) as Promise<any>).then(options => parseOptions(leafPredicates, options))
                  })) as any
                : viewType == "InfiniteStreamViews" ?
                  SearchableInfiniteStreamForm<CollectionReference, any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
                    .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
                    .mapContext<any & SearchableInfiniteStreamState<CollectionReference> & Value<CollectionSelection<CollectionReference>>>(_ => ({ ..._, label: fieldName })) as any
                  : viewType == "InfiniteStreamMultiselectViews" ?
                    InfiniteMultiselectDropdownForm<CollectionReference, any & FormLabel, Unit>(_ => PromiseRepo.Default.mock(() => []))
                      .withView(((fieldViews as any)[viewType] as any)[viewName]() as any)
                      .mapContext<any & FormLabel & SharedFormState & SearchableInfiniteStreamState<CollectionReference> & Value<OrderedMap<Guid, CollectionReference>>>(_ => ({ ..._, label: fieldName })) as any
                    : `error: the view for ${viewType as string}::${viewName as string} cannot be found`;

export const FieldFormState = //<Context, FieldViews extends DefaultFieldViews, InfiniteStreamSources extends {}, InfiniteStreamConfigs extends {}>() => <ViewType extends keyof FieldViews, ViewName extends keyof FieldViews[ViewType]>
  (fieldViews: any, viewType: any, viewName: any, fieldName: string, InfiniteStreamSources: any, infiniteStreamConfigs: any): any => {
    if (viewType == "BooleanViews" || viewType == "NumberViews" || viewType == "StringViews")
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
    return `error: the view for ${viewType as string}::${viewName as string} cannot be found when creating the corresponding field form state`;
  };

export type ParsedForm = {
  initialFormState: any,
  formConfig: any,
  visibleFields: any,
}
export const ParseForm = (
  containerFormView: any,
  fieldViews: any,
  otherForms: ParsedForms,
  fieldsViewsConfig: any,
  fieldsInfiniteStreamsConfig: any,
  fieldsOptionsConfig: any,
  InfiniteStreamSources: any,
  EnumOptionsSources: any,
  leafPredicates: any,
  visibleFieldsBoolExprs: any
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

  const initialFormState: any = SharedFormState.Default();
  Object.keys(fieldsViewsConfig).forEach(fieldName => {
    const viewName = (fieldsViewsConfig as any)[fieldName];
    initialFormState[fieldName] =
      otherForms.get(viewName)?.initialFormState ??
      FieldFormState(fieldViews, fieldNameToViewCategory(fieldName) as any, (fieldsViewsConfig as any)[fieldName], fieldName, InfiniteStreamSources, fieldsInfiniteStreamsConfig);
    if (typeof initialFormState[fieldName] == "string") {
      formConfig[fieldName] = (props: any) => <>Error: field {fieldName} with {viewName} could not be instantiated</>
      throw `cannot resolve initial state ${viewName} of field ${fieldName}`
    }
  });
  const formConfig: any = {};
  Object.keys(fieldsViewsConfig).forEach(fieldName => {
    const viewName = (fieldsViewsConfig as any)[fieldName];
    formConfig[fieldName] =
      otherForms.get(viewName)?.form.withView(containerFormView) ??
      FieldView(fieldViews, fieldNameToViewCategory(fieldName) as any, (fieldsViewsConfig as any)[fieldName], fieldName, EnumOptionsSources, fieldsOptionsConfig, leafPredicates);
    if (typeof formConfig[fieldName] == "string") {
      formConfig[fieldName] = (props: any) => <>Error: field {fieldName} with {viewName} could not be instantiated</>
      throw `cannot resolve view ${viewName} of field ${fieldName}`
    }
  });

  const visibleFields = parseVisibleFields(
    Object.entries(visibleFieldsBoolExprs), leafPredicates
  );

  return ({
    initialFormState,
    formConfig,
    visibleFields
  });
};

export const parseVisibleFields = (
  visibleFields: Array<[string, BoolExpr<any>]>,
  leafPredicates: LeafPredicatesEvaluators<any, any>): OrderedMap<string, Predicate<any>> => OrderedMap(
    visibleFields.map(([fieldName, boolExpr]) => ([fieldName, boolExpr.eval<any>(leafPredicates)]) as any)
  );

export const builtInsFromFieldViews = (fieldViews: any): BuiltIns => {
  let builtins: BuiltIns = {
    "primitives": Set(["string", "number", "boolean", "Date", "CollectionReference"]),
    "generics": Set(["SingleSelection", "Multiselection"]),
    "renderers": {
      "BooleanViews": Set(),
      "DateViews": Set(),
      "EnumMultiselectViews": Set(),
      "EnumViews": Set(),
      "InfiniteStreamMultiselectViews": Set(),
      "InfiniteStreamViews": Set(),
      "NumberViews": Set(),
      "StringViews": Set(),
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

export type ParsedLaunchers = {
  create:Map<string, { form: Template<any, any, Unit>, initialState:any, actualForm: EntityFormTemplate<any, any, any, any, any> }>,
  edit:Map<string, { form: Template<any, any, Unit>, initialState:any, actualForm: EntityFormTemplate<any, any, any, any, any> }>,
}
export type ParsedForms = Map<string, ParsedForm & { form: EntityFormTemplate<any, any, any, any, any> }>
export type FormParsingErrors = Array<string>
export type FormParsingResult = Sum<ParsedLaunchers, FormParsingErrors>
export type StreamName = string
export type InfiniteStreamSources = BasicFun<StreamName, SearchableInfiniteStreamState<CollectionReference>["getChunk"]>
export type EntityName = string
export type EntityApis = {
  create:BasicFun<EntityName, BasicFun<any, Promise<Unit>>>
  default:BasicFun<EntityName, BasicFun<Unit,Promise<any>>>
  update:BasicFun<EntityName, BasicFun<any,Promise<ApiErrors>>>
  get:BasicFun<EntityName, BasicFun<Guid,Promise<any>>>
}
export type EnumName = string
export type EnumOptionsSources = BasicFun<EnumName, Promise<Array<[CollectionReference, BoolExpr<Unit>]>>>
export const parseForms =
  <LeafPredicates,>(
    containerFormView: any,
    fieldViews: any,
    infiniteStreamSources: InfiniteStreamSources,
    enumOptionsSources: EnumOptionsSources,
    entityApis:EntityApis,
    leafPredicates: LeafPredicates) =>
    (formsConfig: FormsConfig):
      FormParsingResult => {
      let errors: FormParsingErrors = []
      let seen = Set<string>()
      let formProcessingOrder = OrderedSet<string>()
      let parsedLaunchers:ParsedLaunchers = {
        create:Map(),
        edit:Map(),
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
        const formFieldStreams = formConfig.fields.filter(field => field.api.stream != undefined).map(field => field.api.stream).toObject()
        const formFieldEnumOptions = formConfig.fields.filter(field => field.api.enumOptions != undefined).map(field => field.api.enumOptions).toObject()
        try {
          const parsedForm = ParseForm(
            containerFormView,
            fieldViews,
            parsedForms,
            formFieldRenderers,
            formFieldStreams,
            formFieldEnumOptions,
            infiniteStreamSources,
            enumOptionsSources,
            leafPredicates,
            formFieldVisibilities,
          )
          const formBuilder = Form<any, any, any, any>().Default<any>()
          const form = formBuilder.template({
            ...(parsedForm.formConfig)
          }, _ => PromiseRepo.Default.mock(() =>
            [
            ])).mapContext<Unit>(_ => ({ ..._, visibleFields: parsedForm.visibleFields, layout: formConfig.tabs }))
          parsedForms = parsedForms.set(formName, { ...parsedForm, form })
        } catch (error: any) {
          errors.push(error)
        }
      })

      formsConfig.launchers.edit.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form
        const initialState = parsedForm.initialFormState
        const api = {
          get: entityApis.get(launcher.api),
          update: entityApis.update(launcher.api)
        }
        parsedLaunchers.edit = parsedLaunchers.edit.set(
          launcherName, {
            form:EditFormTemplate<any, any>().mapContext((parentContext:any) => 
            ({
              ...parentContext,
              api: api,
              actualForm:form.withView(parentContext.containerFormView).mapContext((_: any) => ({ ..._, rootValue: _.value, ...parentContext.extraContext }))
            })),
            initialState:EditFormState<any, any>().Default(initialState),
            actualForm:form,
          }          
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
          launcherName, {
            form:CreateFormTemplate<any, any>().mapContext((parentContext:any) => 
            ({
              ...parentContext,
              api: api,
              actualForm:form.withView(parentContext.containerFormView).mapContext((_: any) => ({ ..._, rootValue: _.value, ...parentContext.extraContext }))
            }))
              .withViewFromProps(props => props.context.submitButtonWrapper)
              .mapForeignMutationsFromProps(props => props.foreignMutations as any),
            initialState:EditFormState<any, any>().Default(initialState),
            actualForm:form,
          }          
        )
      })

      if (errors.length > 0) return Sum.Default.right(errors)
      return Sum.Default.left(parsedLaunchers)
    }
    