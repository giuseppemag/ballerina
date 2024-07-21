import { InfiniteStreamReadonlyState, InfiniteStreamWritableState, InfiniteStreamState } from "../state";
import { StreamCo } from "./builder";
import { Loader } from "./infiniteLoader";

export const StreamDataLoader =
  <Element extends { id: string }, foreignMutations>() => {
    const operations = InfiniteStreamState<Element>().Operations;
    const LoaderTemplate = StreamCo<Element>().Template<foreignMutations>(Loader<Element>(), { 
      runFilter:props => operations.shouldCoroutineRun(props.context) 
    })
    return LoaderTemplate.mapContext<InfiniteStreamReadonlyState & InfiniteStreamWritableState<Element>>(_ => _)
  }
