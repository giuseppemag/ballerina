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

export const createFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<
    CreateFormContext<E, FS> & CreateFormForeignMutationsExpected<E, FS>,
    CreateFormWritableState<E, FS>
  >();

  const init = Co.GetState().then((current) =>
    Co.Seq([
      Co.SetState(
        CreateFormState<E,FS>().Updaters.Core.customFormState.children.initApiChecker(ApiResponseChecker.Updaters().toUnchecked())
      ),
      Co.All([
        Synchronize<Unit, E>(
          () => current.api.default(),
          (_) => "transient failure",
          5,
          50
        ).embed((_) => _.rawEntity, CreateFormState<E, FS>().Updaters.Core.rawEntity),
        Synchronize<Unit, any>(
          () => current.api.getGlobalConfiguration(),
          (_) => "transient failure",
          5,
          50
        ).embed((_) => _.rawGlobalConfiguration, CreateFormState<E, FS>().Updaters.Core.rawGlobalConfiguration),
      ]),
      HandleApiResponse<
        CreateFormWritableState<E, FS>,
        CreateFormContext<E, FS>,
        any
      >((_) => _.rawEntity.sync, {
        handleSuccess: current.apiHandlers?.onDefaultSuccess,
        handleError: current.apiHandlers?.onDefaultError,
      }),
      Co.SetState(
        CreateFormState<E, FS>().Updaters.Core.customFormState.children.initApiChecker(ApiResponseChecker.Updaters().toChecked())
      ),
      HandleApiResponse<
      CreateFormWritableState<E, FS>,
      CreateFormContext<E, FS>,
      any
    >((_) => _.rawGlobalConfiguration.sync, {
      handleSuccess: current.apiHandlers?.onConfigSuccess,
      handleError: current.apiHandlers?.onConfigError,
    }),
    Co.SetState(
      CreateFormState<E, FS>().Updaters.Core.customFormState.children.configApiChecker(ApiResponseChecker.Updaters().toChecked())
    ),
    ]),
  );

  const parseEntity = Co.GetState().then((current) => {
    if(current.rawEntity.sync.kind == "loaded") {
      const parsed = current.fromApiParser(current.rawEntity.sync.value)
      return Synchronize<Unit, any>(
        () => Promise.resolve(parsed),
        (_) => "transient failure",
        5,
        50
      ).embed((_) => _.entity, CreateFormState<E, FS>().Updaters.Core.entity)
      
    }
    return Co.Do(() => {})
  })

  const parseGlobalConfiguration = Co.GetState().then((current) => {
      if(current.rawGlobalConfiguration.sync.kind == "loaded") {
        const parsed = current.parseGlobalConfiguration(current.rawGlobalConfiguration.sync.value)
        if(parsed.kind == "value")
          return Co.SetState(CreateFormState<E, FS>().Updaters.Core.globalConfiguration(replaceWith(Sum.Default.left(parsed.value))))
      }
      return Co.Do(() => {})
  })

  const calculateInitialVisibilities = Co.GetState().then((current) => {
    if(current.rawEntity.sync.kind == "loaded" && current.rawGlobalConfiguration.sync.kind == "loaded") {
      const parsedRootPredicate = PredicateValue.Operations.parse(current.rawEntity.sync.value, current.formType, current.types)

      if(parsedRootPredicate.kind == "errors" || current.globalConfiguration.kind == "r")
        return Co.Do(() => {})
      if(typeof parsedRootPredicate.value != "object" || !("kind" in parsedRootPredicate.value) || parsedRootPredicate.value.kind != "record")
        return Co.Do(() => {})
      return Co.SetState(CreateFormState<E, FS>().Updaters.Core.customFormState.children.predicateEvaluations(
        replaceWith(Debounced.Default(evaluatePredicates({
          global: current.globalConfiguration.value,
          types: current.types,
          visibilityPredicateExpressions: current.visibilityPredicateExpressions,
          disabledPredicatedExpressions: current.disabledPredicatedExpressions
        }, parsedRootPredicate.value)))))
    }
    return Co.Do(() => {})
  })

  const PredicatesCo = CoTypedFactory<CreateFormWritableState<E, FS> & CreateFormContext<E, FS>, ValueOrErrors<{
    visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
    disabledPredicateEvaluations: FormFieldPredicateEvaluation;
  }, string>>();

  const calculateVisibilities = 
    Co.Repeat(
      Debounce<ValueOrErrors<{visiblityPredicateEvaluations: FormFieldPredicateEvaluation; disabledPredicateEvaluations: FormFieldPredicateEvaluation;}, string>, CreateFormContext<E, FS> & CreateFormWritableState<E, FS>>(
        PredicatesCo.GetState().then((current) => {
            if((current.globalConfiguration.kind == "r" || current.entity.sync.kind != "loaded") ){
              return PredicatesCo.Return<ApiResultStatus>("permanent failure")
            }
            const parsedEntity = current.toApiParser(current.entity.sync.value, current, false)
            if(parsedEntity.kind == "errors") {
              console.error('parsedEntity', parsedEntity)
              return PredicatesCo.Return<ApiResultStatus>("permanent failure")
            }
            const parseRootPredicate = PredicateValue.Operations.parse(parsedEntity.value, current.formType, current.types)
            if(parseRootPredicate.kind == "errors") {
              console.error('parseRootPredicate', parseRootPredicate)
              return PredicatesCo.Return<ApiResultStatus>("permanent failure")
            }
            return PredicatesCo.SetState(replaceWith(evaluatePredicates({
              global: current.globalConfiguration.value,
              types: current.types,
              visibilityPredicateExpressions: current.visibilityPredicateExpressions,
              disabledPredicatedExpressions: current.disabledPredicatedExpressions
            }, parseRootPredicate.value))).then(() => PredicatesCo.Return<ApiResultStatus>("success"))
          })
        , 50)
        .embed(
        (_) => ({ ..._, ..._.customFormState.predicateEvaluations }),
        CreateFormState<E, FS>().Updaters.Core.customFormState.children.predicateEvaluations)
    )

  const synchronize = Co.Repeat(
    Co.GetState().then((current) =>
      Co.Seq([
        Co.SetState(CreateFormState<E, FS>().Updaters.Core.customFormState.children.createApiChecker(ApiResponseChecker.Updaters().toUnchecked())
        ),
        Debounce<Synchronized<Unit, ApiErrors>, CreateFormWritableState<E, FS>>(
          (() => {
            if (current.entity.sync.kind != "loaded") {
              return Synchronize<Unit, ApiErrors, CreateFormWritableState<E, FS>>(
                (_) => Promise.resolve([]),
                (_) => "transient failure",
                5,
                50
              )
            }
            const parsed = current.toApiParser(current.entity.sync.value, current, true)

            return Synchronize<Unit, ApiErrors, CreateFormWritableState<E, FS>>(
              (_) => parsed.kind == "errors" ? Promise.reject(parsed.errors) : current.api.create(parsed),
              (_) => "transient failure",
              parsed.kind == "errors" ? 1 : 5,
              50
            );
          })(),
          15
        ).embed(
          (_) => ({ ..._, ..._.customFormState.apiRunner }),
          CreateFormState<E, FS>().Updaters.Core.customFormState.children.apiRunner
        ),
        HandleApiResponse<
          CreateFormWritableState<E, FS>,
          CreateFormContext<E, FS>,
          ApiErrors
        >((_) => _.customFormState.apiRunner.sync, {
            handleSuccess: current.apiHandlers?.onCreateSuccess,
            handleError: current.apiHandlers?.onCreateError,
          }
        ),
        Co.SetState(CreateFormState<E, FS>().Updaters.Core.customFormState.children.createApiChecker(ApiResponseChecker.Updaters().toChecked())
        ),
      ])
    )
  );

  return Co.Template<CreateFormForeignMutationsExpected<E, FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.rawEntity.sync) || !AsyncState.Operations.hasValue(props.context.rawGlobalConfiguration.sync) || !ApiResponseChecker.Operations.checked(props.context.customFormState.initApiChecker),
  }).any([
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(parseEntity, {
      interval: 15,
      runFilter: (props) =>
        props.context.rawEntity.sync.kind == "loaded" && !AsyncState.Operations.hasValue(props.context.entity.sync)
    }),
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(parseGlobalConfiguration, {
      interval: 15,
      runFilter: (props) =>
        props.context.rawGlobalConfiguration.sync.kind == "loaded" &&
        props.context.globalConfiguration.kind == "r"
    }),
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(calculateInitialVisibilities, {
      interval: 15,
      runFilter: (props) =>
        props.context.rawEntity.sync.kind == "loaded" &&
        props.context.globalConfiguration.kind == "l"
    }),
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(synchronize, {
      interval: 15,
      runFilter: (props) =>
         props.context.entity.sync.kind === "loaded" &&
        (Debounced.Operations.shouldCoroutineRun(props.context.customFormState.apiRunner) ||
        !ApiResponseChecker.Operations.checked(props.context.customFormState.createApiChecker))
    }),
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(calculateVisibilities, {
      interval: 15,
      runFilter: (props) =>
        props.context.entity.sync.kind == "loaded" &&
        props.context.globalConfiguration.kind == "l" &&
        Debounced.Operations.shouldCoroutineRun(props.context.customFormState.predicateEvaluations)
    })
  ]);
};
