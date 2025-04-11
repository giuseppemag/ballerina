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

export type TableState = {
  commonFormState: CommonFormState;
  customFormState: {
    streamParams: Debounced<Map<string, string>>;
    stream: InfiniteStreamState<any>; // TODO: consider if its worth typing this
    getChunk: BasicFun<
      Map<string, string>,
      InfiniteStreamState<any>["getChunk"] // TODO: consider if its worth typing this
    >;
  };
};
export const TableState = () => ({
  Default: (
    getChunk: BasicFun<
      Map<string, string>,
      InfiniteStreamState<any>["getChunk"]
    >,
  ): TableState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {
      streamParams: Debounced.Default(Map()),
      getChunk,
      stream: InfiniteStreamState<any>().Default(10, getChunk(Map())),
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
