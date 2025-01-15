import { ApiErrors, AsyncState, Debounce, Debounced, CreateFormForeignMutationsExpected, CreateFormState, Synchronize, Synchronized, Unit, SimpleCallback, unit, replaceWith, FormRefApiHandlers } from "../../../../../../../main"
import { CoTypedFactory } from "../../../../../../coroutines/builder"
import { CreateFormContext, CreateFormWritableState } from "../state"

export const createFormRunner = <E, FS>() => {
  const Co = CoTypedFactory<CreateFormContext<E, FS> & {apiHandlers: FormRefApiHandlers<E>}, CreateFormWritableState<E, FS>>()

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
      Co.Seq([
      Co.GetState().then(current =>
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
        )
      ),
      Co.GetState().then(current => {
        if (!AsyncState.Operations.hasValue(current.entity.sync) || !current.handleResponseAfterSync) {
          return Co.Return(unit)
        }

        if (AsyncState.Operations.hasValue(current.entity.sync.value.sync)) {
          return Co.Seq([
            Co.Do(() => {
              if (AsyncState.Operations.hasValue(current.entity.sync) && AsyncState.Operations.hasValue(current.entity.sync.value.sync))
                current.apiHandlers.success?.(current.entity.sync.value)
            }),
            Co.SetState(CreateFormState<E,FS>().Updaters.Core.handleResponseAfterSync(replaceWith(false)))
          ])
        }

        if (current.entity.sync.value.sync.kind === "error") {
          return Co.Seq([
            Co.Do(() => {
              if (AsyncState.Operations.hasValue(current.entity.sync) && current.entity.sync.value.sync.kind === "error") 
              current.apiHandlers.error?.(current.entity.sync.value.sync.error);
            }),
            Co.SetState(CreateFormState<E,FS>().Updaters.Core.handleResponseAfterSync(replaceWith(false)))
          ])
        }

        return Co.Return(unit)
      }
      )
    ])
    )

  return Co.Template<CreateFormForeignMutationsExpected<E, FS>>(
    init, {
    interval: 15,
    runFilter: props => !AsyncState.Operations.hasValue(props.context.entity.sync)
  }
  ).any([
    Co.Template<CreateFormForeignMutationsExpected<E, FS>>(
      synchronize, {
      interval: 15,
      runFilter: props => Debounced.Operations.shouldCoroutineRun(props.context.entity) || props.context.handleResponseAfterSync
    }
    )
  ])
}
