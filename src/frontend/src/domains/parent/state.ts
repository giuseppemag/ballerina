import { Child2 } from "./domains/child2/state";
import { Child1 } from "./domains/child1/state";
import { simpleUpdater } from "../core/fun/domains/updater/domains/simpleUpdater/state";
import { BasicUpdater, Updater } from "../core/fun/domains/updater/state";
import { replaceWith } from "../core/fun/domains/updater/domains/replaceWith/state";
import { Unit } from "../core/fun/domains/unit/state";
import { ForeignMutationsInput } from "../core/foreignMutations/state";

export type Parent = { child1: Child1; child2: Child2; counter:number; doubleCounter:number, inputString:string };

const CoreUpdaters = {
	...simpleUpdater<Parent>()("child1"),
	...simpleUpdater<Parent>()("child2"),
	...simpleUpdater<Parent>()("counter"),
	...simpleUpdater<Parent>()("doubleCounter"),
	...simpleUpdater<Parent>()("inputString"),
}


export const Parent = {
	Default:() : Parent => ({
		child1:Child1.Default(),
		child2:Child2.Default(),
		counter:0,
		doubleCounter:0,
		inputString:""
	}),
	Updaters: {
		Template:{
			inputString:CoreUpdaters.inputString,
			tick:() : Updater<Parent> => 
				CoreUpdaters.counter(_ => _ + 1).then(p => 
					CoreUpdaters.doubleCounter(replaceWith(p.counter * 2))(p)
				),
			doubleTick:() : Updater<Parent> => 
				CoreUpdaters.counter(_ => _ + 2).then(p => 
					CoreUpdaters.doubleCounter(replaceWith(p.counter * 2))(p)
				),
			},
		Coroutine:{
			tick:() : Updater<Parent> => Parent.Updaters.Template.tick(),
			doubleTick:() : Updater<Parent> => Parent.Updaters.Template.doubleTick(),
		}
	},
	ForeignMutations:(_:ForeignMutationsInput<ParentReadonlyContext, ParentWritableState>) => ({
		
	})
};

export type ParentWritableState = Parent
export type ParentReadonlyContext = Unit
