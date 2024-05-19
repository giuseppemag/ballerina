import { OrderedMap } from "immutable";
import { Identifiable, SmallIdentifiable } from "../../../../../baseEntity/domains/identifiable/state";
import { Updater } from "../../../../../fun/domains/updater/state";
import { BasicFun } from "../../../../../fun/state";

export const OrderedMapRepo = {
  Default: {
    fromSmallIdentifiables: <T extends SmallIdentifiable>(
      array: T[]
    ): OrderedMap<T["id"], T> =>
      OrderedMap(
        array.reduce(
          (acc, item) => {
            acc[item.id] = item;
            return acc;
          },
          {} as Record<string, T>
        )
      ),
    fromIdentifiables: <T extends Identifiable>(
      array: T[]
    ): OrderedMap<T["Id"], T> =>
      OrderedMap(
        array.reduce(
          (acc, item) => {
            acc[item.Id] = item;
            return acc;
          },
          {} as Record<string, T>
        )
      ),
  },
  Updaters: {
    replaceAndMerge<K, V>(
      key: K,
      originalMap: OrderedMap<K, V>,
      mergeMap: OrderedMap<K, V>
    ) {
      const index = originalMap.keySeq().findIndex((k) => k === key);

      let newMap = originalMap.remove(key);

      mergeMap.entrySeq().forEach((entry, idx) => {
        newMap = newMap
          .slice(0, index + idx)
          .concat([[entry[0], entry[1]]], newMap.slice(index + idx));
      });

      return newMap;
    },
    filter<K, V>(predicate: BasicFun<V, boolean>): Updater<OrderedMap<K, V>> {
      return Updater((_) => _.filter(predicate));
    },
    set<K, V>(key: K, value: V): Updater<OrderedMap<K, V>> {
      return Updater((_) => _.set(key, value));
    },
    remove<K, V>(key: K): Updater<OrderedMap<K, V>> {
      return Updater((_) => _.remove(key));
    },
    merge<K, V>(
      key: K,
      originalMap: OrderedMap<K, V>,
      mergeMap: OrderedMap<K, V>
    ) {
      const index = originalMap.keySeq().findIndex((k) => k === key);

      mergeMap.entrySeq().forEach((entry, idx) => {
        originalMap = originalMap
          .slice(0, index + idx)
          .concat([[entry[0], entry[1]]], originalMap.slice(index + idx));
      });

      return originalMap;
    },
    update: <k, v>(k: k, _: Updater<v>): Updater<OrderedMap<k, v>> =>
      Updater((current) =>
        current.has(k) ? current.set(k, _(current.get(k)!)) : current
      ),
  },
  Operations: {
    toArray: <T extends Identifiable>(map: OrderedMap<T["Id"], T>) =>
      map.valueSeq().toArray(),
  },
};

