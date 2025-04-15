import {
  ValueInfiniteStreamReadonlyContext,
  ValueInfiniteStreamWritableState,
  ValueInfiniteStreamState,
} from "../state";
import { ValueStreamCo } from "./builder";
import { ValueInfiniteStreamLoader } from "./infiniteLoader";

export const ValueStreamDataLoader = <foreignMutations>() => {
  const operations = ValueInfiniteStreamState().Operations;
  const LoaderTemplate = ValueStreamCo().Template<foreignMutations>(
    ValueInfiniteStreamLoader(),
    {
      runFilter: (props) => operations.shouldCoroutineRun(props.context),
    },
  );
  return LoaderTemplate.mapContext<
    ValueInfiniteStreamReadonlyContext & ValueInfiniteStreamWritableState
  >((_) => _);
};
