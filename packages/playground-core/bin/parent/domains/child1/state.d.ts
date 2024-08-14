import { ForeignMutationsInput, Unit, View } from "@ballerina/core";
export type Child1 = {
    x: number;
    y: string;
};
export declare const Child1: {
    Default: () => Child1;
    Updaters: {
        Core: {
            y: import("@ballerina/core").Widening<Child1, "y">;
            x: import("@ballerina/core").Widening<Child1, "x">;
        };
    };
    ForeignMutations: (_: ForeignMutationsInput<Child1ReadonlyContext, Child1WritableState>) => {};
};
export type Child1ReadonlyContext = Unit;
export type Child1WritableState = Child1;
export type Child1ForeignMutationsExpected = Unit;
export type Child1ForeignMutationsExposed = ReturnType<typeof Child1.ForeignMutations>;
export type Child1View = View<Child1ReadonlyContext & Child1WritableState, Child1WritableState, Child1ForeignMutationsExpected>;
//# sourceMappingURL=state.d.ts.map