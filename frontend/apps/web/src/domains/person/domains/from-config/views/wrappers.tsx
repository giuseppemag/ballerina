import { EntityFormView, FormLayout, Unit, unit, CreateFormView, Template, CreateFormContext, CreateFormWritableState, CreateFormForeignMutationsExpected, SimpleCallback, FormParsingResult, FormValidationResult } from "ballerina-core"

export const ContainerFormView: EntityFormView<any, any, any, { layout: FormLayout }, Unit> = props => {
  return <>
    <table>
      <tbody>
        {/* {JSON.stringify(props.VisibleFieldKeys.toArray())} */}
        {
          props.context.layout.valueSeq().map(tab =>
            tab.columns.valueSeq().map(column =>
              <tr>
                {
                  column.groups.valueSeq().map(group =>
                    group.filter(fieldName => props.VisibleFieldKeys.has(fieldName))
                      .map(fieldName =>
                        <td>
                          {props.EmbeddedFields[fieldName]({ ...props, view: unit })}
                        </td>
                      )
                  )
                }
              </tr>
            )
          )
        }
      </tbody>
    </table>
  </>
}

export const SubmitButtonWrapper: CreateFormView<any, any> = Template.Default<
  CreateFormContext<any, any> & CreateFormWritableState<any, any>,
  CreateFormWritableState<any, any>,
  CreateFormForeignMutationsExpected<any, any> & { onSubmit: SimpleCallback<void> },
  {
    actualForm: JSX.Element | undefined
  }>(props =>
    <>
      {props.view.actualForm}
      <button disabled={props.context.entity.dirty != "not dirty"} onClick={e => props.foreignMutations.onSubmit()}>Submit</button>
    </>
  )

export const ShowFormSetupErrors = (validatedFormsConfig: FormValidationResult, parsedFormsConfig: FormParsingResult) => ({
  form: Template.Default((props: any) =>
    <>
      {validatedFormsConfig.kind == "r" && JSON.stringify(validatedFormsConfig.value)}
      {parsedFormsConfig.kind == "r" && JSON.stringify(parsedFormsConfig.value)}
    </>),
    initialState: unit,
})
