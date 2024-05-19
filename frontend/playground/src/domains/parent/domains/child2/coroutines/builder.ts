import { CoTypedFactory } from "ballerina-core";
import { Child2ReadonlyContext, Child2WritableState } from "../state";

export const Co = CoTypedFactory<Child2ReadonlyContext, Child2WritableState, never>();

