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
  FormFieldPredicateEvaluation,
  PredicateValue,
  ValueTuple,
  MapFieldPredicateEvaluation,
  Delta,
  ParsedType,
  ParsedApplicationType,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  CommonFormState,
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { MapFieldState, MapFieldView } from "./state";

export const MapForm = <
  KeyFormState extends { commonFormState: CommonFormState },
  ValueFormState extends { commonFormState: CommonFormState },
  Context extends FormLabel & {
    visibilities: MapFieldPredicateEvaluation;
    disabledFields: MapFieldPredicateEvaluation;
    type: ParsedType<any>;
  },
  ForeignMutationsExpected,
>(
  KeyFormState: { Default: () => KeyFormState },
  ValueFormState: { Default: () => ValueFormState },
  Key: { Default: () => PredicateValue },
  Value: { Default: () => PredicateValue },
  keyTemplate: Template<
    Context & Value<PredicateValue> & KeyFormState,
    KeyFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<PredicateValue>;
    }
  >,
  valueTemplate: Template<
    Context & Value<PredicateValue> & ValueFormState,
    ValueFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<PredicateValue>;
    }
  >,
  validation?: BasicFun<ValueTuple, Promise<FieldValidation>>,
) => {
  const embeddedKeyTemplate = (elementIndex: number) =>
    keyTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
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
              kind: "MapKey",
              value: [elementIndex, nestedDelta],
            };
            props.foreignMutations.onChange(
              Updater((elements: ValueTuple) =>
                PredicateValue.Default.tuple(
                  elements.values.update(
                    elementIndex,
                    PredicateValue.Default.unit(),
                    (_) =>
                      _ == undefined
                        ? _
                        : !PredicateValue.Operations.IsTuple(_)
                          ? _
                          : PredicateValue.Default.tuple(
                              List([
                                elementUpdater(_.values.get(0)!),
                                _.values.get(1)!,
                              ]),
                            ),
                  ),
                ),
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
          add: (newElement: ValueTuple) => {},
          remove: (elementIndex: number) => {},
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<ValueTuple> &
            MapFieldState<KeyFormState, ValueFormState>,
        ): (Context & Value<ValueTuple> & KeyFormState) | undefined => {
          const element = _.value.values.get(elementIndex) as ValueTuple;
          if (element == undefined) return undefined;
          if (
            _.visibilities == undefined ||
            _.visibilities.elementValues[elementIndex] == undefined ||
            _.visibilities.kind != "map"
          )
            return undefined;
          if (
            _.disabledFields == undefined ||
            _.disabledFields.elementValues[elementIndex] == undefined ||
            _.disabledFields.kind != "map"
          )
            return undefined;
          const disabled =
            _.disabledFields.elementValues[elementIndex]?.key.value ?? true;
          const visible =
            _.visibilities.elementValues[elementIndex]?.key.value ?? false;
          const elementFormState = _.elementFormStates.get(elementIndex) || {
            KeyFormState: KeyFormState.Default(),
            ValueFormState: ValueFormState.Default(),
          };
          const elementVisibility =
            _.visibilities.elementValues[elementIndex]?.key;
          const elementDisabled =
            _.disabledFields.elementValues[elementIndex]?.key;
          const elementContext: Context & Value<ValueTuple> & KeyFormState = {
            ..._,
            ...elementFormState.KeyFormState,
            value: element.values.get(0)!,
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
          _: BasicUpdater<KeyFormState>,
        ): Updater<MapFieldState<KeyFormState, ValueFormState>> =>
          MapFieldState<
            KeyFormState,
            ValueFormState
          >().Updaters.Core.elementFormStates(
            MapRepo.Updaters.upsert(
              elementIndex,
              () => ({
                KeyFormState: KeyFormState.Default(),
                ValueFormState: ValueFormState.Default(),
              }),
              (current) => ({
                ...current,
                KeyFormState: _(current.KeyFormState),
              }),
            ),
          ),
      );
  const embeddedValueTemplate = (elementIndex: number) =>
    valueTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<ValueTuple>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
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
              kind: "MapValue",
              value: [elementIndex, nestedDelta],
            };
            props.foreignMutations.onChange(
              Updater((elements: ValueTuple) =>
                PredicateValue.Default.tuple(
                  elements.values.update(
                    elementIndex,
                    PredicateValue.Default.unit(),
                    (_) =>
                      _ == undefined
                        ? _
                        : !PredicateValue.Operations.IsTuple(_)
                          ? _
                          : PredicateValue.Default.tuple(
                              List([
                                _.values.get(0)!,
                                elementUpdater(_.values.get(1)!),
                              ]),
                            ),
                  ),
                ),
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
          add: (newElement: ValueTuple) => {},
          remove: (elementIndex: number) => {},
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<ValueTuple> &
            MapFieldState<KeyFormState, ValueFormState>,
        ): (Context & Value<ValueTuple> & ValueFormState) | undefined => {
          const element = _.value.values.get(elementIndex) as ValueTuple;
          if (element == undefined) return undefined;
          if (
            _.visibilities == undefined ||
            _.visibilities.elementValues[elementIndex] == undefined ||
            _.visibilities.kind != "map"
          )
            return undefined;
          if (
            _.disabledFields == undefined ||
            _.disabledFields.elementValues[elementIndex] == undefined ||
            _.disabledFields.kind != "map"
          )
            return undefined;
          const disabled =
            _.disabledFields.elementValues[elementIndex].value.value ?? true;
          const visible =
            _.visibilities.elementValues[elementIndex].value.value ?? false;
          const elementFormState = _.elementFormStates.get(elementIndex) || {
            KeyFormState: KeyFormState.Default(),
            ValueFormState: ValueFormState.Default(),
          };
          const elementVisibility =
            _.visibilities.elementValues[elementIndex]?.value;
          const elementDisabled =
            _.disabledFields.elementValues[elementIndex]?.value;
          const elementContext: Context & Value<ValueTuple> & ValueFormState = {
            ..._,
            ...elementFormState.ValueFormState,
            value: element.values.get(1)!,
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
          _: BasicUpdater<ValueFormState>,
        ): Updater<MapFieldState<KeyFormState, ValueFormState>> =>
          MapFieldState<
            KeyFormState,
            ValueFormState
          >().Updaters.Core.elementFormStates(
            MapRepo.Updaters.upsert(
              elementIndex,
              () => ({
                KeyFormState: KeyFormState.Default(),
                ValueFormState: ValueFormState.Default(),
              }),
              (current) => ({
                ...current,
                ValueFormState: _(current.ValueFormState),
              }),
            ),
          ),
      );
  return Template.Default<
    Context & Value<ValueTuple> & { disabled: boolean },
    MapFieldState<KeyFormState, ValueFormState>,
    ForeignMutationsExpected & { onChange: OnChange<ValueTuple> },
    MapFieldView<
      KeyFormState,
      ValueFormState,
      Context,
      ForeignMutationsExpected
    >
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
                kind: "MapAdd",
                keyValue: [Key.Default(), Value.Default()],
                keyState: KeyFormState.Default(),
                keyType: (props.context.type as ParsedApplicationType<any>)
                  .args[0],
                valueState: ValueFormState.Default(),
                valueType: (props.context.type as ParsedApplicationType<any>)
                  .args[1],
              };
              props.foreignMutations.onChange(
                Updater((list) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.push<ValueTuple>(
                      PredicateValue.Default.tuple(
                        List([Key.Default(), Value.Default()]),
                      ),
                    )(list.values as List<ValueTuple>),
                  ),
                ),
                delta,
              );
            },
            remove: (_) => {
              const delta: Delta = {
                kind: "MapRemove",
                index: _,
              };
              props.foreignMutations.onChange(
                Updater((list) =>
                  PredicateValue.Default.tuple(
                    ListRepo.Updaters.remove<ValueTuple>(_)(
                      list.values as List<ValueTuple>,
                    ),
                  ),
                ),
                delta,
              );
            },
          }}
          embeddedKeyTemplate={embeddedKeyTemplate}
          embeddedValueTemplate={embeddedValueTemplate}
        />
      </>
    );
  }).any([
    ValidateRunner<
      Context & { disabled: boolean },
      MapFieldState<KeyFormState, ValueFormState>,
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
