import { simpleUpdater, BasicUpdater, Updater, SimpleCallback, replaceWith, simpleUpdaterWithChildren } from "../../../../../../main";
import { Debounced } from "../../../../../debounced/state";
import { BasicFun } from "../../../../../fun/state";
import { InfiniteStreamState } from "../../../../../infinite-data-stream/state";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { StreamValue } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";


export type SearchableInfiniteStreamState<Element extends StreamValue> = 
  { commonFormState: CommonFormState,
    customFormState: { searchText: Debounced<Value<string>>; status: "open" | "closed"; stream: InfiniteStreamState<Element>; getChunk: BasicFun<string, InfiniteStreamState<Element>["getChunk"]>; }
   };
export const SearchableInfiniteStreamState = <Element extends StreamValue>() => ({
  Default: (searchText: string, getChunk: BasicFun<string, InfiniteStreamState<Element>["getChunk"]>): SearchableInfiniteStreamState<Element> => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {
      searchText: Debounced.Default(Value.Default(searchText)),
      status: "closed",
      getChunk,
      stream: InfiniteStreamState<Element>().Default(10, getChunk(searchText))
    }
  }),
  Updaters: {
    Core: {
      ...simpleUpdaterWithChildren<SearchableInfiniteStreamState<Element>>()({
        ...simpleUpdater<SearchableInfiniteStreamState<Element>["customFormState"]>()("status"),
        ...simpleUpdater<SearchableInfiniteStreamState<Element>["customFormState"]>()("stream"),
        ...simpleUpdater<SearchableInfiniteStreamState<Element>["customFormState"]>()("searchText"),
      })("customFormState"),
    },
    Template: {
      searchText: (_: BasicUpdater<string>): Updater<SearchableInfiniteStreamState<Element>> =>
        SearchableInfiniteStreamState<Element>().Updaters.Core.customFormState.children.searchText(
          Debounced.Updaters.Template.value(
            Value.Updaters.value(
              _
            )
          )
      )
    }
  }
});
export type SearchableInfiniteStreamView<Element extends StreamValue, Context extends FormLabel, ForeignMutationsExpected> = 
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
