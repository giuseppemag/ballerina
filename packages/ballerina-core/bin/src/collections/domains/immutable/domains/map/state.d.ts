import { Map } from "immutable";
import { Identifiable } from "../../../../../baseEntity/domains/identifiable/state";
import { Unit } from "../../../../../fun/domains/unit/state";
import { BasicUpdater, Updater } from "../../../../../fun/domains/updater/state";
import { BasicFun } from "../../../../../fun/state";
export declare const MapRepo: {
    Default: {
        fromIdentifiables: <T extends Identifiable>(array: T[]) => Map<T["Id"], T>;
    };
    Updaters: {
        set<K, V>(key: K, value: V): Updater<Map<K, V>>;
        remove<K, V>(key: K): Updater<Map<K, V>>;
        update: <k, v>(k: k, _: BasicUpdater<v>) => Updater<Map<k, v>>;
        upsert: <k, v>(k: k, defaultValue: BasicFun<Unit, v>, _: BasicUpdater<v>) => Updater<Map<k, v>>;
    };
};
//# sourceMappingURL=state.d.ts.map