import {
  AsyncState,
  editFormRunner,
  replaceWith,
  SimpleCallback,
  unit,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import {
  EditFormContext,
  EditFormForeignMutationsExpected,
  EditFormState,
  EditFormWritableState,
} from "./state";

export type EditFormView<T, FS> = Template<
  EditFormContext<T, FS> & EditFormWritableState<T, FS>,
  EditFormWritableState<T, FS>,
  EditFormForeignMutationsExpected<T, FS> & { onSubmit: SimpleCallback<void> },
  {
    actualForm: JSX.Element | undefined;
  }
>;
export type EditFormTemplate<T, FS> = Template<
  EditFormContext<T, FS> & EditFormWritableState<T, FS>,
  EditFormWritableState<T, FS>,
  EditFormForeignMutationsExpected<T, FS>,
  EditFormView<T, FS>
>;
export const EditFormTemplate = <T, FS>(): EditFormTemplate<T, FS> =>
  Template.Default<
    EditFormContext<T, FS> & EditFormWritableState<T, FS>,
    EditFormWritableState<T, FS>,
    EditFormForeignMutationsExpected<T, FS>,
    EditFormView<T, FS>
  >((props) => {
    const visibilities =
      props.context.customFormState.predicateEvaluations.kind == "value" &&
      props.context.customFormState.predicateEvaluations.value
        .visiblityPredicateEvaluations.kind == "form"
        ? props.context.customFormState.predicateEvaluations.value
            .visiblityPredicateEvaluations
        : undefined;
    const disabledFields =
      props.context.customFormState.predicateEvaluations.kind == "value" &&
      props.context.customFormState.predicateEvaluations.value
        .disabledPredicateEvaluations.kind == "form"
        ? props.context.customFormState.predicateEvaluations.value
            .disabledPredicateEvaluations
        : undefined;
    return (
      <>
        {props.view({
          ...props,
          foreignMutations: {
            ...props.foreignMutations,
            onSubmit: () => {
              props.setState(EditFormState<T, FS>().Updaters.Template.submit());
            },
          },
          view: {
            ...props.view,
            actualForm:
              !AsyncState.Operations.hasValue(props.context.entity.sync) ||
              !AsyncState.Operations.hasValue(
                props.context.globalConfiguration.sync,
              )
                ? undefined
                : props.context.actualForm({
                    context: {
                      value: props.context.entity.sync.value,
                      formFieldStates: props.context.formFieldStates,
                      commonFormState: props.context.commonFormState,
                      visibilities,
                      disabledFields,
                    },
                    setState: (_) => {
                      props.setState((__) => ({
                        ...__,
                        formFieldStates: _(__).formFieldStates,
                        commonFormState: _(__).commonFormState,
                      }));
                    },
                    foreignMutations: {
                      onChange: (e) => {
                        props.setState(
                          EditFormState<T, FS>().Updaters.Template.entity(e),
                        );
                        props.setState(
                          EditFormState<
                            T,
                            FS
                          >().Updaters.Template.recalculatePredicates(),
                        );
                      },
                    },
                    view: unit,
                  }),
          },
        })}
      </>
    );
  }).any([
    editFormRunner<T, FS>().mapContextFromProps((props) => ({
      ...props.context,
      apiHandlers: {
        onGetSuccess: props.foreignMutations.apiHandlers?.onGetSuccess,
        onGetError: props.foreignMutations.apiHandlers?.onGetError,
        onUpdateSuccess: props.foreignMutations.apiHandlers?.onUpdateSuccess,
        onUpdateError: props.foreignMutations.apiHandlers?.onUpdateError,
      },
    })),
  ]);
