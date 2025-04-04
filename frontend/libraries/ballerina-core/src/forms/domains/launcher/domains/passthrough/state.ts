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
  Sum,
} from "../../../../../../main";
import { List, Map } from "immutable";

export type PassthroughFormContext<T, FS> = {
  formType: ParsedType<T>;
  globalConfiguration: Sum<PredicateValue, "not initialized">;
  entity: Sum<PredicateValue, "not initialized">;
  onEntityChange: (
    updater: Updater<PredicateValue>,
    path: List<string>,
  ) => void;
  toApiParser: (
    entity: PredicateValue,
    formstate: PassthroughFormState<T, FS>,
    type: ParsedType<any>,
  ) => ValueOrErrors<any, string>;
  fromApiParser: (raw: any) => ValueOrErrors<PredicateValue, string>;
  parseGlobalConfiguration: (raw: any) => ValueOrErrors<PredicateValue, string>;
  visibilityPredicateExpressions: FieldPredicateExpressions;
  disabledPredicatedExpressions: FieldPredicateExpressions;
  actualForm: Template<
    Value<PredicateValue> & { formFieldStates: FS } & {
      commonFormState: CommonFormState;
    } & { visibilities: FormFieldPredicateEvaluation | undefined } & {
      disabledFields: FormFieldPredicateEvaluation | undefined;
    },
    { formFieldStates: FS } & { commonFormState: CommonFormState },
    { onChange: (e: Updater<PredicateValue>, path: List<string>) => void }
  >;
};

export type PassthroughFormState<E, FS> = {
  formFieldStates: FS;
  commonFormState: CommonFormState;
  customFormState: {
    isInitialized: boolean;
    predicateEvaluations: Debounced<
      ValueOrErrors<
        {
          visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
          disabledPredicateEvaluations: FormFieldPredicateEvaluation;
        },
        string
      >
    >;
  };
};

export const PassthroughFormState = <T, FS>() => ({
  Default: (
    formFieldStates: FS,
    commonFormState: CommonFormState,
  ): PassthroughFormState<T, FS> => ({
    formFieldStates,
    commonFormState,
    customFormState: {
      isInitialized: false,
      predicateEvaluations: Debounced.Default(
        ValueOrErrors.Default.return({
          visiblityPredicateEvaluations:
            FormFieldPredicateEvaluation.Default.form(false, Map()),
          disabledPredicateEvaluations:
            FormFieldPredicateEvaluation.Default.form(false, Map()),
        }),
      ),
    },
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<PassthroughFormState<T, FS>>()("formFieldStates"),
      ...simpleUpdaterWithChildren<PassthroughFormState<T, FS>>()({
        ...simpleUpdater<PassthroughFormState<T, FS>["customFormState"]>()(
          "predicateEvaluations",
        ),
        ...simpleUpdater<PassthroughFormState<T, FS>["customFormState"]>()(
          "isInitialized",
        ),
      })("customFormState"),
      ...simpleUpdater<PassthroughFormState<T, FS>>()("commonFormState"),
    },
    Template: {
      recalculatePredicates: (): Updater<PassthroughFormState<T, FS>> =>
        PassthroughFormState<
          T,
          FS
        >().Updaters.Core.customFormState.children.predicateEvaluations(
          Debounced.Updaters.Template.value(id),
        ),
    },
  },
  ForeignMutations: (
    _: ForeignMutationsInput<
      PassthroughFormContext<T, FS>,
      PassthroughFormWritableState<T, FS>
    >,
  ) => ({}),
});

export type PassthroughFormWritableState<T, FS> = PassthroughFormState<T, FS>;
export type PassthroughFormForeignMutationsExposed<T, FS> = ReturnType<
  ReturnType<typeof PassthroughFormState<T, FS>>["ForeignMutations"]
>;
export type PassthroughFormForeignMutationsExpected<T, FS> = {};
