import { ApiResponseChecker, AsyncState, BasicUpdater, Debounced, ForeignMutationsInput, Guid, id, SimpleCallback, simpleUpdater, Synchronized, Template, unit, Unit, Updater, Value } from "../../../../../../main"
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state"
import { BasicFun } from "../../../../../fun/state"

export type ApiErrors = Array<string>

export type EditFormContext<E,FS> = {
  entityId:string,
  api:{
    get:(id: Guid) => Promise<E>,
    update:(id: Guid, raw: any) => Promise<ApiErrors>
  },
  parser: (entity:E, formstate: FS) => ValueOrErrors<E, ApiErrors>
  actualForm:Template<Value<E> & FS, FS, { onChange:SimpleCallback<BasicUpdater<E>>}>
}

export type EditFormState<E,FS> = {
  // first sync is GET (returns E), second is UPDATE (accepts E)
  entity:Synchronized<Unit, E>
  apiRunner:Debounced<Synchronized<Unit,ApiErrors>>
  formState:FS,
  initApiChecker: ApiResponseChecker,
  updateApiChecker: ApiResponseChecker,
};

export const EditFormState = <E,FS>() => ({
  Default:(initialFormState:FS) : EditFormState<E,FS> => ({
    entity:Synchronized.Default(unit),
    apiRunner:Debounced.Default(
      Synchronized.Default(unit)
    ),
    formState:initialFormState,
    initApiChecker:ApiResponseChecker.Default(true),
    updateApiChecker:ApiResponseChecker.Default(true),
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<EditFormState<E,FS>>()("entity"),
      ...simpleUpdater<EditFormState<E,FS>>()("apiRunner"),
      ...simpleUpdater<EditFormState<E,FS>>()("formState"),
      ...simpleUpdater<EditFormState<E,FS>>()("initApiChecker"),
      ...simpleUpdater<EditFormState<E,FS>>()("updateApiChecker"),
    },
    Template:{
      entity:(_:BasicUpdater<E>) : Updater<EditFormState<E,FS>> =>
          EditFormState<E,FS>().Updaters.Core.entity(
            Synchronized.Updaters.sync(
              AsyncState.Operations.map(
                  _
              )
            )
          ),
      submit: () : Updater<EditFormState<E,FS>> =>
        EditFormState<E,FS>().Updaters.Core.apiRunner(
          Debounced.Updaters.Template.value(
            Synchronized.Updaters.sync(
              AsyncState.Operations.map(
                  id
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
    onGetSuccess?: (_: EditFormWritableState<E, FS> & EditFormContext<E, FS> | undefined) => void;
    onGetError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onUpdateSuccess?: (_: EditFormWritableState<E, FS> & EditFormContext<E, FS> | undefined) => void;
    onUpdateError?: <ApiErrors>(_: ApiErrors | undefined) => void;
  }
}
