import { IntegratedFormContext, IntegratedFormForeignMutationsExpected, IntegratedFormView, IntegratedFormWritableState, Template } from "ballerina-core"


export const IntegratedFormContainerWrapper: IntegratedFormView<any, any> = Template.Default<
  IntegratedFormContext<any, any> & IntegratedFormWritableState<any, any>,
  IntegratedFormWritableState<any, any>,
  IntegratedFormForeignMutationsExpected<any, any>,
  {
    actualForm: JSX.Element | undefined
  }>(props =>
    <>
      {props.view.actualForm}
    </>
  )
