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
  const calculateInitialVisibilities = Co.GetState().then((current) => { 
    const parsedGlobalConfig = current.parseGlobalConfiguration(current.rawGlobalConfiguration)
    const parsedRootPredicate = PredicateValue.Operations.parse(current.rawEntity, current.formType, current.types)
    
    if(parsedRootPredicate.kind == "errors" || parsedGlobalConfig.kind == "errors") {
      console.error('error parsing bindings', parsedRootPredicate, parsedGlobalConfig)
      return Co.Do(() => {})
    }
    console.debug("EVALUATING INITIAL VISIBILITIES")
    if(typeof parsedRootPredicate.value != "object" || !("kind" in parsedRootPredicate.value) || parsedRootPredicate.value.kind != "record") {
      return Co.Do(() => {})
    }
    return Co.SetState(IntegratedFormState<E, FS>().Updaters.Core.customFormState.children.predicateEvaluations(
      replaceWith(Debounced.Default(evaluatePredicates({
        global: parsedGlobalConfig.value,
        types: current.types,
        visibilityPredicateExpressions: current.visibilityPredicateExpressions,
        disabledPredicatedExpressions: current.disabledPredicatedExpressions
      }, parsedRootPredicate.value))))).then(() => Co.SetState(IntegratedFormState<E, FS>().Updaters.Core.customFormState.children.isInitialized(replaceWith(true))))
  })

  const PredicatesCo = CoTypedFactory<IntegratedFormWritableState<E, FS> & IntegratedFormContext<E, FS>, ValueOrErrors<{
    visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
    disabledPredicateEvaluations: FormFieldPredicateEvaluation;
  }, string>>();

  const calculateVisibilities = Co.Repeat(
    Debounce<ValueOrErrors<{visiblityPredicateEvaluations: FormFieldPredicateEvaluation; disabledPredicateEvaluations: FormFieldPredicateEvaluation;}, string>, IntegratedFormContext<E, FS> & IntegratedFormWritableState<E, FS>>(
    PredicatesCo.GetState().then((current) => { 
      const parsedGlobalConfig = current.parseGlobalConfiguration(current.rawGlobalConfiguration)
      const parseRootPredicate = PredicateValue.Operations.parse(current.rawEntity, current.formType, current.types)
      if(parseRootPredicate.kind == "errors" || parsedGlobalConfig.kind == "errors") {
        console.error('error parsing', parseRootPredicate, parsedGlobalConfig)
        return PredicatesCo.Return<ApiResultStatus>("permanent failure")
      }
      return PredicatesCo.SetState(replaceWith(evaluatePredicates({
        global: parsedGlobalConfig.value,
        types: current.types,
        visibilityPredicateExpressions: current.visibilityPredicateExpressions,
        disabledPredicatedExpressions: current.disabledPredicatedExpressions
    }, parseRootPredicate.value))).then(() => PredicatesCo.Return<ApiResultStatus>("success"))})
  , 50)
  .embed(
    (_) => ({ ..._, ..._.customFormState.predicateEvaluations }),
    IntegratedFormState<E, FS>().Updaters.Core.customFormState.children.predicateEvaluations)
  )


  return Co.Template<IntegratedFormForeignMutationsExpected<E, FS>>(calculateInitialVisibilities, {
      interval: 15,
      runFilter: (props) => props.context.customFormState.isInitialized == false
    }).any([
    Co.Template<IntegratedFormForeignMutationsExpected<E, FS>>(calculateVisibilities, {
      interval: 15,
      runFilter: (props) =>
        Debounced.Operations.shouldCoroutineRun(props.context.customFormState.predicateEvaluations)
    })
  ]);
};
