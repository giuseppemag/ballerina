import {
  ApiErrors,
  ApiResponseChecker,
  ApiResultStatus,
  AsyncState,
  Debounce,
  Debounced,
  EditFormForeignMutationsExpected,
  EditFormState,
  evaluatePredicates,
  FormFieldPredicateEvaluation,
  HandleApiResponse,
  PredicateValue,
  replaceWith,
  Sum,
  Synchronize,
  Synchronized,
  Unit,
  ValueOrErrors,
} from "../../../../../../../main";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { EditFormContext, EditFormWritableState } from "../state";

export const editFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<
    EditFormContext<E, FS> & EditFormForeignMutationsExpected<E, FS>,
    EditFormWritableState<E, FS>
  >();

  const init = Co.GetState().then((current) => {
    return Co.Seq([
      Co.SetState(
        EditFormState<
          E,
          FS
        >().Updaters.Core.customFormState.children.initApiChecker(
          ApiResponseChecker.Updaters().toUnchecked(),
        ),
      ),
      Co.All([
        Synchronize<Unit, any>(
          () => current.api.get(current.entityId),
          (_) => "transient failure",
          5,
          50,
        ).embed(
          (_) => _.rawEntity,
          EditFormState<E, FS>().Updaters.Core.rawEntity,
        ),
        Synchronize<Unit, any>(
          () => current.api.getGlobalConfiguration(),
          (_) => "transient failure",
          5,
          50,
        ).embed(
          (_) => _.rawGlobalConfiguration,
          EditFormState<E, FS>().Updaters.Core.rawGlobalConfiguration,
        ),
      ]),
      HandleApiResponse<
        EditFormWritableState<E, FS>,
        EditFormContext<E, FS>,
        any
      >((_) => _.rawEntity.sync, {
        handleSuccess: current.apiHandlers?.onGetSuccess,
        handleError: current.apiHandlers?.onGetError,
      }),
      Co.SetState(
        EditFormState<
          E,
          FS
        >().Updaters.Core.customFormState.children.initApiChecker(
          ApiResponseChecker.Updaters().toChecked(),
        ),
      ),
      HandleApiResponse<
        EditFormWritableState<E, FS>,
        EditFormContext<E, FS>,
        any
      >((_) => _.rawGlobalConfiguration.sync, {
        handleSuccess: current.apiHandlers?.onConfigSuccess,
        handleError: current.apiHandlers?.onConfigError,
      }),
      Co.SetState(
        EditFormState<
          E,
          FS
        >().Updaters.Core.customFormState.children.configApiChecker(
          ApiResponseChecker.Updaters().toChecked(),
        ),
      ),
    ]);
  });

  const parseEntity = Co.GetState().then((current) => {
    if (current.rawEntity.sync.kind == "loaded") {
      const parsed = current.fromApiParser(current.rawEntity.sync.value);
      console.debug("parsed", parsed.fields.toJS());
      return Synchronize<Unit, any>(
        () => Promise.resolve(parsed),
        (_) => "transient failure",
        5,
        50,
      ).embed((_) => _.entity, EditFormState<E, FS>().Updaters.Core.entity);
    }
    return Co.Do(() => {});
  });

  const parseGlobalConfiguration = Co.GetState().then((current) => {
    if (current.rawGlobalConfiguration.sync.kind == "loaded") {
      const parsed = current.parseGlobalConfiguration(
        current.rawGlobalConfiguration.sync.value,
      );
      if (parsed.kind == "value") {
        return Co.SetState(
          EditFormState<E, FS>().Updaters.Core.globalConfiguration(
            replaceWith(Sum.Default.left(parsed.value)),
          ),
        );
      }
    }
    return Co.Do(() => {});
  });

  const calculateInitialVisibilities = Co.GetState().then((current) => {
    if (
      current.rawEntity.sync.kind == "loaded" &&
      current.rawGlobalConfiguration.sync.kind == "loaded"
    ) {
      const parsedRootPredicate = PredicateValue.Operations.parse(
        current.rawEntity.sync.value,
        current.formType,
        current.types,
      );

      if (
        parsedRootPredicate.kind == "errors" ||
        current.globalConfiguration.kind == "r"
      ) {
        console.error("error parsing bindings");
        return Co.Do(() => {});
      }
      if (
        typeof parsedRootPredicate.value != "object" ||
        !("kind" in parsedRootPredicate.value) ||
        parsedRootPredicate.value.kind != "record"
      ) {
        return Co.Do(() => {});
      }
      return Co.SetState(
        EditFormState<
          E,
          FS
        >().Updaters.Core.customFormState.children.predicateEvaluations(
          replaceWith(
            Debounced.Default(
              evaluatePredicates(
                {
                  global: current.globalConfiguration.value,
                  types: current.types,
                  visibilityPredicateExpressions:
                    current.visibilityPredicateExpressions,
                  disabledPredicatedExpressions:
                    current.disabledPredicatedExpressions,
                },
                parsedRootPredicate.value,
              ),
            ),
          ),
        ),
      );
    }
    return Co.Do(() => {});
  });

  const PredicatesCo = CoTypedFactory<
    EditFormWritableState<E, FS> & EditFormContext<E, FS>,
    ValueOrErrors<
      {
        visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
        disabledPredicateEvaluations: FormFieldPredicateEvaluation;
      },
      string
    >
  >();

  const calculateVisibilities = Co.Repeat(
    Debounce<
      ValueOrErrors<
        {
          visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
          disabledPredicateEvaluations: FormFieldPredicateEvaluation;
        },
        string
      >,
      EditFormContext<E, FS> & EditFormWritableState<E, FS>
    >(
      PredicatesCo.GetState().then((current) => {
        if (
          current.globalConfiguration.kind == "r" ||
          current.entity.sync.kind != "loaded"
        ) {
          return PredicatesCo.Return<ApiResultStatus>("permanent failure");
        }
        const parsedEntity = current.toApiParser(
          current.entity.sync.value,
          current,
          false,
        );
        if (parsedEntity.kind == "errors") {
          console.error("error parsing entity", parsedEntity);
          return PredicatesCo.Return<ApiResultStatus>("permanent failure");
        }
        const parseRootPredicate = PredicateValue.Operations.parse(
          parsedEntity.value,
          current.formType,
          current.types,
        );
        if (parseRootPredicate.kind == "errors") {
          console.error("error parsing root predicate", parseRootPredicate);
          return PredicatesCo.Return<ApiResultStatus>("permanent failure");
        }
        return PredicatesCo.SetState(
          replaceWith(
            evaluatePredicates(
              {
                global: current.globalConfiguration.value,
                types: current.types,
                visibilityPredicateExpressions:
                  current.visibilityPredicateExpressions,
                disabledPredicatedExpressions:
                  current.disabledPredicatedExpressions,
              },
              parseRootPredicate.value,
            ),
          ),
        ).then(() => PredicatesCo.Return<ApiResultStatus>("success"));
      }),
      50,
    ).embed(
      (_) => ({ ..._, ..._.customFormState.predicateEvaluations }),
      EditFormState<E, FS>().Updaters.Core.customFormState.children
        .predicateEvaluations,
    ),
  );

  const SynchronizeCo = CoTypedFactory<
    EditFormWritableState<E, FS>,
    Synchronized<Unit, ApiErrors>
  >();

  const synchronize = Co.Repeat(
    Co.GetState().then((editFormState) =>
      Co.Seq([
        Co.SetState(
          EditFormState<
            E,
            FS
          >().Updaters.Core.customFormState.children.updateApiChecker(
            ApiResponseChecker.Updaters().toUnchecked(),
          ),
        ),
        Debounce<Synchronized<Unit, ApiErrors>, EditFormWritableState<E, FS>>(
          SynchronizeCo.GetState().then((current) => {
            if (current.entity.sync.kind != "loaded") {
              return Synchronize<Unit, ApiErrors, EditFormWritableState<E, FS>>(
                (_) => Promise.resolve([]),
                (_) => "transient failure",
                5,
                50,
              );
            }
            const parsed = editFormState.toApiParser(
              current.entity.sync.value,
              current,
              true,
            );

            return Synchronize<Unit, ApiErrors, EditFormWritableState<E, FS>>(
              (_) =>
                parsed.kind == "errors"
                  ? Promise.reject(parsed.errors)
                  : editFormState.api.update(editFormState.entityId, parsed),
              (_) => "transient failure",
              parsed.kind == "errors" ? 1 : 5,
              50,
            );
          }),
          15,
        ).embed(
          (_) => ({ ..._, ..._.customFormState.apiRunner }),
          EditFormState<E, FS>().Updaters.Core.customFormState.children
            .apiRunner,
        ),
        HandleApiResponse<
          EditFormWritableState<E, FS>,
          EditFormContext<E, FS>,
          ApiErrors
        >((_) => _.customFormState.apiRunner.sync, {
          handleSuccess: editFormState.apiHandlers?.onUpdateSuccess,
          handleError: editFormState.apiHandlers?.onUpdateError,
        }),
        Co.SetState(
          EditFormState<
            E,
            FS
          >().Updaters.Core.customFormState.children.updateApiChecker(
            ApiResponseChecker.Updaters().toChecked(),
          ),
        ),
      ]),
    ),
  );

  return Co.Template<EditFormForeignMutationsExpected<E, FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.rawEntity.sync) ||
      !AsyncState.Operations.hasValue(
        props.context.rawGlobalConfiguration.sync,
      ) ||
      !ApiResponseChecker.Operations.checked(
        props.context.customFormState.initApiChecker,
      ),
  }).any([
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(parseEntity, {
      interval: 15,
      runFilter: (props) =>
        props.context.rawEntity.sync.kind == "loaded" &&
        !AsyncState.Operations.hasValue(props.context.entity.sync),
    }),
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(
      parseGlobalConfiguration,
      {
        interval: 15,
        runFilter: (props) =>
          props.context.rawGlobalConfiguration.sync.kind == "loaded" &&
          props.context.globalConfiguration.kind == "r",
      },
    ),
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(
      calculateInitialVisibilities,
      {
        interval: 15,
        runFilter: (props) =>
          props.context.rawEntity.sync.kind == "loaded" &&
          props.context.globalConfiguration.kind == "l",
      },
    ),
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(synchronize, {
      interval: 15,
      runFilter: (props) =>
        props.context.entity.sync.kind == "loaded" &&
        (Debounced.Operations.shouldCoroutineRun(
          props.context.customFormState.apiRunner,
        ) ||
          !ApiResponseChecker.Operations.checked(
            props.context.customFormState.updateApiChecker,
          )),
    }),
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(
      calculateVisibilities,
      {
        interval: 15,
        runFilter: (props) =>
          props.context.entity.sync.kind == "loaded" &&
          props.context.globalConfiguration.kind == "l" &&
          Debounced.Operations.shouldCoroutineRun(
            props.context.customFormState.predicateEvaluations,
          ),
      },
    ),
  ]);
};
