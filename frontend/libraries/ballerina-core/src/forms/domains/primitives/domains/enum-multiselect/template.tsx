import { List, OrderedMap } from "immutable";
import { AsyncState, BasicFun, BasicPredicate, CoTypedFactory, Debounce, Debounced, Guid, OrderedMapRepo, replaceWith, Synchronize, Unit, ValidateRunner } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, CommonFormState, ValidationError } from "../../../singleton/state";
import { BaseEnumContext, EnumFormState } from "../enum/state";
import { EnumMultiselectView } from "./state";


export const EnumMultiselectForm = <Context extends FormLabel & BaseEnumContext<Context, Element>, ForeignMutationsExpected, Element extends CollectionReference>(
  validation?: BasicFun<OrderedMap<Guid, Element>, Promise<FieldValidation>>
) => {
  const Co = CoTypedFactory<Context & Value<OrderedMap<Guid, Element>> & EnumFormState<Context, Element> & { disabled:boolean }, EnumFormState<Context, Element>>()
  return Template.Default<Context & Value<OrderedMap<Guid, Element>> & { disabled: boolean }, EnumFormState<Context, Element>, ForeignMutationsExpected & { onChange: OnChange<OrderedMap<Guid, Element>>; }, EnumMultiselectView<Context, Element, ForeignMutationsExpected>>(props => <>
    <props.view {...props}
      context={{
        ...props.context,
        selectedIds: props.context.value.map(_ => _.id).valueSeq().toArray(),
        activeOptions: !AsyncState.Operations.hasValue(props.context.customFormState.options.sync) ? "loading"
        : props.context.customFormState.options.sync.value.valueSeq().filter(o => o[1](props.context)).map(o => o[0]).toArray()
      }}
      foreignMutations={{
        ...props.foreignMutations,
        setNewValue: (_) => {
          if (!AsyncState.Operations.hasValue(props.context.customFormState.options.sync)) return
          const options = props.context.customFormState.options.sync.value
          const newSelection = _
            .flatMap(_ => {
              const selectedItem = options.get(_);
              if (selectedItem != undefined) return [selectedItem[0]];
              return [];
            });

          props.foreignMutations.onChange(replaceWith(OrderedMapRepo.Default.fromSmallIdentifiables(newSelection)), List());
        }
      }}
    />
  </>
  ).any([
    ValidateRunner<Context & { disabled:boolean }, EnumFormState<Context, Element>, ForeignMutationsExpected, OrderedMap<Guid, Element>>(
      validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
    ),
    Co.Template<ForeignMutationsExpected & { onChange: OnChange<OrderedMap<Guid, Element>>; }>(
      Co.GetState().then(current =>
        Synchronize<Unit, OrderedMap<Guid, [Element, BasicPredicate<Context>]>>(current.getOptions, () => "transient failure", 5, 50)
          .embed(_ => _.customFormState.options, _ => current => ({ ...current, customFormState: { ...current.customFormState, options: _(current.customFormState.options) } }))
      ),
      {
        interval: 15,
        runFilter: props => !AsyncState.Operations.hasValue(props.context.customFormState.options.sync)
      }
    )
]);
}
