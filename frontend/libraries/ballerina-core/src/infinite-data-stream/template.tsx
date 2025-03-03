import { Unit } from "../fun/domains/unit/state";
import { Template } from "../template/state";
import { StreamDataLoader } from "./coroutines/runner";
import {
  InfiniteStreamReadonlyState,
  InfiniteStreamWritableState,
} from "./state";

export const InfiniteStreamTemplate = <Element extends { Id: string }>() =>
  Template.Default<
    InfiniteStreamReadonlyState,
    InfiniteStreamWritableState<Element>,
    Unit
  >((_props) => <>{}</>).any([StreamDataLoader<Element, Unit>()]);
