import { List } from "immutable";
import { id, ParsedLauncher, replaceWith, Sum } from "../../../../../main";
import { AsyncState } from "../../../../async/state";
import { CoTypedFactory } from "../../../../coroutines/builder";
import {
  FormRunnerContext,
  FormRunnerForeignMutationsExpected,
  FormRunnerState,
} from "../state";

export const FormRunnerLoader = <T extends { [key in keyof T]: { type: any; state: any } }>() => {
  const Co = CoTypedFactory<FormRunnerContext<T>, FormRunnerState<T>>();

  return Co.Template<FormRunnerForeignMutationsExpected>(
    Co.GetState().then((current) =>
      !AsyncState.Operations.hasValue(current.formsConfig.sync)
        ? Co.Wait(0)
        : Co.UpdateState((_) => {
            if (!AsyncState.Operations.hasValue(current.formsConfig.sync))
              return id;
            if (current.formsConfig.sync.value.kind == "errors")
              return FormRunnerState<T>().Updaters.form(
                replaceWith(
                  Sum.Default.right<ParsedLauncher<T>, "not initialized">(
                    "not initialized",
                  ),
                ),
              );

            const formRef = current.formRef;
            if (formRef.kind == "create") {
              const createForm =
                current.formsConfig.sync.value.value.launchers.edit.get(
                  formRef.formName,
                );
              if (createForm == undefined)
                return FormRunnerState<T>().Updaters.form(
                  replaceWith(
                    Sum.Default.right<ParsedLauncher<T>, "not initialized">(
                      "not initialized",
                    ),
                  ),
                );

              return FormRunnerState<T>().Updaters.form(
                replaceWith(
                  Sum.Default.left<ParsedLauncher<T>, "not initialized">(
                    createForm,
                  ),
                ),
              );
            } else if (formRef.kind == "edit") {
              const editLauncher =
                current.formsConfig.sync.value.value.launchers.edit.get(
                  formRef.formName,
                );
              if (editLauncher == undefined)
                return FormRunnerState<T>().Updaters.form(
                  replaceWith(Sum.Default.right("not initialized")),
                );
              return FormRunnerState<T>().Updaters.form(
                replaceWith(
                  Sum.Default.left<ParsedLauncher<T>, "not initialized">(
                    editLauncher,
                  ),
                ),
              );
            } else {
              const passthroughLauncher =
                current.formsConfig.sync.value.value.launchers.passthrough.get(
                  formRef.formName,
                );
              if (passthroughLauncher == undefined)
                return FormRunnerState<T>().Updaters.form(
                  replaceWith(Sum.Default.right("not initialized")),
                );
              return FormRunnerState<T>().Updaters.form(
                replaceWith(
                  Sum.Default.left<ParsedLauncher<T>, "not initialized">(
                    passthroughLauncher,
                  ),
                ),
              );
            }

            // else {
            //   const form = current.formsConfig.sync.value.value.passthrough.get(
            //     formRef.formName,
            //   );
            //   if (form == undefined)
            //     return FormRunnerState.Updaters.form(
            //       replaceWith(
            //         Sum.Default.left(
            //           FormRunnerErrorsTemplate(
            //             Sum.Default.right(
            //               List([`Cannot find form '${formRef.formName}'`]),
            //             ),
            //           ),
            //         ),
            //       ),
            //     );
            //   const instantiatedForm = form();
            //   return FormRunnerState.Updaters.form(
            //     replaceWith(
            //       Sum.Default.left({
            //         form: instantiatedForm.form,
            //         formFieldStates:
            //           instantiatedForm.initialState.formFieldStates,
            //         commonFormState:
            //           instantiatedForm.initialState.commonFormState,
            //         customFormState:
            //           instantiatedForm.initialState.customFormState,
            //         entity: undefined,
            //         globalConfiguration: undefined,
            //       }),
            //     ),
            //   );
            // }

            return id;
          }),
    ),
    {
      interval: 15,
      runFilter: (props) =>
        AsyncState.Operations.hasValue(props.context.formsConfig.sync) &&
        props.context.form.kind == "r",
    },
  );
};
