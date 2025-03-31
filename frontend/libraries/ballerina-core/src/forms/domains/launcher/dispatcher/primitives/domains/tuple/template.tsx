import React from "react";
import { List, Map } from "immutable";
import {
  SimpleCallback,
  BasicFun,
  Unit,
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
} from "../../../../../../../../main";
import { Template } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { TupleFormState, TupleFormView } from "./state";
import { ValidateRunner } from "../../../singleton/template";

export const TupleForm = <
  ElementFormStates extends List<{
    commonFormState: { modifiedByUser: boolean };
  }>,
  Context extends FormLabel & {
    disabled: boolean;
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
              Updater((tuple: ValueTuple) =>
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
          const element = _.value.values.get(elementIndex);
          const elementFormState =
            _.elementFormStates.get(elementIndex) ||
            ElementFormStates.get(elementIndex)!.Default();
          const elementContext: Context &
            Value<ValueTuple> & {
              commonFormState: { modifiedByUser: boolean };
            } = {
            ..._,
            ...elementFormState,
            disabled: _.disabled,
            value: element,
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
