import { SimpleCallback } from "../../../core/fun/domains/simpleCallback/state";
import { Unit } from "../../../core/fun/domains/unit/state";
import { simpleUpdater } from "../../../core/fun/domains/updater/domains/simpleUpdater/state";

export type Child2 = { a: number; b: string; };
export const Child2 = {
	Default:() : Child2 => ({
		a:1,
		b:"",
	}),
	Updaters: {
		Core: {
			...simpleUpdater<Child2>()("a"),
			...simpleUpdater<Child2>()("b"),
		}
	}
};

export type Child2ReadonlyContext = Unit
export type Child2WritableState = Child2
export type Child2ForeignMutationsExpected = { setFlag:SimpleCallback<boolean> }
