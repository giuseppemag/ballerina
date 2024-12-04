import { ApiResponseChecker, AsyncState, BasicUpdater, Debounced, ForeignMutationsInput, id, SimpleCallback, simpleUpdater, Synchronized, Template, unit, Unit, Updater, Value } from "../../../../../../main"
import { BasicFun } from "../../../../../fun/state"

export type ApiErrors = Array<string>

export type EditFormContext<E,FS> = {
  entityId:string,
  api:{
    get:() => Promise<E>,
    update:BasicFun<E, Promise<ApiErrors>>
  },
  actualForm:Template<Value<E> & FS, FS, { onChange:SimpleCallback<BasicUpdater<E>> }>
  debounceRateMs?: number
}

export type EditFormState<E,FS> = {
  // first sync is GET (returns E), second is UPDATE (accepts E)
  entity:Synchronized<Unit, E>
  apiRunner:Debounced<Synchronized<Unit,ApiErrors>>
  formState:FS,
} & ApiResponseChecker;

export const EditFormState = <E,FS>() => ({
  Default:(initialFormState:FS) : EditFormState<E,FS> => ({
    entity:Synchronized.Default(unit),
    apiRunner:Debounced.Default(
      Synchronized.Default(unit)
    ),
    formState:initialFormState,
    ...ApiResponseChecker.Default(false),
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<EditFormState<E,FS>>()("entity"),
      ...simpleUpdater<EditFormState<E,FS>>()("apiRunner"),
      ...simpleUpdater<EditFormState<E,FS>>()("formState"),
    },
    Template:{
      ...ApiResponseChecker.Updaters<EditFormState<E, FS>>(),
      entity:(_:BasicUpdater<E>) : Updater<EditFormState<E,FS>> => 
        EditFormState<E,FS>().Updaters.Core.apiRunner(
          Debounced.Updaters.Template.value(
            Synchronized.Updaters.sync(
              AsyncState.Operations.map(
                  id
              )
            )
          )
        ).then(
          EditFormState<E,FS>().Updaters.Core.entity(
            Synchronized.Updaters.sync(
              AsyncState.Operations.map(
                  _
              )
            )
          )
        )
    }
  },
  ForeignMutations: (_: ForeignMutationsInput<EditFormContext<E,FS>, EditFormWritableState<E,FS>>) => ({

  })
})

export type EditFormWritableState<E,FS> = EditFormState<E,FS>
export type EditFormForeignMutationsExposed<E,FS> = ReturnType<ReturnType<typeof EditFormState<E,FS>>["ForeignMutations"]>
export type EditFormForeignMutationsExpected<E,FS> = {
  apiHandlers?: {
    success?: (_: EditFormWritableState<E, FS> & EditFormContext<E, FS> | undefined) => void;
    error?: <ApiErrors>(_: ApiErrors | undefined) => void;
  }
}
