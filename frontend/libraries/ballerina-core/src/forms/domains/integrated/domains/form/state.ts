import {
  ParsedType,
  Template,
  Value,
  ValueOrErrors,
  PredicateValue,
  FieldPredicateExpressions,
  CommonFormState,
  FormFieldPredicateEvaluation,
  SimpleCallback,
  BasicUpdater,
  AsyncState,
  simpleUpdater,
  Debounced,
  Synchronized,
  unit,
  Sum,
  CreateFormState,
  simpleUpdaterWithChildren,
  Updater,
  id,
  ForeignMutationsInput,
  Unit,
} from "../../../../../../main";

export type IntegratedFormContext<E, FS> = {
  formType: ParsedType<E>;
  types: Map<string, ParsedType<E>>;
  // Still needed for the predicates
  toApiParser: (
    entity: E,
    formstate: FS,
    checkKeys: boolean
  ) => ValueOrErrors<E, string>;
  fromApiParser: (raw: any) => any;
  parseGlobalConfiguration: (raw: any) => ValueOrErrors<PredicateValue, string>;
  visibilityPredicateExpressions: FieldPredicateExpressions;
  disabledPredicatedExpressions: FieldPredicateExpressions;
  actualForm: Template<
    Value<E> & { formFieldStates: FS } & {
      commonFormState: CommonFormState;
    } & { visibilities: FormFieldPredicateEvaluation | undefined } & {
      disabledFields: FormFieldPredicateEvaluation | undefined;
    },
    { formFieldStates: FS } & { commonFormState: CommonFormState },
    { onChange: SimpleCallback<BasicUpdater<E>> }
  >;
};

export type IntegratedFormState<E,FS> = {
  rawEntity: Synchronized<Unit, any>,
  entity: Synchronized<Unit, E>,
  rawGlobalConfiguration: Synchronized<Unit, any>,
  globalConfiguration: Sum<any, "not parsed">,
  formFieldStates: FS,
  commonFormState: CommonFormState,
  customFormState: {
    predicateEvaluations: Debounced<ValueOrErrors<{
      visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
      disabledPredicateEvaluations: FormFieldPredicateEvaluation;
    }, string>>,
  }
}

export const IntegratedFormState = <E,FS>() => ({
    Default:(formFieldStates:FS,
      commonFormState: CommonFormState,
      customFormState: {
        predicateEvaluations: Debounced<ValueOrErrors<{
          visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
          disabledPredicateEvaluations: FormFieldPredicateEvaluation;
        }, string>>,
    }) : IntegratedFormState<E,FS> => ({
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
        recalculatePredicates: () : Updater<CreateFormState<E,FS>> => 
          CreateFormState<E,FS>().Updaters.Core.customFormState.children.predicateEvaluations(
            Debounced.Updaters.Template.value(
              id
            )
          )
      }
    },
    ForeignMutations: (_: ForeignMutationsInput<IntegratedFormContext<E,FS>, IntegratedFormWritableState<E,FS>>) => ({
  
    })
  })

  export type IntegratedFormWritableState<E, FS> = IntegratedFormState<E,FS>
  export type IntegratedFormForeignMutationsExposed<E,FS> = ReturnType<ReturnType<typeof IntegratedFormState<E,FS>>["ForeignMutations"]>
  export type IntegratedFormForeignMutationsExpected<E,FS> = {}