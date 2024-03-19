import { CoTypedFactory } from "../../../../../../Shared/Coroutines/Coroutine";
import {
  InfiniteStreamReadonlyState,
  InfiniteStreamWritableState,
} from "../templateIO";

export const StreamCo = <Element extends { id: string }>() =>
  CoTypedFactory<
    InfiniteStreamReadonlyState,
    InfiniteStreamWritableState<Element>,
    never
  >();
