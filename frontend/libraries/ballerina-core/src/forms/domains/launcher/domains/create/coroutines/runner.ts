import { ApiErrors, AsyncState, Debounce, Debounced, CreateFormForeignMutationsExpected, CreateFormState, Synchronize, Synchronized, Unit, HandleApiResponse, ApiResponseChecker } from "../../../../../../../main"
import { CoTypedFactory } from "../../../../../../coroutines/builder"
import { CreateFormContext, CreateFormWritableState } from "../state"

export const createFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<
    CreateFormContext<E, FS> & CreateFormForeignMutationsExpected<E, FS>,
    CreateFormWritableState<E, FS>
  >()

  const init =
    Co.GetState().then(current =>
      Synchronize<Unit, Synchronized<E, ApiErrors>>(() => current.api.default().then(e =>
        Synchronized.Default<E, ApiErrors>(e)
      ), _ => "transient failure", 5, 50)
        .embed(_ => _.entity,
          _ => CreateFormState<E, FS>().Updaters.Core.entity(Debounced.Updaters.Core.value(_)))
    )

  const synchronize =
    Co.Repeat(
      Co.GetState().then(current =>
      Co.Seq([
        Co.SetState(
          CreateFormState<E, FS>().Updaters.Template.toUnchecked()
        ),
        Debounce<Synchronized<Unit, Synchronized<E, ApiErrors>>, CreateFormContext<E, FS>>(
          Synchronize<E, ApiErrors>(e => current.api.create([e, current.formState]), _ => "transient failure", 5, 50)
            .embed(
              _ => AsyncState.Operations.hasValue(_.sync) ? _.sync.value : undefined,
              _ => Synchronized.Updaters.sync<Unit, Synchronized<E, ApiErrors>>(AsyncState.Operations.map(_))
            ),
          15
        ).embed(
          _ => ({ ..._, ..._.entity }),
          _ => CreateFormState<E, FS>().Updaters.Core.entity(_)
        ),
        HandleApiResponse<
          CreateFormWritableState<E, FS>,
          CreateFormContext<E, FS>,
          unknown // could be Synchronized<E, ApiErrors> or ApiErrors
        >((_) => AsyncState.Operations.hasValue(_.entity.sync) ? _.entity.sync.value.sync : _.entity.sync, {
          handleSuccess: current.apiHandlers?.success,
          handleError: current.apiHandlers?.error,
        }),
      ]
      ),
    ))

  return Co.Template<CreateFormForeignMutationsExpected<E, FS>>(
    init, {
    interval: 15,
    runFilter: props => !AsyncState.Operations.hasValue(props.context.entity.sync)
  }
  ).any([
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(
      synchronize, {
      interval: 15,
      runFilter: props =>
        props.context.entity.sync.kind === "loaded" &&
        (Debounced.Operations.shouldCoroutineRun(props.context.entity) ||
        !ApiResponseChecker.Operations.checked(props.context))
    }
    )
  ])
}
