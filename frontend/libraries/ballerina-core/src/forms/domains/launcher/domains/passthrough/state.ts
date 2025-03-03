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

export type PassthroughFormContext<E, FS> = {
  formType: ParsedType<E>;
  types: Map<string, ParsedType<E>>;
  globalConfiguration: Sum<PredicateValue, "not initialized">;
  initialRawEntity: Sum<any, "not initialized">;
  entity: Sum<E, "not initialized">;
  onRawEntityChange: (updater: Updater<E>, path: List<string>) => void;
  toApiParser: (
    entity: E,
    formstate: PassthroughFormState<E, FS>,
    checkKeys: boolean,
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

export const PassthroughFormState = <E, FS>() => ({
  Default: (
    formFieldStates: FS,
    commonFormState: CommonFormState,
  ): PassthroughFormState<E, FS> => ({
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
      ...simpleUpdater<PassthroughFormState<E, FS>>()("formFieldStates"),
      ...simpleUpdaterWithChildren<PassthroughFormState<E, FS>>()({
        ...simpleUpdater<PassthroughFormState<E, FS>["customFormState"]>()(
          "predicateEvaluations",
        ),
        ...simpleUpdater<PassthroughFormState<E, FS>["customFormState"]>()(
          "isInitialized",
        ),
      })("customFormState"),
      ...simpleUpdater<PassthroughFormState<E, FS>>()("commonFormState"),
    },
    Template: {
      recalculatePredicates: (): Updater<PassthroughFormState<E, FS>> =>
        PassthroughFormState<
          E,
          FS
        >().Updaters.Core.customFormState.children.predicateEvaluations(
          Debounced.Updaters.Template.value(id),
        ),
    },
  },
  ForeignMutations: (
    _: ForeignMutationsInput<
      PassthroughFormContext<E, FS>,
      PassthroughFormWritableState<E, FS>
    >,
  ) => ({}),
});

export type PassthroughFormWritableState<E, FS> = PassthroughFormState<E, FS>;
export type PassthroughFormForeignMutationsExposed<E, FS> = ReturnType<
  ReturnType<typeof PassthroughFormState<E, FS>>["ForeignMutations"]
>;
export type PassthroughFormForeignMutationsExpected<E, FS> = {};
