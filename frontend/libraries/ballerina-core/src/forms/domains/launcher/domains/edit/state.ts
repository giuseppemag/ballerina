import { AsyncState, BasicUpdater, Debounced, ForeignMutationsInput, SimpleCallback, simpleUpdater, Synchronized, Template, unit, Unit, Updater, Value } from "../../../../../../main"
import { BasicFun } from "../../../../../fun/state"

export type ApiErrors = Array<string>

export type EditFormContext<E,FS> = {
  entityId:string,
  api:{
    get:() => Promise<E>,
    update:BasicFun<E, Promise<ApiErrors>>
  },
  actualForm:Template<Value<E> & FS, FS, { onChange:SimpleCallback<BasicUpdater<E>> }>
}

export type EditFormState<E,FS> = {
  // first sync is GET (returns E), second is UPDATE (accepts E)
  entity:Debounced<Synchronized<Unit, Synchronized<E, ApiErrors>>>
  formState:FS,
}

export const EditFormState = <E,FS>() => ({
  Default:(initialFormState:FS) : EditFormState<E,FS> => ({
    entity:Debounced.Default(
      Synchronized.Default(unit)
    ),
    formState:initialFormState,
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<EditFormState<E,FS>>()("entity"),
      ...simpleUpdater<EditFormState<E,FS>>()("formState"),
    },
    Template:{
      entity:(_:BasicUpdater<E>) : Updater<EditFormState<E,FS>> => 
        EditFormState<E,FS>().Updaters.Core.entity(
          Debounced.Updaters.Template.value(
            Synchronized.Updaters.sync(
              AsyncState.Operations.map(
                Synchronized.Updaters.value(
                  _
                )
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
export type EditFormForeignMutationsExpected<E,FS> = Unit
