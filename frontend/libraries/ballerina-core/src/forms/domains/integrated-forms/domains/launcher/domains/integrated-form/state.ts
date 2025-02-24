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
  simpleUpdaterWithChildren,
  Updater,
  id,
  ForeignMutationsInput,
  Unit,
} from "../../../../../../../../main";
import { Map } from "immutable";


export type IntegratedFormContext<E, FS> = {
  formType: ParsedType<E>;
  types: Map<string, ParsedType<E>>;
  rawGlobalConfiguration: any;
  toApiParser: (
    entity: E,
    formstate: IntegratedFormState<E,FS>,
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
      globalConfiguration: Sum.Default.right("not parsed"),
      formFieldStates,
      commonFormState,
      customFormState,
    }),
    Updaters:{
      Core:{
        ...simpleUpdater<IntegratedFormState<E,FS>>()("rawEntity"),
        ...simpleUpdater<IntegratedFormState<E,FS>>()("entity"),
        ...simpleUpdater<IntegratedFormState<E,FS>>()("globalConfiguration"),
        ...simpleUpdater<IntegratedFormState<E,FS>>()("formFieldStates"),
        ...simpleUpdaterWithChildren<IntegratedFormState<E,FS>>()({
            ...simpleUpdater<IntegratedFormState<E,FS>["customFormState"]>()("predicateEvaluations"),
        })("customFormState"),
        ...simpleUpdater<IntegratedFormState<E,FS>>()("commonFormState"),
      },
      Template:{
        entity:(_:BasicUpdater<E>) : Updater<IntegratedFormState<E,FS>> => 
          IntegratedFormState<E,FS>().Updaters.Core.entity(
              Synchronized.Updaters.sync(
                AsyncState.Operations.map(
                    _
                )
              )
          ),
        recalculatePredicates: () : Updater<IntegratedFormState<E,FS>> => 
          IntegratedFormState<E,FS>().Updaters.Core.customFormState.children.predicateEvaluations(
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
  export type IntegratedFormForeignMutationsExpected<E, FS> = Unit