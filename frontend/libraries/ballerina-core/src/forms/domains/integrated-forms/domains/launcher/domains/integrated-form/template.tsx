import { unit } from "../../../../../../../../main";
import { Template } from "../../../../../../../template/state";
import { IntegratedFormContext, IntegratedFormForeignMutationsExpected, IntegratedFormState, IntegratedFormWritableState } from "./state";
import { integratedFormRunner } from "./coroutines/runner";
export type IntegratedFormView<E, FS> =
  Template<
    IntegratedFormContext<E, FS> & IntegratedFormWritableState<E, FS>,
    IntegratedFormWritableState<E, FS>,
    IntegratedFormForeignMutationsExpected<E, FS>,
    {
      actualForm: JSX.Element | undefined
    }>
export type IntegratedFormTemplate<E, FS> =
  Template<
    IntegratedFormContext<E, FS> & IntegratedFormWritableState<E, FS>,
    IntegratedFormWritableState<E, FS>,
    IntegratedFormForeignMutationsExpected<E, FS>,
    IntegratedFormView<E, FS>>
export const IntegratedFormTemplate = <E, FS>(): IntegratedFormTemplate<E, FS> =>
  Template.Default<
    IntegratedFormContext<E, FS> & IntegratedFormWritableState<E, FS>,
    IntegratedFormWritableState<E, FS>,
    IntegratedFormForeignMutationsExpected<E, FS>,
    IntegratedFormView<E, FS>>(props => {
      if(props.context.entity.kind == "r" || props.context.globalConfiguration.kind == "r") {
        return <>
        </>
      }
      const visibilities = props.context.customFormState.predicateEvaluations.kind == "value" && 
        props.context.customFormState.predicateEvaluations.value.visiblityPredicateEvaluations.kind == "form" ?
        props.context.customFormState.predicateEvaluations.value.visiblityPredicateEvaluations : undefined;
      const disabledFields = props.context.customFormState.predicateEvaluations.kind == "value" 
        && props.context.customFormState.predicateEvaluations.value.disabledPredicateEvaluations.kind == "form" ?
        props.context.customFormState.predicateEvaluations.value.disabledPredicateEvaluations : undefined;
      return <>
        {
          props.view({
            ...props, 
            ...props.foreignMutations,
            view: {
              ...props.view,
              actualForm:
                  props.context.actualForm({
                    context: {
                      value: props.context.entity.value,
                      formFieldStates: props.context.formFieldStates,
                      commonFormState: props.context.commonFormState,
                      visibilities,
                      disabledFields
                    },
                    setState: _ => {
                      props.setState(__ => ({
                        ...__,
                        formFieldStates: _(__).formFieldStates,
                        commonFormState: _(__).commonFormState
                      }))
                    },
                    foreignMutations: {
                      onChange: (updater, path) => {
                        if(props.context.entity.kind == "r") 
                          return
                        props.context.onRawEntityChange(updater, path)
                        props.setState(IntegratedFormState<E, FS>().Updaters.Template.recalculatePredicates())
                      }
                    },
                    view: unit
                  })
            }
          })
        }
      </>
    }).any([
      integratedFormRunner<E, FS>()
    ])
