import { AsyncState } from "../../async/state";
import { replaceWith } from "../../fun/domains/updater/domains/replaceWith/state";
import { ValueInfiniteStreamState, ValueStreamPosition } from "../state";
import { ValueStreamCo } from "./builder";

export const ValueInfiniteStreamLoader = () => {
  const Co = ValueStreamCo();
  const updaters = ValueInfiniteStreamState().Updaters;
  // const operations = InfiniteStreamState<Element>().Operations;

  return Co.Seq([
    Co.SetState(
      updaters.Core.loadingMore(replaceWith(AsyncState.Default.loading())),
    ),
    Co.While(
      ([current]) => current.loadingMore.kind != "loaded",
      Co.GetState().then((current) => {
        return Co.Await(
          () => current.getChunk([current.position]),
          () => "error" as const,
        ).then((apiResult) => {
          if (apiResult.kind == "l") {
            return Co.SetState(
              updaters.Core.loadingMore(
                replaceWith(AsyncState.Default.loaded({})),
              ).then(
                updaters.Coroutine.addLoadedChunk(
                  current.position.chunkIndex,
                  apiResult.value,
                ).then(
                  updaters.Core.position(
                    ValueStreamPosition.Updaters.Core.shouldLoad(
                      replaceWith<ValueStreamPosition["shouldLoad"]>(false),
                    ),
                  ),
                ),
              ),
            );
          } else {
            return Co.Wait(500);
          }
        });
      }),
    ),
  ]);
};

