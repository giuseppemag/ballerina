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
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { MapFieldState, MapFieldView } from "./state";

export const MapForm = <
  K extends PredicateValue,
  V extends PredicateValue,
  KeyFormState,
  ValueFormState,
  Context extends FormLabel & {
    elementVisibilities: {
      key: FormFieldPredicateEvaluation;
      value: FormFieldPredicateEvaluation;
    }[];
    elementDisabled: {
      key: FormFieldPredicateEvaluation;
      value: FormFieldPredicateEvaluation;
    }[];
  },
  ForeignMutationsExpected,
>(
  KeyFormState: { Default: () => KeyFormState },
  ValueFormState: { Default: () => ValueFormState },
  Key: { Default: () => K },
  Value: { Default: () => V },
  keyTemplate: Template<
    Context & Value<K> & KeyFormState,
    KeyFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<K>;
    }
  >,
  valueTemplate: Template<
    Context & Value<V> & ValueFormState,
    ValueFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<V>;
    }
  >,
  validation?: BasicFun<List<[K, V]>, Promise<FieldValidation>>,
) => {
  const embeddedKeyTemplate = (elementIndex: number) =>
    keyTemplate
      .mapForeignMutationsFromProps<
        ForeignMutationsExpected & {
          onChange: OnChange<List<[K, V]>>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
        }
      >(
        (
          props,
        ): ForeignMutationsExpected & {
          onChange: OnChange<K>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(
              Updater((elements: List<[K, V]>) =>
                elements.update(elementIndex, (_: [K, V] | undefined) =>
                  _ == undefined ? _ : [elementUpdater(_[0]), _[1]],
                ),
              ),
              List([elementIndex.toString(), "key"]).concat(path),
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
          add: (newElement: [K, V]) => {},
          remove: (elementIndex: number) => {},
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<List<[K, V]>> &
            MapFieldState<K, V, KeyFormState, ValueFormState>,
        ): (Context & Value<K> & KeyFormState) | undefined => {
          const element = _.value.get(elementIndex);
          if (element == undefined) return undefined;
          const elementFormState = _.elementFormStates.get(elementIndex) || {
            KeyFormState: KeyFormState.Default(),
            ValueFormState: ValueFormState.Default(),
          };
          const elementVisibility = _.elementVisibilities[elementIndex]?.key;
          const elementDisabled = _.elementDisabled[elementIndex]?.key;
          const elementContext: Context & Value<K> & KeyFormState = {
            ..._,
            ...elementFormState.KeyFormState,
            value: element[0],
            visibilities: elementVisibility,
            disabledFields: elementDisabled,
          };
          return elementContext;
        },
      )
      .mapState(
        (
          _: BasicUpdater<KeyFormState>,
        ): Updater<MapFieldState<K, V, KeyFormState, ValueFormState>> =>
          MapFieldState<
            K,
            V,
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
          onChange: OnChange<List<[K, V]>>;
          add: SimpleCallback<Unit>;
          remove: SimpleCallback<number>;
        }
      >(
        (
          props,
        ): ForeignMutationsExpected & {
          onChange: OnChange<V>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
            props.foreignMutations.onChange(
              Updater((elements: List<[K, V]>) =>
                elements.update(elementIndex, (_: [K, V] | undefined) =>
                  _ == undefined ? _ : [_[0], elementUpdater(_[1])],
                ),
              ),
              List([elementIndex, "value"]).concat(path),
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
          add: (newElement: [K, V]) => {},
          remove: (elementIndex: number) => {},
        }),
      )
      .mapContext(
        (
          _: Context &
            Value<List<[K, V]>> &
            MapFieldState<K, V, KeyFormState, ValueFormState>,
        ): (Context & Value<V> & ValueFormState) | undefined => {
          const element = _.value.get(elementIndex);
          if (element == undefined) return undefined;
          const elementFormState = _.elementFormStates.get(elementIndex) || {
            KeyFormState: KeyFormState.Default(),
            ValueFormState: ValueFormState.Default(),
          };
          const elementVisibility = _.elementVisibilities[elementIndex]?.value;
          const elementDisabled = _.elementDisabled[elementIndex]?.value;
          const elementContext: Context & Value<V> & ValueFormState = {
            ..._,
            ...elementFormState.ValueFormState,
            value: element[1],
            visibilities: elementVisibility,
            disabledFields: elementDisabled,
          };
          return elementContext;
        },
      )
      .mapState(
        (
          _: BasicUpdater<ValueFormState>,
        ): Updater<MapFieldState<K, V, KeyFormState, ValueFormState>> =>
          MapFieldState<
            K,
            V,
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
    Context & Value<List<[K, V]>> & { disabled: boolean },
    MapFieldState<K, V, KeyFormState, ValueFormState>,
    ForeignMutationsExpected & { onChange: OnChange<List<[K, V]>> },
    MapFieldView<
      K,
      V,
      KeyFormState,
      ValueFormState,
      Context,
      ForeignMutationsExpected
    >
  >((props) => (
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
              ListRepo.Updaters.push([Key.Default(), Value.Default()]),
              List([{ kind: "add" }]),
            );
          },
          remove: (_) => {
            props.foreignMutations.onChange(
              ListRepo.Updaters.remove(_),
              List([_, { kind: "remove" }]),
            );
          },
        }}
        embeddedKeyTemplate={embeddedKeyTemplate}
        embeddedValueTemplate={embeddedValueTemplate}
      />
    </>
  )).any([
    ValidateRunner<
      Context & { disabled: boolean },
      MapFieldState<K, V, KeyFormState, ValueFormState>,
      ForeignMutationsExpected,
      List<[K, V]>
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
