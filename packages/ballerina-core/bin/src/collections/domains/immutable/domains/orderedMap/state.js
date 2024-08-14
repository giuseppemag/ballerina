import { OrderedMap } from "immutable";
import { Updater } from "../../../../../fun/domains/updater/state";
export const OrderedMapRepo = {
    Default: {
        fromSmallIdentifiables: (array) => OrderedMap(array.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {})),
        fromIdentifiables: (array) => OrderedMap(array.reduce((acc, item) => {
            acc[item.Id] = item;
            return acc;
        }, {})),
    },
    Updaters: {
        replaceAndMerge(key, originalMap, mergeMap) {
            const index = originalMap.keySeq().findIndex((k) => k === key);
            let newMap = originalMap.remove(key);
            mergeMap.entrySeq().forEach((entry, idx) => {
                newMap = newMap
                    .slice(0, index + idx)
                    .concat([[entry[0], entry[1]]], newMap.slice(index + idx));
            });
            return newMap;
        },
        filter(predicate) {
            return Updater((_) => _.filter((v, k) => predicate([k, v])));
        },
        set(key, value) {
            return Updater((_) => _.set(key, value));
        },
        insertAtBeginning(key, value) {
            return Updater((_) => OrderedMap(_.toArray().toSpliced(0, 0, [key, value])));
        },
        insertAtEnd(key, value) {
            return Updater((_) => OrderedMap(_.toArray().toSpliced(_.size, 0, [key, value])));
        },
        insertAt([key, value], insertionPosition, order) {
            return Updater((_) => {
                const __ = _.toArray();
                const insertionIndex = __.findIndex((value) => value[0] == insertionPosition) + (order == "after" ? 1 : 0);
                return OrderedMap(__.toSpliced(insertionIndex, 0, [key, value]));
            });
        },
        remove(key) {
            return Updater((_) => _.remove(key));
        },
        merge(key, originalMap, mergeMap) {
            const index = originalMap.keySeq().findIndex((k) => k === key);
            mergeMap.entrySeq().forEach((entry, idx) => {
                originalMap = originalMap
                    .slice(0, index + idx)
                    .concat([[entry[0], entry[1]]], originalMap.slice(index + idx));
            });
            return originalMap;
        },
        update: (k, _) => Updater((current) => current.has(k) ? current.set(k, _(current.get(k))) : current),
        upsert: (k, defaultValue, _) => Updater((current) => current.has(k) ? current.set(k, _(current.get(k))) : current.set(k, defaultValue({}))),
    },
    Operations: {
        toArray: (map) => map.valueSeq().toArray(),
    },
};
//# sourceMappingURL=state.js.map