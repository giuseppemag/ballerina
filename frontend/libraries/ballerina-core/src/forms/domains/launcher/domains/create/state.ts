import { ApiErrors, ApiResponseChecker, AsyncState, BasicUpdater, Debounced, ForeignMutationsInput, FormRefApiHandlers, id, replaceWith, SimpleCallback, simpleUpdater, Synchronized, Template, unit, Unit, Updater, Value } from "../../../../../../main"
import { BasicFun } from "../../../../../fun/state"

export type CreateFormContext<E,FS> = {
  entityId:string,
  api:{
    default:() => Promise<E>,
    create:BasicFun<[E, FS], Promise<ApiErrors>>
  },
  actualForm:Template<Value<E> & FS, FS, { onChange:SimpleCallback<BasicUpdater<E>> }>
}

export type CreateFormState<E,FS> = {
  // first sync is GET (returns E), second is UPDATE (accepts E)
  entity:Debounced<Synchronized<Unit, Synchronized<E, ApiErrors>>>
  formState:FS,
} & ApiResponseChecker;

export const CreateFormState = <E,FS>() => ({
  Default:(initialFormState:FS) : CreateFormState<E,FS> => ({
    entity:Debounced.Default(
      Synchronized.Default(unit)
    ),
    formState:initialFormState,
    ...ApiResponseChecker.Default(true),
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<CreateFormState<E,FS>>()("entity"),
      ...simpleUpdater<CreateFormState<E,FS>>()("formState"),
    },
    Template:{
      ...ApiResponseChecker.Updaters<CreateFormState<E, FS>>(),
      entity:(_:BasicUpdater<E>) : Updater<CreateFormState<E,FS>> => 
        CreateFormState<E,FS>().Updaters.Core.entity(
          Debounced.Updaters.Core.value(
            Synchronized.Updaters.sync(
              AsyncState.Operations.map(
                Synchronized.Updaters.value(
                  _
                )
              )
            )
          )
        ),
        submit:() : Updater<CreateFormState<E,FS>> => 
          CreateFormState<E,FS>().Updaters.Core.entity(
            Debounced.Updaters.Template.value(
              Synchronized.Updaters.sync(
                AsyncState.Operations.map(
                  Synchronized.Updaters.value(
                    id
                  )
                )
              )
            )
          )
  
    }
  },
  ForeignMutations: (_: ForeignMutationsInput<CreateFormContext<E,FS>, CreateFormWritableState<E,FS>>) => ({

  })
})

export type CreateFormWritableState<E,FS> = CreateFormState<E,FS>
export type CreateFormForeignMutationsExposed<E,FS> = ReturnType<ReturnType<typeof CreateFormState<E,FS>>["ForeignMutations"]>
export type CreateFormForeignMutationsExpected<E,FS> = {
  apiHandlers?: {
    success?: (_: CreateFormWritableState<E, FS> & CreateFormContext<E, FS> | undefined) => void;
    error?: <ApiErrors>(_: ApiErrors | undefined) => void;
  }
 }
