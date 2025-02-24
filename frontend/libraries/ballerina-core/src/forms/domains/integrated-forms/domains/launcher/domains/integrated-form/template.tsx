import { AsyncState, unit } from "../../../../../../../../main";
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
      const visibilities = props.context.customFormState.predicateEvaluations.kind == "value" && 
        props.context.customFormState.predicateEvaluations.value.visiblityPredicateEvaluations.kind == "form" ?
        props.context.customFormState.predicateEvaluations.value.visiblityPredicateEvaluations : undefined;
      const disabledFields = props.context.customFormState.predicateEvaluations.kind == "value" 
        && props.context.customFormState.predicateEvaluations.value.disabledPredicateEvaluations.kind == "form" ?
        props.context.customFormState.predicateEvaluations.value.disabledPredicateEvaluations : undefined;
      const parsedEntity = props.context.fromApiParser(props.context.rawEntity)
      console.debug('parsed entity', parsedEntity)
      console.debug('visibilities', visibilities?.fields.toJS())
      console.debug('disabledFields', disabledFields)
      console.debug(props)
      return <>
        {
          props.view({
            ...props, 
            foreignMutations: {
            //   ...props.foreignMutations,
            //    onSubmit: () => {
            //     props.setState(IntegratedFormState<E, FS>().Updaters.Template.submit())
            //   }
            },
            view: {
              ...props.view,
              actualForm:
                  props.context.actualForm({
                    context: {
                      value: parsedEntity,
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
                      onChange: (e) => {
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
