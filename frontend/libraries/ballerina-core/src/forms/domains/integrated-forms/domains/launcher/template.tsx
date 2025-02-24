import { BasicUpdater, Sum, unit } from "../../../../../../main"
import { Template } from "../../../../../template/state"

import { IntegratedFormRunnerContext, IntegratedFormRunnerForeignMutationsExpected, IntegratedFormRunnerState } from "./state"
import { IntegratedFormParsingResult } from "../parser/state"
import { IntegratedFormRunnerLoader } from "./coroutines/runner"

export const IntegratedFormRunnerErrorsTemplate = (parsedFormsConfig: IntegratedFormParsingResult) => ({
  form: Template.Default<IntegratedFormRunnerContext & IntegratedFormRunnerState, IntegratedFormRunnerState, IntegratedFormRunnerForeignMutationsExpected>(props =>
    <>
      {JSON.stringify(parsedFormsConfig)}
      <br />
      {JSON.stringify(props)}
    </>),
  formFieldStates: unit,
  commonFormState: unit,
  customFormState: unit,
})

export const IntegratedFormRunnerTemplate =
  Template.Default<IntegratedFormRunnerContext & IntegratedFormRunnerState, IntegratedFormRunnerState, IntegratedFormRunnerForeignMutationsExpected>(props => {
    if (props.context.form.kind == "r") return <></>
    return <>
        <props.context.form.value.form
          context={{
            rawEntity: props.context.rawEntity,
            rawGlobalConfiguration: props.context.rawGlobalConfiguration,
            formFieldStates: props.context.form.value.formFieldStates,
            commonFormState: props.context.form.value.commonFormState,
            customFormState: props.context.form.value.customFormState,
            containerWrapper: props.context.containerWrapper,
            extraContext: {
              ...props.context.extraContext,
            },
          }}
          setState={(_: BasicUpdater<any>) => props.setState(
            IntegratedFormRunnerState.Updaters.form(Sum.Updaters.left(_))
          )}
          view={unit}
          foreignMutations={{

          }}
        />

      </>
      }).any([
        IntegratedFormRunnerLoader()
      ])
