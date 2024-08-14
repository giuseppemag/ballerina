import { OrderedMap } from "immutable";
import { BasicUpdater, Updater } from "../fun/domains/updater/state";
import { AsyncState } from "../async/state";
import { Unit } from "../fun/domains/unit/state";
import { BasicFun } from "../fun/state";
export type StreamingStatus = "reload" | "loadMore" | false;
type Identifiable = {
    id: string;
};
export type StreamPosition = {
    chunkSize: number;
    chunkIndex: number;
    shouldLoad: StreamingStatus;
    lastModifiedTime: number;
};
export declare const StreamPosition: {
    Default: (initialChunkSize: number, shouldLoad?: StreamingStatus) => StreamPosition;
    Updaters: {
        Template: {
            changeChunkSize: (chunkSize: number) => Updater<StreamPosition>;
            reload: () => Updater<StreamPosition>;
            loadMore: () => Updater<StreamPosition>;
        };
        Core: {
            chunkSize: import("../fun/domains/updater/domains/simpleUpdater/state").Widening<StreamPosition, "chunkSize">;
            chunkIndex: import("../fun/domains/updater/domains/simpleUpdater/state").Widening<StreamPosition, "chunkIndex">;
            shouldLoad: import("../fun/domains/updater/domains/simpleUpdater/state").Widening<StreamPosition, "shouldLoad">;
            lastModifiedTime: import("../fun/domains/updater/domains/simpleUpdater/state").Widening<StreamPosition, "lastModifiedTime">;
        };
        Coroutine: {};
    };
};
export type Chunk<Element extends Identifiable> = {
    hasMoreValues: boolean;
    data: OrderedMap<Element["id"], Element>;
};
export type InfiniteStreamState<Element extends Identifiable> = {
    loadingMore: AsyncState<Unit>;
    loadedElements: OrderedMap<StreamPosition["chunkIndex"], Chunk<Element>>;
    position: StreamPosition;
    getChunk: BasicFun<[StreamPosition], Promise<Chunk<Element>>>;
};
export declare const InfiniteStreamState: <Element extends Identifiable>() => {
    Default: (initialChunkSize: number, getChunk: InfiniteStreamState<Element>["getChunk"], shouldLoad?: StreamingStatus) => InfiniteStreamState<Element>;
    Operations: {
        shouldCoroutineRun: (current: InfiniteStreamState<Element>) => boolean;
        loadNextPage: (current: InfiniteStreamState<Element>) => boolean;
    };
    Updaters: {
        Coroutine: {
            addLoadedChunk: (chunkIndex: number, newChunk: Chunk<Element>) => Updater<InfiniteStreamState<Element>>;
        };
        Core: {
            whenNotAlreadyLoading: (_: BasicUpdater<InfiniteStreamState<Element>>) => Updater<InfiniteStreamState<Element>>;
            position: (positionUpdater: Updater<InfiniteStreamState<Element>["position"]>) => Updater<InfiniteStreamState<Element>>;
            clearLoadedElements: () => Updater<InfiniteStreamState<Element>>;
            loadedElements: import("../fun/domains/updater/domains/simpleUpdater/state").Widening<InfiniteStreamState<Element>, "loadedElements">;
            loadingMore: import("../fun/domains/updater/domains/simpleUpdater/state").Widening<InfiniteStreamState<Element>, "loadingMore">;
            getChunk: import("../fun/domains/updater/domains/simpleUpdater/state").Widening<InfiniteStreamState<Element>, "getChunk">;
        };
        Template: {
            reload: (getChunk: InfiniteStreamState<Element>["getChunk"]) => Updater<InfiniteStreamState<Element>>;
            loadMore: () => Updater<InfiniteStreamState<Element>>;
        };
    };
};
export type InfiniteStreamReadonlyState = Unit;
export type InfiniteStreamWritableState<Element extends {
    id: string;
}> = InfiniteStreamState<Element>;
export {};
//# sourceMappingURL=state.d.ts.map