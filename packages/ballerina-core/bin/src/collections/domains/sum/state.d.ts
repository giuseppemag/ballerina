import { Unit } from "../../../fun/domains/unit/state";
import { BasicUpdater, Updater } from "../../../fun/domains/updater/state";
import { BasicFun, Fun } from "../../../fun/state";
export type LeftValue<a> = {
    value: a;
    kind: "l";
};
export declare const LeftValue: {
    Updaters: {
        value: <a>(_: BasicUpdater<a>) => Updater<LeftValue<a>>;
    };
};
export type RightValue<b> = {
    value: b;
    kind: "r";
};
export declare const RightValue: {
    Updaters: {
        value: <b>(_: BasicUpdater<b>) => Updater<RightValue<b>>;
    };
};
export type Sum<a, b> = {
    value: a;
    kind: "l";
} | {
    value: b;
    kind: "r";
};
export type Either<a, b> = Sum<a, b>;
export declare const Sum: (<a, b>() => {
    Default: {
        left: Fun<a, Sum<a, b>>;
        right: Fun<b, Sum<a, b>>;
    };
    Updaters: {
        left: Fun<BasicUpdater<a>, Updater<Sum<a, b>>>;
        right: Fun<BasicUpdater<b>, Updater<Sum<a, b>>>;
        map2: <a_1, b_1, a1, b1>(l: BasicFun<a_1, a1>, r: BasicFun<b_1, b1>) => Fun<Sum<a_1, b_1>, Sum<a1, b1>>;
    };
    Operations: {
        fold: <a_1, b_2, c>(l: BasicFun<a_1, c>, r: BasicFun<b_2, c>) => Fun<Sum<a_1, b_2>, c>;
    };
}) & {
    Default: {
        left: <a, b>(_: a) => Sum<a, b>;
        right: <a, b>(_: b) => Sum<a, b>;
    };
    Updaters: {
        left: <a, b>(_: BasicUpdater<a>) => Updater<Sum<a, b>>;
        right: <a, b>(_: BasicUpdater<b>) => Updater<Sum<a, b>>;
        map2: <a, b, a1, b1>(l: BasicFun<a, a1>, r: BasicFun<b, b1>) => Fun<Sum<a, b>, Sum<a1, b1>>;
    };
    Operations: {
        fold: <a, b, c>(l: BasicFun<a, c>, r: BasicFun<b, c>) => Fun<Sum<a, b>, c>;
    };
};
export declare const Either: (<a, b>() => {
    Default: {
        left: Fun<a, Sum<a, b>>;
        right: Fun<b, Sum<a, b>>;
    };
    Updaters: {
        left: Fun<BasicUpdater<a>, Updater<Sum<a, b>>>;
        right: Fun<BasicUpdater<b>, Updater<Sum<a, b>>>;
        map2: <a_1, b_1, a1, b1>(l: BasicFun<a_1, a1>, r: BasicFun<b_1, b1>) => Fun<Sum<a_1, b_1>, Sum<a1, b1>>;
    };
    Operations: {
        fold: <a_1, b_2, c>(l: BasicFun<a_1, c>, r: BasicFun<b_2, c>) => Fun<Sum<a_1, b_2>, c>;
    };
}) & {
    Default: {
        left: <a, b>(_: a) => Sum<a, b>;
        right: <a, b>(_: b) => Sum<a, b>;
    };
    Updaters: {
        left: <a, b>(_: BasicUpdater<a>) => Updater<Sum<a, b>>;
        right: <a, b>(_: BasicUpdater<b>) => Updater<Sum<a, b>>;
        map2: <a, b, a1, b1>(l: BasicFun<a, a1>, r: BasicFun<b, b1>) => Fun<Sum<a, b>, Sum<a1, b1>>;
    };
    Operations: {
        fold: <a, b, c>(l: BasicFun<a, c>, r: BasicFun<b, c>) => Fun<Sum<a, b>, c>;
    };
};
export type Option<a> = Sum<Unit, a>;
//# sourceMappingURL=state.d.ts.map