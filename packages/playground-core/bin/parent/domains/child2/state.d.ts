import { ForeignMutationsInput, SimpleCallback, View } from "@ballerina/core";
import { Unit } from "@ballerina/core";
export type Child2 = {
    a: number;
    b: string;
};
export declare const Child2: {
    Default: () => Child2;
    Updaters: {
        Core: {
            b: import("@ballerina/core").Widening<Child2, "b">;
            a: import("@ballerina/core").Widening<Child2, "a">;
        };
    };
    ForeignMutations: (_: ForeignMutationsInput<Child2ReadonlyContext, Child2WritableState>) => {};
};
export type Child2ReadonlyContext = Unit;
export type Child2WritableState = Child2;
export type Child2ForeignMutationsExpected = {
    setFlag: SimpleCallback<boolean>;
};
export type Child2ForeignMutationsExposed = ReturnType<typeof Child2.ForeignMutations>;
export type Child2View = View<Child2ReadonlyContext & Child2WritableState, Child2WritableState, Child2ForeignMutationsExpected>;
//# sourceMappingURL=state.d.ts.map