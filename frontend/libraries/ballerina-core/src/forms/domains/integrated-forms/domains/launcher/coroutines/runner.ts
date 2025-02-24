import { List } from "immutable"
import { id, replaceWith, Sum, ValueOrErrors } from "../../../../../../../main"
import { AsyncState } from "../../../../../../async/state"
import { CoTypedFactory } from "../../../../../../coroutines/builder"
import {  IntegratedFormRunnerForeignMutationsExpected, IntegratedFormRunnerState, IntegratedFormRunnerContext } from "../state"
import { IntegratedFormRunnerErrorsTemplate } from "../template"

export const IntegratedFormRunnerLoader = () => {
  const Co = CoTypedFactory<IntegratedFormRunnerContext, IntegratedFormRunnerState>()

  return Co.Template<IntegratedFormRunnerForeignMutationsExpected>(
    Co.GetState().then(current =>
      !AsyncState.Operations.hasValue(current.formsConfig.sync) ?
        Co.Wait(0)
        : Co.UpdateState(_ => {
          if (!AsyncState.Operations.hasValue(current.formsConfig.sync)) return id
          if (current.formsConfig.sync.value.kind == "errors")
            return IntegratedFormRunnerState.Updaters.form(
              replaceWith(
                Sum.Default.left(
                    IntegratedFormRunnerErrorsTemplate(current.formsConfig.sync.value)
                )
              )
            )
            
          const formRef = current.formRef
          
        const form = current.formsConfig.sync.value.value.get(formRef.formName)
        if (form == undefined)
            return IntegratedFormRunnerState.Updaters.form(
            replaceWith(
                Sum.Default.left(
                IntegratedFormRunnerErrorsTemplate(ValueOrErrors.Default.throw(List([`Cannot find form '${formRef.formName}'`])))
                )   
            )
            )
            const instantiatedForm = form()
            return IntegratedFormRunnerState.Updaters.form(
            replaceWith(
                Sum.Default.left({
                form: instantiatedForm.form,
                formFieldStates: instantiatedForm.initialState.formFieldStates,
                entity: instantiatedForm.initialState.entity,
                rawEntity: instantiatedForm.initialState.rawEntity,
                commonFormState: instantiatedForm.initialState.commonFormState,
                customFormState: instantiatedForm.initialState.customFormState,
                globalConfiguration: instantiatedForm.initialState.globalConfiguration
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

