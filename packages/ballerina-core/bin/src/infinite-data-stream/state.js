import { OrderedMap } from "immutable";
import { Updater } from "../fun/domains/updater/state";
import { replaceWith } from "../fun/domains/updater/domains/replaceWith/state";
import { simpleUpdater } from "../fun/domains/updater/domains/simpleUpdater/state";
import { AsyncState } from "../async/state";
export const StreamPosition = {
    Default: (initialChunkSize, shouldLoad = false) => ({
        chunkSize: initialChunkSize,
        chunkIndex: 0,
        shouldLoad,
        lastModifiedTime: Date.now(),
    }),
    Updaters: {
        Template: {
            changeChunkSize: (chunkSize) => StreamPosition.Updaters.Core.chunkSize(replaceWith(chunkSize)).then(StreamPosition.Updaters.Template.reload()),
            reload: () => StreamPosition.Updaters.Core.lastModifiedTime(replaceWith(Date.now()))
                .then(StreamPosition.Updaters.Core.shouldLoad(replaceWith("reload")))
                .then(StreamPosition.Updaters.Core.chunkIndex(replaceWith(0))),
            loadMore: () => StreamPosition.Updaters.Core.chunkIndex((_) => _ + 1).then(StreamPosition.Updaters.Core.lastModifiedTime(replaceWith(Date.now())).then(StreamPosition.Updaters.Core.shouldLoad(replaceWith("loadMore")))),
        },
        Core: Object.assign(Object.assign(Object.assign(Object.assign({}, simpleUpdater()("lastModifiedTime")), simpleUpdater()("shouldLoad")), simpleUpdater()("chunkIndex")), simpleUpdater()("chunkSize")),
        Coroutine: {},
    },
};
export const InfiniteStreamState = () => ({
    Default: (initialChunkSize, getChunk, shouldLoad) => ({
        loadingMore: AsyncState.Default.unloaded(),
        loadedElements: OrderedMap(),
        position: StreamPosition.Default(initialChunkSize, shouldLoad),
        getChunk,
    }),
    Operations: {
        shouldCoroutineRun: (current) => current.position.shouldLoad != false,
        loadNextPage: (current) => {
            var _a;
            return current.position.shouldLoad !== false &&
                ((_a = current.loadedElements.last()) === null || _a === void 0 ? void 0 : _a.hasMoreValues) !== false;
        },
    },
    Updaters: {
        Coroutine: {
            addLoadedChunk: (chunkIndex, newChunk) => InfiniteStreamState().Updaters.Core.loadedElements((_) => _.set(chunkIndex, newChunk)),
        },
        Core: Object.assign(Object.assign(Object.assign(Object.assign({}, simpleUpdater()("getChunk")), simpleUpdater()("loadingMore")), simpleUpdater()("loadedElements")), { whenNotAlreadyLoading: (_) => {
                return Updater((current) => {
                    if (InfiniteStreamState().Operations.loadNextPage(current)) {
                        return current;
                    }
                    return _(current);
                });
            }, position: (positionUpdater) => Updater((current) => {
                const newPosition = positionUpdater(current.position);
                let newState = current;
                if (newPosition.chunkSize != current.position.chunkSize)
                    newState =
                        InfiniteStreamState().Updaters.Core.clearLoadedElements()(newState);
                return Object.assign(Object.assign({}, newState), { position: newPosition });
            }), clearLoadedElements: () => InfiniteStreamState().Updaters.Core.loadedElements((_) => OrderedMap()) }),
        Template: {
            reload: (getChunk) => InfiniteStreamState()
                .Updaters.Core.position(StreamPosition.Updaters.Template.reload())
                .then(InfiniteStreamState().Updaters.Core.clearLoadedElements())
                .then(InfiniteStreamState().Updaters.Core.getChunk(replaceWith(getChunk))),
            loadMore: () => InfiniteStreamState().Updaters.Core.whenNotAlreadyLoading(InfiniteStreamState().Updaters.Core.position(StreamPosition.Updaters.Template.loadMore())),
        },
    },
});
//# sourceMappingURL=state.js.map