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
  replaceWith,
  Synchronize,
  Synchronized,
  Unit,
  ValueOrErrors,
} from "../../../../../../../main";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { EditFormContext, EditFormWritableState } from "../state";

export const editFormRunner = <FS>() => {
  const Co = CoTypedFactory<
    EditFormContext<FS> & EditFormForeignMutationsExpected<FS>,
    EditFormWritableState<FS>
  >();

  const init = Co.GetState().then((current) => {
    return Co.Seq([
      Co.SetState(
        EditFormState<FS>().Updaters.Core.customFormState.children.initApiChecker(
          ApiResponseChecker.Updaters().toUnchecked()
        ).then(EditFormState<FS>().Updaters.Core.customFormState.children.configApiChecker(
          ApiResponseChecker.Updaters().toUnchecked()
        ))
      ),
      Co.All([
        Synchronize<Unit, any>(
          () => current.api.get(current.entityId).then((raw) => current.fromApiParser(raw)),
          (_) => "transient failure",
          5,
          50
        ).embed(
          (_) => _.entity,
          EditFormState<FS>().Updaters.Core.entity
        ),
        Synchronize<Unit, any>(
          () => current.api.getGlobalConfiguration().then((raw) => current.parseGlobalConfiguration(raw)),
          (_) => "transient failure",
          5,
          50
        ).embed(
          (_) => _.globalConfiguration,
          EditFormState<FS>().Updaters.Core.globalConfiguration
        ),
      ]),
      HandleApiResponse<EditFormWritableState<FS>, EditFormContext<FS>, any>(
        (_) => _.entity.sync,
        {
          handleSuccess: current.apiHandlers?.onGetSuccess,
          handleError: current.apiHandlers?.onGetError,
        }
      ),
      Co.SetState(
        EditFormState<FS>().Updaters.Core.customFormState.children.initApiChecker(
          ApiResponseChecker.Updaters().toChecked()
        )
      ),
      HandleApiResponse<EditFormWritableState<FS>, EditFormContext<FS>, any>(
        (_) => _.globalConfiguration.sync,
        {
          handleSuccess: current.apiHandlers?.onConfigSuccess,
          handleError: current.apiHandlers?.onConfigError,
        }
      ),
      Co.SetState(
        EditFormState<FS>().Updaters.Core.customFormState.children.configApiChecker(
          ApiResponseChecker.Updaters().toChecked()
        )
      ),
    ]);
  });

  const calculateInitialVisibilities = Co.GetState().then((current) => {
    if (
      current.entity.sync.kind == "loaded" &&
      current.globalConfiguration.sync.kind == "loaded"
    ) {


      if (
        current.globalConfiguration.sync.value.kind == "errors"
      ) {
        console.error("error parsing bindings");
        return Co.Do(() => {});
      }
      return Co.SetState(
        EditFormState<FS>().Updaters.Core.customFormState.children.predicateEvaluations(
          replaceWith(
            Debounced.Default(
              evaluatePredicates(
                {
                  global: current.globalConfiguration.sync.value.value,
                  types: current.types,
                  visibilityPredicateExpressions:
                    current.visibilityPredicateExpressions,
                  disabledPredicatedExpressions:
                    current.disabledPredicatedExpressions,
                },
                // TODO - value or errors
                current.entity.sync.value
              )
            )
          )
        )
      );
    }
    return Co.Do(() => {});
  });

  const PredicatesCo = CoTypedFactory<
    EditFormWritableState<FS> & EditFormContext<FS>,
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
      EditFormContext<FS> & EditFormWritableState<FS>
    >(
      PredicatesCo.GetState().then((current) => {
        if (
          current.globalConfiguration.sync.kind != "loaded" ||
          current.entity.sync.kind != "loaded"
        ) {
          return PredicatesCo.Return<ApiResultStatus>("permanent failure");
        }

        if (current.globalConfiguration.sync.value.kind == "errors") {
          console.error("error parsing global configuration predicate", current.globalConfiguration.sync.value);
          return PredicatesCo.Return<ApiResultStatus>("permanent failure");
        }
        return PredicatesCo.SetState(
          replaceWith(
            evaluatePredicates(
              {
                global: current.globalConfiguration.sync.value.value,
                types: current.types,
                visibilityPredicateExpressions:
                  current.visibilityPredicateExpressions,
                disabledPredicatedExpressions:
                  current.disabledPredicatedExpressions,
              },
              // TODO - value or errors
              current.entity.sync.value
            )
          )
        ).then(() => PredicatesCo.Return<ApiResultStatus>("success"));
      }),
      50
    ).embed(
      (_) => ({ ..._, ..._.customFormState.predicateEvaluations }),
      EditFormState<FS>().Updaters.Core.customFormState.children
        .predicateEvaluations
    )
  );

  const SynchronizeCo = CoTypedFactory<
    EditFormWritableState<FS>,
    Synchronized<Unit, ApiErrors>
  >();

  const synchronize = Co.Repeat(
    Co.GetState().then((editFormState) =>
      Co.Seq([
        Co.SetState(
          EditFormState<
            FS
          >().Updaters.Core.customFormState.children.updateApiChecker(
            ApiResponseChecker.Updaters().toUnchecked()
          )
        ),
        Debounce<Synchronized<Unit, ApiErrors>, EditFormWritableState<FS>>(
          SynchronizeCo.GetState().then((current) => {
            if (current.entity.sync.kind != "loaded") {
              return Synchronize<Unit, ApiErrors, EditFormWritableState<FS>>(
                (_) => Promise.resolve([]),
                (_) => "transient failure",
                5,
                50
              );
            }
            const parsed = editFormState.toApiParser(
              current.entity.sync.value,
              current,
              true
            );

            return Synchronize<Unit, ApiErrors, EditFormWritableState<FS>>(
              (_) =>
                parsed.kind == "errors"
                  ? Promise.reject(parsed.errors)
                  : editFormState.api.update(editFormState.entityId, parsed),
              (_) => "transient failure",
              parsed.kind == "errors" ? 1 : 5,
              50
            );
          }),
          15
        ).embed(
          (_) => ({ ..._, ..._.customFormState.apiRunner }),
          EditFormState<FS>().Updaters.Core.customFormState.children.apiRunner
        ),
        HandleApiResponse<
          EditFormWritableState<FS>,
          EditFormContext<FS>,
          ApiErrors
        >((_) => _.customFormState.apiRunner.sync, {
          handleSuccess: editFormState.apiHandlers?.onUpdateSuccess,
          handleError: editFormState.apiHandlers?.onUpdateError,
        }),
        Co.SetState(
          EditFormState<
            FS
          >().Updaters.Core.customFormState.children.updateApiChecker(
            ApiResponseChecker.Updaters().toChecked()
          )
        ),
      ])
    )
  );

  return Co.Template<EditFormForeignMutationsExpected<FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.entity.sync) ||
      !AsyncState.Operations.hasValue(
        props.context.globalConfiguration.sync
      ) ||
      !ApiResponseChecker.Operations.checked(
        props.context.customFormState.initApiChecker
      ),
  }).any([
    Co.Template<EditFormForeignMutationsExpected<FS>>(
      calculateInitialVisibilities,
      {
        interval: 15,
        runFilter: (props) =>
          props.context.entity.sync.kind == "loaded" &&
          props.context.globalConfiguration.sync.kind == "loaded",
      }
    ),
    Co.Template<EditFormForeignMutationsExpected<FS>>(synchronize, {
      interval: 15,
      runFilter: (props) =>
        props.context.entity.sync.kind == "loaded" &&
        (Debounced.Operations.shouldCoroutineRun(
          props.context.customFormState.apiRunner
        ) ||
          !ApiResponseChecker.Operations.checked(
            props.context.customFormState.updateApiChecker
          )),
    }),
    Co.Template<EditFormForeignMutationsExpected<FS>>(calculateVisibilities, {
      interval: 15,
      runFilter: (props) =>
        props.context.entity.sync.kind == "loaded" &&
        props.context.globalConfiguration.sync.kind == "loaded" &&
        Debounced.Operations.shouldCoroutineRun(
          props.context.customFormState.predicateEvaluations
        ),
    }),
  ]);
};
