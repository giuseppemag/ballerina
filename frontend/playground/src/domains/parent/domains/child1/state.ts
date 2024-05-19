import { Unit } from "ballerina-core";
import { simpleUpdater } from "ballerina-core";

export type Child1 = { x: number; y: string; };
export const Child1 = {
	Default:() : Child1 => ({
		x:0,
		y:"",
	}),
	Updaters: {
		Core: {
			...simpleUpdater<Child1>()("x"),
			...simpleUpdater<Child1>()("y"),
		}
	}
};

export type Child1ReadonlyState = Unit
export type Child1WritableState = Child1
export type Child1ForeignMutationsExposed = Unit
export type Child1ForeignMutationsExpected = Unit