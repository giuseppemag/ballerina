import { CoTypedFactory } from "ballerina-core";
import { ParentReadonlyContext, ParentWritableState } from "../state";

export const Co = CoTypedFactory<ParentReadonlyContext, ParentWritableState, never>()
