import { OrderedMap } from "immutable";
import { Guid, BasicPredicate, SimpleCallback, Synchronized, Unit, unit } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/state";


export type BaseEnumContext<Context, Element extends CollectionReference> = { getOptions:() => Promise<OrderedMap<Guid, [Element, BasicPredicate<Context>]>> }
export type EnumFormState<Context, Element extends CollectionReference> = 
  SharedFormState & { 
    options: Synchronized<Unit, OrderedMap<Guid, [Element, BasicPredicate<Context>]>>; };
export const EnumFormState = <Context extends BaseEnumContext<Context, Element>, Element extends CollectionReference>() => ({
  Default: (): EnumFormState<Context, Element> => ({ 
    ...SharedFormState.Default(),
    options:Synchronized.Default(unit)
  }),
});
export type EnumView<Context extends FormLabel & BaseEnumContext<Context, Element>, Element extends CollectionReference, ForeignMutationsExpected> = View<
  Context & Value<CollectionSelection<Element>> & EnumFormState<Context, Element> & 
  { activeOptions: "loading" | Array<Element>; } & { disabled:boolean }, EnumFormState<Context, Element>, 
  ForeignMutationsExpected & { 
    onChange: OnChange<CollectionSelection<Element>>; 
    setNewValue: SimpleCallback<Guid> 
  }>;
