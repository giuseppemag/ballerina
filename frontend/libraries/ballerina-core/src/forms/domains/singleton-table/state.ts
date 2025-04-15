import { Map, OrderedMap } from "immutable";

import {
  simpleUpdater,
  BasicUpdater,
  Updater,
  SimpleCallback,
  simpleUpdaterWithChildren,
  ValueOption,
  MapRepo,
  ValueOrErrors,
  PredicateValue,
  TableApiSource,
  ParsedType,
  Sum,
  ValueRecord,
} from "../../../../main";
import { Debounced } from "../../../debounced/state";
import { BasicFun } from "../../../fun/state";
import { View } from "../../../template/state";
import { Value } from "../../../value/state";
import { FormLabel } from "../singleton/domains/form-label/state";
import { OnChange, CommonFormState } from "../singleton/state";
import { ValueInfiniteStreamState } from "../../../value-infinite-data-stream/state";

export type TableReadonlyContext = {
  tableApiSource: TableApiSource;
  fromApiParserByType: (
    type: ParsedType<any>,
  ) => (value: any) => ValueOrErrors<PredicateValue, string>;
  type: ParsedType<any>;
};

export type TableState = {
  commonFormState: CommonFormState;
  customFormState: {
    isInitialized: boolean;
    streamParams: Debounced<Map<string, string>>;
    stream: ValueInfiniteStreamState;
    getChunkWithParams: BasicFun<
      Map<string, string>,
      ValueInfiniteStreamState["getChunk"]
    >;
  };
};
export const TableState = () => ({
  Default: (): TableState => ({
    commonFormState: CommonFormState.Default(),
    customFormState: {
      isInitialized: false,
      streamParams: Debounced.Default(Map()),
      getChunkWithParams: undefined as any,
      stream: undefined as any,
    },
  }),
  Updaters: {
    Core: {
      ...simpleUpdaterWithChildren<TableState>()({
        ...simpleUpdater<TableState["customFormState"]>()("getChunkWithParams"),
        ...simpleUpdater<TableState["customFormState"]>()("stream"),
        ...simpleUpdater<TableState["customFormState"]>()("streamParams"),
        ...simpleUpdater<TableState["customFormState"]>()("isInitialized"),
      })("customFormState"),
    },
    Template: {
      searchText: (key: string, _: BasicUpdater<string>): Updater<TableState> =>
        TableState().Updaters.Core.customFormState.children.streamParams(
          Debounced.Updaters.Template.value(
            MapRepo.Updaters.upsert(key, () => "", _),
          ),
        ),
      loadMore: (): Updater<TableState> =>
        TableState().Updaters.Core.customFormState.children.stream(
          ValueInfiniteStreamState().Updaters.Template.loadMore(),
        ),
    },
  },
  Operations: {
    tableValuesToValueRecord: (
      values: any,
      fromApiRaw: (value: any) => ValueOrErrors<PredicateValue, string>,
    ): ValueRecord => {
      return PredicateValue.Default.record(
        OrderedMap(
          Object.entries(values)
            .map(([Id, _]) => {
              const parsedRow = fromApiRaw(_);
              if (parsedRow.kind == "errors") {
                console.error(parsedRow.errors.toJS());
                return [Id, PredicateValue.Default.record(Map())];
              }
              return [Id, parsedRow.value];
            })
            .reduce((acc, [Id, value]) => {
              acc[Id as string] = value;
              return acc;
            }, {} as any),
        ),
      );
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
