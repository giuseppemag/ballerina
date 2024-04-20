import { CoTypedFactory } from "../../../../core/coroutines/builder";
import { Unit } from "../../../../core/fun/domains/unit/state";
import { Child1 } from "../state";

export const Co = CoTypedFactory<Unit, Child1, never>();

