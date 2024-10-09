import { ApiErrors, AsyncState, Debounce, Debounced, EditFormForeignMutationsExpected, EditFormState, Synchronize, Synchronized, Unit } from "../../../../../../../main"
import { CoTypedFactory } from "../../../../../../coroutines/builder"
import { EditFormContext, EditFormWritableState } from "../state"

export const editFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<EditFormContext<E, FS>, EditFormWritableState<E, FS>>()

  const init =
    Co.GetState().then(current =>
      Synchronize<Unit, Synchronized<E, ApiErrors>>(() => current.api.get().then(e =>
        Synchronized.Default<E, ApiErrors>(e)
      ), _ => "transient failure", 5, 50)
        .embed(_ => _.entity,
          _ => EditFormState<E, FS>().Updaters.Core.entity(Debounced.Updaters.Core.value(_)))
    )

  const synchronize =
    Co.Repeat(
      Co.GetState().then(current =>
        Debounce<Synchronized<Unit, Synchronized<E, ApiErrors>>, EditFormContext<E, FS>>(
          Synchronize<E, ApiErrors>(e => current.api.update(e), _ => "transient failure", 5, 50)
            .embed(
              _ => AsyncState.Operations.hasValue(_.sync) ? _.sync.value : undefined,
              _ => Synchronized.Updaters.sync<Unit, Synchronized<E, ApiErrors>>(AsyncState.Operations.map(_))
            ),
          15
        ).embed(
          _ => ({ ..._, ..._.entity }),
          _ => EditFormState<E, FS>().Updaters.Core.entity(_)
        )
      )
    )

  return Co.Template<EditFormForeignMutationsExpected<E, FS>>(
    init, {
    interval: 15,
    runFilter: props => !AsyncState.Operations.hasValue(props.context.entity.sync)
  }
  ).any([
    Co.Template<EditFormForeignMutationsExpected<E, FS>>(
      synchronize, {
      interval: 15,
      runFilter: props => Debounced.Operations.shouldCoroutineRun(props.context.entity)
    }
    )
  ])
}
