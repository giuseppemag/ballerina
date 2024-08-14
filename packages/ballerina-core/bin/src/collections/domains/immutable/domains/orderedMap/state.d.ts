import { OrderedMap } from "immutable";
import { Identifiable, SmallIdentifiable } from "../../../../../baseEntity/domains/identifiable/state";
import { BasicUpdater, Updater } from "../../../../../fun/domains/updater/state";
import { BasicFun } from "../../../../../fun/state";
import { Unit } from "@core";
export declare const OrderedMapRepo: {
    Default: {
        fromSmallIdentifiables: <T extends SmallIdentifiable>(array: T[]) => OrderedMap<T["id"], T>;
        fromIdentifiables: <T extends Identifiable>(array: T[]) => OrderedMap<T["Id"], T>;
    };
    Updaters: {
        replaceAndMerge<K, V>(key: K, originalMap: OrderedMap<K, V>, mergeMap: OrderedMap<K, V>): OrderedMap<K, V>;
        filter<K, V>(predicate: BasicFun<[K, V], boolean>): Updater<OrderedMap<K, V>>;
        set<K, V>(key: K, value: V): Updater<OrderedMap<K, V>>;
        insertAtBeginning<K, V>(key: K, value: V): Updater<OrderedMap<K, V>>;
        insertAtEnd<K, V>(key: K, value: V): Updater<OrderedMap<K, V>>;
        insertAt<K, V>([key, value]: [K, V], insertionPosition: K, order: "before" | "after"): Updater<OrderedMap<K, V>>;
        remove<K, V>(key: K): Updater<OrderedMap<K, V>>;
        merge<K, V>(key: K, originalMap: OrderedMap<K, V>, mergeMap: OrderedMap<K, V>): OrderedMap<K, V>;
        update: <k, v>(k: k, _: BasicUpdater<v>) => Updater<OrderedMap<k, v>>;
        upsert: <k, v>(k: k, defaultValue: BasicFun<Unit, v>, _: BasicUpdater<v>) => Updater<OrderedMap<k, v>>;
    };
    Operations: {
        toArray: <T extends Identifiable>(map: OrderedMap<T["Id"], T>) => T[];
    };
};
//# sourceMappingURL=state.d.ts.map