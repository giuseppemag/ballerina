import {
  ApiErrors,
  ApiResponseChecker,
  AsyncState,
  BasicUpdater,
  CommonFormState,
  Debounced,
  FieldPredicateExpressions,
  ForeignMutationsInput,
  FormFieldPredicateEvaluation,
  id,
  ParsedType,
  PredicateValue,
  SimpleCallback,
  simpleUpdater,
  simpleUpdaterWithChildren,
  Sum,
  Synchronized,
  Template,
  unit,
  Unit,
  Updater,
  Value,
} from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";

export type CreateFormContext<T, FS> = {
  entityId: string;
  api: {
    default: () => Promise<any>;
    create: (raw: any) => Promise<ApiErrors>;
    getGlobalConfiguration: () => Promise<any>;
  };
  formType: ParsedType<T>;
  toApiParser: (
    entity: PredicateValue,
    formstate: CreateFormState<T, FS>
  ) => ValueOrErrors<any, string>;
  fromApiParser: (raw: any) => ValueOrErrors<PredicateValue, string>;
  parseGlobalConfiguration: (raw: any) => ValueOrErrors<PredicateValue, string>;
  visibilityPredicateExpressions: FieldPredicateExpressions;
  disabledPredicatedExpressions: FieldPredicateExpressions;
  actualForm: Template<
    Value<PredicateValue> & { formFieldStates: FS } & {
      commonFormState: CommonFormState;
    } & { visibilities: FormFieldPredicateEvaluation | undefined } & {
      disabledFields: FormFieldPredicateEvaluation | undefined;
    },
    { formFieldStates: FS } & { commonFormState: CommonFormState },
    { onChange: SimpleCallback<BasicUpdater<PredicateValue>> }
  >;
};

export type CreateFormState<T, FS> = {
  entity: Synchronized<Unit, PredicateValue>;
  globalConfiguration: Synchronized<Unit, PredicateValue>;
  formFieldStates: FS;
  commonFormState: CommonFormState;
  customFormState: {
    initApiChecker: ApiResponseChecker;
    configApiChecker: ApiResponseChecker;
    createApiChecker: ApiResponseChecker;
    predicateEvaluations: Debounced<
      ValueOrErrors<
        {
          visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
          disabledPredicateEvaluations: FormFieldPredicateEvaluation;
        },
        string
      >
    >;
    apiRunner: Debounced<Synchronized<Unit, ApiErrors>>;
  };
};

export const CreateFormState = <T, FS>() => ({
  Default: (
    formFieldStates: FS,
    commonFormState: CommonFormState,
    customFormState: {
      initApiChecker: ApiResponseChecker;
      configApiChecker: ApiResponseChecker;
      createApiChecker: ApiResponseChecker;
      predicateEvaluations: Debounced<
        ValueOrErrors<
          {
            visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
            disabledPredicateEvaluations: FormFieldPredicateEvaluation;
          },
          string
        >
      >;
      apiRunner: Debounced<Synchronized<Unit, ApiErrors>>;
    }
  ): CreateFormState<T, FS> => ({
    entity: Synchronized.Default(unit),
    globalConfiguration: Synchronized.Default(unit),
    formFieldStates,
    commonFormState,
    customFormState,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<CreateFormState<T, FS>>()("entity"),
      ...simpleUpdater<CreateFormState<T, FS>>()("globalConfiguration"),
      ...simpleUpdater<CreateFormState<T, FS>>()("formFieldStates"),
      ...simpleUpdaterWithChildren<CreateFormState<T, FS>>()({
        ...simpleUpdater<CreateFormState<T, FS>["customFormState"]>()(
          "initApiChecker"
        ),
        ...simpleUpdater<CreateFormState<T, FS>["customFormState"]>()(
          "configApiChecker"
        ),
        ...simpleUpdater<CreateFormState<T, FS>["customFormState"]>()(
          "createApiChecker"
        ),
        ...simpleUpdater<CreateFormState<T, FS>["customFormState"]>()(
          "apiRunner"
        ),
        ...simpleUpdater<CreateFormState<T, FS>["customFormState"]>()(
          "predicateEvaluations"
        ),
      })("customFormState"),
      ...simpleUpdater<CreateFormState<T, FS>>()("commonFormState"),
    },
    Template: {
      entity: (
        _: BasicUpdater<PredicateValue>
      ): Updater<CreateFormState<T, FS>> =>
        CreateFormState<T, FS>().Updaters.Core.entity(
          Synchronized.Updaters.sync(AsyncState.Operations.map(_))
        ),
      submit: (): Updater<CreateFormState<T, FS>> =>
        CreateFormState<
          T,
          FS
        >().Updaters.Core.customFormState.children.apiRunner(
          Debounced.Updaters.Template.value(
            Synchronized.Updaters.sync(AsyncState.Operations.map(id))
          )
        ),
      recalculatePredicates: (): Updater<CreateFormState<T, FS>> =>
        CreateFormState<
          T,
          FS
        >().Updaters.Core.customFormState.children.predicateEvaluations(
          Debounced.Updaters.Template.value(id)
        ),
    },
  },
  ForeignMutations: (
    _: ForeignMutationsInput<
      CreateFormContext<T, FS>,
      CreateFormWritableState<T, FS>
    >
  ) => ({}),
});

export type CreateFormWritableState<T, FS> = CreateFormState<T, FS>;
export type CreateFormForeignMutationsExposed<T, FS> = ReturnType<
  ReturnType<typeof CreateFormState<T, FS>>["ForeignMutations"]
>;
export type CreateFormForeignMutationsExpected<T, FS> = {
  apiHandlers?: {
    onDefaultSuccess?: (
      _: (CreateFormWritableState<T, FS> & CreateFormContext<T, FS>) | undefined
    ) => void;
    onDefaultError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onConfigSuccess?: (
      _: (CreateFormWritableState<T, FS> & CreateFormContext<T, FS>) | undefined
    ) => void;
    onConfigError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onCreateSuccess?: (
      _: (CreateFormWritableState<T, FS> & CreateFormContext<T, FS>) | undefined
    ) => void;
    onCreateError?: <ApiErrors>(_: ApiErrors | undefined) => void;
  };
};
