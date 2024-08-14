import { List } from "immutable";
import { Updater } from "../../../../../fun/domains/updater/state";
import { BasicFun } from "../../../../../fun/state";
export declare const ListRepo: {
    Default: {};
    Updaters: {
        push<V>(v: V): Updater<List<V>>;
        filter<V>(predicate: BasicFun<V, boolean>): Updater<List<V>>;
    };
    Operations: {};
};
//# sourceMappingURL=state.d.ts.map