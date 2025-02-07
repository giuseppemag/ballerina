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

  const init = Co.GetState().then((current) =>
    Co.Seq([
      Co.SetState(
        CreateFormState<
          E,
          FS
        >().Updaters.Core.customFormState.children.initApiChecker(ApiResponseChecker.Updaters().toUnchecked())
      ),
      Synchronize<Unit, E>(
        () => current.api.default(),
        (_) => "transient failure",
        5,
        50
      ).embed((_) => _.entity, CreateFormState<E, FS>().Updaters.Core.entity),
      HandleApiResponse<
        CreateFormWritableState<E, FS>,
        CreateFormContext<E, FS>,
        E
      >((_) => _.entity.sync, {
        handleSuccess: current.apiHandlers?.onDefaultSuccess,
        handleError: current.apiHandlers?.onDefaultError,
      }),
      Co.SetState(
        CreateFormState<E, FS>().Updaters.Core.customFormState.children.initApiChecker(ApiResponseChecker.Updaters().toChecked())
      ),
    ])
  );

  const synchronize = Co.Repeat(
    Co.GetState().then((current) =>
      Co.Seq([
        Co.SetState(CreateFormState<E, FS>().Updaters.Core.customFormState.children.createApiChecker(ApiResponseChecker.Updaters().toUnchecked())
        ),
        Debounce<Synchronized<Unit, ApiErrors>, CreateFormWritableState<E, FS>>(
          (() => {
            if (current.entity.sync.kind != "loaded") {
              return Synchronize<Unit, ApiErrors, CreateFormWritableState<E, FS>>(
                (_) => Promise.resolve([]),
                (_) => "transient failure",
                5,
                50
              )
            }
            const parsed = current.parser(current.entity.sync.value, current)

            return Synchronize<Unit, ApiErrors, CreateFormWritableState<E, FS>>(
              (_) => parsed.kind == "errors" ? Promise.reject(parsed.errors) : current.api.create(parsed),
              (_) => "transient failure",
              parsed.kind == "errors" ? 1 : 5,
              50
            );
          })(),
          15
        ).embed(
          (_) => ({ ..._, ..._.customFormState.apiRunner }),
          CreateFormState<E, FS>().Updaters.Core.customFormState.children.apiRunner
        ),
        HandleApiResponse<
          CreateFormWritableState<E, FS>,
          CreateFormContext<E, FS>,
          ApiErrors
        >((_) => _.customFormState.apiRunner.sync, {
            handleSuccess: current.apiHandlers?.onCreateSuccess,
            handleError: current.apiHandlers?.onCreateError,
          }
        ),
        Co.SetState(CreateFormState<E, FS>().Updaters.Core.customFormState.children.createApiChecker(ApiResponseChecker.Updaters().toChecked())
        ),
      ])
    )
  );

  return Co.Template<CreateFormForeignMutationsExpected<E, FS>>(init, {
    interval: 15,
    runFilter: (props) =>
      !AsyncState.Operations.hasValue(props.context.entity.sync) || !ApiResponseChecker.Operations.checked(props.context.customFormState.initApiChecker),
  }).any([
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(synchronize, {
      interval: 15,
      runFilter: (props) =>
         props.context.entity.sync.kind === "loaded" &&
        (Debounced.Operations.shouldCoroutineRun(props.context.customFormState.apiRunner) ||
        !ApiResponseChecker.Operations.checked(props.context.customFormState.createApiChecker))
    }),
  ]);
};
