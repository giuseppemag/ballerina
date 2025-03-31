import {
  EntityFormView,
  FormLayout,
  Unit,
  unit,
  CreateFormView,
  Template,
  CreateFormContext,
  CreateFormWritableState,
  CreateFormForeignMutationsExpected,
  SimpleCallback,
  FormLaunchersResult,
  EditFormView,
  EditFormWritableState,
  EditFormContext,
  EditFormForeignMutationsExpected,
} from "ballerina-core";

export const PersonContainerFormView: EntityFormView<
  any,
  any,
  { layout: FormLayout },
  Unit
> = (props) => {
  return (
    <>
      {props.context.label && <h1>{props.context.label}</h1>}
      <table>
        <tbody>
          {/* {JSON.stringify(props.VisibleFieldKeys.toArray())} */}
          {props.context.layout.valueSeq().map((tab) =>
            tab.columns.valueSeq().map((column) => (
              <tr style={{ display: "block", float: "left" }}>
                {column.groups.valueSeq().map((group) =>
                  group
                    .filter((fieldName) =>
                      props.VisibleFieldKeys.has(fieldName),
                    )
                    .map((fieldName) => (
                      <td style={{ display: "block" }}>
                        {props.EmbeddedFields[fieldName]({
                          ...props,
                          context: {
                            ...props.context,
                            disabled: props.DisabledFieldKeys.has(fieldName),
                          },
                          view: unit,
                        })}
                      </td>
                    )),
                )}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </>
  );
};

export const PersonNestedContainerFormView: EntityFormView<
  any,
  any,
  { layout: FormLayout },
  Unit
> = (props) => {
  return (
    <>
      {props.context.label && <h3>{props.context.label}</h3>}
      <table>
        <tbody>
          {/* {JSON.stringify(props.VisibleFieldKeys.toArray())} */}
          {props.context.layout.valueSeq().map((tab) =>
            tab.columns.valueSeq().map((column) => (
              <tr style={{ display: "block", float: "left" }}>
                {column.groups.valueSeq().map((group) =>
                  group
                    .filter((fieldName) =>
                      props.VisibleFieldKeys.has(fieldName),
                    )
                    .map((fieldName) => (
                      <td style={{ display: "block" }}>
                        {props.EmbeddedFields[fieldName]({
                          ...props,
                          context: {
                            ...props.context,
                            disabled: props.DisabledFieldKeys.has(fieldName),
                          },
                          view: unit,
                        })}
                      </td>
                    )),
                )}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </>
  );
};

export const CreatePersonSubmitButtonWrapper: CreateFormView<any, any> =
  Template.Default<
    CreateFormContext<any, any> & CreateFormWritableState<any, any>,
    CreateFormWritableState<any, any>,
    CreateFormForeignMutationsExpected<any, any> & {
      onSubmit: SimpleCallback<void>;
    },
    {
      actualForm: JSX.Element | undefined;
    }
  >((props) => (
    <>
      {props.view.actualForm}
      <button
        disabled={props.context.customFormState.apiRunner.dirty != "not dirty"}
        onClick={(e) => props.foreignMutations.onSubmit()}
      >
        Submit
      </button>
    </>
  ));

export const EditPersonSubmitButtonWrapper: EditFormView<any, any> =
  Template.Default<
    EditFormContext<any, any> & EditFormWritableState<any, any>,
    EditFormWritableState<any, any>,
    EditFormForeignMutationsExpected<any, any> & {
      onSubmit: SimpleCallback<void>;
    },
    {
      actualForm: JSX.Element | undefined;
    }
  >((props) => (
    <>
      {props.view.actualForm}
      <button
        disabled={props.context.customFormState.apiRunner.dirty != "not dirty"}
        onClick={(e) => props.foreignMutations.onSubmit()}
      >
        Submit
      </button>
    </>
  ));

// export const PersonShowFormSetupErrors = (
//   validatedFormsConfig: FormConfigValidationAndParseResult<Unit>,
//   parsedFormsConfig: FormLaunchersResult<any>,
// ) => ({
//   form: Template.Default((props: any) => (
//     <>
//       {validatedFormsConfig.kind == "errors" &&
//         JSON.stringify(validatedFormsConfig.errors)}
//       {parsedFormsConfig.kind == "r" && JSON.stringify(parsedFormsConfig.value)}
//     </>
//   )),
//   initialState: unit,
// });
