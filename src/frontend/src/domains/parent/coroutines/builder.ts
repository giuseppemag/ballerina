import { CoTypedFactory } from "../../core/coroutines/builder";
import { ParentReadonlyContext, ParentWritableState } from "../state";

export const Co = CoTypedFactory<ParentReadonlyContext, ParentWritableState, never>()