import { simpleUpdater, BasicUpdater, Updater, SimpleCallback } from "../../../../../../main";
import { Debounced } from "../../../../../debounced/state";
import { BasicFun } from "../../../../../fun/state";
import { InfiniteStreamState } from "../../../../../infinite-data-stream/state";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, SharedFormState } from "../../../singleton/state";


export type SearchableInfiniteStreamState<Element extends CollectionReference> = 
  SharedFormState &
  { searchText: Debounced<Value<string>>; status: "open" | "closed"; stream: InfiniteStreamState<Element>; getChunk: BasicFun<string, InfiniteStreamState<Element>["getChunk"]>; };
export const SearchableInfiniteStreamState = <Element extends CollectionReference>() => ({
  Default: (searchText: string, getChunk: BasicFun<string, InfiniteStreamState<Element>["getChunk"]>): SearchableInfiniteStreamState<Element> => ({
    ...SharedFormState.Default(),
    searchText: Debounced.Default(Value.Default(searchText)),
    status: "closed",
    getChunk,
    stream: InfiniteStreamState<Element>().Default(10, getChunk(searchText))
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<SearchableInfiniteStreamState<Element>>()("status"),
      ...simpleUpdater<SearchableInfiniteStreamState<Element>>()("stream"),
      ...simpleUpdater<SearchableInfiniteStreamState<Element>>()("searchText"),
    },
    Template: {
      searchText: (_: BasicUpdater<string>): Updater<SearchableInfiniteStreamState<Element>> => SearchableInfiniteStreamState<Element>().Updaters.Core.searchText(
        Debounced.Updaters.Template.value(
          Value.Updaters.value(
            _
          )
        )
      )
    }
  }
});
export type SearchableInfiniteStreamView<Element extends CollectionReference, Context extends FormLabel, ForeignMutationsExpected> = 
  View<
    Context & Value<CollectionSelection<Element>> & SearchableInfiniteStreamState<Element> & {
      hasMoreValues:boolean,
      disabled:boolean
    }, 
    SearchableInfiniteStreamState<Element>, 
    ForeignMutationsExpected & { 
      onChange: OnChange<CollectionSelection<Element>>; 
      toggleOpen:SimpleCallback<void>
      clearSelection:SimpleCallback<void>
      setSearchText:SimpleCallback<string>
      select:SimpleCallback<Element>
      loadMore:SimpleCallback<void>
      reload:SimpleCallback<void>
    }>;
