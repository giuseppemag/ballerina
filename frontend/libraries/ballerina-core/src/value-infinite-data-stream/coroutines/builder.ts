import { CoTypedFactory } from "../../coroutines/builder";
import {
  ValueInfiniteStreamReadonlyContext,
  ValueInfiniteStreamWritableState,
} from "../state";

export const ValueStreamCo = () =>
  CoTypedFactory<
    ValueInfiniteStreamReadonlyContext,
    ValueInfiniteStreamWritableState
  >();
