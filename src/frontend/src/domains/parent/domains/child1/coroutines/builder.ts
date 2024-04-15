import { CoTypedFactory } from "../../../../core/coroutines/state";
import { Unit } from "../../../../core/fun/domains/unit/state";
import { Child1 } from "../state";

export const CoChild1 = CoTypedFactory<Unit, Child1, never>();
