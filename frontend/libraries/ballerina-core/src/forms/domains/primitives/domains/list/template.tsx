import { List } from "immutable";
import {
  SimpleCallback,
  BasicFun,
  Unit,
  ValidateRunner,
  Updater,
  BasicUpdater,
  MapRepo,
  ListRepo,
  ValueTuple,
  PredicateValue,
  ListFieldPredicateEvaluation,
  Delta,
  ParsedType,
  ParsedApplicationType,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { ListFieldState, ListFieldView } from "./state";

export const ListForm = <
  ElementFormState extends { commonFormState: { modifiedByUser: boolean } },
  Context extends FormLabel & {
    visibilities: ListFieldPredicateEvaluation;
    disabledFields: ListFieldPredicateEvaluation;
    type: ParsedType<any>;
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
          onChange: (elementUpdater, nestedDelta) => {            
            const delta: Delta = {
              kind: "ArrayValue",
              value: [elementIndex, nestedDelta],
            }
            props.foreignMutations.onChange(
              Updater((list) =>
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
              delta,
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
              const delta: Delta = {
                kind: "ArrayAdd",
                value: Element.Default(),
                state: {
                  commonFormState: props.context.commonFormState,
                  elementFormStates: props.context.elementFormStates,
                },
                type: (props.context.type as ParsedApplicationType<any>).args[0],
              }
              props.foreignMutations.onChange(
                Updater((list) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.push<PredicateValue>(Element.Default())(
                      list.values,
                    ),
                  ),
                ),
                delta,
              );
            },
            remove: (_) => {
              const delta: Delta = {
                kind: "ArrayRemoveAt",
                index: _,
              }
              props.foreignMutations.onChange(
                Updater((list) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.remove<PredicateValue>(_)(list.values),
                  ),
                ),
                delta,
              );
            },
            move: (index, to) => {
              const delta: Delta = {
                kind: "ArrayMoveFromTo",
                from: index,
                to: to,
              }
              props.foreignMutations.onChange(
                Updater((list) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.move<PredicateValue>(
                      index,
                      to,
                    )(list.values),
                  ),
                ),
                delta,
              );
            },
            duplicate: (_) => {
              const delta: Delta = {
                kind: "ArrayDuplicateAt",
                index: _,
              }
              props.foreignMutations.onChange(
                Updater((list) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.duplicate<PredicateValue>(_)(list.values),
                  ),
                ),
                delta,
              );
            },
            insert: (_) => {
              const delta: Delta = {
                kind: "ArrayAddAt",
                value: [_, Element.Default()],
                elementState: ElementFormState.Default(),
                elementType: (props.context.type as ParsedApplicationType<any>).args[0],
              }
              props.foreignMutations.onChange(
                Updater((list) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.insert<PredicateValue>(
                      _,
                      Element.Default(),
                    )(list.values),
                  ),
                ),
                delta,
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
