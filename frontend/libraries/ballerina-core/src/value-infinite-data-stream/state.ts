import { OrderedMap, Map } from "immutable";
import { BasicUpdater, Updater } from "../fun/domains/updater/state";
import { replaceWith } from "../fun/domains/updater/domains/replaceWith/state";
import { simpleUpdater } from "../fun/domains/updater/domains/simpleUpdater/state";
import { AsyncState } from "../async/state";
import { Unit } from "../fun/domains/unit/state";
import { BasicFun } from "../fun/state";
import { ValueRecord } from "../../main";

export type ValueStreamingStatus = "reload" | "loadMore" | false;

export type ValueStreamPosition = {
  chunkSize: number;
  chunkIndex: number;
  shouldLoad: ValueStreamingStatus;
  lastModifiedTime: number;
};

export const ValueStreamPosition = {
  Default: (
    initialChunkSize: number,
    shouldLoad: ValueStreamingStatus = false,
  ): ValueStreamPosition => ({
    chunkSize: initialChunkSize,
    chunkIndex: 0,
    shouldLoad,
    lastModifiedTime: Date.now(),
  }),
  Updaters: {
    Template: {
      changeChunkSize: (chunkSize: number): Updater<ValueStreamPosition> =>
        ValueStreamPosition.Updaters.Core.chunkSize(
          replaceWith(chunkSize),
        ).then(ValueStreamPosition.Updaters.Template.reload()),
      reload: (): Updater<ValueStreamPosition> =>
        ValueStreamPosition.Updaters.Core.lastModifiedTime(
          replaceWith(Date.now()),
        )
          .then(
            ValueStreamPosition.Updaters.Core.shouldLoad(
              replaceWith<ValueStreamPosition["shouldLoad"]>("reload"),
            ),
          )
          .then(
            ValueStreamPosition.Updaters.Core.chunkIndex(
              replaceWith<ValueStreamPosition["chunkIndex"]>(0),
            ),
          ),
      loadMore: (): Updater<ValueStreamPosition> =>
        ValueStreamPosition.Updaters.Core.chunkIndex((_) => _ + 1).then(
          ValueStreamPosition.Updaters.Core.lastModifiedTime(
            replaceWith(Date.now()),
          ).then(
            ValueStreamPosition.Updaters.Core.shouldLoad(
              replaceWith<ValueStreamPosition["shouldLoad"]>("loadMore"),
            ),
          ),
        ),
    },
    Core: {
      ...simpleUpdater<ValueStreamPosition>()("lastModifiedTime"),
      ...simpleUpdater<ValueStreamPosition>()("shouldLoad"),
      ...simpleUpdater<ValueStreamPosition>()("chunkIndex"),
      ...simpleUpdater<ValueStreamPosition>()("chunkSize"),
    },
    Coroutine: {},
  },
};

export type ValueChunk = {
  hasMoreValues: boolean;
  data: ValueRecord;
};
export const ValueChunk = {
  Default: (
    hasMoreValues: boolean,
    data: ValueRecord,
  ): ValueChunk => ({
    hasMoreValues,
    data,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<ValueChunk>()("hasMoreValues"),
      ...simpleUpdater<ValueChunk>()("data"),
    },
  },
};

export type StateChunk = {
  state: Record<string, any>;
};

export const StateChunk = {
  Default: (state: Record<string, any>): StateChunk => ({ state }),
  Updaters: {
    Core: {
      ...simpleUpdater<StateChunk>()("state"),
    },
  },
};

export type ValueInfiniteStreamState = {
  loadingMore: AsyncState<Unit>;
  loadedElements: OrderedMap<ValueStreamPosition["chunkIndex"], ValueChunk>;
  position: ValueStreamPosition;
  getChunk: BasicFun<[ValueStreamPosition], Promise<ValueChunk>>;
  chunkStates: Map<string, StateChunk>;
};

export const ValueInfiniteStreamState = () => ({
  Default: (
    initialChunkSize: number,
    getChunk: ValueInfiniteStreamState["getChunk"],
    shouldLoad?: ValueStreamingStatus,
  ): ValueInfiniteStreamState => ({
    loadingMore: AsyncState.Default.unloaded(),
    loadedElements: OrderedMap(),
    position: ValueStreamPosition.Default(initialChunkSize, shouldLoad),
    getChunk,
    chunkStates: Map(),
  }),
  Operations: {
    shouldCoroutineRun: (current: ValueInfiniteStreamState): boolean =>
      current.position.shouldLoad != false,
    loadNextPage: (current: ValueInfiniteStreamState): boolean =>
      current.position.shouldLoad !== false &&
      current.loadedElements.last()?.hasMoreValues !== false,
  },
  Updaters: {
    Coroutine: {
      addLoadedChunk: (
        chunkIndex: number,
        newChunk: ValueChunk,
      ): Updater<ValueInfiniteStreamState> =>
        ValueInfiniteStreamState().Updaters.Core.loadedElements((_) =>
          _.set(chunkIndex, newChunk),
        ),
    },
    Core: {
      ...simpleUpdater<ValueInfiniteStreamState>()("getChunk"),
      ...simpleUpdater<ValueInfiniteStreamState>()("loadingMore"),
      ...simpleUpdater<ValueInfiniteStreamState>()("loadedElements"),
      ...simpleUpdater<ValueInfiniteStreamState>()("chunkStates"),
      whenNotAlreadyLoading: (
        _: BasicUpdater<ValueInfiniteStreamState>,
      ): Updater<ValueInfiniteStreamState> => {
        return Updater((current) => {
          if (ValueInfiniteStreamState().Operations.loadNextPage(current)) {
            return current;
          }
          return _(current);
        });
      },
      position: (
        positionUpdater: Updater<ValueInfiniteStreamState["position"]>,
      ): Updater<ValueInfiniteStreamState> =>
        Updater((current) => {
          const newPosition = positionUpdater(current.position);
          let newState = current;
          if (newPosition.chunkSize != current.position.chunkSize)
            newState =
              ValueInfiniteStreamState().Updaters.Core.clearLoadedElements()(
                newState,
              );
          return { ...newState, position: newPosition };
        }),
      clearLoadedElements: (): Updater<ValueInfiniteStreamState> =>
        ValueInfiniteStreamState().Updaters.Core.loadedElements((_) =>
          OrderedMap(),
        ),
    },
    Template: {
      reload: (
        getChunk: ValueInfiniteStreamState["getChunk"],
      ): Updater<ValueInfiniteStreamState> =>
        ValueInfiniteStreamState()
          .Updaters.Core.position(
            ValueStreamPosition.Updaters.Template.reload(),
          )
          .then(ValueInfiniteStreamState().Updaters.Core.clearLoadedElements())
          .then(
            ValueInfiniteStreamState().Updaters.Core.getChunk(
              replaceWith(getChunk),
            ),
          ),
      loadMore: (): Updater<ValueInfiniteStreamState> =>
        ValueInfiniteStreamState().Updaters.Core.whenNotAlreadyLoading(
          ValueInfiniteStreamState().Updaters.Core.position(
            ValueStreamPosition.Updaters.Template.loadMore(),
          ),
        ),
    },
  },
});

export type ValueInfiniteStreamReadonlyContext = Unit;
export type ValueInfiniteStreamWritableState = ValueInfiniteStreamState;
