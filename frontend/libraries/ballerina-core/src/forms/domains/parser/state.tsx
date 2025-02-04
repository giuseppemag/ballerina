import { List, Map, OrderedMap, OrderedSet, Set } from "immutable";
import { BoolExpr, Unit, Guid, LeafPredicatesEvaluators, Predicate, ParsedFormJSON, BuiltIns, Sum, BasicFun, Template, unit, EditFormState, EditFormTemplate, ApiErrors, CreateFormTemplate, EntityFormTemplate, CommonFormState, CreateFormState, EditFormContext, CreateFormContext, Synchronized, simpleUpdater, TypeName, ListFieldState, ListForm, BuiltInApiConverters, defaultValue, fromAPIRawValue, toAPIRawValue, EditFormForeignMutationsExpected, MapFieldState, MapForm, ParsedType, Base64FileForm, SecretForm, InjectedPrimitives, Injectables, ApiConverters, Maybe, ApiResponseChecker, Debounced, ParsedFormConfig } from "../../../../main";
import { CollectionReference } from "../collection/domains/reference/state";
import { SearchableInfiniteStreamState } from "../primitives/domains/searchable-infinite-stream/state";
import { Form } from "../singleton/template";
import { ParsedRenderer } from "./domains/renderer/state";

export type ParsedForm<T,> = {
  initialFormState: any,
  formConfig: any,
  formName: string,
  formDef: ParsedFormConfig<T>,
  visibleFields: any,
  disabledFields: any,
}
export const ParseForm = <T,>(
  formName: string,
  formDef: ParsedFormConfig<T>,
  nestedContainerFormView: any,
  formViews: Record<string, Record<string, any>>,
  forms: ParsedForms<T>,
  fieldsViewsConfig: any,
  infiniteStreamSources: any,
  enumOptionsSources: EnumOptionsSources,
  leafPredicates: any,
  visibleFieldsBoolExprs: any,
  disabledFieldsBoolExprs: any,
  defaultValue: BasicFun<ParsedType<T>, any>,
  injectedPrimitives?: InjectedPrimitives<T>
): ParsedForm<T> => {

  const formConfig: any = {};
  const initialFormState: any = {
    commonFormState: CommonFormState.Default(),
    formFieldStates: {},
  };

  const fieldNames = Object.keys(fieldsViewsConfig)

  fieldNames.forEach(fieldName => {
    const parsedFormConfig  = ParsedRenderer.Operations.RendererToForm(
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
    OrderedMap(
      visibleFields.map(([fieldName, boolExpr]) => ([fieldName, boolExpr.eval<any>(leafPredicates)]) as any)
    )

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
  create: Map<string, <Entity, FormState, ExtraContext>() =>
    {
      form:
      Template<CreateLauncherContext<Entity, FormState, ExtraContext> & CreateFormState<Entity, FormState>,
        CreateFormState<Entity, FormState>, Unit>,
      initialState: CreateFormState<Entity, FormState>
    }>,
  edit: Map<string, <Entity, FormState, ExtraContext>() =>
    {
      form:
      Template<EditLauncherContext<Entity, FormState, ExtraContext> & EditFormState<Entity, FormState>,
        EditFormState<Entity, FormState>, EditFormForeignMutationsExpected<Entity, FormState>>,
      initialState: EditFormState<Entity, FormState>
    }>,
}
export type ParsedForms<T> = Map<string, ParsedForm<T> & { form: EntityFormTemplate<any, any, any, any, any> }>
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


export type EnumOptionsSources = BasicFun<EnumName, BasicFun<Unit, Promise<Array<{value: CollectionReference}>>>>
export const parseForms =
  <LeafPredicates, T extends { [key in keyof T]: { type: any; state: any; }; },>(
    builtIns: BuiltIns,
    injectedPrimitives: InjectedPrimitives<T> | undefined,
    apiConverters: ApiConverters<T>,
    containerFormView: any,
    nestedContainerFormView: any,
    fieldViews: any,
    infiniteStreamSources: InfiniteStreamSources,
    enumOptionsSources: EnumOptionsSources,
    entityApis: EntityApis,
    leafPredicates: LeafPredicates) =>
    (formsConfig: ParsedFormJSON<T>):
      FormParsingResult => {
      let errors: FormParsingErrors = List()
      let seen = Set<string>()
      let formProcessingOrder = OrderedSet<string>()

      let parsedLaunchers: ParsedLaunchers = {
        create: Map(),
        edit: Map(),
      }
      let parsedForms: ParsedForms<T> = Map()
      const traverse = (formDef:ParsedFormConfig<T>) => {
        if (formProcessingOrder.has(formDef.name)) {
          return
        }
        if (seen.has(formDef.name)) {
          errors.push(`aborting: cycle detected when parsing forms: ${JSON.stringify(formProcessingOrder.reverse().toArray())} -> ${formDef.name}`)
          return
        }
        seen = seen.add(formDef.name)
        formDef.fields.forEach((field, fieldName) => {
          // TODO add a union case
          if (field.type.kind == "lookup" || field.type.kind == "form") {
            traverse(formsConfig.forms.get(field.renderer)!)
          }
          try {
            if (field.kind == "list") {
              if (typeof field.elementRenderer == "string") throw Error("Deprecated element renderer as string, use a render object instead - check parser.")
              if (formsConfig.forms.has(field.elementRenderer.renderer))
                traverse(formsConfig.forms.get(field.elementRenderer.renderer)!)
            }
            if (field.kind == "map") {
              const keyRenderer = field.keyRenderer
              const valueRenderer = field.valueRenderer
              if (keyRenderer && formsConfig.forms.has(keyRenderer.renderer)) {
                traverse(formsConfig.forms.get(keyRenderer.renderer)!)
              }
              if (valueRenderer && formsConfig.forms.has(valueRenderer.renderer)) {
                traverse(formsConfig.forms.get(valueRenderer.renderer)!)
              }
            }
          } catch (error: any) {
            console.error(`error parsing field :${fieldName}:: `,error)
            errors.push(error.message ?? error)
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
          console.error(error)
          errors.push(error.message ?? error)
        }
      })

      if (errors.size > 0) {
        console.error(errors)
        return Sum.Default.right(errors)
      }

      formsConfig.launchers.edit.forEach((launcher, launcherName) => {
        const parsedForm = parsedForms.get(launcher.form)!
        const form = parsedForm.form
        const initialState = parsedForm.initialFormState
        const api = {
          get: (id: string) => entityApis.get(launcher.api)(id).then((raw: any) => {
            const x =fromAPIRawValue(parsedForm.formDef.type , formsConfig.types, builtIns, apiConverters, injectedPrimitives)(raw)
            return x
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
                parser: (value: any, formState: any) => toAPIRawValue(parsedForm.formDef.type , formsConfig.types, builtIns, apiConverters, injectedPrimitives)(value, formState),
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
          default: (_: Unit) => 
            entityApis.default(launcher.api)(unit).then((raw: any) => 
              fromAPIRawValue(parsedForm.formDef.type , formsConfig.types, builtIns, apiConverters, injectedPrimitives)(raw)),
          create: (parsed: any) => 
            parsed.kind == "errors" ? Promise.reject(parsed.errors) : entityApis.create(launcher.api)(parsed.value)
          ,
        }
        parsedLaunchers.create = parsedLaunchers.create.set(
          launcherName,
          <Entity, FormState, ExtraContext, Context extends CreateLauncherContext<Entity, FormState, ExtraContext>>() => ({
            form: CreateFormTemplate<Entity, FormState>().mapContext((parentContext: Context) =>
              { 
                return ({
                  apiRunner: parentContext.customFormState.apiRunner,
                  parser: (value: any, formState: any) => toAPIRawValue(parsedForm.formDef.type , formsConfig.types, builtIns, apiConverters, injectedPrimitives)(value, formState),
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
