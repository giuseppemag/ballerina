import { Map } from "immutable";
import {
  ApiResponseChecker,
  AsyncState,
  BasicUpdater,
  CommonFormState,
  Debounced,
  FieldPredicateExpressions,
  ForeignMutationsInput,
  FormFieldPredicateEvaluation,
  Guid,
  id,
  ParsedType,
  PredicateValue,
  SimpleCallback,
  simpleUpdater,
  simpleUpdaterWithChildren,
  Synchronized,
  Template,
  unit,
  Unit,
  Updater,
  Value,
} from "../../../../../../main";
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";

export type ApiErrors = Array<string>;

export type EditFormContext<T, FS> = {
  entityId: string;
  api: {
    get: (id: Guid) => Promise<PredicateValue>;
    update: (id: Guid, raw: any) => Promise<ApiErrors>;
    getGlobalConfiguration: () => Promise<PredicateValue>;
  };
  formType: ParsedType<T>;
  toApiParser: (
    entity: PredicateValue,
    formstate: EditFormState<T, FS>
  ) => ValueOrErrors<any, string>;
  fromApiParser: (raw: any) => PredicateValue;
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

export type EditFormState<T, FS> = {
  entity: Synchronized<Unit, PredicateValue>
  globalConfiguration: Synchronized<
    Unit,
    ValueOrErrors<PredicateValue, string>
  >;
  formFieldStates: FS;
  commonFormState: CommonFormState;
  customFormState: {
    initApiChecker: ApiResponseChecker;
    configApiChecker: ApiResponseChecker;
    updateApiChecker: ApiResponseChecker;
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

export const EditFormState = <T, FS>() => ({
  Default: (
    formFieldStates: FS,
    commonFormState: CommonFormState,
    customFormState: {
      initApiChecker: ApiResponseChecker;
      configApiChecker: ApiResponseChecker;
      updateApiChecker: ApiResponseChecker;
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
  ): EditFormState<T, FS> => ({
    entity: Synchronized.Default(unit),
    globalConfiguration: Synchronized.Default(unit),
    formFieldStates,
    commonFormState,
    customFormState,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<EditFormState<T, FS>>()("entity"),
      ...simpleUpdater<EditFormState<T, FS>>()("formFieldStates"),
      ...simpleUpdater<EditFormState<T, FS>>()("globalConfiguration"),
      ...simpleUpdaterWithChildren<EditFormState<T, FS>>()({
        ...simpleUpdater<EditFormState<T, FS>["customFormState"]>()(
          "initApiChecker"
        ),
        ...simpleUpdater<EditFormState<T, FS>["customFormState"]>()(
          "configApiChecker"
        ),
        ...simpleUpdater<EditFormState<T, FS>["customFormState"]>()(
          "updateApiChecker"
        ),
        ...simpleUpdater<EditFormState<T, FS>["customFormState"]>()(
          "apiRunner"
        ),
        ...simpleUpdater<EditFormState<T, FS>["customFormState"]>()(
          "predicateEvaluations"
        ),
      })("customFormState"),
      ...simpleUpdater<EditFormState<T, FS>>()("commonFormState"),
    },
    Template: {
      entity: (
        _: BasicUpdater<PredicateValue>
      ): Updater<EditFormState<T, FS>> =>
        EditFormState<T, FS>().Updaters.Core.entity(
          Synchronized.Updaters.sync(AsyncState.Operations.map(_))
        ),
      submit: (): Updater<EditFormState<T, FS>> =>
        EditFormState<T, FS>().Updaters.Core.customFormState.children.apiRunner(
          Debounced.Updaters.Template.value(
            Synchronized.Updaters.sync(AsyncState.Operations.map(id))
          )
        ),
      recalculatePredicates: (): Updater<EditFormState<T, FS>> =>
        EditFormState<
          T,
          FS
        >().Updaters.Core.customFormState.children.predicateEvaluations(
          Debounced.Updaters.Template.value(id)
        ),
    },
  },
  ForeignMutations: (
    _: ForeignMutationsInput<
      EditFormContext<T, FS>,
      EditFormWritableState<T, FS>
    >
  ) => ({}),
});

export type EditFormWritableState<T, FS> = EditFormState<T, FS>;
export type EditFormForeignMutationsExposed<T, FS> = ReturnType<
  ReturnType<typeof EditFormState<T, FS>>["ForeignMutations"]
>;
export type EditFormForeignMutationsExpected<T, FS> = {
  apiHandlers?: {
    onGetSuccess?: (
      _: (EditFormWritableState<T, FS> & EditFormContext<T, FS>) | undefined
    ) => void;
    onGetError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onUpdateSuccess?: (
      _: (EditFormWritableState<T, FS> & EditFormContext<T, FS>) | undefined
    ) => void;
    onUpdateError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onConfigSuccess?: (
      _: (EditFormWritableState<T, FS> & EditFormContext<T, FS>) | undefined
    ) => void;
    onConfigError?: <ApiErrors>(_: ApiErrors | undefined) => void;
  };
};
