import { simpleUpdater } from "../../../core/fun/domains/updater/domains/simpleUpdater/state";

export type Child2 = { a: number; b: string; };
export const Child2 = {
	Default:() : Child2 => ({
		a:0,
		b:"",
	}),
	Updaters: {
		Core: {
			...simpleUpdater<Child2>()("a"),
			...simpleUpdater<Child2>()("b"),
		}
	}
};
