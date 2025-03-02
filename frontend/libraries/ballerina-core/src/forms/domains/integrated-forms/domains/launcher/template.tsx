import { BasicUpdater, FormParsingResult, Sum, unit } from "../../../../../../main"
import { Template } from "../../../../../template/state"

import { PassthroughFormRunnerContext, PassthroughFormRunnerForeignMutationsExpected, PassthroughFormRunnerState } from "./state"
import { PassthroughFormRunnerLoader } from "./coroutines/runner"

export const IntegratedFormRunnerErrorsTemplate = <E,>(parsedFormsConfig: FormParsingResult) => ({
  form: Template.Default<PassthroughFormRunnerContext<E> & PassthroughFormRunnerState<E>, PassthroughFormRunnerState<E>, PassthroughFormRunnerForeignMutationsExpected>(props =>
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

export const PassthroughFormRunnerTemplate = <E,>() => {
  return Template.Default<PassthroughFormRunnerContext<E> & PassthroughFormRunnerState<E>, PassthroughFormRunnerState<E>, PassthroughFormRunnerForeignMutationsExpected>(props => {
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
            PassthroughFormRunnerState<E>().Updaters.form(Sum.Updaters.left(_))
          )}
          view={unit}
          foreignMutations={{
          }}
        />

      </>
      }).any([
        PassthroughFormRunnerLoader()
    ])
}
