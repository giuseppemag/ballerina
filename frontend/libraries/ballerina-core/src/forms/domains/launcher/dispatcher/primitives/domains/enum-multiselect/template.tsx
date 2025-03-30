import { List, OrderedMap, Map } from "immutable";
import {
  AsyncState,
  BasicFun,
  CoTypedFactory,
  Guid,
  PredicateValue,
  replaceWith,
  Synchronize,
  Unit,
  ValidateRunner,
  ValueRecord,
} from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import {
  FieldValidation,
  FieldValidationWithPath,
  OnChange,
} from "../../../singleton/state";
import { BaseEnumContext, EnumFormState } from "../enum/state";
import { EnumMultiselectView } from "./state";

export const EnumMultiselectForm = <
  Context extends FormLabel & BaseEnumContext,
  ForeignMutationsExpected,
>(
  validation?: BasicFun<ValueRecord, Promise<FieldValidation>>,
) => {
  const Co = CoTypedFactory<
    Context &
      Value<ValueRecord> &
      EnumFormState & { disabled: boolean; visible: boolean },
    EnumFormState
  >();
  return Template.Default<
    Context & Value<ValueRecord> & { disabled: boolean; visible: boolean },
    EnumFormState,
    ForeignMutationsExpected & {
      onChange: OnChange<ValueRecord>;
    },
    EnumMultiselectView<Context, ForeignMutationsExpected>
  >((props) => {
    return (
      <>
        <props.view
          {...props}
          context={{
            ...props.context,
            selectedIds: props.context.value.fields.keySeq().toArray(),
            activeOptions: !AsyncState.Operations.hasValue(
              props.context.customFormState.options.sync,
            )
              ? "loading"
              : props.context.customFormState.options.sync.value
                  .valueSeq()
                  .toArray(),
          }}
          foreignMutations={{
            ...props.foreignMutations,
            setNewValue: (_) => {
              if (
                !AsyncState.Operations.hasValue(
                  props.context.customFormState.options.sync,
                )
              )
                return;
              const options = props.context.customFormState.options.sync.value;
              const newSelection = _.flatMap((_) => {
                const selectedItem = options.get(_);
                if (selectedItem != undefined) {
                  const item: [string, ValueRecord] = [_, selectedItem];
                  return [item];
                }
                return [];
              });
              props.foreignMutations.onChange(
                replaceWith(PredicateValue.Default.record(Map(newSelection))),
                List(),
              );
            },
          }}
        />
      </>
    );
  }).any([
    ValidateRunner<
      Context & { disabled: boolean; visible: boolean },
      EnumFormState,
      ForeignMutationsExpected,
      ValueRecord
    >(
      validation
        ? (_) =>
            validation(_).then(
              FieldValidationWithPath.Default.fromFieldValidation,
            )
        : undefined,
    ),
    Co.Template<
      ForeignMutationsExpected & {
        onChange: OnChange<ValueRecord>;
      }
    >(
      Co.GetState().then((current) =>
        Synchronize<Unit, OrderedMap<Guid, ValueRecord>>(
          current.getOptions,
          () => "transient failure",
          5,
          50,
        ).embed(
          (_) => _.customFormState.options,
          (_) => (current) => ({
            ...current,
            customFormState: {
              ...current.customFormState,
              options: _(current.customFormState.options),
            },
          }),
        ),
      ),
      {
        interval: 15,
        runFilter: (props) =>
          !AsyncState.Operations.hasValue(
            props.context.customFormState.options.sync,
          ),
      },
    ),
  ]);
};
