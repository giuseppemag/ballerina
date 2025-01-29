import {
  ApiErrors,
  ApiResponseChecker,
  AsyncState,
  Debounce,
  Debounced,
  EditFormForeignMutationsExpected,
  EditFormState,
  HandleApiResponse,
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
      Co.SetState(
        EditFormState<E, FS>().Updaters.Core.customFormState.children.initApiChecker(ApiResponseChecker.Updaters().toUnchecked())
      ),
      Synchronize<Unit, E>(
        () => current.api.get(current.entityId),
        (_) => "transient failure",
        5,
        50
      ).embed((_) => _.entity, EditFormState<E, FS>().Updaters.Core.entity),
      HandleApiResponse<
      EditFormWritableState<E, FS>,
      EditFormContext<E, FS>,
      E
      >((_) => _.entity.sync , {
        handleSuccess: current.apiHandlers?.onGetSuccess,
        handleError: current.apiHandlers?.onGetError,
      }),
      Co.SetState(
        EditFormState<E, FS>().Updaters.Core.customFormState.children.initApiChecker(ApiResponseChecker.Updaters().toChecked())
      ),
    ])
  )

  const synchronize = Co.Repeat(
    Co.GetState().then((current) =>
      Co.Seq([
        Co.SetState(EditFormState<E, FS>().Updaters.Core.customFormState.children.updateApiChecker(ApiResponseChecker.Updaters().toUnchecked())),
        Debounce<Synchronized<Unit, ApiErrors>, EditFormWritableState<E, FS>>(
          (() => {
            if(current.entity.sync.kind != "loaded") {
                return Synchronize<Unit, ApiErrors, EditFormWritableState<E, FS>>(
                (_) => Promise.resolve([]),
                (_) => "transient failure",
                5,
                50
              )
            }
            const parsed = current.parser(current.entity.sync.value,  current)

            return Synchronize<Unit, ApiErrors, EditFormWritableState<E, FS>>(
              (_) => parsed.kind == "errors" ? Promise.reject(parsed.errors) : current.api.update(current.entityId, parsed),
              (_) => "transient failure",
              parsed.kind == "errors" ? 1 : 5,
              50
            )
          })(),

          15
        ).embed(
          (_) => ({ ..._, ..._.customFormState.apiRunner }),
          EditFormState<E, FS>().Updaters.Core.customFormState.children.apiRunner
        ),
        HandleApiResponse<
          EditFormWritableState<E, FS>,
          EditFormContext<E, FS>,
          ApiErrors
        >((_) => _.customFormState.apiRunner.sync, {
          handleSuccess: current.apiHandlers?.onUpdateSuccess,
          handleError: current.apiHandlers?.onUpdateError,
        }),
        Co.SetState(
          EditFormState<E, FS>().Updaters.Core.customFormState.children.updateApiChecker(ApiResponseChecker.Updaters().toChecked())
        ),
      ])
    )
  );

  return Co.Template<EditFormForeignMutationsExpected<E, FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.entity.sync) || !ApiResponseChecker.Operations.checked(props.context.customFormState.initApiChecker),
  }).any([
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(synchronize, {
      interval: 15,
      runFilter: (props) =>
        props.context.entity.sync.kind == "loaded" &&
        (Debounced.Operations.shouldCoroutineRun(props.context.customFormState.apiRunner) ||
        !ApiResponseChecker.Operations.checked(props.context.customFormState.updateApiChecker)),
    }),
  ]);
};
