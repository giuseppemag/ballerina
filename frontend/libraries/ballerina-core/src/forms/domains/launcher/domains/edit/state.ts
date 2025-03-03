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

export type EditFormContext<E, FS> = {
  entityId: string;
  api: {
    get: (id: Guid) => Promise<E>;
    update: (id: Guid, raw: any) => Promise<ApiErrors>;
    getGlobalConfiguration: () => Promise<any>;
  };
  formType: ParsedType<E>;
  types: Map<string, ParsedType<E>>;
  toApiParser: (
    entity: E,
    formstate: EditFormState<E, FS>,
    checkKeys: boolean,
  ) => ValueOrErrors<E, ApiErrors>;
  fromApiParser: (raw: any) => any;
  parseGlobalConfiguration: (
    raw: any,
  ) => ValueOrErrors<PredicateValue, ApiErrors>;
  visibilityPredicateExpressions: FieldPredicateExpressions;
  disabledPredicatedExpressions: FieldPredicateExpressions;
  actualForm: Template<
    Value<E> & { formFieldStates: FS } & {
      commonFormState: CommonFormState;
    } & { visibilities: FormFieldPredicateEvaluation | undefined } & {
      disabledFields: FormFieldPredicateEvaluation | undefined;
    },
    { formFieldStates: FS } & { commonFormState: CommonFormState },
    { onChange: SimpleCallback<BasicUpdater<E>> }
  >;
};

export type EditFormState<E, FS> = {
  rawEntity: Synchronized<Unit, any>;
  entity: Synchronized<Unit, E>;
  rawGlobalConfiguration: Synchronized<Unit, any>;
  globalConfiguration: Sum<PredicateValue, "not parsed">;
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

export const EditFormState = <E, FS>() => ({
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
  ): EditFormState<E, FS> => ({
    rawEntity: Synchronized.Default(unit),
    entity: Synchronized.Default(unit),
    rawGlobalConfiguration: Synchronized.Default(unit),
    globalConfiguration: Sum.Default.right("not parsed"),
    formFieldStates,
    commonFormState,
    customFormState,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<EditFormState<E, FS>>()("rawEntity"),
      ...simpleUpdater<EditFormState<E, FS>>()("entity"),
      ...simpleUpdater<EditFormState<E, FS>>()("formFieldStates"),
      ...simpleUpdater<EditFormState<E, FS>>()("rawGlobalConfiguration"),
      ...simpleUpdater<EditFormState<E, FS>>()("globalConfiguration"),
      ...simpleUpdaterWithChildren<EditFormState<E, FS>>()({
        ...simpleUpdater<EditFormState<E, FS>["customFormState"]>()(
          "initApiChecker",
        ),
        ...simpleUpdater<EditFormState<E, FS>["customFormState"]>()(
          "configApiChecker",
        ),
        ...simpleUpdater<EditFormState<E, FS>["customFormState"]>()(
          "updateApiChecker",
        ),
        ...simpleUpdater<EditFormState<E, FS>["customFormState"]>()(
          "apiRunner",
        ),
        ...simpleUpdater<EditFormState<E, FS>["customFormState"]>()(
          "predicateEvaluations",
        ),
      })("customFormState"),
      ...simpleUpdater<EditFormState<E, FS>>()("commonFormState"),
    },
    Template: {
      entity: (_: BasicUpdater<E>): Updater<EditFormState<E, FS>> =>
        EditFormState<E, FS>().Updaters.Core.entity(
          Synchronized.Updaters.sync(AsyncState.Operations.map(_)),
        ),
      submit: (): Updater<EditFormState<E, FS>> =>
        EditFormState<E, FS>().Updaters.Core.customFormState.children.apiRunner(
          Debounced.Updaters.Template.value(
            Synchronized.Updaters.sync(AsyncState.Operations.map(id)),
          ),
        ),
      recalculatePredicates: (): Updater<EditFormState<E, FS>> =>
        EditFormState<
          E,
          FS
        >().Updaters.Core.customFormState.children.predicateEvaluations(
          Debounced.Updaters.Template.value(id),
        ),
    },
  },
  ForeignMutations: (
    _: ForeignMutationsInput<
      EditFormContext<E, FS>,
      EditFormWritableState<E, FS>
    >,
  ) => ({}),
});

export type EditFormWritableState<E, FS> = EditFormState<E, FS>;
export type EditFormForeignMutationsExposed<E, FS> = ReturnType<
  ReturnType<typeof EditFormState<E, FS>>["ForeignMutations"]
>;
export type EditFormForeignMutationsExpected<E, FS> = {
  apiHandlers?: {
    onGetSuccess?: (
      _: (EditFormWritableState<E, FS> & EditFormContext<E, FS>) | undefined,
    ) => void;
    onGetError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onUpdateSuccess?: (
      _: (EditFormWritableState<E, FS> & EditFormContext<E, FS>) | undefined,
    ) => void;
    onUpdateError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onConfigSuccess?: (
      _: (EditFormWritableState<E, FS> & EditFormContext<E, FS>) | undefined,
    ) => void;
    onConfigError?: <ApiErrors>(_: ApiErrors | undefined) => void;
  };
};
