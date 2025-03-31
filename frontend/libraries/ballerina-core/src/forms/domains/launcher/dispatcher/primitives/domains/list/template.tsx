import { List } from "immutable";

import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { ListFieldState, ListFieldView } from "./state";
import React from "react";
import { SimpleCallback, Unit, Updater, BasicUpdater, MapRepo, ListRepo } from "../../../../../../../../main";
import { BasicFun } from "../../../../../../../fun/state";
import { Template } from "../../../../../../../template/state";
import { Value } from "../../../../../../../value/state";
import { ListFieldPredicateEvaluation, PredicateValue, ValueTuple } from "../../../../../parser/domains/predicates/state";
import { ValidateRunner } from "../../../singleton/template";

export const ListForm = <
  ElementFormState extends { commonFormState: { modifiedByUser: boolean } },
  Context extends FormLabel & {
    visibilities: ListFieldPredicateEvaluation;
    disabledFields: ListFieldPredicateEvaluation;
  },
  ForeignMutationsExpected,
>(
  ElementFormState: { Default: () => ElementFormState },
  Element: { Default: () => PredicateValue },
  elementTemplate: Template<
    Context & Value<PredicateValue> & ElementFormState,
    ElementFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<PredicateValue>;
    }
  >,
  validation?: BasicFun<ValueTuple, Promise<FieldValidation>>,
) => {
  const embeddedElementTemplate = (elementIndex: number) =>
    elementTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
          move: (elementIndex: number, to: number) => void;
          duplicate: SimpleCallback<number>;
          insert: SimpleCallback<number>;
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
              Updater((list: ValueTuple) =>
                list.values.has(elementIndex)
                  ? PredicateValue.Default.tuple(
                      list.values.update(
                        elementIndex,
                        PredicateValue.Default.unit(),
                        elementUpdater,
                      ),
                    )
                  : list,
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
          add: () => {},
          remove: (elementIndex: number) => {},
          move: (elementIndex: number, to: number) => {},
          duplicate: (elementIndex: number) => {},
          insert: (elementIndex: number) => {},
        }),
      )
      .mapContext(
        (
          _: Context & Value<ValueTuple> & ListFieldState<ElementFormState>,
        ): (Context & Value<ValueTuple> & ElementFormState) | undefined => {
          if (!_.value.values.has(elementIndex)) return undefined;
          if (_.visibilities == undefined || _.visibilities.kind != "list")
            return undefined;
          if (_.disabledFields == undefined || _.disabledFields.kind != "list")
            return undefined;
          const disabled =
            _.disabledFields.elementValues[elementIndex]?.value ?? true;
          const visible =
            _.visibilities.elementValues[elementIndex]?.value ?? false;
          const element = _.value.values.get(elementIndex);
          const elementFormState =
            _.elementFormStates.get(elementIndex) || ElementFormState.Default();
          const elementVisibility = _.visibilities.elementValues[elementIndex];
          const elementDisabled = _.disabledFields.elementValues[elementIndex];
          const elementContext: Context & Value<ValueTuple> & ElementFormState =
            {
              ..._,
              ...elementFormState,
              value: element,
              visibilities: elementVisibility,
              disabledFields: elementDisabled,
              disabled: disabled,
              visible: visible,
            };
          return elementContext;
        },
      )
      .mapState(
        (
          _: BasicUpdater<ElementFormState>,
        ): Updater<ListFieldState<ElementFormState>> =>
          ListFieldState<ElementFormState>().Updaters.Core.elementFormStates(
            MapRepo.Updaters.upsert(
              elementIndex,
              () => ElementFormState.Default(),
              _,
            ),
          ),
      );
  return Template.Default<
    Context & Value<ValueTuple> & { disabled: boolean },
    ListFieldState<ElementFormState>,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueTuple>;
    },
    ListFieldView<ElementFormState, Context, ForeignMutationsExpected>
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
            add: (_) => {
              props.foreignMutations.onChange(
                Updater((list: ValueTuple) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.push<PredicateValue>(Element.Default())(
                      list.values,
                    ),
                  ),
                ),
                List([{ kind: "add" }]),
              );
            },
            remove: (_) => {
              props.foreignMutations.onChange(
                Updater((list: ValueTuple) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.remove<PredicateValue>(_)(list.values),
                  ),
                ),
                List([_, { kind: "remove" }]),
              );
            },
            move: (index, to) => {
              props.foreignMutations.onChange(
                Updater((list: ValueTuple) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.move<PredicateValue>(
                      index,
                      to,
                    )(list.values),
                  ),
                ),
                List([index, { kind: "move", to }]),
              );
            },
            duplicate: (_) => {
              props.foreignMutations.onChange(
                Updater((list: ValueTuple) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.duplicate<PredicateValue>(_)(list.values),
                  ),
                ),
                List([_, { kind: "duplicate" }]),
              );
            },
            insert: (_) => {
              props.foreignMutations.onChange(
                Updater((list: ValueTuple) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.insert<PredicateValue>(
                      _,
                      Element.Default(),
                    )(list.values),
                  ),
                ),
                List([_, { kind: "insert" }]),
              );
            },
          }}
          embeddedElementTemplate={embeddedElementTemplate}
        />
      </>
    );
  }).any([
    ValidateRunner<
      Context & { disabled: boolean },
      ListFieldState<ElementFormState>,
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
