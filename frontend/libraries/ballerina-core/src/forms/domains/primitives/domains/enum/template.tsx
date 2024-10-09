import { List, OrderedMap } from "immutable";
import { AsyncState, BasicFun, BasicPredicate, CoTypedFactory, Debounce, Debounced, Guid, replaceWith, Synchronize, Unit, ValidateRunner } from "../../../../../../main";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { FieldValidation, FieldValidationWithPath, FormValidatorSynchronized, OnChange, ValidationError } from "../../../singleton/state";
import { BaseEnumContext, EnumFormState, EnumView } from "./state";


export const EnumForm = <Context extends FormLabel & BaseEnumContext<Context, Element>, ForeignMutationsExpected, Element extends CollectionReference>(
  validation: BasicFun<CollectionSelection<Element>, Promise<FieldValidation>>
) => {
  const Co = CoTypedFactory<Context & Value<CollectionSelection<Element>>, EnumFormState<Context, Element>>()
  return Template.Default<Context & Value<CollectionSelection<Element>>, EnumFormState<Context, Element>, ForeignMutationsExpected & { onChange: OnChange<CollectionSelection<Element>>; },
    EnumView<Context, Element, ForeignMutationsExpected>>(props => <>
      <props.view {...props}
        context={{
          ...props.context,
          activeOptions: !AsyncState.Operations.hasValue(props.context.options.sync) ? "loading"
            : props.context.options.sync.value.valueSeq().filter(o => o[1](props.context)).map(o => o[0]).toArray()
        }}
        foreignMutations={{
          ...props.foreignMutations,
          setNewValue: (_) => {
            if (!AsyncState.Operations.hasValue(props.context.options.sync)) return
            const newSelection = props.context.options.sync.value.get(_);
            if (newSelection == undefined)
              return props.foreignMutations.onChange(replaceWith(CollectionSelection<Element>().Default.right("no selection")), List());
            else
              return props.foreignMutations.onChange(replaceWith(CollectionSelection<Element>().Default.left(newSelection[0])), List());

          }
        }} />
    </>
    ).any([
      ValidateRunner<Context, EnumFormState<Context, Element>, ForeignMutationsExpected, CollectionSelection<Element>>(
        _ => validation(_).then(FieldValidationWithPath.Default.fromFieldValidation)
      ),
      Co.Template<ForeignMutationsExpected & { onChange: OnChange<CollectionSelection<Element>>; }>(
        Co.GetState().then(current =>
          Synchronize<Unit, OrderedMap<Guid, [Element, BasicPredicate<Context>]>>(current.getOptions, () => "transient failure", 5, 50)
            .embed(_ => _.options, _ => current => ({ ...current, options: _(current.options) }))
        ),
        {
          interval: 15,
          runFilter: props => !AsyncState.Operations.hasValue(props.context.options.sync)
        }
      )
    ]);
}
