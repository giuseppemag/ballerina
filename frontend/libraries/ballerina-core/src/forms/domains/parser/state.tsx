import { List, Map, OrderedSet, Set } from "immutable";
import {
  Unit,
  Guid,
  ParsedFormJSON,
  BuiltIns,
  Sum,
  BasicFun,
  Template,
  unit,
  EditFormState,
  EditFormTemplate,
  ApiErrors,
  CreateFormTemplate,
  EntityFormTemplate,
  CommonFormState,
  CreateFormState,
  EditFormContext,
  CreateFormContext,
  Synchronized,
  simpleUpdater,
  defaultValue,
  fromAPIRawValue,
  toAPIRawValue,
  EditFormForeignMutationsExpected,
  ParsedType,
  InjectedPrimitives,
  Injectables,
  ApiConverters,
  ApiResponseChecker,
  Debounced,
  ParsedFormConfig,
  PredicateValue,
  FieldPredicateExpressions,
  FormFieldPredicateEvaluation,
  ValueOrErrors,
  PassthroughFormState,
  PassthroughFormContext,
  PassthroughFormTemplate,
} from "../../../../main";
import {
  CollectionReference,
  EnumReference,
} from "../collection/domains/reference/state";
import { SearchableInfiniteStreamState } from "../primitives/domains/searchable-infinite-stream/state";
import { Form } from "../singleton/template";
import { ParsedRenderer } from "./domains/renderer/state";

export type ParsedForm<T> = {
  initialFormState: any;
  formConfig: any;
  formName: string;
  formDef: ParsedFormConfig<T>;
  visibilityPredicateExpressions: FieldPredicateExpressions;
  disabledPredicatedExpressions: FieldPredicateExpressions;
};
export const ParseForm = <T,>(
  formName: string,
  formDef: ParsedFormConfig<T>,
  nestedContainerFormView: any,
  formViews: Record<string, Record<string, any>>,
  forms: ParsedForms<T>,
  fieldsViewsConfig: any,
  infiniteStreamSources: any,
  enumOptionsSources: EnumOptionsSources,
  defaultValue: BasicFun<ParsedType<T>, any>,
  injectedPrimitives?: InjectedPrimitives<T>,
): ParsedForm<T> => {
  const formConfig: any = {};
  let visibilityPredicateExpressions: FieldPredicateExpressions = Map();
  let disabledPredicatedExpressions: FieldPredicateExpressions = Map();
  const initialFormState: any = {
    commonFormState: CommonFormState.Default(),
    formFieldStates: {},
  };

  const fieldNames = Object.keys(fieldsViewsConfig);

  fieldNames.forEach((fieldName) => {
    const parsedFormConfig = ParsedRenderer.Operations.RendererToForm(
      fieldName,
      {
        formViews,
        forms,
        nestedContainerFormView,
        defaultValue,
        enumOptionsSources,
        infiniteStreamSources,
        injectedPrimitives,
      },
      formDef.fields.get(fieldName)!,
    );
    if (parsedFormConfig.kind == "errors")
      throw Error(`Error parsing form ${fieldsViewsConfig[fieldName]}`); // TODO - better error handling

    formConfig[fieldName] = parsedFormConfig.value.form.renderer;
    visibilityPredicateExpressions = visibilityPredicateExpressions.set(
      fieldName,
      parsedFormConfig.value.visibilityPredicateExpression,
    );
    disabledPredicatedExpressions = disabledPredicatedExpressions.set(
      fieldName,
      parsedFormConfig.value.disabledPredicatedExpression,
    );
    initialFormState["formFieldStates"][fieldName] =
      parsedFormConfig.value.form.initialState;
  });

  return {
    initialFormState,
    formName,
    formDef,
    formConfig,
    visibilityPredicateExpressions,
    disabledPredicatedExpressions,
  };
};

export const ParseForms =
  <T,>(
    builtIns: BuiltIns,
    injectedPrimitives: InjectedPrimitives<T> | undefined,
    nestedContainerFormView: any,
    fieldViews: any,
    infiniteStreamSources: any,
    enumOptionsSources: EnumOptionsSources,
  ) =>
  (formsConfig: ParsedFormJSON<T>): ValueOrErrors<ParsedForms<T>, string> => {
    let errors: FormParsingErrors = List();
    let seen = Set<string>();
    let formProcessingOrder = OrderedSet<string>();

    let parsedForms: ParsedForms<T> = Map();
    const traverse = (formDef: ParsedFormConfig<T>) => {
      if (formProcessingOrder.has(formDef.name)) {
        return;
      }
      if (seen.has(formDef.name)) {
        errors.push(
          `aborting: cycle detected when parsing forms: ${JSON.stringify(formProcessingOrder.reverse().toArray())} -> ${formDef.name}`,
        );
        return;
      }
      seen = seen.add(formDef.name);
      formDef.fields.forEach((field, fieldName) => {
        if (field.type.kind == "lookup" || field.type.kind == "form") {
          traverse(formsConfig.forms.get(field.renderer)!);
        }
        try {
          if (field.kind == "list") {
            if (typeof field.elementRenderer == "string")
              throw Error(
                "Deprecated element renderer as string, use a render object instead - check parser.",
              );
            if (formsConfig.forms.has(field.elementRenderer.renderer))
              traverse(formsConfig.forms.get(field.elementRenderer.renderer)!);
          }
          if (field.kind == "map") {
            const keyRenderer = field.keyRenderer;
            const valueRenderer = field.valueRenderer;
            if (keyRenderer && formsConfig.forms.has(keyRenderer.renderer)) {
              traverse(formsConfig.forms.get(keyRenderer.renderer)!);
            }
            if (
              valueRenderer &&
              formsConfig.forms.has(valueRenderer.renderer)
            ) {
              traverse(formsConfig.forms.get(valueRenderer.renderer)!);
            }
          }
        } catch (error: any) {
          console.error(`error parsing field :${fieldName}:: `, error);
          errors.push(error.message ?? error);
        }
      });
      formProcessingOrder = formProcessingOrder.add(formDef.name);
    };
    const allForms = formsConfig.forms.valueSeq().toArray();
    allForms.forEach((form) => {
      seen = seen.clear();
      traverse(form);
    });

    formProcessingOrder.forEach((formName) => {
      const formConfig = formsConfig.forms.get(formName)!;
      const formFieldRenderers = formConfig.fields
        .map((field) => field.renderer)
        .toObject();
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
          defaultValue(formsConfig.types, builtIns, injectedPrimitives),
          injectedPrimitives,
        );
        const formBuilder = Form<any, any, any, any>().Default<any>();
        const form = formBuilder
          .template({
            ...parsedForm.formConfig,
          })
          .mapContext<Unit>((_) => {
            return {
              label: (_ as any).label,
              value: (_ as any).value,
              commonFormState: (_ as any).commonFormState,
              formFieldStates: (_ as any).formFieldStates,
              rootValue: (_ as any).rootValue,
              extraContext: (_ as any).extraContext,
              visibilities: (_ as any).visibilities,
              disabledFields: (_ as any).disabledFields,
              visibilityPredicateExpressions:
                parsedForm.visibilityPredicateExpressions,
              disabledPredicateExpressions:
                parsedForm.disabledPredicatedExpressions,
              layout: formConfig.tabs,
            };
          });

        parsedForms = parsedForms.set(formName, {
          ...parsedForm,
          form,
          visibilityPredicateExpressions:
            parsedForm.visibilityPredicateExpressions,
          disabledPredicatedExpressions:
            parsedForm.disabledPredicatedExpressions,
        });
      } catch (error: any) {
        console.error(error);
        errors.push(error.message ?? error);
      }
    });

    if (errors.size > 0) {
      return ValueOrErrors.Default.throw(errors);
    }

    return ValueOrErrors.Default.return(parsedForms);
  };
export type EditLauncherContext<FormState, ExtraContext> = Omit<
  EditFormContext<FormState> &
    EditFormState<FormState> & {
      extraContext: ExtraContext;
      containerFormView: any;
      submitButtonWrapper: any;
    },
  "api" | "parser" | "actualForm"
>;

export type CreateLauncherContext<Entity, FormState, ExtraContext> = Omit<
  CreateFormContext<Entity, FormState> &
    CreateFormState<Entity, FormState> & {
      extraContext: ExtraContext;
      containerFormView: any;
      submitButtonWrapper: any;
    },
  "api" | "actualForm"
>;

export type PassthroughLauncherContext<Entity, FormState, ExtraContext> = Omit<
  PassthroughFormContext<Entity, FormState> &
    PassthroughFormState<Entity, FormState> & {
      extraContext: ExtraContext;
      containerFormView: any;
      containerWrapper: any;
    },
  "api" | "actualForm"
>;

export type ParsedLaunchers = {
  create: Map<
    string,
    <Entity, FormState, ExtraContext>() => {
      form: Template<
        CreateLauncherContext<Entity, FormState, ExtraContext> &
          CreateFormState<Entity, FormState>,
        CreateFormState<Entity, FormState>,
        Unit
      >;
      initialState: CreateFormState<Entity, FormState>;
    }
  >;
  edit: Map<
    string,
    <Entity, FormState, ExtraContext>() => {
      form: Template<
        EditLauncherContext<FormState, ExtraContext> &
          EditFormState<FormState>,
        EditFormState<FormState>,
        EditFormForeignMutationsExpected<FormState>
      >;
      initialState: EditFormState<FormState>;
    }
  >;
  passthrough: Map<
    string,
    <Entity, FormState, ExtraContext>() => {
      form: Template<
        PassthroughLauncherContext<Entity, FormState, ExtraContext> &
          PassthroughFormState<Entity, FormState>,
        PassthroughFormState<Entity, FormState>,
        Unit
      >;
      initialState: PassthroughFormState<Entity, FormState>;
      fromApiParser: (value: any) => Entity;
      toApiParser: (value: any, formState: any, checkKeys: boolean) => any;
      parseGlobalConfiguration: (
        raw: any,
      ) => ValueOrErrors<PredicateValue, string>;
    }
  >;
};
export type ParsedForms<T> = Map<
  string,
  ParsedForm<T> & {
    form: EntityFormTemplate<any, any, any, any, any>;
    visibilityPredicateExpressions: FieldPredicateExpressions;
    disabledPredicatedExpressions: FieldPredicateExpressions;
  }
>;
export type FormParsingErrors = List<string>;
export type FormParsingResult = Sum<ParsedLaunchers, FormParsingErrors>;
export type EnumName = string;
export type EnumOptionsSources = BasicFun<
  EnumName,
  BasicFun<Unit, Promise<Array<EnumReference>>>
>;
export type StreamName = string;
export type InfiniteStreamSources = BasicFun<
  StreamName,
  SearchableInfiniteStreamState<CollectionReference>["customFormState"]["getChunk"]
>;
export type ConfigName = string;
export type GlobalConfigurationSources = BasicFun<ConfigName, Promise<any>>;
export type EntityName = string;
export type EntityApis = {
  create: BasicFun<EntityName, BasicFun<any, Promise<Unit>>>;
  default: BasicFun<EntityName, BasicFun<Unit, Promise<any>>>;
  update: BasicFun<EntityName, (id: Guid, entity: any) => Promise<ApiErrors>>;
  get: BasicFun<EntityName, BasicFun<Guid, Promise<any>>>;
};

export const parseFormsToLaunchers =
  <T extends { [key in keyof T]: { type: any; state: any } }>(
    builtIns: BuiltIns,
    injectedPrimitives: InjectedPrimitives<T> | undefined,
    apiConverters: ApiConverters<T>,
    containerFormView: any,
    nestedContainerFormView: any,
    fieldViews: any,
    infiniteStreamSources: InfiniteStreamSources,
    enumOptionsSources: EnumOptionsSources,
    entityApis: EntityApis,
  ) =>
  (formsConfig: ParsedFormJSON<T>): FormParsingResult => {
    let parsedLaunchers: ParsedLaunchers = {
      create: Map(),
      edit: Map(),
      passthrough: Map(),
    };

    const parsedFormsResult = ParseForms(
      builtIns,
      injectedPrimitives,
      nestedContainerFormView,
      fieldViews,
      infiniteStreamSources,
      enumOptionsSources,
    )(formsConfig);

    if (parsedFormsResult.kind == "errors") {
      console.error(parsedFormsResult.errors);
      return Sum.Default.right(parsedFormsResult.errors);
    }

    const parsedForms = parsedFormsResult.value;

    formsConfig.launchers.edit.forEach((launcher, launcherName) => {
      const parsedForm = parsedForms.get(launcher.form)!;
      const form = parsedForm.form;
      const initialState = parsedForm.initialFormState;
      const formType = parsedForm.formDef.type;
      const globalConfigEntity = formsConfig.apis.entities.get(
        launcher.configApi,
      )!;
      const globalConfigurationType = formsConfig.types.get(
        globalConfigEntity.type,
      )!;
      const visibilityPredicateExpressions =
        parsedForm.visibilityPredicateExpressions;
      const disabledPredicatedExpressions =
        parsedForm.disabledPredicatedExpressions;
      const api = {
        getGlobalConfiguration: () => entityApis.get(launcher.configApi)(""),
        get: (id: string) => entityApis.get(launcher.api)(id),
        update: (id: any, parsed: any) => {
          return parsed.kind == "errors"
            ? Promise.reject(parsed.errors)
            : entityApis.update(launcher.api)(id, parsed.value);
        },
      };
      parsedLaunchers.edit = parsedLaunchers.edit.set(launcherName, <
        Entity,
        FormState,
        ExtraContext,
        Context extends EditLauncherContext<FormState, ExtraContext>,
      >() => ({
        form: EditFormTemplate<Entity, FormState>()
          .mapContext(
            (parentContext: Context) =>
              ({
                value:
                  parentContext.entity.sync.kind == "loaded"
                    ? parentContext.entity.sync.value
                    : undefined,
                entity: parentContext.entity,
                globalConfiguration: parentContext.globalConfiguration,
                entityId: parentContext.entityId,
                commonFormState: parentContext.commonFormState,
                customFormState: parentContext.customFormState,
                formFieldStates: parentContext.formFieldStates,
                extraContext: parentContext.extraContext,
                visibilityPredicateExpressions,
                disabledPredicatedExpressions,
                types: formsConfig.types,
                formType: formType,
                api: api,
                parseGlobalConfiguration: (raw: any) =>
                  PredicateValue.Operations.parse(
                    raw,
                    globalConfigurationType,
                    formsConfig.types,
                  ),
                fromApiParser: (value: any) =>
                  fromAPIRawValue(
                    formType,
                    formsConfig.types,
                    builtIns,
                    apiConverters,
                    injectedPrimitives,
                  )(value),
                toApiParser: (value: any, formState: any, checkKeys: boolean) =>
                  toAPIRawValue(
                    formType,
                    formsConfig.types,
                    builtIns,
                    apiConverters,
                    injectedPrimitives,
                  )(value, formState, checkKeys),
                actualForm: form
                  .withView(containerFormView)
                  .mapContext((_: any) => ({
                    value: _.value,
                    toApiParser: parentContext.toApiParser,
                    fromApiParser: parentContext.fromApiParser,
                    parseGlobalConfiguration:
                      parentContext.parseGlobalConfiguration,
                    formFieldStates: parentContext.formFieldStates,
                    rootValue: _.value,
                    extraContext: parentContext.extraContext,
                    commonFormState: parentContext.commonFormState,
                    predicateEvaluations:
                      parentContext.customFormState.predicateEvaluations,
                    visibilities: _.visibilities,
                    disabledFields: _.disabledFields,
                  })),
              }) as any,
          )
          .withViewFromProps((props) => props.context.submitButtonWrapper)
          .mapForeignMutationsFromProps(
            (props) => props.foreignMutations as any,
          ),
        initialState: EditFormState<FormState>().Default(
          initialState.formFieldStates,
          initialState.commonFormState,
          {
            initApiChecker: ApiResponseChecker.Default(true),
            updateApiChecker: ApiResponseChecker.Default(true),
            configApiChecker: ApiResponseChecker.Default(true),
            apiRunner: Debounced.Default(Synchronized.Default(unit)),
            predicateEvaluations: Debounced.Default(
              ValueOrErrors.Default.return({
                visiblityPredicateEvaluations:
                  FormFieldPredicateEvaluation.Default.form(false, Map()),
                disabledPredicateEvaluations:
                  FormFieldPredicateEvaluation.Default.form(false, Map()),
              }),
            ),
          },
        ),
      }));
    });

    formsConfig.launchers.create.forEach((launcher, launcherName) => {
      const parsedForm = parsedForms.get(launcher.form)!;
      const form = parsedForm.form;
      const initialState = parsedForm.initialFormState;
      const formType = parsedForm.formDef.type;
      const globalConfigEntity = formsConfig.apis.entities.get(
        launcher.configApi,
      )!;
      const globalConfigurationType = formsConfig.types.get(
        globalConfigEntity.type,
      )!;
      const visibilityPredicateExpressions =
        parsedForm.visibilityPredicateExpressions;
      const disabledPredicatedExpressions =
        parsedForm.disabledPredicatedExpressions;
      const api = {
        getGlobalConfiguration: () => entityApis.get(launcher.configApi)(""),
        default: (_: Unit) => entityApis.default(launcher.api)(unit),
        create: (parsed: any) =>
          parsed.kind == "errors"
            ? Promise.reject(parsed.errors)
            : entityApis.create(launcher.api)(parsed.value),
      };
      parsedLaunchers.create = parsedLaunchers.create.set(launcherName, <
        Entity,
        FormState,
        ExtraContext,
        Context extends CreateLauncherContext<Entity, FormState, ExtraContext>,
      >() => ({
        form: CreateFormTemplate<Entity, FormState>()
          .mapContext((parentContext: Context) => {
            return {
              value:
                parentContext.entity.sync.kind == "loaded"
                  ? parentContext.entity.sync.value
                  : undefined,
              rawEntity: parentContext.rawEntity,
              entity: parentContext.entity,
              rawGlobalConfiguration: parentContext.rawGlobalConfiguration,
              globalConfiguration: parentContext.globalConfiguration,
              entityId: parentContext.entityId,
              commonFormState: parentContext.commonFormState,
              customFormState: parentContext.customFormState,
              formFieldStates: parentContext.formFieldStates,
              extraContext: parentContext.extraContext,
              visibilityPredicateExpressions,
              disabledPredicatedExpressions,
              types: formsConfig.types,
              formType: formType,
              api: api,
              parseGlobalConfiguration: (raw: any) =>
                PredicateValue.Operations.parse(
                  raw,
                  globalConfigurationType,
                  formsConfig.types,
                ),
              fromApiParser: (value: any) =>
                fromAPIRawValue(
                  formType,
                  formsConfig.types,
                  builtIns,
                  apiConverters,
                  injectedPrimitives,
                )(value),
              toApiParser: (value: any, formState: any, checkKeys: boolean) =>
                toAPIRawValue(
                  formType,
                  formsConfig.types,
                  builtIns,
                  apiConverters,
                  injectedPrimitives,
                )(value, formState, checkKeys),
              actualForm: form
                .withView(containerFormView)
                .mapContext((_: any) => {
                  return {
                    value: _.value,
                    toApiParser: parentContext.toApiParser,
                    fromApiParser: parentContext.fromApiParser,
                    parseGlobalConfiguration:
                      parentContext.parseGlobalConfiguration,
                    formFieldStates: parentContext.formFieldStates,
                    rootValue: _.value,
                    extraContext: parentContext.extraContext,
                    commonFormState: parentContext.commonFormState,
                    predicateEvaluations:
                      parentContext.customFormState.predicateEvaluations,
                    visibilities: _.visibilities,
                    disabledFields: _.disabledFields,
                  };
                }),
            } as any;
          })
          .withViewFromProps((props) => props.context.submitButtonWrapper)
          .mapForeignMutationsFromProps(
            (props) => props.foreignMutations as any,
          ),
        initialState: CreateFormState<any, any>().Default(
          initialState.formFieldStates,
          initialState.commonFormState,
          {
            initApiChecker: ApiResponseChecker.Default(true),
            createApiChecker: ApiResponseChecker.Default(true),
            configApiChecker: ApiResponseChecker.Default(true),
            apiRunner: Debounced.Default(Synchronized.Default(unit)),
            predicateEvaluations: Debounced.Default(
              ValueOrErrors.Default.return({
                visiblityPredicateEvaluations:
                  FormFieldPredicateEvaluation.Default.form(false, Map()),
                disabledPredicateEvaluations:
                  FormFieldPredicateEvaluation.Default.form(false, Map()),
              }),
            ),
          },
        ),
      }));
    });

    formsConfig.launchers.passthrough.forEach((launcher, launcherName) => {
      const parsedForm = parsedForms.get(launcher.form)!;
      const form = parsedForm.form;
      const globalConfigurationType = formsConfig.types.get(
        launcher.configType,
      )!;
      const initialState = parsedForm.initialFormState;
      const formType = parsedForm.formDef.type;
      const visibilityPredicateExpressions =
        parsedForm.visibilityPredicateExpressions;
      const disabledPredicatedExpressions =
        parsedForm.disabledPredicatedExpressions;
      parsedLaunchers.passthrough = parsedLaunchers.passthrough.set(
        launcherName,
        <
          Entity,
          FormState,
          ExtraContext,
          Context extends PassthroughLauncherContext<
            Entity,
            FormState,
            ExtraContext
          >,
        >() => ({
          form: PassthroughFormTemplate<Entity, FormState>()
            .mapContext(
              (parentContext: Context) =>
                ({
                  initialRawEntity: parentContext.initialRawEntity,
                  entity: parentContext.entity,
                  globalConfiguration: parentContext.globalConfiguration,
                  commonFormState: parentContext.commonFormState,
                  customFormState: parentContext.customFormState,
                  formFieldStates: parentContext.formFieldStates,
                  extraContext: parentContext.extraContext,
                  visibilityPredicateExpressions,
                  disabledPredicatedExpressions,
                  types: formsConfig.types,
                  formType: formType,
                  onRawEntityChange: parentContext.onRawEntityChange,
                  parseGlobalConfiguration: (raw: any) =>
                    PredicateValue.Operations.parse(
                      raw,
                      globalConfigurationType,
                      formsConfig.types,
                    ),
                  fromApiParser: (value: any) =>
                    fromAPIRawValue(
                      formType,
                      formsConfig.types,
                      builtIns,
                      apiConverters,
                      injectedPrimitives,
                    )(value),
                  toApiParser: (
                    value: any,
                    formState: any,
                    checkKeys: boolean,
                  ) =>
                    toAPIRawValue(
                      formType,
                      formsConfig.types,
                      builtIns,
                      apiConverters,
                      injectedPrimitives,
                    )(value, formState, checkKeys),
                  actualForm: form
                    .withView(containerFormView)
                    .mapContext((_: any) => ({
                      value: _.value,
                      entity: _.entity,
                      toApiParser: parentContext.toApiParser,
                      fromApiParser: parentContext.fromApiParser,
                      parseGlobalConfiguration:
                        parentContext.parseGlobalConfiguration,
                      formFieldStates: parentContext.formFieldStates,
                      rootValue: _.value,
                      extraContext: parentContext.extraContext,
                      commonFormState: parentContext.commonFormState,
                      predicateEvaluations:
                        parentContext.customFormState.predicateEvaluations,
                      visibilities: _.visibilities,
                      disabledFields: _.disabledFields,
                    })),
                }) as any,
            )
            .withViewFromProps((props) => props.context.containerWrapper)
            .mapForeignMutationsFromProps(
              (props) => props.foreignMutations as any,
            ),
          initialState: PassthroughFormState<Entity, FormState>().Default(
            initialState.formFieldStates,
            initialState.commonFormState,
          ),
          fromApiParser: (value: any): Entity =>
            fromAPIRawValue(
              formType,
              formsConfig.types,
              builtIns,
              apiConverters,
              injectedPrimitives,
            )(value),
          toApiParser: (value: any, formState: any, checkKeys: boolean) =>
            toAPIRawValue(
              formType,
              formsConfig.types,
              builtIns,
              apiConverters,
              injectedPrimitives,
            )(value, formState, checkKeys),
          parseGlobalConfiguration: (raw: any) =>
            PredicateValue.Operations.parse(
              raw,
              globalConfigurationType,
              formsConfig.types,
            ),
        }),
      );
    });

    return Sum.Default.left(parsedLaunchers);
  };

export type FormsParserContext<
  T extends { [key in keyof T]: { type: any; state: any } },
> = {
  containerFormView: any;
  nestedContainerFormView: any;
  fieldViews: any;
  fieldTypeConverters: ApiConverters<T>;
  infiniteStreamSources: InfiniteStreamSources;
  enumOptionsSources: EnumOptionsSources;
  entityApis: EntityApis;
  getFormsConfig: BasicFun<void, Promise<any>>;
  injectedPrimitives?: Injectables<T>;
};
export type FormsParserState = {
  formsConfig: Synchronized<Unit, FormParsingResult>;
};
export const FormsParserState = {
  Default: (): FormsParserState => ({
    formsConfig: Synchronized.Default(unit),
  }),
  Updaters: {
    ...simpleUpdater<FormsParserState>()("formsConfig"),
  },
};
