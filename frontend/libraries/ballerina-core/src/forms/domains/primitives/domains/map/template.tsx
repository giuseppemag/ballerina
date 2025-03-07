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
  ForeignMutationsExpected
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
  validation?: BasicFun<ValueTuple, Promise<FieldValidation>>
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
          props
        ): ForeignMutationsExpected & {
          onChange: OnChange<PredicateValue>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
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
                            ])
                          )
                  )
                )
              ),
              List([elementIndex.toString(), "key"]).concat(path)
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
          add: (newElement: ValueTuple) => {},
          remove: (elementIndex: number) => {},
        })
      )
      .mapContext(
        (
          _: Context &
            Value<ValueTuple> &
            MapFieldState<KeyFormState, ValueFormState>
        ): (Context & Value<ValueTuple> & KeyFormState) | undefined => {
          const element = _.value.values.get(elementIndex) as ValueTuple;
          if (element == undefined) return undefined;
          const elementFormState = _.elementFormStates.get(elementIndex) || {
            KeyFormState: KeyFormState.Default(),
            ValueFormState: ValueFormState.Default(),
          };
          const elementVisibility = _.elementVisibilities[elementIndex]?.key;
          const elementDisabled = _.elementDisabled[elementIndex]?.key;
          const elementContext: Context & Value<ValueTuple> & KeyFormState = {
            ..._,
            ...elementFormState.KeyFormState,
            value: element.values.get(0)!,
            visibilities: elementVisibility,
            disabledFields: elementDisabled,
          };
          return elementContext;
        }
      )
      .mapState(
        (
          _: BasicUpdater<KeyFormState>
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
              })
            )
          )
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
          props
        ): ForeignMutationsExpected & {
          onChange: OnChange<PredicateValue>;
        } => ({
          ...props.foreignMutations,
          onChange: (elementUpdater, path) => {
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
                            ])
                          )
                  )
                )
              ),
              List([elementIndex.toString(), "value"]).concat(path)
            );
            props.setState((_) => ({ ..._, modifiedByUser: true }));
          },
          add: (newElement: ValueTuple) => {},
          remove: (elementIndex: number) => {},
        })
      )
      .mapContext(
        (
          _: Context &
            Value<ValueTuple> &
            MapFieldState<KeyFormState, ValueFormState>
        ): (Context & Value<ValueTuple> & ValueFormState) | undefined => {
          const element = _.value.values.get(elementIndex) as ValueTuple;
          if (element == undefined) return undefined;
          const elementFormState = _.elementFormStates.get(elementIndex) || {
            KeyFormState: KeyFormState.Default(),
            ValueFormState: ValueFormState.Default(),
          };
          const elementVisibility = _.elementVisibilities[elementIndex]?.value;
          const elementDisabled = _.elementDisabled[elementIndex]?.value;
          const elementContext: Context & Value<ValueTuple> & ValueFormState = {
            ..._,
            ...elementFormState.ValueFormState,
            value: element.values.get(1)!,
            visibilities: elementVisibility,
            disabledFields: elementDisabled,
          };
          return elementContext;
        }
      )
      .mapState(
        (
          _: BasicUpdater<ValueFormState>
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
              })
            )
          )
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
              Updater((list) =>
                PredicateValue.Default.tuple(
                  ListRepo.Updaters.push<ValueTuple>(
                    PredicateValue.Default.tuple(
                      List([Key.Default(), Value.Default()])
                    )
                  )(list.values as List<ValueTuple>)
                )
              ),
              List([{ kind: "add" }])
            );
          },
          remove: (_) => {
            props.foreignMutations.onChange(
              Updater((list) =>
                PredicateValue.Default.tuple(
                  ListRepo.Updaters.remove<ValueTuple>(_)(
                    list.values as List<ValueTuple>
                  )
                )
              ),
              List([_, { kind: "remove" }])
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
      MapFieldState<KeyFormState, ValueFormState>,
      ForeignMutationsExpected,
      ValueTuple
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
