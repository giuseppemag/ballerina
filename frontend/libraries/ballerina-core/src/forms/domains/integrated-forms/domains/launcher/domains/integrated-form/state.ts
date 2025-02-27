import {
  ParsedType,
  Template,
  Value,
  ValueOrErrors,
  PredicateValue,
  FieldPredicateExpressions,
  CommonFormState,
  FormFieldPredicateEvaluation,
  simpleUpdater,
  Debounced,
  simpleUpdaterWithChildren,
  Updater,
  id,
  ForeignMutationsInput,
  Sum
} from "../../../../../../../../main";
import { List, Map } from "immutable";

export type IntegratedFormContext<E, FS> = {
  formType: ParsedType<E>;
  types: Map<string, ParsedType<E>>;
  globalConfiguration: Sum<PredicateValue, "not initialized">;
  initialRawEntity: Sum<any, "not initialized">;
  entity: Sum<E, "not initialized">;
  onRawEntityChange: (updater: Updater<E>, path: List<string>) => void;
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
    { onChange: (e: Updater<E>, path: List<string>) => void }
  >;
};

export type IntegratedFormState<E,FS> = {
  formFieldStates: FS,  
  commonFormState: CommonFormState,
  customFormState: {
    isInitialized: boolean,
    predicateEvaluations: Debounced<ValueOrErrors<{
      visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
      disabledPredicateEvaluations: FormFieldPredicateEvaluation;
    }, string>>,
  }
}

export const IntegratedFormState = <E,FS>() => ({
    Default:(formFieldStates:FS, commonFormState: CommonFormState) : IntegratedFormState<E,FS> => ({
      formFieldStates,
      commonFormState,
      customFormState: {
        isInitialized: false,
        predicateEvaluations: Debounced.Default(ValueOrErrors.Default.return({
        visiblityPredicateEvaluations: FormFieldPredicateEvaluation.Default.form(false, Map()),
        disabledPredicateEvaluations: FormFieldPredicateEvaluation.Default.form(false, Map())
        }))
      }
    }),
    Updaters:{
      Core:{
        ...simpleUpdater<IntegratedFormState<E,FS>>()("formFieldStates"),
        ...simpleUpdaterWithChildren<IntegratedFormState<E,FS>>()({
            ...simpleUpdater<IntegratedFormState<E,FS>["customFormState"]>()("predicateEvaluations"),
            ...simpleUpdater<IntegratedFormState<E,FS>["customFormState"]>()("isInitialized"),
        })("customFormState"),
        ...simpleUpdater<IntegratedFormState<E,FS>>()("commonFormState"),
      },
      Template:{
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
  export type IntegratedFormForeignMutationsExpected<E, FS> = {

  }