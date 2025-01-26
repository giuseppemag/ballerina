import { List } from "immutable"
import { BasicUpdater, FormRunnerContext, FormRunnerForeignMutationsExpected, FormRunnerLoader, FormRunnerState, Sum, unit } from "../../../../main"
import { Template } from "../../../template/state"
import { FormParsingResult } from "../parser/state"

export const FormRunnerErrorsTemplate = (parsedFormsConfig: FormParsingResult) => ({
  form: Template.Default<FormRunnerContext & FormRunnerState, FormRunnerState, FormRunnerForeignMutationsExpected>(props =>
    <>
      {JSON.stringify(parsedFormsConfig)}
      <br />
      {JSON.stringify(props)}
    </>),
  // form: Template.Default<FormRunnerContext & FormRunnerState, FormRunnerState, FormRunnerForeignMutationsExpected>(props =>
  //   props.context.showFormParsingErrors(parsedFormsConfig)
  // ),
  formState: unit,
})

export const FormRunnerTemplate =
  Template.Default<FormRunnerContext & FormRunnerState, FormRunnerState, FormRunnerForeignMutationsExpected>(props => {
    if (props.context.form.kind == "r") return <></>
    // console.log("props.context.form.value.formState", props.context)
    return <>
        <props.context.form.value.form
          context={{
            ...props.context.form.value.formState,
            entityId: props.context.formRef.kind == "edit" ? props.context.formRef.entityId : undefined,
            value: undefined,
            formState: props.context.form.value.formState.formState,
            extraContext: {
              ...props.context.extraContext,
              rootValue:
                  props.context.form.value.formState?.entity.sync?.value,
            },
            submitButtonWrapper: (props.context.formRef.kind == "create" || props.context.formRef.kind == "edit" )  ? props.context.formRef.submitButtonWrapper : undefined
          }}
          setState={(_: BasicUpdater<any>) => props.setState(
            FormRunnerState.Updaters.form(
              Sum.Updaters.left(
                current => ({ ...current, formState: _(current.formState) })
              )
            )
          )}
          view={unit}
          foreignMutations={{
            onChange: (_: BasicUpdater<any>, _path: List<string>) => {
              if (props.context.formRef.kind == "map")
                props.context.formRef.onChange(_, _path)
            },
            apiHandlers: {
              onDefaultSuccess: (_: any) => {
                if (
                  props.context.formRef.kind == "create"
                )
                  props.context.formRef.apiHandlers?.onDefaultSuccess?.(_)
              },
              onDefaultError: (_: any) => {
                if (
                  props.context.formRef.kind == "create"
                )
                  props.context.formRef.apiHandlers?.onDefaultError?.(_)
              },
              onCreateSuccess: (_: any) => {
                if (props.context.formRef.kind === 'create')
                  props.context.formRef.apiHandlers?.onCreateSuccess?.(_)
              },
              onCreateError: (_: any) => {
                if (props.context.formRef.kind === 'create')
                  props.context.formRef.apiHandlers?.onCreateError?.(_)
              },
              onGetSuccess: (_: any) => {
                if (
                  props.context.formRef.kind === 'edit'
                )
                  props.context.formRef.apiHandlers?.onGetSuccess?.(_)
              },
              onGetError: (_: any) => {
                if (
                  props.context.formRef.kind === 'edit'
                )
                  props.context.formRef.apiHandlers?.onGetError?.(_)
              },
              onUpdateSuccess: (_: any) => {
                if (props.context.formRef.kind === 'edit')
                  props.context.formRef.apiHandlers?.onUpdateSuccess?.(_)
              },
              onUpdateError: (_: any) => {
                if (props.context.formRef.kind === 'edit')
                  props.context.formRef.apiHandlers?.onUpdateError?.(_)
              }
            }
          }}
        />

      </>
      }).any([
        FormRunnerLoader()
      ])
