import {
  coroutine,
  Unit,
} from "../../../../../../Shared/widgets-library/widgets-main";
import { Template } from "../../../templates-lib/templateDefinition";
import { InfiniteStreamState } from "../state";
import {
  InfiniteStreamReadonlyState,
  InfiniteStreamWritableState,
} from "../templateIO";
import { Loader } from "./_loader";

export const StreamDataLoader =
  <Element extends { id: string }>(): Template<
    InfiniteStreamReadonlyState,
    InfiniteStreamWritableState<Element>,
    Unit
  > =>
  (props) => {
    const operations = InfiniteStreamState<Element>().Operations;
    return (
      <>
        {operations.loadNextPage(props.writableState)
          ? coroutine(Loader<Element>(), [], {
              interval: 50,
            })({
              ...props.readonlyState,
              ...props.writableState,
            }).run(props.setState)
          : undefined}
      </>
    );
  };
