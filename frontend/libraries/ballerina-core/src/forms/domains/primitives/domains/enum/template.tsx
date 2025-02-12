import { List, OrderedMap } from "immutable";
import { AsyncState, BasicFun, BasicPredicate, CoTypedFactory, Debounce, Debounced, Guid, replaceWith, Synchronize, Unit, ValidateRunner } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference, EnumReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, ValidationError } from "../../../singleton/state";
import { BaseEnumContext, EnumFormState, EnumView } from "./state";


export const EnumForm = <Context extends FormLabel & BaseEnumContext<Element>, ForeignMutationsExpected, Element extends EnumReference>(
  validation?: BasicFun<CollectionSelection<Element>, Promise<FieldValidation>>
) => {
  const Co = CoTypedFactory<Context & Value<CollectionSelection<Element>> & { disabled:boolean }, EnumFormState<Context, Element>>()
  return Template.Default<Context & Value<CollectionSelection<Element>> & { disabled:boolean }, EnumFormState<Context, Element>, ForeignMutationsExpected & { onChange: OnChange<CollectionSelection<Element>>; },
    EnumView<Context, Element, ForeignMutationsExpected>>(props => {
      return <>
      <props.view {...props}
        context={{
          ...props.context,
          activeOptions: !AsyncState.Operations.hasValue(props.context.customFormState.options.sync) ? "loading"
            : props.context.customFormState.options.sync.value.valueSeq().toArray()
        }}
        foreignMutations={{
          ...props.foreignMutations,
          setNewValue: (_) => {
            if (!AsyncState.Operations.hasValue(props.context.customFormState.options.sync)) return
            const newSelection = props.context.customFormState.options.sync.value.get(_);
            if (newSelection == undefined)
              return props.foreignMutations.onChange(replaceWith(CollectionSelection<Element>().Default.right("no selection")), List());
            else
              return props.foreignMutations.onChange(replaceWith(CollectionSelection<Element>().Default.left(newSelection)), List());

          }
        }} />
    </>}
    ).any([
      ValidateRunner<Context & { disabled:boolean }, EnumFormState<Context, Element>, ForeignMutationsExpected, CollectionSelection<Element>>(
        validation ? _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation) : undefined
      ),
      Co.Template<ForeignMutationsExpected & { onChange: OnChange<CollectionSelection<Element>>; }>(
        Co.GetState().then(current =>
          { 
            return Synchronize<Unit, OrderedMap<Guid, Element>>(current.getOptions, () => "transient failure", 5, 50)
            .embed(_ =>  _.customFormState.options,
               _ => current => ({ ...current, customFormState: { ...current.customFormState, options: _(current.customFormState.options) } })
              )}
        ),
        {
          interval: 15,
          runFilter: props => !AsyncState.Operations.hasValue(props.context.customFormState.options.sync)
        }
      )
    ]);
}
