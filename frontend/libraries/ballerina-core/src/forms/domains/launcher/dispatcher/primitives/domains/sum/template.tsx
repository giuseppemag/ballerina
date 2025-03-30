
import React from "react";
import {
  BasicFun,
  BasicUpdater,
  PredicateValue,
  Sum,
  SumFieldPredicateEvaluation,
  Updater,
  Value,
  ValueSum,
} from "../../../../../../../../main";
import { Template } from "../../../../../../../template/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { ValidateRunner } from "../../../singleton/template";
import { SumFormState, SumFormView } from "./state";

export const SumForm = <
  LeftFormState,
  RightFormState,
  Context extends FormLabel & {
    visibilities: SumFieldPredicateEvaluation;
    disabledFields: SumFieldPredicateEvaluation;
    disabled: boolean;
    visible: boolean;
  },
  ForeignMutationsExpected,
>(
  leftDefaultState: () => LeftFormState,
  rightDefaultState: () => RightFormState,
  leftTemplate?: Template<
    Context & Value<PredicateValue> & LeftFormState,
    LeftFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<PredicateValue>;
    }
  >,
  rightTemplate?: Template<
    Context & Value<PredicateValue> & RightFormState,
    RightFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<PredicateValue>;
    }
  >,

  validation?: BasicFun<ValueSum, Promise<FieldValidation>>,
) => {
  const embeddedLeftTemplate =
    leftTemplate != undefined
      ? () =>
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
                  SumFormState<LeftFormState, RightFormState>,
              ):
                | (Context & Value<PredicateValue> & LeftFormState)
                | undefined => {
                if (_.value.value.kind != "l") return undefined;
                if (_.visibilities == undefined || _.visibilities.kind != "sum")
                  return undefined;
                if (
                  _.disabledFields == undefined ||
                  _.disabledFields.kind != "sum"
                )
                  return undefined;
                const leftFormState =
                  _.customFormState.left || leftDefaultState();
                const leftContext: Context &
                  Value<PredicateValue> &
                  LeftFormState = {
                  ..._,
                  ...leftFormState,
                  disabled: _.disabledFields.innerValue.value ?? true,
                  visible: _.visibilities.innerValue.value ?? false,
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
              ): Updater<SumFormState<LeftFormState, RightFormState>> =>
                SumFormState<
                  LeftFormState,
                  RightFormState
                >().Updaters.Core.customFormState((_) => ({
                  ..._,
                  left: upd(_.left),
                })),
            )
      : undefined;
  const embeddedRightTemplate =
    rightTemplate != undefined
      ? () =>
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
                  SumFormState<LeftFormState, RightFormState>,
              ):
                | (Context & Value<PredicateValue> & RightFormState)
                | undefined => {
                if (_.value.value.kind != "r") return undefined;
                if (_.visibilities == undefined || _.visibilities.kind != "sum")
                  return undefined;
                if (
                  _.disabledFields == undefined ||
                  _.disabledFields.kind != "sum"
                )
                  return undefined;
                const rightFormState =
                  _.customFormState.right || rightDefaultState();
                const rightContext: Context &
                  Value<PredicateValue> &
                  RightFormState = {
                  ..._,
                  ...rightFormState,
                  disabled: _.disabledFields.innerValue.value,
                  visible: _.visibilities.innerValue.value,
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
              ): Updater<SumFormState<LeftFormState, RightFormState>> =>
                SumFormState<
                  LeftFormState,
                  RightFormState
                >().Updaters.Core.customFormState((_) => ({
                  ..._,
                  right: upd(_.right),
                })),
            )
      : undefined;
  return Template.Default<
    Context & Value<ValueSum> & { disabled: boolean },
    SumFormState<LeftFormState, RightFormState>,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueSum>;
    },
    SumFormView<
      LeftFormState,
      RightFormState,
      Context,
      ForeignMutationsExpected
    >
  >((props) => {
    return (
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
    );
  }).any([
    ValidateRunner<
      Context & { disabled: boolean },
      SumFormState<LeftFormState, RightFormState>,
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
