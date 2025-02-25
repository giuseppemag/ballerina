import { BasicUpdater, Sum, unit } from "../../../../../../main"
import { Template } from "../../../../../template/state"

import { IntegratedFormRunnerContext, IntegratedFormRunnerForeignMutationsExpected, IntegratedFormRunnerState } from "./state"
import { IntegratedFormParsingResult } from "../parser/state"
import { IntegratedFormRunnerLoader } from "./coroutines/runner"

export const IntegratedFormRunnerErrorsTemplate = <E,>(parsedFormsConfig: IntegratedFormParsingResult) => ({
  form: Template.Default<IntegratedFormRunnerContext<E> & IntegratedFormRunnerState<E>, IntegratedFormRunnerState<E>, IntegratedFormRunnerForeignMutationsExpected>(props =>
    <>
      {JSON.stringify(parsedFormsConfig)}
      <br />
      {JSON.stringify(props)}
    </>),
  formFieldStates: unit,
  commonFormState: unit,
  customFormState: unit,
  fromApiParser: (value: any) => value,
  toApiParser: (value: any, formState: any, checkKeys: boolean) => value,
  parseGlobalConfiguration: (raw: any) => raw,
})

export const IntegratedFormRunnerTemplate = <E,>() => {
  return Template.Default<IntegratedFormRunnerContext<E> & IntegratedFormRunnerState<E>, IntegratedFormRunnerState<E>, IntegratedFormRunnerForeignMutationsExpected>(props => {
    if (props.context.form.kind == "r") return <></>
    return <>
        <props.context.form.value.form
          context={{
            initialRawEntity: props.context.initialRawEntity,
            entity: props.context.entity,
            globalConfiguration: props.context.globalConfiguration,
            formFieldStates: props.context.form.value.formFieldStates,
            commonFormState: props.context.form.value.commonFormState,
            customFormState: props.context.form.value.customFormState,
            containerWrapper: props.context.containerWrapper,
            onRawEntityChange: props.foreignMutations.onRawEntityChange,
            extraContext: {
              ...props.context.extraContext,
            },
          }}
          setState={(_: BasicUpdater<any>) => props.setState(
            IntegratedFormRunnerState<E>().Updaters.form(Sum.Updaters.left(_))
          )}
          view={unit}
          foreignMutations={{
          }}
        />

      </>
      }).any([
        IntegratedFormRunnerLoader()
    ])
}
