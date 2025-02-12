import { OrderedMap } from "immutable";
import { Guid, BasicPredicate, SimpleCallback, Synchronized, Unit, unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference, EnumReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";


export type BaseEnumContext<Element extends EnumReference> = { getOptions:() => Promise<OrderedMap<Guid, Element>> }
export type EnumFormState<Context, Element extends EnumReference> = 
    { commonFormState: CommonFormState,
      customFormState: { options: Synchronized<Unit, OrderedMap<Guid, Element>>; }; };
export const EnumFormState = <Context extends BaseEnumContext< Element >, Element extends EnumReference>() => ({
  Default: (): EnumFormState<Context, Element> => ({ 
    commonFormState: CommonFormState.Default(),
    customFormState: { options: Synchronized.Default(unit) }
  }),
});
export type EnumView<Context extends FormLabel & BaseEnumContext<Element>, Element extends EnumReference, ForeignMutationsExpected> = View<
  Context & Value<CollectionSelection<Element>> & EnumFormState<Context, Element> & 
  { activeOptions: "loading" | Array<Element>; } & { disabled:boolean }, EnumFormState<Context, Element>, 
  ForeignMutationsExpected & { 
    onChange: OnChange<CollectionSelection<Element>>; 
    setNewValue: SimpleCallback<Guid> 
  }>;
