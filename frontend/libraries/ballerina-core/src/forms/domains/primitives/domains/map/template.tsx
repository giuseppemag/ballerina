import { List } from "immutable";
import { SimpleCallback, BasicFun, Unit, ValidateRunner, Updater, BasicUpdater, MapRepo, ListRepo } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, OnChange } from "../../../singleton/state";
import { MapFieldState, MapFieldView } from "./state";

export const MapForm = <K, V, KeyFormState, ValueFormState, Context extends FormLabel, ForeignMutationsExpected>(
  KeyFormState: { Default: () => KeyFormState },
  ValueFormState: { Default: () => ValueFormState },
  Key: { Default: () => K },
  Value: { Default: () => V },
  keyTemplate: Template<
    Context & Value<K> & KeyFormState,
    KeyFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<K>;
    }>,
  valueTemplate: Template<
    Context & Value<V> & ValueFormState,
    ValueFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<V>;
    }>,
  validation?: BasicFun<List<[K, V]>, Promise<FieldValidation>>,
) => {
  const embeddedKeyTemplate = (elementIndex: number) =>
    keyTemplate
      .mapForeignMutations((_: ForeignMutationsExpected & {
        onChange: OnChange<List<[K, V]>>;
        add: SimpleCallback<Unit>;
        remove: SimpleCallback<number>;
      }): ForeignMutationsExpected & {
        onChange: OnChange<K>;
      } =>
      ({
        ..._,
        onChange: (elementUpdater, path) => {
          _.onChange(Updater((elements: List<[K, V]>) => elements.update(elementIndex, (_: [K, V] | undefined) => _ == undefined ? _ : [elementUpdater(_[0]), _[1]])), path)
        },
        add: (newElement: [K, V]) => { },
        remove: (elementIndex: number) => { }
      })
      )
      .mapContext((_: Context & Value<List<[K, V]>> & MapFieldState<K, V, KeyFormState, ValueFormState>): (Context & Value<K> & KeyFormState) | undefined => {
        const element = _.value.get(elementIndex)
        if (element == undefined) return undefined
        const elementFormState = _.elementFormStates.get(elementIndex) || { KeyFormState: KeyFormState.Default(), ValueFormState: ValueFormState.Default() }
        const elementContext: Context & Value<K> & KeyFormState = ({ ..._, ...elementFormState.KeyFormState, value: element[0] })
        return elementContext
      })
      .mapState((_: BasicUpdater<KeyFormState>): Updater<MapFieldState<K, V, KeyFormState, ValueFormState>> =>
        MapFieldState<K, V, KeyFormState, ValueFormState>().Updaters.Core.elementFormStates(
          MapRepo.Updaters.upsert(elementIndex, () => ({ KeyFormState: KeyFormState.Default(), ValueFormState: ValueFormState.Default() }), current => ({ ...current, KeyFormState:_(current.KeyFormState) }))
        ))
  const embeddedValueTemplate = (elementIndex: number) =>
    valueTemplate
      .mapForeignMutations((_: ForeignMutationsExpected & {
        onChange: OnChange<List<[K, V]>>;
        add: SimpleCallback<Unit>;
        remove: SimpleCallback<number>;
      }): ForeignMutationsExpected & {
        onChange: OnChange<V>;
      } =>
      ({
        ..._,
        onChange: (elementUpdater, path) => {
          _.onChange(Updater((elements: List<[K, V]>) => elements.update(elementIndex, (_: [K, V] | undefined) => _ == undefined ? _ : [_[0], elementUpdater(_[1])])), path)
        },
        add: (newElement: [K, V]) => { },
        remove: (elementIndex: number) => { }
      })
      )
      .mapContext((_: Context & Value<List<[K, V]>> & MapFieldState<K, V, KeyFormState, ValueFormState>): (Context & Value<V> & ValueFormState) | undefined => {
        const element = _.value.get(elementIndex)
        if (element == undefined) return undefined
        const elementFormState = _.elementFormStates.get(elementIndex) || { KeyFormState: KeyFormState.Default(), ValueFormState: ValueFormState.Default() }
        const elementContext: Context & Value<V> & ValueFormState = ({ ..._, ...elementFormState.ValueFormState, value: element[1] })
        return elementContext
      })
      .mapState((_: BasicUpdater<ValueFormState>): Updater<MapFieldState<K, V, KeyFormState, ValueFormState>> =>
        MapFieldState<K, V, KeyFormState, ValueFormState>().Updaters.Core.elementFormStates(
          MapRepo.Updaters.upsert(elementIndex, () => ({ KeyFormState: KeyFormState.Default(), ValueFormState: ValueFormState.Default() }), current => ({ ...current, ValueFormState: _(current.ValueFormState) }))
        ))
  return Template.Default<Context & Value<List<[K, V]>> & { disabled: boolean }, MapFieldState<K, V, KeyFormState, ValueFormState>, ForeignMutationsExpected & { onChange: OnChange<List<[K, V]>>; },
    MapFieldView<K, V, KeyFormState, ValueFormState, Context, ForeignMutationsExpected>>(props => <>
      <props.view {...props}
        context={{
          ...props.context,
        }}
        foreignMutations={{
          ...props.foreignMutations,
          add: (_) => {
            props.foreignMutations.onChange(
              ListRepo.Updaters.push([Key.Default(), Value.Default()]), List()
            )
          },
          remove: (_) => {
            props.foreignMutations.onChange(
              ListRepo.Updaters.remove(_), List()
            )
          }
        }}
        embeddedKeyTemplate={embeddedKeyTemplate}
        embeddedValueTemplate={embeddedValueTemplate}
      />
    </>
    ).any([
      ValidateRunner<Context & { disabled: boolean }, MapFieldState<K, V, KeyFormState, ValueFormState>, ForeignMutationsExpected, List<[K, V]>>(
        validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
      ),
    ]);
};
