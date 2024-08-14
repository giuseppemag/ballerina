import { Child2, Child2ForeignMutationsExpected, Child2View } from "./domains/child2/state";
import { Child1, Child1ForeignMutationsExpected, Child1View } from "./domains/child1/state";
import { BasicFun, BasicUpdater, Fun, Template, View } from "@ballerina/core";
import { Updater } from "@ballerina/core";
import { Unit } from "@ballerina/core";
import { ForeignMutationsInput } from "@ballerina/core";
import { Debounced } from "@ballerina/core";
import { Value } from "@ballerina/core";
import { Synchronized } from "@ballerina/core";
import { Validation } from "@ballerina/core";
export type Parent = {
    child1: Child1;
    child2: Child2;
    counter: number;
    doubleCounter: number;
    inputString: Debounced<Synchronized<Value<string>, Validation>>;
};
export declare const Parent: {
    Default: () => Parent;
    Updaters: {
        Core: {
            inputString: import("@ballerina/core").Widening<Parent, "inputString">;
            doubleCounter: import("@ballerina/core").Widening<Parent, "doubleCounter">;
            counter: import("@ballerina/core").Widening<Parent, "counter">;
            child2: import("@ballerina/core").Widening<Parent, "child2">;
            child1: import("@ballerina/core").Widening<Parent, "child1">;
        };
        Template: {
            inputString: Fun<BasicUpdater<string>, Updater<Parent>>;
            tick: () => Updater<Parent>;
            doubleTick: () => Updater<Parent>;
        };
        Coroutine: {
            tick: () => Updater<Parent>;
            doubleTick: () => Updater<Parent>;
        };
    };
    ForeignMutations: (_: ForeignMutationsInput<ParentReadonlyContext, ParentWritableState>) => {};
};
export type ParentViewProps = {
    context: ParentReadonlyContext & ParentWritableState;
    setState: BasicFun<BasicUpdater<Parent>, void>;
    foreignMutations: ParentForeignMutationsExpected;
};
export type ParentReadonlyContext = Unit;
export type ParentWritableState = Parent;
export type ParentForeignMutationsExpected = Child1ForeignMutationsExpected & Child2ForeignMutationsExpected;
export type ParentForeignMutationsExposed = ReturnType<typeof Parent.ForeignMutations>;
export type ParentView1 = View<ParentReadonlyContext & ParentWritableState, ParentWritableState, ParentForeignMutationsExpected, {
    Child2: Template<ParentReadonlyContext & ParentWritableState, ParentWritableState, Child2ForeignMutationsExpected, Child2View>;
}>;
export type ParentView2 = View<ParentReadonlyContext & ParentWritableState, ParentWritableState, ParentForeignMutationsExpected, {
    Child1: Template<ParentReadonlyContext & ParentWritableState, ParentWritableState, Child1ForeignMutationsExpected, Child1View>;
    Child2: Template<ParentReadonlyContext & ParentWritableState, ParentWritableState, Child2ForeignMutationsExpected, Child2View>;
}>;
//# sourceMappingURL=state.d.ts.map