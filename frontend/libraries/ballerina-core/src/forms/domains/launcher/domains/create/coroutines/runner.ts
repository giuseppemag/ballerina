import {
  ApiErrors,
  AsyncState,
  Debounce,
  Debounced,
  CreateFormForeignMutationsExpected,
  CreateFormState,
  Synchronize,
  Synchronized,
  Unit,
  SimpleCallback,
  unit,
  replaceWith,
  HandleApiResponse,
  ApiResponseChecker,
} from "../../../../../../../main";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { CreateFormContext, CreateFormWritableState } from "../state";

export const createFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<
    CreateFormContext<E, FS> & CreateFormForeignMutationsExpected<E, FS>,
    CreateFormWritableState<E, FS>
  >();

  const init = Co.Seq([
    Co.GetState().then((current) =>
      Synchronize<Unit, Synchronized<E, ApiErrors>>(
        () =>
          current.api
            .default()
            .then((e) => Synchronized.Default<E, ApiErrors>(e)),
        (_) => "transient failure",
        5,
        50
      ).embed(
        (_) => _.entity,
        (_) =>
          CreateFormState<E, FS>().Updaters.Core.entity(
            Debounced.Updaters.Core.value(_)
          )
      )
    ),
    Co.GetState().then((current) =>
      HandleApiResponse<
        CreateFormWritableState<E, FS>,
        CreateFormContext<E, FS>,
        Synchronized<E, ApiErrors>
      >((_) => _.entity.sync, {
        handleSuccess: current.apiHandlers?.success,
        handleError: current.apiHandlers?.error,
      })
    ),
  ]);

  const synchronize = Co.Repeat(
    Co.Seq([
      Co.SetState(CreateFormState<E, FS>().Updaters.Template.toUnchecked()),
      Co.GetState().then((current) =>
        Debounce<
          Synchronized<Unit, Synchronized<E, ApiErrors>>,
          CreateFormContext<E, FS>
        >(
          Synchronize<E, ApiErrors>(
            (e) => current.api.create(e),
            (_) => "transient failure",
            5,
            50
          ).embed(
            (_) =>
              AsyncState.Operations.hasValue(_.sync) ? _.sync.value : undefined,
            (_) =>
              Synchronized.Updaters.sync<Unit, Synchronized<E, ApiErrors>>(
                AsyncState.Operations.map(_)
              )
          ),
          15
        ).embed(
          (_) => ({ ..._, ..._.entity }),
          (_) => CreateFormState<E, FS>().Updaters.Core.entity(_)
        )
      ),
      Co.GetState().then((current) =>
        HandleApiResponse<
          CreateFormWritableState<E, FS>,
          CreateFormContext<E, FS>,
          ApiErrors
        >(
          (_) =>
            AsyncState.Operations.hasValue(_.entity.sync)
              ? _.entity.sync.value.sync
              : AsyncState.Default.error({}),
          {
            handleSuccess: current.apiHandlers?.success,
            handleError: current.apiHandlers?.error,
          }
        )
      ),
      Co.GetState().then((current) =>
        AsyncState.Operations.hasValue(current.entity.sync) &&
        AsyncState.Operations.hasValue(current.entity.sync.value.sync) &&
        current.notifySubmitAfterSync
          ? Co.Seq([
              Co.Do(() => {
                if (
                  AsyncState.Operations.hasValue(current.entity.sync) &&
                  AsyncState.Operations.hasValue(current.entity.sync.value.sync)
                )
                  current.onSubmitted(current.entity.sync.value);
              }),
              Co.SetState(
                CreateFormState<E, FS>().Updaters.Core.notifySubmitAfterSync(
                  replaceWith(false)
                )
              ),
            ])
          : Co.Return(unit)
      ),
    ])
  );

  return Co.Template<CreateFormForeignMutationsExpected<E, FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.entity.sync) ||
      !ApiResponseChecker.Operations.checked(props.context),
  }).any([
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(synchronize, {
      interval: 15,
      runFilter: (props) =>
        Debounced.Operations.shouldCoroutineRun(props.context.entity) ||
        !ApiResponseChecker.Operations.checked(props.context) ||
        props.context.notifySubmitAfterSync,
    }),
  ]);
};
