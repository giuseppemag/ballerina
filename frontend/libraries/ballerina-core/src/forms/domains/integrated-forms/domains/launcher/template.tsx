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
  rawEntity: unit,
  entity: unit,
  commonFormState: unit,
  customFormState: unit,
  globalConfiguration: unit,
})

export const IntegratedFormRunnerTemplate =
  Template.Default<IntegratedFormRunnerContext & IntegratedFormRunnerState, IntegratedFormRunnerState, IntegratedFormRunnerForeignMutationsExpected>(props => {
    if (props.context.form.kind == "r") return <></>
    return <>
        <props.context.form.value.form
          context={{
            entity: props.context.form.value.entity,
            rawEntity: props.context.form.value.rawEntity,
            globalConfiguration: props.context.form.value.globalConfiguration,
            formFieldStates: props.context.form.value.formFieldStates,
            commonFormState: props.context.form.value.commonFormState,
            customFormState: props.context.form.value.customFormState,
            extraContext: {
              ...props.context.extraContext,
              rootValue:
                  props.context.form.value?.entity.sync?.value,
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
