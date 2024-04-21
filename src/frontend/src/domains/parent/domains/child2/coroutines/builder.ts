import { CoTypedFactory } from "../../../../core/coroutines/builder";
import { Child2ReadonlyContext, Child2WritableState } from "../state";

export const Co = CoTypedFactory<Child2ReadonlyContext, Child2WritableState, never>();

