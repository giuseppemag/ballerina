import { Unit } from "../../../../../Shared/widgets-library/widgets-main";
import { Template } from "../../templates-lib/templateDefinition";
import { StreamDataLoader } from "./coroutines/runner";
import {
  InfiniteStreamReadonlyState,
  InfiniteStreamWritableState,
} from "./templateIO";

export const InfiniteStreamTemplate =
  <Element extends { id: string }>(): Template<
    InfiniteStreamReadonlyState,
    InfiniteStreamWritableState<Element>,
    Unit
  > =>
  (props) => <>{StreamDataLoader<Element>()(props)}</>;
