import { replaceWith } from "../../../../../../Shared/widgets-library/widgets-main";
import { AsyncState } from "../../../state/async";
import { InfiniteStreamState, StreamPosition } from "../state";
import { StreamCo } from "./coFactory";

export const Loader = <Element extends { id: string }>() => {
  const Co = StreamCo<Element>();
  const updaters = InfiniteStreamState<Element>().Updaters;
  const operations = InfiniteStreamState<Element>().Operations;

  const LoadCurrentChunk = Co.Seq([
    Co.SetState(
      updaters.Core.loadingMore(replaceWith(AsyncState.Default.loading()))
    ),
    Co.While(
      ([current]) => current.loadingMore.kind != "loaded",
      Co.GetState().then((current) =>
        Co.Await(
          () => current.getChunk([current.position, current.headers]),
          () => "error" as const
        ).then((apiResult) => {
          if (apiResult.kind == "l") {
            return Co.SetState(
              updaters.Core.loadingMore(
                replaceWith(AsyncState.Default.loaded({}))
              ).then(
                updaters.Coroutine.addLoadedChunk(
                  current.position.chunkIndex,
                  apiResult.v
                ).then(
                  updaters.Core.position(
                    StreamPosition.Updaters.Core.shouldLoad(
                      replaceWith<StreamPosition["shouldLoad"]>(false)
                    )
                  )
                )
              )
            );
          } else {
            return Co.Wait(500);
          }
        })
      )
    ),
  ]);

  const LoadMoreForever = Co.While(
    () => true,
    Co.GetState().then((current) => {
      if (operations.loadNextPage(current)) return LoadCurrentChunk;
      else return Co.Wait(250);
    })
  );

  return LoadMoreForever;
};
