import React from "react";
import { AsyncState, createFormRunner, IntegratedFormContext, IntegratedFormForeignMutationsExpected, IntegratedFormState, IntegratedFormWritableState, replaceWith, SimpleCallback, unit } from "../../../../../main";
import { Template, View } from "../../../../template/state";

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
                !AsyncState.Operations.hasValue(props.context.entity.sync) ? undefined :
                  props.context.actualForm({
                    context: {
                      value: props.context.entity.sync.value,
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
                        props.setState(IntegratedFormState<E, FS>().Updaters.Template.entity(e));
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
    //   createFormRunner<E, FS>().mapContextFromProps(props => ({
    //     ...props.context,
    //     apiHandlers: {
    //       onDefaultSuccess: props.foreignMutations.apiHandlers?.onDefaultSuccess,
    //       onDefaultError: props.foreignMutations.apiHandlers?.onDefaultError,
    //       onCreateSuccess: props.foreignMutations.apiHandlers?.onCreateSuccess,
    //       onCreateError: props.foreignMutations.apiHandlers?.onCreateError
    //     }
    //   }))
    ])
