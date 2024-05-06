import { Child2, Child2ForeignMutationsExpected as Child2ForeignMutationsExpected } from "./domains/child2/state";
import { Child1 } from "./domains/child1/state";
import { simpleUpdater } from "../core/fun/domains/updater/domains/simpleUpdater/state";
import { Updater } from "../core/fun/domains/updater/state";
import { replaceWith } from "../core/fun/domains/updater/domains/replaceWith/state";
import { Unit } from "../core/fun/domains/unit/state";
import { ForeignMutationsInput } from "../core/foreignMutations/state";
import { Debounced } from "../core/debounced/state";
import { Value } from "../core/value/state";
import { Synchronized } from "../core/async/domains/synchronized/state";
import { Validation } from "../core/validation/state";

export type Parent = { child1: Child1; child2: Child2; counter:number; doubleCounter:number, 
	inputString:Debounced<Synchronized<Value<string>, Validation>>
};

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
		inputString:Debounced.Default(Synchronized.Default(Value.Default(""))),
	}),
	Updaters: {
		Core:CoreUpdaters,
		Template:{
			inputString:(_:Updater<string>) => 
					CoreUpdaters.inputString(
						Debounced.Updaters.Template.value(
							Synchronized.Updaters.value(
								Value.Updaters.value(
									_
								)
							)
						)
					),
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
export type ParentForeignMutationsExpected = Child2ForeignMutationsExpected
