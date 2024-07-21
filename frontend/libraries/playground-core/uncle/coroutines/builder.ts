import { CoTypedFactory } from "ballerina-core";
import { UncleReadonlyContext, UncleWritableState } from "../state";

export const Co = CoTypedFactory<UncleReadonlyContext, UncleWritableState>()
