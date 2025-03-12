import { List } from "immutable";
import {
  BasicFun,
  BasicUpdater,
  FormFieldPredicateEvaluation,
  PredicateValue,
  Sum,
  Updater,
  ValidateRunner,
  Value,
  ValueSum,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { SumFieldState, SumFieldView } from "./state";

export type StateWithDefault<S> = { Default: () => S };

export const SumForm = <
  LeftFormState,
  RightFormState,
  Context extends FormLabel & {
    visibilities: FormFieldPredicateEvaluation;
    disabledFields: FormFieldPredicateEvaluation;
  },
  ForeignMutationsExpected,
>(
  LeftFormState: StateWithDefault<LeftFormState>,
  RightFormState: StateWithDefault<RightFormState>,
  Left: StateWithDefault<PredicateValue>,
  Right: StateWithDefault<PredicateValue>,
  leftTemplate: Template<
    Context & Value<PredicateValue> & LeftFormState,
    LeftFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<PredicateValue>;
    }
  >,
  rightTemplate: Template<
    Context & Value<PredicateValue> & RightFormState,
    RightFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<PredicateValue>;
    }
  >,
  validation?: BasicFun<ValueSum, Promise<FieldValidation>>,
) => {
  const embeddedLeftTemplate = () =>
    leftTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueSum>;
        }
      >(
        (
          props,
        ): ForeignMutationsExpected & {
          onChange: OnChange<PredicateValue>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(
              (_) => ({
                ..._,
                value: Sum.Updaters.left<PredicateValue, PredicateValue>(
                  elementUpdater,
                )(_.value),
              }),
              path,
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<ValueSum> &
            SumFieldState<LeftFormState, RightFormState>,
        ): (Context & Value<PredicateValue> & LeftFormState) | undefined => {
          if (_.value.value.kind != "l") return undefined;
          if (_.visibilities.kind != "sum") return undefined;
          if (_.disabledFields.kind != "sum") return undefined;
          const leftFormState =
            _.customFormState.left || LeftFormState.Default();
          const leftContext: Context & Value<PredicateValue> & LeftFormState = {
            ..._,
            ...leftFormState,
            value: _.value.value.value,
            visibilities: _.visibilities.innerValue,
            disabledFields: _.disabledFields.innerValue,
          };
          return leftContext;
        },
      )
      .mapState(
        (
          upd: BasicUpdater<LeftFormState>,
        ): Updater<SumFieldState<LeftFormState, RightFormState>> =>
          SumFieldState<
            LeftFormState,
            RightFormState
          >().Updaters.Core.customFormState((_) => ({
            ..._,
            left: upd(_.left),
          })),
      );
  const embeddedRightTemplate = () =>
    rightTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueSum>;
        }
      >(
        (
          props,
        ): ForeignMutationsExpected & {
          onChange: OnChange<PredicateValue>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(
              (_) => ({
                ..._,
                value: Sum.Updaters.right<PredicateValue, PredicateValue>(
                  elementUpdater,
                )(_.value),
              }),
              path,
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<ValueSum> &
            SumFieldState<LeftFormState, RightFormState>,
        ): (Context & Value<PredicateValue> & RightFormState) | undefined => {
          if (_.value.value.kind != "r") return undefined;
          if (_.visibilities.kind != "sum") return undefined;
          if (_.disabledFields.kind != "sum") return undefined;
          const rightFormState =
            _.customFormState.right || RightFormState.Default();
            const rightContext: Context & Value<PredicateValue> & RightFormState =
            {
              ..._,
              ...rightFormState,
              value: _.value.value.value,
              visibilities: _.visibilities.innerValue,
              disabledFields: _.disabledFields.innerValue,
            };
          return rightContext;
        },
      )
      .mapState(
        (
          upd: BasicUpdater<RightFormState>,
        ): Updater<SumFieldState<LeftFormState, RightFormState>> =>
          SumFieldState<
            LeftFormState,
            RightFormState
          >().Updaters.Core.customFormState((_) => ({
            ..._,
            right: upd(_.right),
          })),
      );
  return Template.Default<
    Context & Value<ValueSum> & { disabled: boolean },
    SumFieldState<LeftFormState, RightFormState>,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueSum>;
    },
    SumFieldView<
      LeftFormState,
      RightFormState,
      Context,
      ForeignMutationsExpected
    >
  >((props) => (
    <>
      <props.view
        {...props}
        context={{ ...props.context }}
        foreignMutations={{
          ...props.foreignMutations,
          onSwitch: () => {
            props.foreignMutations.onChange(
              (_) =>
                _.value.kind === "l"
                  ? PredicateValue.Default.sum(
                      Sum.Default.right(Right.Default()),
                    )
                  : PredicateValue.Default.sum(
                      Sum.Default.left(Left.Default()),
                    ),
              List(["switch"]),
            );
          },
        }}
        embeddedLeftTemplate={embeddedLeftTemplate}
        embeddedRightTemplate={embeddedRightTemplate}
      />
    </>
  )).any([
    ValidateRunner<
      Context & { disabled: boolean },
      SumFieldState<LeftFormState, RightFormState>,
      ForeignMutationsExpected,
      ValueSum
    >(
      validation
        ? (_) =>
            validation(_).then(
              FieldValidationWithPath.Default.fromFieldValidation,
            )
        : undefined,
    ),
  ]);
};
