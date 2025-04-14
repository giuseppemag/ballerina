import React from "react";
import { Unit } from "../fun/domains/unit/state";
import { Template } from "../template/state";
import { ValueStreamDataLoader } from "./coroutines/runner";
import {
  ValueInfiniteStreamReadonlyContext,
  ValueInfiniteStreamWritableState,
} from "./state";

export const ValueInfiniteStreamTemplate = () =>
  Template.Default<
    ValueInfiniteStreamReadonlyContext,
    ValueInfiniteStreamWritableState,
    Unit
  >((_props) => <>{}</>).any([ValueStreamDataLoader<Unit>()]);
