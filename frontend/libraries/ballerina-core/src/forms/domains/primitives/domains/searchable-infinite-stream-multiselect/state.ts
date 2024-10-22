import { OrderedMap } from "immutable";
import { Guid, SimpleCallback } from "../../../../../../main";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange } from "../../../singleton/state";
import { SearchableInfiniteStreamState } from "../searchable-infinite-stream/state";


export type InfiniteStreamMultiselectView<Element extends CollectionReference, Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<OrderedMap<Guid, Element>> & SearchableInfiniteStreamState<Element> & {
      hasMoreValues:boolean,
      isLoading:boolean,
      availableOptions:Array<Element>,
      disabled: boolean
    }, 
    SearchableInfiniteStreamState<Element>, 
    ForeignMutationsExpected & { 
      onChange: OnChange<OrderedMap<Guid, Element>>; 
      toggleOpen:SimpleCallback<void>
      clearSelection:SimpleCallback<void>
      setSearchText:SimpleCallback<string>
      toggleSelection:SimpleCallback<Element>
      loadMore:SimpleCallback<void>
      reload:SimpleCallback<void>
  }>;
