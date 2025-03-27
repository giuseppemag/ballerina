import {
  simpleUpdater,
  BasicUpdater,
  Updater,
  SimpleCallback,
  replaceWith,
  simpleUpdaterWithChildren,
  ValueOption,
} from "../../../../../../main";
import { Debounced } from "../../../../../debounced/state";
import { BasicFun } from "../../../../../fun/state";
import { InfiniteStreamState } from "../../../../../infinite-data-stream/state";
import { View } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { CollectionReference } from "../../../collection/domains/reference/state";
import { CollectionSelection } from "../../../collection/domains/selection/state";
import { FormLabel } from "../../../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../../../singleton/state";

export type SearchableInfiniteStreamState = {
  commonFormState: CommonFormState;
  customFormState: {
    searchText: Debounced<Value<string>>;
    status: "open" | "closed";
    stream: InfiniteStreamState<CollectionReference>;
    getChunk: BasicFun<
      string,
      InfiniteStreamState<CollectionReference>["getChunk"]
    >;
  };
};
export const SearchableInfiniteStreamState = () => ({
  Default: (
    searchText: string,
    getChunk: BasicFun<
      string,
      InfiniteStreamState<CollectionReference>["getChunk"]
    >,
  ): SearchableInfiniteStreamState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {
      searchText: Debounced.Default(Value.Default(searchText)),
      status: "closed",
      getChunk,
      stream: InfiniteStreamState<CollectionReference>().Default(
        10,
        getChunk(searchText),
      ),
    },
  }),
  Updaters: {
    Core: {
      ...simpleUpdaterWithChildren<SearchableInfiniteStreamState>()({
        ...simpleUpdater<SearchableInfiniteStreamState["customFormState"]>()(
          "status",
        ),
        ...simpleUpdater<SearchableInfiniteStreamState["customFormState"]>()(
          "stream",
        ),
        ...simpleUpdater<SearchableInfiniteStreamState["customFormState"]>()(
          "searchText",
        ),
      })("customFormState"),
    },
    Template: {
      searchText: (
        _: BasicUpdater<string>,
      ): Updater<SearchableInfiniteStreamState> =>
        SearchableInfiniteStreamState().Updaters.Core.customFormState.children.searchText(
          Debounced.Updaters.Template.value(Value.Updaters.value(_)),
        ),
    },
  },
});
export type SearchableInfiniteStreamView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<ValueOption> &
    SearchableInfiniteStreamState & {
      hasMoreValues: boolean;
      disabled: boolean;
      visible: boolean;
    },
  SearchableInfiniteStreamState,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueOption>;
    toggleOpen: SimpleCallback<void>;
    clearSelection?: SimpleCallback<void>;
    setSearchText: SimpleCallback<string>;
    select: SimpleCallback<ValueOption>;
    loadMore: SimpleCallback<void>;
    reload: SimpleCallback<void>;
  }
>;
