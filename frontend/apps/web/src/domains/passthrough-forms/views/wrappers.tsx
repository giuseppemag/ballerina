import {
  PassthroughFormContext,
  PassthroughFormForeignMutationsExpected,
  PassthroughFormView,
  PassthroughFormWritableState,
  Template,
} from "ballerina-core";

export const PassthroughFormContainerWrapper: PassthroughFormView<any, any> =
  Template.Default<
    PassthroughFormContext<any, any> & PassthroughFormWritableState<any, any>,
    PassthroughFormWritableState<any, any>,
    PassthroughFormForeignMutationsExpected<any, any>,
    {
      actualForm: JSX.Element | undefined;
    }
  >((props) => <>{props.view.actualForm}</>);
