import { Unit } from "../../../core/fun/domains/unit/state";
import { simpleUpdater } from "../../../core/fun/domains/updater/domains/simpleUpdater/state";

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
