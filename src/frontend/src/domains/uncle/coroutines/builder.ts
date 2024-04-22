import { CoTypedFactory } from "../../core/coroutines/builder";
import { UncleReadonlyContext, UncleWritableState } from "../state";

export const Co = CoTypedFactory<UncleReadonlyContext, UncleWritableState, never>()
