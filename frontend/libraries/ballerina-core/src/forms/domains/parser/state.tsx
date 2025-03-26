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
  defaultState,
  TypeName,
  ParsedRecordFormConfig,
  ParsedUnionFormConfig,
  FormLabel,
  UnionForm,
} from "../../../../main";
import { EnumReference } from "../collection/domains/reference/state";
import { SearchableInfiniteStreamState } from "../primitives/domains/searchable-infinite-stream/state";
import { Form } from "../singleton/template";
import { ParsedRenderer } from "./domains/renderer/state";

export type ParsedRecordForm<T> = {
  initialFormState: any;
  formConfig: any;
  formName: string;
  formDef: ParsedFormConfig<T>;
  visibilityPredicateExpressions: FieldPredicateExpressions;
  disabledPredicatedExpressions: FieldPredicateExpressions;
  parsedRenderer: ParsedRenderer<T>;
};

export type ParsedUnionForm<T> = {
  initialFormState: any;
  formConfig: any;
  formName: string;
  formDef: ParsedFormConfig<T>;
  parsedRenderer: ParsedRenderer<T>;
};

export type ParsedForm<T> = ParsedRecordForm<T> | ParsedUnionForm<T>;
export const ParseForm =
  <T,>(
    nestedContainerFormView: any,
    formViews: Record<string, Record<string, any>>,
    formFieldRenderers: any,
    infiniteStreamSources: any,
    enumOptionsSources: EnumOptionsSources,
    defaultValue: BasicFun<ParsedType<T>, any>,
    defaultState: BasicFun<ParsedType<T>, any>,
    injectedPrimitives?: InjectedPrimitives<T>,
  ) =>
  (forms: ParsedForms<T>) =>
  (
    formName: string,
    formDef: ParsedRecordFormConfig<T>,
  ): ParsedForm<T> => {
    const formConfig: any = {};
    let visibilityPredicateExpressions: FieldPredicateExpressions = Map();
    let disabledPredicatedExpressions: FieldPredicateExpressions = Map();
    const initialFormState: any = {
      commonFormState: CommonFormState.Default(),
      formFieldStates: {},
    };

    const fieldNames = Object.keys(formFieldRenderers);

    fieldNames.forEach((fieldName) => {
      const parsedFormConfig = ParsedRenderer.Operations.RendererToForm(
        fieldName,
        {
          formViews,
          forms,
          nestedContainerFormView,
          defaultValue,
          defaultState,
          enumOptionsSources,
          infiniteStreamSources,
          injectedPrimitives,
        },
        formDef.fields.get(fieldName)!,
      );
      if (parsedFormConfig.kind == "errors") {
        console.error(parsedFormConfig.errors.toJS());
        throw Error(`Error parsing form ${formFieldRenderers[fieldName]}`);
      }
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

export const ParseUnionForm =
  <T,>(
    nestedContainerFormView: any,
    formViews: Record<string, Record<string, any>>,
    formFieldRenderers: any,
    infiniteStreamSources: any,
    enumOptionsSources: EnumOptionsSources,
    defaultValue: BasicFun<ParsedType<T>, any>,
    defaultState: BasicFun<ParsedType<T>, any>,
    injectedPrimitives?: InjectedPrimitives<T>,
  ) =>
  (forms: ParsedForms<T>) =>
  (formName: string, formDef: ParsedUnionFormConfig<T>): ParsedUnionForm<T> => {
    const initialFormState: any = {
      commonFormState: CommonFormState.Default(),
      formFieldStates: {},
    };

    // const parsedFormConfig = ParsedRenderer.Operations.RendererToForm(
    //   formName,
    //   {
    //     formViews,
    //     forms,
    //     nestedContainerFormView,
    //     defaultValue,
    //     defaultState,
    //     enumOptionsSources,
    //     infiniteStreamSources,
    //     injectedPrimitives,
    //   },
    //   formDef.renderer,
    // );
    // if (parsedFormConfig.kind == "errors") {
    //   console.error(parsedFormConfig.errors.toJS());
    //   throw Error(`Error parsing form ${formDef.name}`);
    // }
    const viewKind = ParsedRenderer.Operations.FormViewToViewKind(
      formDef.renderer.renderer,
      formViews,
      forms.keySeq().toSet(),
    );

    const caseTemplates = Map(
      formDef.renderer.cases.map((caseDef) => {
        return forms.get(caseDef)!.form;
      }),
    );

    const parsedFormConfig = ValueOrErrors.Default.return({
      form: {
        renderer: UnionForm<any & FormLabel, any>(caseTemplates)
          .withView(formViews[viewKind][formDef.renderer.renderer]())
          .mapContext<any>((_) => ({
            ..._,
          })),
        initialValue: defaultValue(formDef.type),
        initialState: forms.get(formDef.name)!.initialFormState,
      },
    });

    if (parsedFormConfig.kind == "errors") {
      console.error(parsedFormConfig.errors.toJS());
      throw Error(`Error parsing form ${formDef.name}`);
    }

    formConfig[formDef.name] = parsedFormConfig.value.form.renderer;

    initialFormState["formFieldStates"][formDef.name] =
      parsedFormConfig.value.form.initialState;

    return {
      initialFormState,
      formConfig,
      formName,
      formDef,
      form: parsedFormConfig.value.form,
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
  (types: Map<TypeName, ParsedType<T>>) =>
  (
    forms: Map<string, ParsedFormConfig<T>>,
  ): ValueOrErrors<ParsedForms<T>, string> => {
    const recordForms = forms.filter((form) => form.kind == "recordForm");
    const unionForms = forms.filter((form) => form.kind == "unionForm");

    let errors: FormParsingErrors = List();
    let seen = Set<string>();
    let formProcessingOrder = OrderedSet<string>();

    let parsedForms: ParsedForms<T> = Map();
    const traverseRecordForm = (recordForm: ParsedRecordFormConfig<T>) => {
      if (formProcessingOrder.has(recordForm.name)) {
        return;
      }
      if (seen.has(recordForm.name)) {
        errors.push(
          `aborting: cycle detected when parsing forms: ${JSON.stringify(
            formProcessingOrder.reverse().toArray(),
          )} -> ${recordForm.name}`,
        );
        return;
      }
      seen = seen.add(recordForm.name);
      recordForm.fields.forEach((field, fieldName) => {
        if (field.type.kind == "lookup" || field.type.kind == "record") {
          traverseRecordForm(recordForms.get(field.renderer)!);
        }
        try {
          if (field.kind == "list") {
            if (typeof field.elementRenderer == "string")
              throw Error(
                "Deprecated element renderer as string, use a render object instead - check parser.",
              );
            if (recordForms.has(field.elementRenderer.renderer))
              traverseRecordForm(
                recordForms.get(field.elementRenderer.renderer)!,
              );
          }
          if (field.kind == "map") {
            const keyRenderer = field.keyRenderer;
            const valueRenderer = field.valueRenderer;
            if (keyRenderer && recordForms.has(keyRenderer.renderer)) {
              traverseRecordForm(recordForms.get(keyRenderer.renderer)!);
            }
            if (valueRenderer && recordForms.has(valueRenderer.renderer)) {
              traverseRecordForm(recordForms.get(valueRenderer.renderer)!);
            }
          }
        } catch (error: any) {
          console.error(`error parsing field :${fieldName}:: `, error);
          errors.push(error.message ?? error);
        }
      });
      formProcessingOrder = formProcessingOrder.add(recordForm.name);
    };
    const allForms = recordForms.valueSeq().toArray();
    allForms.forEach((form) => {
      seen = seen.clear();
      traverseRecordForm(form);
    });

    formProcessingOrder.forEach((formName) => {
      const formConfig = recordForms.get(formName)!;
      const formFieldRenderers = formConfig.fields
        .map((field) => field.renderer)
        .toObject();
      try {
        const parsedForm = ParseRecordForm(
          nestedContainerFormView,
          fieldViews,
          formFieldRenderers,
          infiniteStreamSources,
          enumOptionsSources,
          defaultValue(types, builtIns, injectedPrimitives),
          defaultState(types, builtIns, injectedPrimitives),
          injectedPrimitives,
        )(parsedForms)(formName, formConfig);
        const formBuilder = Form<any, any, any>().Default<any>();
        const form = formBuilder
          .template({
            ...parsedForm.formConfig,
          })
          .mapContext<Unit>((_) => {
            return {
              visible: (_ as any).visible ?? true,
              disabled: (_ as any).disabled ?? false,
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
        });
      } catch (error: any) {
        console.error(error);
        errors.push(error.message ?? error);
      }
    });

    if (errors.size > 0) {
      return ValueOrErrors.Default.throw(errors);
    }

    unionForms.forEach((form) => {
      const formConfig = unionForms.get(form.name)!;
      const formFieldRenderers = formConfig.cases
        .map((field) => field.renderer)
        .toObject();
    });

    return ValueOrErrors.Default.return(parsedForms);
  };
export type EditLauncherContext<T, FormState, ExtraContext> = Omit<
  EditFormContext<T, FormState> &
    EditFormState<T, FormState> & {
      extraContext: ExtraContext;
      containerFormView: any;
      submitButtonWrapper: any;
    },
  "api" | "parser" | "actualForm"
>;

export type CreateLauncherContext<T, FormState, ExtraContext> = Omit<
  CreateFormContext<T, FormState> &
    CreateFormState<T, FormState> & {
      extraContext: ExtraContext;
      containerFormView: any;
      submitButtonWrapper: any;
    },
  "api" | "actualForm"
>;

export type PassthroughLauncherContext<T, FormState, ExtraContext> = Omit<
  PassthroughFormContext<T, FormState> &
    PassthroughFormState<T, FormState> & {
      extraContext: ExtraContext;
      containerFormView: any;
      containerWrapper: any;
    },
  "api" | "actualForm"
>;

export type ParsedLaunchers = {
  create: Map<
    string,
    <T, FormState, ExtraContext>() => {
      form: Template<
        CreateLauncherContext<T, FormState, ExtraContext> &
          CreateFormState<T, FormState>,
        CreateFormState<T, FormState>,
        Unit
      >;
      initialState: CreateFormState<T, FormState>;
    }
  >;
  edit: Map<
    string,
    <T, FormState, ExtraContext>() => {
      form: Template<
        EditLauncherContext<T, FormState, ExtraContext> &
          EditFormState<T, FormState>,
        EditFormState<T, FormState>,
        EditFormForeignMutationsExpected<T, FormState>
      >;
      initialState: EditFormState<T, FormState>;
    }
  >;
  passthrough: Map<
    string,
    <T, FormState, ExtraContext>() => {
      form: Template<
        PassthroughLauncherContext<T, FormState, ExtraContext> &
          PassthroughFormState<T, FormState>,
        PassthroughFormState<T, FormState>,
        Unit
      >;
      initialState: PassthroughFormState<T, FormState>;
      fromApiParser: (value: any) => ValueOrErrors<PredicateValue, string>;
      toApiParser: (
        value: PredicateValue,
        formState: any,
      ) => ValueOrErrors<any, string>;
      parseGlobalConfiguration: (
        raw: any,
      ) => ValueOrErrors<PredicateValue, string>;
    }
  >;
};
export type ParsedForms<T> = Map<
  string,
  ParsedRecordForm<T> & {
    form: EntityFormTemplate<any, any, any, any>;
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
  SearchableInfiniteStreamState["customFormState"]["getChunk"]
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
    )(formsConfig.types)(formsConfig.forms);

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
        T,
        FormState,
        ExtraContext,
        Context extends EditLauncherContext<T, FormState, ExtraContext>,
      >() => ({
        form: EditFormTemplate<T, FormState>()
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
                  fromAPIRawValue(
                    globalConfigurationType,
                    formsConfig.types,
                    builtIns,
                    apiConverters,
                    injectedPrimitives,
                  )(raw),
                fromApiParser: (value: any) =>
                  fromAPIRawValue(
                    formType,
                    formsConfig.types,
                    builtIns,
                    apiConverters,
                    injectedPrimitives,
                  )(value),
                toApiParser: (value: PredicateValue, formState: any) =>
                  toAPIRawValue(
                    formType,
                    formsConfig.types,
                    builtIns,
                    apiConverters,
                    injectedPrimitives,
                  )(value, formState),
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
              } as any),
          )
          .withViewFromProps((props) => props.context.submitButtonWrapper)
          .mapForeignMutationsFromProps(
            (props) => props.foreignMutations as any,
          ),
        initialState: EditFormState<T, FormState>().Default(
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
        T,
        FormState,
        ExtraContext,
        Context extends CreateLauncherContext<T, FormState, ExtraContext>,
      >() => ({
        form: CreateFormTemplate<T, FormState>()
          .mapContext((parentContext: Context) => {
            return {
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
                fromAPIRawValue(
                  globalConfigurationType,
                  formsConfig.types,
                  builtIns,
                  apiConverters,
                  injectedPrimitives,
                )(raw),
              fromApiParser: (value: any) =>
                fromAPIRawValue(
                  formType,
                  formsConfig.types,
                  builtIns,
                  apiConverters,
                  injectedPrimitives,
                )(value),
              toApiParser: (value: PredicateValue, formState: any) =>
                toAPIRawValue(
                  formType,
                  formsConfig.types,
                  builtIns,
                  apiConverters,
                  injectedPrimitives,
                )(value, formState),
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
        initialState: CreateFormState<T, FormState>().Default(
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
          T,
          FormState,
          ExtraContext,
          Context extends PassthroughLauncherContext<
            T,
            FormState,
            ExtraContext
          >,
        >() => ({
          form: PassthroughFormTemplate<T, FormState>()
            .mapContext(
              (parentContext: Context) =>
                ({
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
                  onEntityChange: parentContext.onEntityChange,
                  actualForm: form
                    .withView(containerFormView)
                    .mapContext((_: any) => ({
                      value: _.value,
                      entity: _.entity,
                      formFieldStates: parentContext.formFieldStates,
                      rootValue: _.value,
                      extraContext: parentContext.extraContext,
                      commonFormState: parentContext.commonFormState,
                      predicateEvaluations:
                        parentContext.customFormState.predicateEvaluations,
                      visibilities: _.visibilities,
                      disabledFields: _.disabledFields,
                    })),
                } as any),
            )
            .withViewFromProps((props) => props.context.containerWrapper)
            .mapForeignMutationsFromProps(
              (props) => props.foreignMutations as any,
            ),
          initialState: PassthroughFormState<T, FormState>().Default(
            initialState.formFieldStates,
            initialState.commonFormState,
          ),
          fromApiParser: (value: any): ValueOrErrors<PredicateValue, string> =>
            fromAPIRawValue(
              formType,
              formsConfig.types,
              builtIns,
              apiConverters,
              injectedPrimitives,
            )(value),
          toApiParser: (value: PredicateValue, formState: any) =>
            toAPIRawValue(
              formType,
              formsConfig.types,
              builtIns,
              apiConverters,
              injectedPrimitives,
            )(value, formState),
          parseGlobalConfiguration: (raw: any) =>
            fromAPIRawValue(
              globalConfigurationType,
              formsConfig.types,
              builtIns,
              apiConverters,
              injectedPrimitives,
            )(raw),
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
