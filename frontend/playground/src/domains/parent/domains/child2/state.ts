import { ForeignMutationsInput, SimpleCallback } from "ballerina-core";
import { Unit } from "ballerina-core";
import { simpleUpdater } from "ballerina-core";

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
	},
	ForeignMutations:(_:ForeignMutationsInput<Child2ReadonlyContext, Child2WritableState>) => ({})
};

export type Child2ReadonlyContext = Unit
export type Child2WritableState = Child2
export type Child2ForeignMutationsExpected = { setFlag:SimpleCallback<boolean> }
export type Child2ForeignMutationsExposed = ReturnType<typeof Child2.ForeignMutations>
