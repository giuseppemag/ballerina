import { List } from "immutable"
import { id, replaceWith, Sum, ValueOrErrors } from "../../../../../../../main"
import { AsyncState } from "../../../../../../async/state"
import { CoTypedFactory } from "../../../../../../coroutines/builder"
import {  PassthroughFormRunnerForeignMutationsExpected, PassthroughFormRunnerState, PassthroughFormRunnerContext, PassthroughForm } from "../state"
import { IntegratedFormRunnerErrorsTemplate } from "../template"

export const PassthroughFormRunnerLoader = <E,>() => {
  const Co = CoTypedFactory<PassthroughFormRunnerContext<E>, PassthroughFormRunnerState<E>>()

  return Co.Template<PassthroughFormRunnerForeignMutationsExpected>(
    Co.GetState().then(current =>
      !AsyncState.Operations.hasValue(current.formsConfig.sync) ?
        Co.Wait(0)
        : Co.UpdateState(_ => {
          if (!AsyncState.Operations.hasValue(current.formsConfig.sync)) return id
          if (current.formsConfig.sync.value.kind == "r")
            return PassthroughFormRunnerState<E>().Updaters.form(
              replaceWith(
                Sum.Default.left(
                    IntegratedFormRunnerErrorsTemplate(current.formsConfig.sync.value)
                )
              )
            )
            
          const formRef = current.formRef
          
        const form = current.formsConfig.sync.value.value.passthrough.get(formRef.formName)
        if (form == undefined)
            return PassthroughFormRunnerState<E>().Updaters.form(
              replaceWith(
                  Sum.Default.left(
                  IntegratedFormRunnerErrorsTemplate(Sum.Default.right(List([`Cannot find form '${formRef.formName}'`])))
                  )   
              )
            )
            const instantiatedForm = form()
        return PassthroughFormRunnerState<E>().Updaters.form(
          replaceWith<Sum<PassthroughForm<E>, "not initialized">>(
              Sum.Default.left<PassthroughForm<E>, "not initialized">({
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

