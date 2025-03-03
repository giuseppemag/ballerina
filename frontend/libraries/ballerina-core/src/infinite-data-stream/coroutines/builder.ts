import { CoTypedFactory } from "../../coroutines/builder";
import {
  InfiniteStreamReadonlyState,
  InfiniteStreamWritableState,
} from "../state";

export const StreamCo = <Element extends { Id: string }>() =>
  CoTypedFactory<
    InfiniteStreamReadonlyState,
    InfiniteStreamWritableState<Element>
  >();
