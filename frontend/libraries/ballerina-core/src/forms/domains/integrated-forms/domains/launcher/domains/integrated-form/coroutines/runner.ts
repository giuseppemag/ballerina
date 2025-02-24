import { Synchronize, Unit, replaceWith, Sum, ValueOrErrors, Debounce } from "../../../../../../../../../main";
import { ApiResultStatus } from "../../../../../../../../apiResultStatus/state";
import { AsyncState } from "../../../../../../../../async/state";
import { CoTypedFactory } from "../../../../../../../../coroutines/builder";
import { Debounced } from "../../../../../../../../debounced/state";
import { PredicateValue, evaluatePredicates, FormFieldPredicateEvaluation } from "../../../../../../parser/domains/predicates/state";
import { IntegratedFormContext, IntegratedFormForeignMutationsExpected, IntegratedFormWritableState, IntegratedFormState } from "../state";


export const integratedFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<
    IntegratedFormContext<E, FS> & IntegratedFormForeignMutationsExpected<E, FS>,
    IntegratedFormWritableState<E, FS>
  >();

  const parseEntity = Co.GetState().then((current) => {
    if(current.rawEntity.sync.kind == "loaded") {
      const parsed = current.fromApiParser(current.rawEntity.sync.value)
      return Synchronize<Unit, any>(
        () => Promise.resolve(parsed),
        (_) => "transient failure",
        5,
        50
      ).embed((_) => _.entity, IntegratedFormState<E, FS>().Updaters.Core.entity)
      
    }
    return Co.Do(() => {})
  })

  const parseGlobalConfiguration = Co.GetState().then((current) => {
    if(current.rawGlobalConfiguration.sync.kind == "loaded") {
      const parsed = current.parseGlobalConfiguration(current.rawGlobalConfiguration.sync.value)
      if(parsed.kind == "value") {
        return Co.SetState(IntegratedFormState<E, FS>().Updaters.Core.globalConfiguration(replaceWith(Sum.Default.left(parsed.value))))
      }
    }
    return Co.Do(() => {})
  })

  const calculateInitialVisibilities = Co.GetState().then((current) => { 
    if(current.rawEntity.sync.kind == "loaded" && current.rawGlobalConfiguration.sync.kind == "loaded") {
      const parsedRootPredicate = PredicateValue.Operations.parse(current.rawEntity.sync.value, current.formType, current.types)

      if(parsedRootPredicate.kind == "errors" || current.globalConfiguration.kind == "r") {
        console.error('error parsing bindings')
        return Co.Do(() => {})
      }
      if(typeof parsedRootPredicate.value != "object" || !("kind" in parsedRootPredicate.value) || parsedRootPredicate.value.kind != "record") {
        return Co.Do(() => {})
      }
      return Co.SetState(IntegratedFormState<E, FS>().Updaters.Core.customFormState.children.predicateEvaluations(
        replaceWith(Debounced.Default(evaluatePredicates({
          global: current.globalConfiguration.value,
          types: current.types,
          visibilityPredicateExpressions: current.visibilityPredicateExpressions,
          disabledPredicatedExpressions: current.disabledPredicatedExpressions
        }, parsedRootPredicate.value)))))
    }
    return Co.Do(() => {})
  })


  const PredicatesCo = CoTypedFactory<IntegratedFormWritableState<E, FS> & IntegratedFormContext<E, FS>, ValueOrErrors<{
    visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
    disabledPredicateEvaluations: FormFieldPredicateEvaluation;
  }, string>>();

  const calculateVisibilities = Co.Repeat(
    Debounce<ValueOrErrors<{visiblityPredicateEvaluations: FormFieldPredicateEvaluation; disabledPredicateEvaluations: FormFieldPredicateEvaluation;}, string>, IntegratedFormContext<E, FS> & IntegratedFormWritableState<E, FS>>(
    PredicatesCo.GetState().then((current) => { 
      if((current.globalConfiguration.kind == "r" || current.entity.sync.kind != "loaded") ){
        return PredicatesCo.Return<ApiResultStatus>("permanent failure")
      }
      const parsedEntity = current.toApiParser(current.entity.sync.value, current, false)
      if(parsedEntity.kind == "errors") {
        console.error('error parsing entity', parsedEntity)
        return PredicatesCo.Return<ApiResultStatus>("permanent failure")
      }
      const parseRootPredicate = PredicateValue.Operations.parse(parsedEntity.value, current.formType, current.types)
      if(parseRootPredicate.kind == "errors") {
        console.error('error parsing root predicate', parseRootPredicate)
        return PredicatesCo.Return<ApiResultStatus>("permanent failure")
      }
      return PredicatesCo.SetState(replaceWith(evaluatePredicates({
        global: current.globalConfiguration.value,
        types: current.types,
        visibilityPredicateExpressions: current.visibilityPredicateExpressions,
        disabledPredicatedExpressions: current.disabledPredicatedExpressions
    }, parseRootPredicate.value))).then(() => PredicatesCo.Return<ApiResultStatus>("success"))})
  , 50)
  .embed(
    (_) => ({ ..._, ..._.customFormState.predicateEvaluations }),
    IntegratedFormState<E, FS>().Updaters.Core.customFormState.children.predicateEvaluations)
  )


  return Co.Template<IntegratedFormForeignMutationsExpected<E, FS>>(parseEntity, {
      interval: 15,
      runFilter: (props) =>
        props.context.rawEntity.sync.kind == "loaded" && !AsyncState.Operations.hasValue(props.context.entity.sync)
    }).any([
    Co.Template<IntegratedFormForeignMutationsExpected<E, FS>>(parseGlobalConfiguration, {
      interval: 15,
      runFilter: (props) =>
        props.context.rawGlobalConfiguration.sync.kind == "loaded" &&
        props.context.globalConfiguration.kind == "r"
    }),
    Co.Template<IntegratedFormForeignMutationsExpected<E, FS>>(calculateInitialVisibilities, {
      interval: 15,
      runFilter: (props) =>
        props.context.rawEntity.sync.kind == "loaded" &&
        props.context.globalConfiguration.kind == "l"
    }),
    Co.Template<IntegratedFormForeignMutationsExpected<E, FS>>(calculateVisibilities, {
      interval: 15,
      runFilter: (props) =>
        props.context.entity.sync.kind == "loaded" &&
        props.context.globalConfiguration.kind == "l" &&
        Debounced.Operations.shouldCoroutineRun(props.context.customFormState.predicateEvaluations)
    })
  ]);
};
