import { Map } from "immutable";
import {
  ApiResponseChecker,
  AsyncState,
  BasicUpdater,
  CommonFormState,
  Debounced,
  DirtyStatus,
  FieldPredicateExpressions,
  ForeignMutationsInput,
  FormFieldPredicateEvaluation,
  Guid,
  id,
  ParsedType,
  PredicateValue,
  replaceWith,
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

export type ApiErrors = Array<string>;

export type EditFormContext<FS> = {
  entityId: string;
  api: {
    get: (id: Guid) => Promise<PredicateValue>;
    update: (id: Guid, raw: any) => Promise<ApiErrors>;
    getGlobalConfiguration: () => Promise<any>;
  };
  formType: ParsedType<FS>;
  types: Map<string, ParsedType<FS>>;
  toApiParser: (
    entity: PredicateValue,
    formstate: EditFormState<FS>,
    checkKeys: boolean,
  ) => ValueOrErrors<PredicateValue, string>;
  fromApiParser: (raw: any) => PredicateValue;
  parseGlobalConfiguration: (
    raw: any,
  ) => ValueOrErrors<PredicateValue, string>;
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

export type EditFormState<FS> = {
  entity: Synchronized<Unit, PredicateValue>;
  globalConfiguration: Synchronized<Unit, ValueOrErrors<PredicateValue, string>>;
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

export const EditFormState = <FS>() => ({
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
    },
  ): EditFormState<FS> => ({
    entity: Synchronized.Default(unit),
    globalConfiguration: Synchronized.Default(unit),
    formFieldStates,
    commonFormState,
    customFormState,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<EditFormState<FS>>()("entity"),
      ...simpleUpdater<EditFormState<FS>>()("formFieldStates"),
      ...simpleUpdater<EditFormState<FS>>()("globalConfiguration"),
      ...simpleUpdaterWithChildren<EditFormState<FS>>()({
        ...simpleUpdater<EditFormState<FS>["customFormState"]>()(
          "initApiChecker",
        ),
        ...simpleUpdater<EditFormState<FS>["customFormState"]>()(
          "configApiChecker",
        ),
        ...simpleUpdater<EditFormState<FS>["customFormState"]>()(
          "updateApiChecker",
        ),
        ...simpleUpdater<EditFormState<FS>["customFormState"]>()(
          "apiRunner",
        ),
        ...simpleUpdater<EditFormState<FS>["customFormState"]>()(
          "predicateEvaluations",
        ),
      })("customFormState"),
      ...simpleUpdater<EditFormState<FS>>()("commonFormState"),
    },
    Template: {
      entity: (_: BasicUpdater<PredicateValue>): Updater<EditFormState<FS>> =>
        EditFormState<FS>().Updaters.Core.entity(
          Synchronized.Updaters.sync(AsyncState.Operations.map(_)),
        ),
      submit: (): Updater<EditFormState<FS>> =>
        EditFormState<FS>().Updaters.Core.customFormState.children.apiRunner(
          Debounced.Updaters.Template.value(
            Synchronized.Updaters.sync(AsyncState.Operations.map(id)),
          ),
        ),
      recalculatePredicates: (): Updater<EditFormState<FS>> =>
        EditFormState<FS>().Updaters.Core.customFormState.children.predicateEvaluations(
          Debounced.Updaters.Template.value(id),
        ),
    },
  },
  ForeignMutations: (
    _: ForeignMutationsInput<EditFormContext<FS>, EditFormWritableState<FS>>,
  ) => ({}),
});

export type EditFormWritableState<FS> = EditFormState<FS>;
export type EditFormForeignMutationsExposed<FS> = ReturnType<
  ReturnType<typeof EditFormState<FS>>["ForeignMutations"]
>;
export type EditFormForeignMutationsExpected<FS> = {
  apiHandlers?: {
    onGetSuccess?: (
      _: (EditFormWritableState<FS> & EditFormContext<FS>) | undefined,
    ) => void;
    onGetError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onUpdateSuccess?: (
      _: (EditFormWritableState<FS> & EditFormContext<FS>) | undefined,
    ) => void;
    onUpdateError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onConfigSuccess?: (
      _: (EditFormWritableState<FS> & EditFormContext<FS>) | undefined,
    ) => void;
    onConfigError?: <ApiErrors>(_: ApiErrors | undefined) => void;
  };
};
