import React from "react";
import { List, Map } from "immutable";
import {
  SimpleCallback,
  BasicFun,
  Unit,
  ValidateRunner,
  Updater,
  BasicUpdater,
  MapRepo,
  ListRepo,
  FormFieldPredicateEvaluation,
  ValueTuple,
  PredicateValue,
  FieldPredicateExpression,
  TuplePredicateExpression,
  TupleFieldPredicateEvaluation,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { TupleFormState, TupleFormView } from "./state";

export const TupleForm = <
  ElementFormStates extends List<{
    commonFormState: { modifiedByUser: boolean };
  }>,
  Context extends FormLabel & {
    visibilities: TupleFieldPredicateEvaluation;
    disabledFields: TupleFieldPredicateEvaluation;
    disabled: boolean;
    visible: boolean;
  },
  ForeignMutationsExpected,
>(
  ElementFormStates: List<{
    Default: () => { commonFormState: { modifiedByUser: boolean } };
  }>,
  elementTemplates: List<
    | Template<
        Context &
          Value<PredicateValue> & {
            commonFormState: { modifiedByUser: boolean };
          },
        any,
        ForeignMutationsExpected & {
          onChange: OnChange<PredicateValue>;
        }
      >
    | undefined
  >,
  validation?: BasicFun<ValueTuple, Promise<FieldValidation>>,
) => {
  const embeddedElementTemplates = (elementIndex: number) =>
    elementTemplates
      .get(elementIndex)!
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
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
              Updater((tuple) =>
                tuple.values.has(elementIndex)
                  ? PredicateValue.Default.tuple(
                      tuple.values.update(
                        elementIndex,
                        PredicateValue.Default.unit(),
                        elementUpdater,
                      ),
                    )
                  : tuple,
              ),
              List([elementIndex]).concat(path),
            );
            props.setState((_) => ({
              ..._,
              commonFormState: {
                ..._.commonFormState,
                modifiedByUser: true,
              },
            }));
          },
        }),
      )
      .mapContext(
        (
          _: Context & Value<ValueTuple> & TupleFormState<ElementFormStates>,
        ):
          | (Context &
              Value<ValueTuple> & {
                commonFormState: { modifiedByUser: boolean };
              })
          | undefined => {
          if (!_.value.values.has(elementIndex)) return undefined;
          if (_.visibilities == undefined || _.visibilities.kind != "tuple")
            return undefined;
          if (_.disabledFields == undefined || _.disabledFields.kind != "tuple")
            return undefined;
          const disabled =
            _.disabledFields.elementValues[elementIndex].value ?? true;
          const visible =
            _.visibilities.elementValues[elementIndex].value ?? false;
          const element = _.value.values.get(elementIndex);
          const elementFormState =
            _.elementFormStates.get(elementIndex) ||
            ElementFormStates.get(elementIndex)!.Default();
          const elementVisibility = _.visibilities.elementValues[elementIndex];
          const elementDisabled = _.disabledFields.elementValues[elementIndex];
          const elementContext: Context &
            Value<ValueTuple> & {
              commonFormState: { modifiedByUser: boolean };
            } = {
            ..._,
            ...elementFormState,
            disabled: disabled,
            visible: visible,
            value: element,
            visibilities: elementVisibility,
            disabledFields: elementDisabled,
          };
          return elementContext;
        },
      )
      .mapState(
        (
          _: BasicUpdater<{
            commonFormState: { modifiedByUser: boolean };
          }>,
        ): Updater<TupleFormState<ElementFormStates>> =>
          TupleFormState<ElementFormStates>().Updaters.Core.elementFormStates(
            MapRepo.Updaters.upsert(
              elementIndex,
              () => ElementFormStates.get(elementIndex)!.Default(),
              _,
            ) as unknown as BasicUpdater<ElementFormStates>,
          ),
      );
  return Template.Default<
    Context & Value<ValueTuple> & { disabled: boolean },
    TupleFormState<ElementFormStates>,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueTuple>;
    },
    TupleFormView<ElementFormStates, Context, ForeignMutationsExpected>
  >((props) => {
    return (
      <>
        <props.view
          {...props}
          context={{
            ...props.context,
          }}
          foreignMutations={{
            ...props.foreignMutations,
          }}
          embeddedElementTemplates={embeddedElementTemplates}
        />
      </>
    );
  }).any([
    ValidateRunner<
      Context & { disabled: boolean },
      TupleFormState<ElementFormStates>,
      ForeignMutationsExpected,
      ValueTuple
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
