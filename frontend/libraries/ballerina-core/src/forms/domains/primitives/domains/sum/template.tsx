import { List } from "immutable";
import {
  BasicFun,
  BasicUpdater,
  FormFieldPredicateEvaluation,
  PredicateValue,
  replaceWith,
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
    elementVisibilities: {
      left: FormFieldPredicateEvaluation;
      right: FormFieldPredicateEvaluation;
    };
    elementDisabled: {
      left: FormFieldPredicateEvaluation;
      right: FormFieldPredicateEvaluation;
    };
  },
  ForeignMutationsExpected
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
  validation?: BasicFun<ValueSum, Promise<FieldValidation>>
) => {
  const embeddedLeftTemplate = () =>
    leftTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueSum>;
        }
      >(
        (
          props
        ): ForeignMutationsExpected & {
          onChange: OnChange<PredicateValue>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(
              (_) => ({ ..._, left: elementUpdater(_.value.value) }),
              path
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
        })
      )
      .mapContext(
        (
          _: Context &
            Value<ValueSum> &
            SumFieldState<LeftFormState, RightFormState>
        ): (Context & Value<PredicateValue> & LeftFormState) | undefined => {
          if (_.value.value.kind !== "l") {
            return undefined;
          }
          const leftFormState =
            _.customFormState.left || LeftFormState.Default();
          const leftContext: Context & Value<PredicateValue> & LeftFormState = {
            ..._,
            ...leftFormState,
            value: _.value.value,
            visibilities: _.elementVisibilities.left,
            disabledFields: _.elementDisabled.left,
          };
          return leftContext;
        }
      )
      .mapState(
        (
          upd: BasicUpdater<LeftFormState>
        ): Updater<SumFieldState<LeftFormState, RightFormState>> =>
          SumFieldState<
            LeftFormState,
            RightFormState
          >().Updaters.Core.customFormState((_) => ({
            ..._,
            left: upd(_.left),
          }))
      );
  const embeddedRightTemplate = () =>
    rightTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueSum>;
        }
      >(
        (
          props
        ): ForeignMutationsExpected & {
          onChange: OnChange<PredicateValue>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(
              (_) => ({ ..._, right: elementUpdater(_.value.value) }),
              path
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
        })
      )
      .mapContext(
        (
          _: Context &
            Value<ValueSum> &
            SumFieldState<LeftFormState, RightFormState>
        ): (Context & Value<PredicateValue> & RightFormState) | undefined => {
          if (_.value.value.kind !== "r") {
            return undefined;
          }
          const rightFormState =
            _.customFormState.right || RightFormState.Default();
          const rightContext: Context & Value<PredicateValue> & RightFormState =
            {
              ..._,
              ...rightFormState,
              value: _.value.value,
              visibilities: _.elementVisibilities.right,
              disabledFields: _.elementDisabled.right,
            };
          return rightContext;
        }
      )
      .mapState(
        (
          upd: BasicUpdater<RightFormState>
        ): Updater<SumFieldState<LeftFormState, RightFormState>> =>
          SumFieldState<
            LeftFormState,
            RightFormState
          >().Updaters.Core.customFormState((_) => ({
            ..._,
            right: upd(_.right),
          }))
      );
  return Template.Default<
    Context & Value<ValueSum> & { disabled: boolean },
    SumFieldState<LeftFormState, RightFormState>,
    ForeignMutationsExpected & { onChange: OnChange<ValueSum> },
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
              FieldValidationWithPath.Default.fromFieldValidation
            )
        : undefined
    ),
  ]);
};
