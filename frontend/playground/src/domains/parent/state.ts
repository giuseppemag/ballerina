import { Child2, Child2ForeignMutationsExpected as Child2ForeignMutationsExpected } from "./domains/child2/state";
import { Child1, Child1ForeignMutationsExpected } from "./domains/child1/state";
import { Fun, simpleUpdater } from "ballerina-core";
import { Updater } from "ballerina-core";
import { replaceWith } from "ballerina-core";
import { Unit } from "ballerina-core";
import { ForeignMutationsInput } from "ballerina-core";
import { Debounced } from "ballerina-core";
import { Value } from "ballerina-core";
import { Synchronized } from "ballerina-core";
import { Validation } from "ballerina-core";

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
			inputString:
				Fun(Value.Updaters.value<string>).then(
					Fun(Synchronized.Updaters.value<Value<string>, Validation>).then(
						Fun(Debounced.Updaters.Template.value<Synchronized<Value<string>, Validation>>).then(
							CoreUpdaters.inputString
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
export type ParentForeignMutationsExposed = Unit
export type ParentForeignMutationsExpected = Child1ForeignMutationsExpected & Child2ForeignMutationsExpected
