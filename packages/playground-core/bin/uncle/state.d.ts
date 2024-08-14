import { ForeignMutationsInput, View } from "@ballerina/core";
import { Unit } from "@ballerina/core";
export type Uncle = {
    flag: boolean;
};
export declare const Uncle: {
    Default: () => Uncle;
    Updaters: {
        Core: {
            flag: import("@ballerina/core").Widening<Uncle, "flag">;
        };
    };
    ForeignMutations: (_: ForeignMutationsInput<UncleReadonlyContext, UncleWritableState>) => {
        overrideFlag: (newValue: boolean) => void;
    };
};
export type UncleReadonlyContext = Unit;
export type UncleWritableState = Uncle;
export type UncleForeignMutationsExpected = Unit;
export type UncleForeignMutationsExposed = ReturnType<typeof Uncle.ForeignMutations>;
export type UncleView = View<UncleReadonlyContext & UncleWritableState, UncleWritableState, UncleForeignMutationsExpected>;
//# sourceMappingURL=state.d.ts.map