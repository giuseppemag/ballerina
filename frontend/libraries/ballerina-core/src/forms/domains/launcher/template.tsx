import { List } from "immutable"
import { BasicUpdater, FormRunnerContext, FormRunnerForeignMutationsExpected, FormRunnerLoader, FormRunnerState, Mapping, Sum, unit } from "../../../../main"
import { Template } from "../../../template/state"
import { FormParsingResult } from "../parser/state"

export const FormRunnerErrorsTemplate = (parsedFormsConfig: FormParsingResult) => ({
  form: Template.Default((props: any) =>
    <>
      {parsedFormsConfig.kind == "r" && JSON.stringify(parsedFormsConfig.value)}
    </>),
  formState: unit,
  mapping: Mapping.Default.fromPaths(unit)
})


export const FormRunnerTemplate =
  Template.Default<FormRunnerContext & FormRunnerState, FormRunnerState, FormRunnerForeignMutationsExpected>(props =>
    props.context.form.kind == "r" ? <></> :
      <>
        <props.context.form.value.form
          context={{
            ...props.context.form.value.formState,
            value: props.context.value,
            formState: props.context.form.value.formState,
            extraContext: {
              ...props.context.extraContext,
              rootValue: props.context.form.value.mapping.from(props.context.value),
            }
          }}
          setState={(_:BasicUpdater<any>) => props.setState(
            FormRunnerState.Updaters.form(
              Sum.Updaters.left(
                current => ({ ...current, formState: _(current.formState) })
              )
            )
          )}
          view={props.context.viewWrappers as any}
          foreignMutations={{
            onChange: (_:BasicUpdater<any>, _path:List<string>) => {
              props.foreignMutations.onChange(_, _path)
            }
          }}
        />

      </>).any([
        FormRunnerLoader()
      ])
