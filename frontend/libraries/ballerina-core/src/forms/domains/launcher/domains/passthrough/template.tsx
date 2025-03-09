import { unit } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import {
  PassthroughFormContext,
  PassthroughFormForeignMutationsExpected,
  PassthroughFormState,
  PassthroughFormWritableState,
} from "./state";
import { passthroughFormRunner } from "./coroutines/runner";
export type PassthroughFormView<T, FS> = Template<
  PassthroughFormContext<T, FS> & PassthroughFormWritableState<T, FS>,
  PassthroughFormWritableState<T, FS>,
  PassthroughFormForeignMutationsExpected<T, FS>,
  {
    actualForm: JSX.Element | undefined;
  }
>;
export type PassthroughFormTemplate<T, FS> = Template<
  PassthroughFormContext<T, FS> & PassthroughFormWritableState<T, FS>,
  PassthroughFormWritableState<T, FS>,
  PassthroughFormForeignMutationsExpected<T, FS>,
  PassthroughFormView<T, FS>
>;
export const PassthroughFormTemplate = <T, FS>(): PassthroughFormTemplate<
  T,
  FS
> =>
  Template.Default<
    PassthroughFormContext<T, FS> & PassthroughFormWritableState<T, FS>,
    PassthroughFormWritableState<T, FS>,
    PassthroughFormForeignMutationsExpected<T, FS>,
    PassthroughFormView<T, FS>
  >((props) => {
    if (
      props.context.entity.kind == "r" ||
      props.context.globalConfiguration.kind == "r"
    ) {
      return <></>;
    }
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
          ...props.foreignMutations,
          view: {
            ...props.view,
            actualForm: props.context.actualForm({
              context: {
                value: props.context.entity.value,
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
                onChange: (updater, path) => {
                  if (props.context.entity.kind == "r") return;
                  props.context.onEntityChange(updater, path);
                  props.setState(
                    PassthroughFormState<
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
  }).any([passthroughFormRunner<T, FS>()]);
