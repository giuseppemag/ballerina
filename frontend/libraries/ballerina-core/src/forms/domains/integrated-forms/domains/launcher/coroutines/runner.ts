import { List } from "immutable"
import { id, replaceWith, Sum, ValueOrErrors } from "../../../../../../../main"
import { AsyncState } from "../../../../../../async/state"
import { CoTypedFactory } from "../../../../../../coroutines/builder"
import {  IntegratedFormRunnerForeignMutationsExpected, IntegratedFormRunnerState, IntegratedFormRunnerContext, IntegratedForm } from "../state"
import { IntegratedFormRunnerErrorsTemplate } from "../template"

export const IntegratedFormRunnerLoader = <E,>() => {
  const Co = CoTypedFactory<IntegratedFormRunnerContext<E>, IntegratedFormRunnerState<E>>()

  return Co.Template<IntegratedFormRunnerForeignMutationsExpected>(
    Co.GetState().then(current =>
      !AsyncState.Operations.hasValue(current.formsConfig.sync) ?
        Co.Wait(0)
        : Co.UpdateState(_ => {
          if (!AsyncState.Operations.hasValue(current.formsConfig.sync)) return id
          if (current.formsConfig.sync.value.kind == "errors")
            return IntegratedFormRunnerState<E>().Updaters.form(
              replaceWith(
                Sum.Default.left(
                    IntegratedFormRunnerErrorsTemplate(current.formsConfig.sync.value)
                )
              )
            )
            
          const formRef = current.formRef
          
        const form = current.formsConfig.sync.value.value.get(formRef.formName)
        if (form == undefined)
            return IntegratedFormRunnerState<E>().Updaters.form(
              replaceWith(
                  Sum.Default.left(
                  IntegratedFormRunnerErrorsTemplate(ValueOrErrors.Default.throw(List([`Cannot find form '${formRef.formName}'`])))
                  )   
              )
            )
            const instantiatedForm = form()
        return IntegratedFormRunnerState<E>().Updaters.form(
          replaceWith<Sum<IntegratedForm<E>, "not initialized">>(
              Sum.Default.left<IntegratedForm<E>, "not initialized">({
                form: instantiatedForm.form,
                formFieldStates: instantiatedForm.initialState.formFieldStates,
                commonFormState: instantiatedForm.initialState.commonFormState,
                customFormState: instantiatedForm.initialState.customFormState,
                fromApiParser: instantiatedForm.fromApiParser as (value: any) => E,
                toApiParser: instantiatedForm.toApiParser,
                parseGlobalConfiguration: instantiatedForm.parseGlobalConfiguration
              })
          )
        )
        })
    ),
    {
      interval: 15,
      runFilter: props =>
        AsyncState.Operations.hasValue(props.context.formsConfig.sync) &&
        props.context.form.kind == "r"
    }
  )
}

