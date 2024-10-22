import { FormRunnerErrorsTemplate, id, replaceWith, Sum } from "../../../../../main"
import { AsyncState } from "../../../../async/state"
import { CoTypedFactory } from "../../../../coroutines/builder"
import { FormRunnerContext, FormRunnerForeignMutationsExpected, FormRunnerState } from "../state"

export const FormRunnerLoader = () => {
  const Co = CoTypedFactory<FormRunnerContext, FormRunnerState>()

  //   const MaybePersonFromConfigForm = parsedFormsConfig.kind == "l" ?
  // 	parsedFormsConfig.value.mappings.get("person-from-config") ?? undefined : undefined
  // const PersonFromConfigForm =
  // 	MaybePersonFromConfigForm != undefined ? MaybePersonFromConfigForm<any, any, any, any>()
  // 		: PersonShowFormSetupErrors(validatedFormsConfig, parsedFormsConfig)
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
          const mappedForm = current.formsConfig.sync.value.value.mappings.get(current.formName)
          if (mappedForm == undefined)
            return FormRunnerState.Updaters.form(
              replaceWith(
                Sum.Default.left(
                  FormRunnerErrorsTemplate(Sum.Default.right([`Cannot find form '${current.formName}'`]))
                )
              )
            )
          const instantiatedMappedForm = mappedForm()
          return FormRunnerState.Updaters.form(
            replaceWith(
              Sum.Default.left({
                form:instantiatedMappedForm.form,
                formState:instantiatedMappedForm.initialState,
                mapping:instantiatedMappedForm.mapping
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

