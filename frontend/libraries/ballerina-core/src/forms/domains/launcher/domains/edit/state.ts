import { ApiResponseChecker, AsyncState, BasicUpdater, CommonFormState, Debounced, ForeignMutationsInput, Guid, id, SimpleCallback, simpleUpdater, simpleUpdaterWithChildren, Sum, Synchronized, Template, unit, Unit, Updater, Value } from "../../../../../../main"
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state"
import { BasicFun } from "../../../../../fun/state"

export type ApiErrors = Array<string>

export type EditFormContext<E,FS> = {
  entityId:string,
  api:{
    get:(id: Guid) => Promise<E>,
    update:(id: Guid, raw: any) => Promise<ApiErrors>
  },
  parser: (entity:E, formstate: EditFormState<E,FS>) => ValueOrErrors<E, ApiErrors>
  actualForm:Template<Value<E> & {formFieldStates:FS} & { commonFormState: CommonFormState }, {formFieldStates: FS} & { commonFormState: CommonFormState }, { onChange:SimpleCallback<BasicUpdater<E>> }>
}

export type EditFormState<E,FS> = {
  entity: Synchronized<Unit, E>
  formFieldStates: FS,
  commonFormState: CommonFormState,
  customFormState: {
    initApiChecker: ApiResponseChecker,
    updateApiChecker: ApiResponseChecker,
    apiRunner: Debounced<Synchronized<Unit, ApiErrors>>
  }
}

export const EditFormState = <E,FS>() => ({
  Default:(formFieldStates:FS,
    commonFormState: CommonFormState,
    customFormState: {
      initApiChecker: ApiResponseChecker,
      updateApiChecker: ApiResponseChecker,
      apiRunner: Debounced<Synchronized<Unit, ApiErrors>>
    }
  ) : EditFormState<E,FS> => ({
    entity:Synchronized.Default(unit),
    formFieldStates,
    commonFormState,
    customFormState
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<EditFormState<E,FS>>()("entity"),
      ...simpleUpdater<EditFormState<E,FS>>()("formFieldStates"),
      ...simpleUpdaterWithChildren<EditFormState<E,FS>>()({
          ...simpleUpdater<EditFormState<E,FS>["customFormState"]>()("initApiChecker"),
          ...simpleUpdater<EditFormState<E,FS>["customFormState"]>()("updateApiChecker"),
          ...simpleUpdater<EditFormState<E,FS>["customFormState"]>()("apiRunner"),
      })("customFormState"),
      ...simpleUpdater<EditFormState<E,FS>>()("commonFormState"),
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
        EditFormState<E,FS>().Updaters.Core.customFormState.children.apiRunner(
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
