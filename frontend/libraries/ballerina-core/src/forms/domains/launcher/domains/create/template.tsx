import {
  AsyncState,
  createFormRunner,
  replaceWith,
  SimpleCallback,
  unit,
} from "../../../../../../main";
import { Template, View } from "../../../../../template/state";
import {
  CreateFormContext,
  CreateFormForeignMutationsExpected,
  CreateFormState,
  CreateFormWritableState,
} from "./state";

export type CreateFormView<T, FS> = Template<
  CreateFormContext<T, FS> & CreateFormWritableState<T, FS>,
  CreateFormWritableState<T, FS>,
  CreateFormForeignMutationsExpected<T, FS> & {
    onSubmit: SimpleCallback<void>;
  },
  {
    actualForm: JSX.Element | undefined;
  }
>;
export type CreateFormTemplate<T, FS> = Template<
  CreateFormContext<T, FS> & CreateFormWritableState<T, FS>,
  CreateFormWritableState<T, FS>,
  CreateFormForeignMutationsExpected<T, FS>,
  CreateFormView<T, FS>
>;
export const CreateFormTemplate = <T, FS>(): CreateFormTemplate<T, FS> =>
  Template.Default<
    CreateFormContext<T, FS> & CreateFormWritableState<T, FS>,
    CreateFormWritableState<T, FS>,
    CreateFormForeignMutationsExpected<T, FS>,
    CreateFormView<T, FS>
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
              props.setState(
                CreateFormState<T, FS>().Updaters.Template.submit(),
              );
            },
          },
          view: {
            ...props.view,
            actualForm: !AsyncState.Operations.hasValue(
              props.context.entity.sync,
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
                        CreateFormState<T, FS>().Updaters.Template.entity(e),
                      );
                      props.setState(
                        CreateFormState<
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
    createFormRunner<T, FS>().mapContextFromProps((props) => ({
      ...props.context,
      apiHandlers: {
        onDefaultSuccess: props.foreignMutations.apiHandlers?.onDefaultSuccess,
        onDefaultError: props.foreignMutations.apiHandlers?.onDefaultError,
        onCreateSuccess: props.foreignMutations.apiHandlers?.onCreateSuccess,
        onCreateError: props.foreignMutations.apiHandlers?.onCreateError,
      },
    })),
  ]);
