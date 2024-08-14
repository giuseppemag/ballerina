import { Child2 } from "./domains/child2/state";
import { Child1 } from "./domains/child1/state";
import { Fun, simpleUpdater } from "@ballerina/core";
import { replaceWith } from "@ballerina/core";
import { Debounced } from "@ballerina/core";
import { Value } from "@ballerina/core";
import { Synchronized } from "@ballerina/core";
const CoreUpdaters = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, simpleUpdater()("child1")), simpleUpdater()("child2")), simpleUpdater()("counter")), simpleUpdater()("doubleCounter")), simpleUpdater()("inputString"));
export const Parent = {
    Default: () => ({
        child1: Child1.Default(),
        child2: Child2.Default(),
        counter: 0,
        doubleCounter: 0,
        inputString: Debounced.Default(Synchronized.Default(Value.Default(""))),
    }),
    Updaters: {
        Core: CoreUpdaters,
        Template: {
            inputString: Fun((Value.Updaters.value)).then(Fun((Synchronized.Updaters.value)).then(Fun((Debounced.Updaters.Template.value)).then(CoreUpdaters.inputString))),
            tick: () => CoreUpdaters.counter(_ => _ + 1).then(p => CoreUpdaters.doubleCounter(replaceWith(p.counter * 2))(p)),
            doubleTick: () => CoreUpdaters.counter(_ => _ + 2).then(p => CoreUpdaters.doubleCounter(replaceWith(p.counter * 2))(p)),
        },
        Coroutine: {
            tick: () => Parent.Updaters.Template.tick(),
            doubleTick: () => Parent.Updaters.Template.doubleTick(),
        }
    },
    ForeignMutations: (_) => ({})
};
//# sourceMappingURL=state.js.map