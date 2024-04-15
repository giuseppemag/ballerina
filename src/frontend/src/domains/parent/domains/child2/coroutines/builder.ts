import { CoTypedFactory } from "../../../../core/coroutines/state";
import { Unit } from "../../../../core/fun/domains/unit/state";
import { Child1 } from "../../child1/state";

export const CoChild2 = CoTypedFactory<Unit, Child1, never>();
