import { List } from "immutable"
import { FormRunnerErrorsTemplate, id, replaceWith, Sum } from "../../../../../main"
import { AsyncState } from "../../../../async/state"
import { CoTypedFactory } from "../../../../coroutines/builder"
import { FormRunnerContext, FormRunnerForeignMutationsExpected, FormRunnerState } from "../state"

export const FormRunnerLoader = () => {
  const Co = CoTypedFactory<FormRunnerContext, FormRunnerState>()

  return Co.Template<FormRunnerForeignMutationsExpected>(
    Co.GetState().then(current =>
      !AsyncState.Operations.hasValue(current.formsConfig.sync) ?
        Co.Wait(0)
        : Co.UpdateState(_ => {
          if (!AsyncState.Operations.hasValue(current.formsConfig.sync)) return id
          if (current.formsConfig.sync.value.kind == "r")
            return FormRunnerState.Updaters.form(
              replaceWith(
                Sum.Default.left(
                  FormRunnerErrorsTemplate(current.formsConfig.sync.value)
                )
              )
            )
            
          const formRef = current.formRef
          if (formRef.kind == "create") {
            const createForm = current.formsConfig.sync.value.value.create.get(formRef.formName)
            if (createForm == undefined)
              return FormRunnerState.Updaters.form(
                replaceWith(
                  Sum.Default.left(
                    FormRunnerErrorsTemplate(Sum.Default.right(List([`Cannot find form '${formRef.formName}'`])))
                  )
                )
              )
              const instantiatedForm = createForm()
              return FormRunnerState.Updaters.form(
                replaceWith(
                  Sum.Default.left({
                    form: instantiatedForm.form,
                    formFieldStates: instantiatedForm.initialState.formFieldStates,
                    entity: instantiatedForm.initialState.entity,
                    commonFormState: instantiatedForm.initialState.commonFormState,
                    customFormState: instantiatedForm.initialState.customFormState,
                  })
                )
              )  
          } else if (formRef.kind == "edit") {
            const editForm = current.formsConfig.sync.value.value.edit.get(formRef.formName)
            if (editForm == undefined)
              return FormRunnerState.Updaters.form(
                replaceWith(
                  Sum.Default.left(
                    FormRunnerErrorsTemplate(Sum.Default.right(List([`Cannot find form '${formRef.formName}'`])))
                  )
                )
              )
              const instantiatedForm = editForm()
              return FormRunnerState.Updaters.form(
                replaceWith(
                  Sum.Default.left({
                    form: instantiatedForm.form,
                    formFieldStates: instantiatedForm.initialState.formFieldStates,
                    entity: instantiatedForm.initialState.entity,
                    commonFormState: instantiatedForm.initialState.commonFormState,
                    customFormState: instantiatedForm.initialState.customFormState
                  })
                )
              )
          }
          return id
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

