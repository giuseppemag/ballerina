import { List } from "immutable";
import { replaceWith, ValueOrErrors, Debounce } from "../../../../../../../main";
import { ApiResultStatus } from "../../../../../../apiResultStatus/state";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { Debounced } from "../../../../../../debounced/state";
import { PredicateValue, evaluatePredicates, FormFieldPredicateEvaluation } from "../../../../parser/domains/predicates/state";
import { PassthroughFormContext, PassthroughFormForeignMutationsExpected, PassthroughFormWritableState, PassthroughFormState } from "../state";


export const passthroughFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<
    PassthroughFormContext<E, FS> & PassthroughFormForeignMutationsExpected<E, FS> & { onRawEntityChange: (updatedRawEntity: any, path: List<string>) => void },
    PassthroughFormWritableState<E, FS>
  >();

  const calculateInitialVisibilities = Co.GetState().then((current) => { 
    const parsedRootPredicate = PredicateValue.Operations.parse(current.initialRawEntity.value, current.formType, current.types)
    
    if(parsedRootPredicate.kind == "errors") {
      console.error('error parsing bindings', parsedRootPredicate)
      return Co.Do(() => {})
    }
    if(typeof parsedRootPredicate.value != "object" || !("kind" in parsedRootPredicate.value) || parsedRootPredicate.value.kind != "record") {
      return Co.Do(() => {})
    }
    return Co.SetState(PassthroughFormState<E, FS>().Updaters.Core.customFormState.children.predicateEvaluations(
      replaceWith(Debounced.Default(evaluatePredicates({
        global: current.globalConfiguration.value,
        types: current.types,
        visibilityPredicateExpressions: current.visibilityPredicateExpressions,
        disabledPredicatedExpressions: current.disabledPredicatedExpressions
      }, parsedRootPredicate.value)))).then(PassthroughFormState<E, FS>().Updaters.Core.customFormState.children.isInitialized(replaceWith(true)))
    )
  })

  const PredicatesCo = CoTypedFactory<PassthroughFormWritableState<E, FS> & PassthroughFormContext<E, FS>, ValueOrErrors<{
    visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
    disabledPredicateEvaluations: FormFieldPredicateEvaluation;
  }, string>>();

  const calculateVisibilities = Co.Repeat(
    Debounce<ValueOrErrors<{visiblityPredicateEvaluations: FormFieldPredicateEvaluation; disabledPredicateEvaluations: FormFieldPredicateEvaluation;}, string>, PassthroughFormContext<E, FS> & PassthroughFormWritableState<E, FS>>(
    PredicatesCo.GetState().then((current) => { 
      if(current.entity.kind == "r" || current.globalConfiguration.kind == "r") {
        return PredicatesCo.Return<ApiResultStatus>("permanent failure")
      }
      const parsedEntity = current.toApiParser(current.entity.value, current, false)
      if(parsedEntity.kind == "errors") {
        console.error('error parsing entity', parsedEntity)
        return PredicatesCo.Return<ApiResultStatus>("permanent failure")
      }
      const parseRootPredicate = PredicateValue.Operations.parse(parsedEntity.value, current.formType, current.types)
      if(parseRootPredicate.kind == "errors") {
        console.error('error parsing', parseRootPredicate)
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
    PassthroughFormState<E, FS>().Updaters.Core.customFormState.children.predicateEvaluations)
  )

  return Co.Template<PassthroughFormForeignMutationsExpected<E, FS>>(calculateInitialVisibilities, {
      interval: 15,
      runFilter: (props) => !props.context.customFormState.isInitialized && props.context.globalConfiguration.kind != "r" && props.context.initialRawEntity.kind != "r"
    }).any([
    Co.Template<PassthroughFormForeignMutationsExpected<E, FS>>(calculateVisibilities, {
      interval: 15,
      runFilter: (props) =>
        Debounced.Operations.shouldCoroutineRun(props.context.customFormState.predicateEvaluations)
    }),
  ]);
};
