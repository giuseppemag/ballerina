import { List } from "immutable";
import {
  replaceWith,
  ValueOrErrors,
  Debounce,
  Updater,
} from "../../../../../../../main";
import { ApiResultStatus } from "../../../../../../apiResultStatus/state";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { Debounced } from "../../../../../../debounced/state";
import {
  PredicateValue,
  evaluatePredicates,
  FormFieldPredicateEvaluation,
} from "../../../../parser/domains/predicates/state";
import {
  PassthroughFormContext,
  PassthroughFormForeignMutationsExpected,
  PassthroughFormWritableState,
  PassthroughFormState,
} from "../state";

export const passthroughFormRunner = <T, FS>() => {
  const Co = CoTypedFactory<
    PassthroughFormContext<T, FS> &
      PassthroughFormForeignMutationsExpected<T, FS> & {
        onEntityChange: (
          updater: Updater<PredicateValue>,
          path: List<string>,
        ) => void;
      },
    PassthroughFormWritableState<T, FS>
  >();

  const calculateInitialVisibilities = Co.GetState().then((current) => {
    if (
      typeof current.entity.value != "object" ||
      !("kind" in current.entity.value) ||
      current.entity.value.kind != "record"
    ) {
      return Co.Do(() => {});
    }
    return Co.SetState(
      PassthroughFormState<T, FS>()
        .Updaters.Core.customFormState.children.predicateEvaluations(
          replaceWith(
            Debounced.Default(
              evaluatePredicates(
                {
                  global: current.globalConfiguration.value,
                  visibilityPredicateExpressions:
                    current.visibilityPredicateExpressions,
                  disabledPredicatedExpressions:
                    current.disabledPredicatedExpressions,
                },
                current.entity.value,
              ),
            ),
          ),
        )
        .then(
          PassthroughFormState<
            T,
            FS
          >().Updaters.Core.customFormState.children.isInitialized(
            replaceWith(true),
          ),
        ),
    );
  });

  const PredicatesCo = CoTypedFactory<
    PassthroughFormWritableState<T, FS> & PassthroughFormContext<T, FS>,
    ValueOrErrors<
      {
        visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
        disabledPredicateEvaluations: FormFieldPredicateEvaluation;
      },
      string
    >
  >();

  const calculateVisibilities = Co.Repeat(
    Debounce<
      ValueOrErrors<
        {
          visiblityPredicateEvaluations: FormFieldPredicateEvaluation;
          disabledPredicateEvaluations: FormFieldPredicateEvaluation;
        },
        string
      >,
      PassthroughFormContext<T, FS> & PassthroughFormWritableState<T, FS>
    >(
      PredicatesCo.GetState().then((current) => {
        if (
          current.entity.kind == "r" ||
          current.globalConfiguration.kind == "r"
        ) {
          return PredicatesCo.Return<ApiResultStatus>("permanent failure");
        }
        return PredicatesCo.SetState(
          replaceWith(
            evaluatePredicates(
              {
                global: current.globalConfiguration.value,
                visibilityPredicateExpressions:
                  current.visibilityPredicateExpressions,
                disabledPredicatedExpressions:
                  current.disabledPredicatedExpressions,
              },
              current.entity.value,
            ),
          ),
        ).then(() => PredicatesCo.Return<ApiResultStatus>("success"));
      }),
      50,
    ).embed(
      (_) => ({ ..._, ..._.customFormState.predicateEvaluations }),
      PassthroughFormState<T, FS>().Updaters.Core.customFormState.children
        .predicateEvaluations,
    ),
  );

  return Co.Template<PassthroughFormForeignMutationsExpected<T, FS>>(
    calculateInitialVisibilities,
    {
      interval: 15,
      runFilter: (props) =>
        !props.context.customFormState.isInitialized &&
        props.context.globalConfiguration.kind != "r" &&
        props.context.entity.kind != "r",
    },
  ).any([
    Co.Template<PassthroughFormForeignMutationsExpected<T, FS>>(
      calculateVisibilities,
      {
        interval: 15,
        runFilter: (props) =>
          Debounced.Operations.shouldCoroutineRun(
            props.context.customFormState.predicateEvaluations,
          ),
      },
    ),
  ]);
};
