import { ApiErrors, ApiResponseChecker, AsyncState, BasicUpdater, CommonFormState, Debounced, ForeignMutationsInput, id, SimpleCallback, simpleUpdater, simpleUpdaterWithChildren, Synchronized, Template, unit, Unit, Updater, Value } from "../../../../../../main"
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state"
import { BasicFun } from "../../../../../fun/state"

export type CreateFormContext<E,FS> = {
  entityId:string,
  api:{
    default:() => Promise<E>,
    create: (raw: any) => Promise<ApiErrors>
  },
  parser: (entity:E, formstate: CreateFormState<E,FS>) => ValueOrErrors<E, ApiErrors>,
  actualForm:Template<Value<E> & {formFieldStates:FS} & { commonFormState: CommonFormState }, {formFieldStates: FS} & { commonFormState: CommonFormState }, { onChange:SimpleCallback<BasicUpdater<E>> }>
}

export type CreateFormState<E,FS> = {
  entity: Synchronized<Unit, E>
  formFieldStates: FS,
  commonFormState: CommonFormState,
  customFormState: {
    initApiChecker: ApiResponseChecker,
    createApiChecker: ApiResponseChecker,
    apiRunner: Debounced<Synchronized<Unit, ApiErrors>>
  }
}

export const CreateFormState = <E,FS>() => ({
  Default:(formFieldStates:FS,
    commonFormState: CommonFormState,
    customFormState: {
      initApiChecker: ApiResponseChecker,
      createApiChecker: ApiResponseChecker,
      apiRunner: Debounced<Synchronized<Unit, ApiErrors>>
  }) : CreateFormState<E,FS> => ({
    entity:Synchronized.Default(unit),
    formFieldStates,
    commonFormState,
    customFormState
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<CreateFormState<E,FS>>()("entity"),
      ...simpleUpdater<CreateFormState<E,FS>>()("formFieldStates"),
      ...simpleUpdaterWithChildren<CreateFormState<E,FS>>()({
          ...simpleUpdater<CreateFormState<E,FS>["customFormState"]>()("initApiChecker"),
          ...simpleUpdater<CreateFormState<E,FS>["customFormState"]>()("createApiChecker"),
          ...simpleUpdater<CreateFormState<E,FS>["customFormState"]>()("apiRunner"),
      })("customFormState"),
      ...simpleUpdater<CreateFormState<E,FS>>()("commonFormState"),
    },
    Template:{
      entity:(_:BasicUpdater<E>) : Updater<CreateFormState<E,FS>> => 
        CreateFormState<E,FS>().Updaters.Core.entity(
            Synchronized.Updaters.sync(
              AsyncState.Operations.map(
                  _
              )
            )
        ),
        submit:() : Updater<CreateFormState<E,FS>> => 
          CreateFormState<E,FS>().Updaters.Core.customFormState.children.apiRunner(
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
  ForeignMutations: (_: ForeignMutationsInput<CreateFormContext<E,FS>, CreateFormWritableState<E,FS>>) => ({

  })
})

export type CreateFormWritableState<E,FS> = CreateFormState<E,FS>
export type CreateFormForeignMutationsExposed<E,FS> = ReturnType<ReturnType<typeof CreateFormState<E,FS>>["ForeignMutations"]>
export type CreateFormForeignMutationsExpected<E,FS> = {
  apiHandlers?: {
    onDefaultSuccess?: (_: CreateFormWritableState<E, FS> & CreateFormContext<E, FS> | undefined) => void;
    onDefaultError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onCreateSuccess?: (_: CreateFormWritableState<E, FS> & CreateFormContext<E, FS> | undefined) => void;
    onCreateError?: <ApiErrors>(_: ApiErrors | undefined) => void;
  }
 }
