import { AsyncState } from "../../async/state";
import { replaceWith } from "../../fun/domains/updater/domains/replaceWith/state";
import { InfiniteStreamState, StreamPosition } from "../state";
import { StreamCo } from "./builder";
export const Loader = () => {
    const Co = StreamCo();
    const updaters = InfiniteStreamState().Updaters;
    // const operations = InfiniteStreamState<Element>().Operations;
    return Co.Seq([
        Co.SetState(updaters.Core.loadingMore(replaceWith(AsyncState.Default.loading()))),
        Co.While(([current]) => current.loadingMore.kind != "loaded", Co.GetState().then((current) => {
            return Co.Await(() => current.getChunk([current.position]), () => "error").then((apiResult) => {
                if (apiResult.kind == "l") {
                    return Co.SetState(updaters.Core.loadingMore(replaceWith(AsyncState.Default.loaded({}))).then(updaters.Coroutine.addLoadedChunk(current.position.chunkIndex, apiResult.value).then(updaters.Core.position(StreamPosition.Updaters.Core.shouldLoad(replaceWith(false))))));
                }
                else {
                    return Co.Wait(500);
                }
            });
        }))
    ]);
};
//# sourceMappingURL=infiniteLoader.js.map