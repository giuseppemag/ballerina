import { Map } from "immutable";

import {
  simpleUpdater,
  BasicUpdater,
  Updater,
  SimpleCallback,
  simpleUpdaterWithChildren,
  ValueOption,
  MapRepo,
  Maybe,
  ValueOrErrors,
  PredicateValue,
} from "../../../../main";
import { Debounced } from "../../../debounced/state";
import { BasicFun } from "../../../fun/state";
import {
  InfiniteStreamState,
  Chunk,
} from "../../../infinite-data-stream/state";
import { View } from "../../../template/state";
import { Value } from "../../../value/state";
import { CollectionReference } from "../collection/domains/reference/state";
import { CollectionSelection } from "../collection/domains/selection/state";
import { FormLabel } from "../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../singleton/state";
import { ValueInfiniteStreamState } from "../../../value-infinite-data-stream/state";

export type TableReadonlyContext = {
  initialChunk: Chunk<any>;
};

export type TableState = {
  commonFormState: CommonFormState;
  customFormState: {
    isInitialized: boolean;
    streamParams: Debounced<Map<string, string>>;
    stream: ValueInfiniteStreamState; // TODO: consider if its worth typing this
    getChunk: BasicFun< 
      BasicFun<any, ValueOrErrors<PredicateValue, string>>,
      BasicFun<Map<string, string>, ValueInfiniteStreamState["getChunk"]>
    >;
  };
};
export const TableState = () => ({
  Default: (
    getChunk: TableState["customFormState"]["getChunk"],
    fromApiRaw: BasicFun<any, ValueOrErrors<PredicateValue, string>>,
  ): TableState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {
      isInitialized: false,
      streamParams: Debounced.Default(Map()),
      getChunk,
      stream: ValueInfiniteStreamState().Default(10, getChunk(fromApiRaw)(Map())),
    },
  }),
  Updaters: {
    Core: {
      ...simpleUpdaterWithChildren<TableState>()({
        ...simpleUpdater<TableState["customFormState"]>()("stream"),
        ...simpleUpdater<TableState["customFormState"]>()("streamParams"),
      })("customFormState"),
    },
    Template: {
      searchText: (key: string, _: BasicUpdater<string>): Updater<TableState> =>
        TableState().Updaters.Core.customFormState.children.streamParams(
          Debounced.Updaters.Template.value(
            MapRepo.Updaters.upsert(key, () => "", _),
          ),
        ),
    },
  },
});
export type TableView<
  Context extends FormLabel,
  ForeignMutationsExpected,
> = View<
  Context &
    Value<ValueOption> &
    TableState & {
      hasMoreValues: boolean;
      disabled: boolean;
    },
  TableState,
  ForeignMutationsExpected & {
    onChange: OnChange<ValueOption>;
    toggleOpen: SimpleCallback<void>;
    setStreamParam: SimpleCallback<string>;
    select: SimpleCallback<ValueOption>;
    loadMore: SimpleCallback<void>;
    reload: SimpleCallback<void>;
  }
>;
