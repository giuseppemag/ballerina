import {
  BasicUpdater,
  FormRunnerContext,
  FormRunnerForeignMutationsExpected,
  FormRunnerLoader,
  FormRunnerState,
  Sum,
  unit,
} from "../../../../main";
import { Template } from "../../../template/state";
import { FormParsingResult } from "../parser/state";

export const FormRunnerErrorsTemplate = (
  parsedFormsConfig: FormParsingResult,
) => ({
  form: Template.Default<
    FormRunnerContext & FormRunnerState,
    FormRunnerState,
    FormRunnerForeignMutationsExpected
  >((props) => (
    <>
      {JSON.stringify(parsedFormsConfig)}
      <br />
      {JSON.stringify(props)}
    </>
  )),
  // form: Template.Default<FormRunnerContext & FormRunnerState, FormRunnerState, FormRunnerForeignMutationsExpected>(props =>
  //   props.context.showFormParsingErrors(parsedFormsConfig)
  // ),
  formFieldStates: unit,
  rawEntity: unit,
  entity: unit,
  commonFormState: unit,
  customFormState: unit,
  rawGlobalConfiguration: unit,
  globalConfiguration: unit,
});

export const FormRunnerTemplate = Template.Default<
  FormRunnerContext & FormRunnerState,
  FormRunnerState,
  FormRunnerForeignMutationsExpected
>((props) => {
  if (props.context.form.kind == "r") return <></>;
  return (
    <>
      <props.context.form.value.form
        context={{
          entityId:
            props.context.formRef.kind == "edit"
              ? props.context.formRef.entityId
              : undefined,
          initialRawEntity:
            props.context.formRef.kind == "passthrough"
              ? props.context.formRef.initialRawEntity
              : undefined,
          entity:
            props.context.formRef.kind == "passthrough"
              ? props.context.formRef.entity
              : props.context.form.value.entity,
          onRawEntityChange:
            props.context.formRef.kind == "passthrough"
              ? props.context.formRef.onRawEntityChange
              : undefined,
          globalConfiguration:
            props.context.formRef.kind == "passthrough"
              ? props.context.formRef.globalConfiguration
              : props.context.form.value.globalConfiguration,
          rawEntity: props.context.form.value.rawEntity,
          rawGlobalConfiguration:
            props.context.form.value.rawGlobalConfiguration,
          formFieldStates: props.context.form.value.formFieldStates,
          commonFormState: props.context.form.value.commonFormState,
          customFormState: props.context.form.value.customFormState,
          extraContext: {
            ...props.context.extraContext,
            rootValue:
              props.context.formRef.kind == "passthrough"
                ? undefined
                : props.context.form.value?.entity.sync?.value,
          },
          submitButtonWrapper:
            props.context.formRef.kind == "create" ||
            props.context.formRef.kind == "edit"
              ? props.context.formRef.submitButtonWrapper
              : undefined,
          containerWrapper:
            props.context.formRef.kind == "passthrough"
              ? props.context.formRef.containerWrapper
              : undefined,
        }}
        setState={(_: BasicUpdater<any>) =>
          props.setState(FormRunnerState.Updaters.form(Sum.Updaters.left(_)))
        }
        view={unit}
        foreignMutations={{
          apiHandlers: {
            onDefaultSuccess: (_: any) => {
              if (props.context.formRef.kind == "create")
                props.context.formRef.apiHandlers?.onDefaultSuccess?.(_);
            },
            onDefaultError: (_: any) => {
              if (props.context.formRef.kind == "create")
                props.context.formRef.apiHandlers?.onDefaultError?.(_);
            },
            onCreateSuccess: (_: any) => {
              if (props.context.formRef.kind === "create")
                props.context.formRef.apiHandlers?.onCreateSuccess?.(_);
            },
            onCreateError: (_: any) => {
              if (props.context.formRef.kind === "create")
                props.context.formRef.apiHandlers?.onCreateError?.(_);
            },
            onGetSuccess: (_: any) => {
              if (props.context.formRef.kind === "edit")
                props.context.formRef.apiHandlers?.onGetSuccess?.(_);
            },
            onGetError: (_: any) => {
              if (props.context.formRef.kind === "edit")
                props.context.formRef.apiHandlers?.onGetError?.(_);
            },
            onUpdateSuccess: (_: any) => {
              if (props.context.formRef.kind === "edit")
                props.context.formRef.apiHandlers?.onUpdateSuccess?.(_);
            },
            onUpdateError: (_: any) => {
              if (props.context.formRef.kind === "edit")
                props.context.formRef.apiHandlers?.onUpdateError?.(_);
            },
          },
        }}
      />
    </>
  );
}).any([FormRunnerLoader()]);
