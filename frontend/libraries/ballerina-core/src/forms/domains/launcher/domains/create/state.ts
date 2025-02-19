import { ApiErrors, ApiResponseChecker, AsyncState, BasicUpdater, CommonFormState, Debounced, FieldPredicateExpressions, ForeignMutationsInput, FormFieldPredicateEvaluation, id, ParsedType, PredicateValue, SimpleCallback, simpleUpdater, simpleUpdaterWithChildren, Sum, Synchronized, Template, unit, Unit, Updater, Value } from "../../../../../../main"
import { ValueOrErrors } from "../../../../../collections/domains/valueOrErrors/state";
import { Map } from "immutable";

export type CreateFormContext<E,FS> = {
  entityId:string,
  api:{
    default:() => Promise<E>,
    create: (raw: any) => Promise<ApiErrors>,
    getGlobalConfiguration: () => Promise<any>
  },
  formType: ParsedType<E>,
  types: Map<string, ParsedType<E>>,
  toApiParser: (entity:E, formstate: CreateFormState<E,FS>, checkKeys: boolean) => ValueOrErrors<E, ApiErrors>,
  fromApiParser: (raw: any) => any,
  parseGlobalConfiguration: (raw: any) => ValueOrErrors<PredicateValue, ApiErrors>,
  visibilityPredicateExpressions: FieldPredicateExpressions,
  disabledPredicatedExpressions: FieldPredicateExpressions,
  actualForm:Template<Value<E> & {formFieldStates:FS} & { commonFormState: CommonFormState } & { visibilities: FormFieldPredicateEvaluation | undefined } & { disabledFields: FormFieldPredicateEvaluation | undefined }, {formFieldStates: FS} & { commonFormState: CommonFormState }, { onChange:SimpleCallback<BasicUpdater<E>> }>
}

export type CreateFormState<E,FS> = {
  rawEntity: Synchronized<Unit, any>,
  entity: Synchronized<Unit, E>
  rawGlobalConfiguration: Synchronized<Unit, any>,
  globalConfiguration: Sum<any, "not parsed">
  formFieldStates: FS,
  commonFormState: CommonFormState,
  customFormState: {
    initApiChecker: ApiResponseChecker,
    configApiChecker: ApiResponseChecker,
    createApiChecker: ApiResponseChecker,
    predicateEvaluations: Debounced<ValueOrErrors<{
      visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
      disabledPredicateEvaluations: FormFieldPredicateEvaluation;
    }, string>>,
    apiRunner: Debounced<Synchronized<Unit, ApiErrors>>
  },
}

export const CreateFormState = <E,FS>() => ({
  Default:(formFieldStates:FS,
    commonFormState: CommonFormState,
    customFormState: {
      initApiChecker: ApiResponseChecker,
      configApiChecker: ApiResponseChecker,
      createApiChecker: ApiResponseChecker,
      predicateEvaluations: Debounced<ValueOrErrors<{
        visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
        disabledPredicateEvaluations: FormFieldPredicateEvaluation;
      }, string>>,
      shouldCalculatePredicates: boolean,
      apiRunner: Debounced<Synchronized<Unit, ApiErrors>>
  }) : CreateFormState<E,FS> => ({
    rawEntity: Synchronized.Default(unit),
    entity:Synchronized.Default(unit),
    rawGlobalConfiguration: Synchronized.Default(unit),
    globalConfiguration: Sum.Default.right("not parsed"),
    formFieldStates,
    commonFormState,
    customFormState,
  }),
  Updaters:{
    Core:{
      ...simpleUpdater<CreateFormState<E,FS>>()("rawEntity"),
      ...simpleUpdater<CreateFormState<E,FS>>()("entity"),
      ...simpleUpdater<CreateFormState<E,FS>>()("rawGlobalConfiguration"),
      ...simpleUpdater<CreateFormState<E,FS>>()("globalConfiguration"),
      ...simpleUpdater<CreateFormState<E,FS>>()("formFieldStates"),
      ...simpleUpdaterWithChildren<CreateFormState<E,FS>>()({
          ...simpleUpdater<CreateFormState<E,FS>["customFormState"]>()("initApiChecker"),
          ...simpleUpdater<CreateFormState<E,FS>["customFormState"]>()("configApiChecker"),
          ...simpleUpdater<CreateFormState<E,FS>["customFormState"]>()("createApiChecker"),
          ...simpleUpdater<CreateFormState<E,FS>["customFormState"]>()("apiRunner"),
          ...simpleUpdater<CreateFormState<E,FS>["customFormState"]>()("predicateEvaluations"),
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
          ),
      recalculatePredicates: () : Updater<CreateFormState<E,FS>> => 
        CreateFormState<E,FS>().Updaters.Core.customFormState.children.predicateEvaluations(
          Debounced.Updaters.Template.value(
            id
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
    onConfigSuccess?: (_: CreateFormWritableState<E, FS> & CreateFormContext<E, FS> | undefined) => void;
    onConfigError?: <ApiErrors>(_: ApiErrors | undefined) => void;
    onCreateSuccess?: (_: CreateFormWritableState<E, FS> & CreateFormContext<E, FS> | undefined) => void;
    onCreateError?: <ApiErrors>(_: ApiErrors | undefined) => void;
  }
 }
