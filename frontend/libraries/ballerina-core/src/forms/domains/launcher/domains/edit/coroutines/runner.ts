import {
  ApiErrors,
  ApiResponseChecker,
  AsyncState,
  Debounce,
  Debounced,
  EditFormForeignMutationsExpected,
  EditFormState,
  HandleApiResponse,
  replaceWith,
  Synchronize,
  Synchronized,
  Unit,
} from "../../../../../../../main";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { EditFormContext, EditFormWritableState } from "../state";

export const editFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<
    EditFormContext<E, FS> & EditFormForeignMutationsExpected<E, FS>,
    EditFormWritableState<E, FS>
  >();

  const init = Co.GetState().then((current) =>
    Co.Seq([
      Co.SetState(EditFormState<E, FS>().Updaters.Template.toUnchecked()),
      Synchronize<Unit, E>(
        () => current.api.get(),
        (_) => "transient failure",
        5,
        50
      ).embed((_) => _.entity, EditFormState<E, FS>().Updaters.Core.entity),
      HandleApiResponse<
        EditFormWritableState<E, FS>,
        EditFormContext<E, FS>,
        ApiErrors
      >((_) => _.apiRunner.sync, {
        handleSuccess: current.apiHandlers?.success,
        handleError: current.apiHandlers?.error,
      }),
    ])
  );

  const synchronize = Co.Repeat(
    Co.GetState().then((current) =>
      Co.Seq([
        Co.SetState(EditFormState<E, FS>().Updaters.Template.toUnchecked()),
        Debounce<Synchronized<Unit, ApiErrors>, EditFormWritableState<E, FS>>(
          Synchronize<Unit, ApiErrors, EditFormWritableState<E, FS>>(
            (_) =>
              current.entity.sync.kind == "loaded"
                ? current.api.update(current.entity.sync.value)
                : Promise.resolve([]),
            (_) => "transient failure",
            5,
            50
          ),
          current.debounceRateMs ?? 15
        ).embed(
          (_) => ({ ..._, ..._.apiRunner }),
          EditFormState<E, FS>().Updaters.Core.apiRunner
        ),
        HandleApiResponse<
          EditFormWritableState<E, FS>,
          EditFormContext<E, FS>,
          ApiErrors
        >((_) => _.apiRunner.sync, {
          handleSuccess: current.apiHandlers?.success,
          handleError: current.apiHandlers?.error,
        }),
      ])
    )
  );

  return Co.Template<EditFormForeignMutationsExpected<E, FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.entity.sync) ||
      !ApiResponseChecker.Operations.checked(props.context),
  }).any([
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(synchronize, {
      interval: 100,
      runFilter: (props) =>
        Debounced.Operations.shouldCoroutineRun(props.context.apiRunner) ||
        !ApiResponseChecker.Operations.checked(props.context),
    }),
  ]);
};
