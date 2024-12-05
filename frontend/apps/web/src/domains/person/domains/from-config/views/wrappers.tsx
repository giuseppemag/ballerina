import { EntityFormView, FormLayout, Unit, unit, CreateFormView, Template, CreateFormContext, CreateFormWritableState, CreateFormForeignMutationsExpected, SimpleCallback, FormParsingResult, FormValidationResult, EditFormView, EditFormWritableState, EditFormContext, EditFormForeignMutationsExpected } from "ballerina-core"

export const PersonContainerFormView: EntityFormView<any, any, any, { layout: FormLayout }, Unit> = props => {
  return <>
    <table>
      <tbody>
        {/* {JSON.stringify(props.VisibleFieldKeys.toArray())} */}
        {
          props.context.layout.valueSeq().map(tab =>
            tab.columns.valueSeq().map(column =>
              <tr style={{ display: "block", float: "left" }}>
                {
                  column.groups.valueSeq().map(group =>
                    group.filter(fieldName => props.VisibleFieldKeys.has(fieldName))
                      .map(fieldName =>
                        <td style={{ display: "block" }}>
                          {props.EmbeddedFields[fieldName]({ ...props, 
                            context:{...props.context, disabled:props.DisabledFieldKeys.has(fieldName) }, view: unit })}
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

export const PersonNestedContainerFormView: EntityFormView<any, any, any, { layout: FormLayout }, Unit> = props => {
  return <>
    <table>
      <tbody>
        {/* {JSON.stringify(props.VisibleFieldKeys.toArray())} */}
        {
          props.context.layout.valueSeq().map(tab =>
            tab.columns.valueSeq().map(column =>
              <tr style={{ display: "block", float: "left" }}>
                {
                  column.groups.valueSeq().map(group =>
                    group.filter(fieldName => props.VisibleFieldKeys.has(fieldName))
                      .map(fieldName =>
                        <td style={{ display: "block" }}>
                          {props.EmbeddedFields[fieldName]({ ...props, 
                            context:{...props.context, disabled:props.DisabledFieldKeys.has(fieldName) }, view: unit })}
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

export const CreatePersonSubmitButtonWrapper: CreateFormView<any, any> = Template.Default<
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

  export const EditPersonSubmitButtonWrapper: EditFormView<any, any> = Template.Default<
    EditFormContext<any, any> & EditFormWritableState<any, any>,
    EditFormWritableState<any, any>,
    EditFormForeignMutationsExpected<any, any> & { onSubmit: SimpleCallback<void> },
    {
      actualForm: JSX.Element | undefined
    }>(props =>
      <>
        {props.view.actualForm}
        <button disabled={props.context.apiRunner.dirty != "not dirty"} onClick={e => props.foreignMutations.onSubmit()}>Submit</button>
      </>
  )

export const PersonShowFormSetupErrors = (validatedFormsConfig: FormValidationResult, parsedFormsConfig: FormParsingResult) => ({
  form: Template.Default((props: any) =>
    <>
      {validatedFormsConfig.kind == "r" && JSON.stringify(validatedFormsConfig.value)}
      {parsedFormsConfig.kind == "r" && JSON.stringify(parsedFormsConfig.value)}
    </>),
    initialState: unit,
})
