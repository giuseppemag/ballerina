import {
  ApiErrors,
  AsyncState,
  Debounce,
  Debounced,
  CreateFormForeignMutationsExpected,
  CreateFormState,
  Synchronize,
  Synchronized,
  Unit,
  HandleApiResponse,
  ApiResponseChecker,
  Sum,
  replaceWith,
  PredicateValue,
  evaluatePredicates,
  FormFieldPredicateEvaluation,
  ValueOrErrors,
  ApiResultStatus,
} from "../../../../../../../main";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { CreateFormContext, CreateFormWritableState } from "../state";

export const createFormRunner = <T, FS>() => {
  const Co = CoTypedFactory<
    CreateFormContext<T, FS> & CreateFormForeignMutationsExpected<T, FS>,
    CreateFormWritableState<T, FS>
  >();

  const init = Co.GetState().then((current) =>
    Co.Seq([
      Co.SetState(
        CreateFormState<T, FS>()
          .Updaters.Core.customFormState.children.initApiChecker(
            ApiResponseChecker.Updaters().toUnchecked(),
          )
          .then(
            CreateFormState<
              T,
              FS
            >().Updaters.Core.customFormState.children.configApiChecker(
              ApiResponseChecker.Updaters().toUnchecked(),
            ),
          ),
      ),
      Co.All([
        Synchronize<Unit, PredicateValue>(
          () =>
            current.api.default().then((raw) => {
              const result = current.fromApiParser(raw);
              return result.kind == "errors"
                ? Promise.reject(result.errors)
                : Promise.resolve(result.value);
            }),
          (_) => "transient failure",
          5,
          50,
        ).embed((_) => _.entity, CreateFormState<T, FS>().Updaters.Core.entity),
        Synchronize<Unit, PredicateValue>(
          () =>
            current.api.getGlobalConfiguration().then((raw) => {
              const result = current.parseGlobalConfiguration(raw);
              return result.kind == "errors"
                ? Promise.reject(result.errors)
                : Promise.resolve(result.value);
            }),
          (_) => "transient failure",
          5,
          50,
        ).embed(
          (_) => _.globalConfiguration,
          CreateFormState<T, FS>().Updaters.Core.globalConfiguration,
        ),
      ]),
      HandleApiResponse<
        CreateFormWritableState<T, FS>,
        CreateFormContext<T, FS>,
        any
      >((_) => _.entity.sync, {
        handleSuccess: current.apiHandlers?.onDefaultSuccess,
        handleError: current.apiHandlers?.onDefaultError,
      }),
      Co.SetState(
        CreateFormState<
          T,
          FS
        >().Updaters.Core.customFormState.children.initApiChecker(
          ApiResponseChecker.Updaters().toChecked(),
        ),
      ),
      HandleApiResponse<
        CreateFormWritableState<T, FS>,
        CreateFormContext<T, FS>,
        any
      >((_) => _.globalConfiguration.sync, {
        handleSuccess: current.apiHandlers?.onConfigSuccess,
        handleError: current.apiHandlers?.onConfigError,
      }),
      Co.SetState(
        CreateFormState<
          T,
          FS
        >().Updaters.Core.customFormState.children.configApiChecker(
          ApiResponseChecker.Updaters().toChecked(),
        ),
      ),
    ]),
  );

  const calculateInitialVisibilities = Co.GetState().then((current) => {
    if (
      current.entity.sync.kind == "loaded" &&
      current.globalConfiguration.sync.kind == "loaded"
    ) {
      return Co.SetState(
        CreateFormState<
          T,
          FS
        >().Updaters.Core.customFormState.children.predicateEvaluations(
          replaceWith(
            Debounced.Default(
              evaluatePredicates(
                {
                  global: current.globalConfiguration.sync.value,
                  visibilityPredicateExpressions:
                    current.visibilityPredicateExpressions,
                  disabledPredicatedExpressions:
                    current.disabledPredicatedExpressions,
                },
                current.entity.sync.value,
              ),
            ),
          ),
        ),
      );
    }
    return Co.Do(() => {});
  });

  const PredicatesCo = CoTypedFactory<
    CreateFormWritableState<T, FS> & CreateFormContext<T, FS>,
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
      CreateFormContext<T, FS> & CreateFormWritableState<T, FS>
    >(
      PredicatesCo.GetState().then((current) => {
        if (
          current.globalConfiguration.sync.kind != "loaded" ||
          current.entity.sync.kind != "loaded"
        ) {
          return PredicatesCo.Return<ApiResultStatus>("permanent failure");
        }

        return PredicatesCo.SetState(
          replaceWith(
            evaluatePredicates(
              {
                global: current.globalConfiguration.sync.value,
                visibilityPredicateExpressions:
                  current.visibilityPredicateExpressions,
                disabledPredicatedExpressions:
                  current.disabledPredicatedExpressions,
              },
              current.entity.sync.value,
            ),
          ),
        ).then(() => PredicatesCo.Return<ApiResultStatus>("success"));
      }),
      50,
    ).embed(
      (_) => ({ ..._, ..._.customFormState.predicateEvaluations }),
      CreateFormState<T, FS>().Updaters.Core.customFormState.children
        .predicateEvaluations,
    ),
  );

  const SynchronizeCo = CoTypedFactory<
    CreateFormWritableState<T, FS>,
    Synchronized<Unit, ApiErrors>
  >();

  const synchronize = Co.Repeat(
    Co.GetState().then((createFormState) =>
      Co.Seq([
        Co.SetState(
          CreateFormState<
            T,
            FS
          >().Updaters.Core.customFormState.children.createApiChecker(
            ApiResponseChecker.Updaters().toUnchecked(),
          ),
        ),
        Debounce<Synchronized<Unit, ApiErrors>, CreateFormWritableState<T, FS>>(
          SynchronizeCo.GetState().then((current) => {
            if (current.entity.sync.kind != "loaded") {
              return Synchronize<
                Unit,
                ApiErrors,
                CreateFormWritableState<T, FS>
              >(
                (_) => Promise.resolve([]),
                (_) => "transient failure",
                5,
                50,
              );
            }
            const parsed = createFormState.toApiParser(
              current.entity.sync.value,
              current,
            );

            return Synchronize<Unit, ApiErrors, CreateFormWritableState<T, FS>>(
              (_) =>
                parsed.kind == "errors"
                  ? Promise.reject(parsed.errors)
                  : createFormState.api.create(parsed),
              (_) => "transient failure",
              parsed.kind == "errors" ? 1 : 5,
              50,
            );
          }),
          15,
        ).embed(
          (_) => ({ ..._, ..._.customFormState.apiRunner }),
          CreateFormState<T, FS>().Updaters.Core.customFormState.children
            .apiRunner,
        ),
        HandleApiResponse<
          CreateFormWritableState<T, FS>,
          CreateFormContext<T, FS>,
          ApiErrors
        >((_) => _.customFormState.apiRunner.sync, {
          handleSuccess: createFormState.apiHandlers?.onCreateSuccess,
          handleError: createFormState.apiHandlers?.onCreateError,
        }),
        Co.SetState(
          CreateFormState<
            T,
            FS
          >().Updaters.Core.customFormState.children.createApiChecker(
            ApiResponseChecker.Updaters().toChecked(),
          ),
        ),
      ]),
    ),
  );

  return Co.Template<CreateFormForeignMutationsExpected<T, FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.entity.sync) ||
      !AsyncState.Operations.hasValue(props.context.globalConfiguration.sync) ||
      !ApiResponseChecker.Operations.checked(
        props.context.customFormState.initApiChecker,
      ),
  }).any([
    Co.Template<CreateFormForeignMutationsExpected<T, FS>>(
      calculateInitialVisibilities,
      {
        interval: 15,
        runFilter: (props) =>
          props.context.entity.sync.kind == "loaded" &&
          props.context.globalConfiguration.sync.kind == "loaded",
      },
    ),
    Co.Template<CreateFormForeignMutationsExpected<T, FS>>(synchronize, {
      interval: 15,
      runFilter: (props) =>
        props.context.entity.sync.kind == "loaded" &&
        (Debounced.Operations.shouldCoroutineRun(
          props.context.customFormState.apiRunner,
        ) ||
          !ApiResponseChecker.Operations.checked(
            props.context.customFormState.createApiChecker,
          )),
    }),
    Co.Template<CreateFormForeignMutationsExpected<T, FS>>(
      calculateVisibilities,
      {
        interval: 15,
        runFilter: (props) =>
          props.context.entity.sync.kind == "loaded" &&
          props.context.globalConfiguration.sync.kind == "loaded" &&
          Debounced.Operations.shouldCoroutineRun(
            props.context.customFormState.predicateEvaluations,
          ),
      },
    ),
  ]);
};
