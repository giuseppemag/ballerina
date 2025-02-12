import { OrderedMap } from "immutable";
import { Guid, SimpleCallback } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference, EnumReference } from "../../../collection/domains/reference/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange } from "../../../singleton/state";
import { BaseEnumContext, EnumFormState } from "../enum/state";


export type EnumMultiselectView<Context extends FormLabel & BaseEnumContext<Element>, Element extends EnumReference, ForeignMutationsExpected> = View<
  Context & Value<OrderedMap<Guid, Element>> & EnumFormState<Context, Element> & {
    selectedIds: Array<Guid>;
    activeOptions: "loading" | Array<Element>;
    disabled: boolean
  }, EnumFormState<Context, Element>, ForeignMutationsExpected & { 
    onChange: OnChange<OrderedMap<Guid, Element>>; 
    setNewValue: SimpleCallback<Array<Guid>> 
  }>;
