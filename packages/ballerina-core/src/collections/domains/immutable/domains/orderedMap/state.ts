import { OrderedMap } from "immutable";
import { Identifiable, SmallIdentifiable } from "../../../../../baseEntity/domains/identifiable/state";
import { BasicUpdater, Updater } from "../../../../../fun/domains/updater/state";
import { BasicFun } from "../../../../../fun/state";
import { Unit } from "@core";

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
    filter<K, V>(predicate: BasicFun<[K, V], boolean>): Updater<OrderedMap<K, V>> {
      return Updater((_) => _.filter((v: V, k: K) => predicate([k, v])))
    },
    set<K, V>(key: K, value: V): Updater<OrderedMap<K, V>> {
      return Updater((_) => _.set(key, value));
    },
    insertAtBeginning<K, V>(key: K, value: V): Updater<OrderedMap<K,V>> {
      return Updater((_) =>   OrderedMap<K, V>(_.toArray().toSpliced(0, 0, [key, value])))
    },
    insertAtEnd<K, V>(key: K, value: V): Updater<OrderedMap<K,V>> {
      return Updater((_) =>   OrderedMap<K, V>(_.toArray().toSpliced(_.size, 0, [key, value])))
    },
    insertAt<K, V>([key, value] : [K, V], insertionPosition: K, order: "before" | "after"): Updater<OrderedMap<K,V>> {
      return Updater((_) =>   { const __ = _.toArray();
                                const insertionIndex = __.findIndex((value) => value[0] == insertionPosition) + (order == "after" ? 1 : 0)
                                return OrderedMap(__.toSpliced(insertionIndex, 0, [key, value]))})
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
    update: <k, v>(k: k, _: BasicUpdater<v>): Updater<OrderedMap<k, v>> =>
      Updater((current) =>
        current.has(k) ? current.set(k, _(current.get(k)!)) : current
      ),
    upsert: <k, v>(k: k, defaultValue: BasicFun<Unit, v>, _: BasicUpdater<v>): Updater<OrderedMap<k, v>> =>
      Updater((current) =>
        current.has(k) ? current.set(k, _(current.get(k)!)) : current.set(k, defaultValue({}))
      ),

  },
  Operations: {
    toArray: <T extends Identifiable>(map: OrderedMap<T["Id"], T>) =>
      map.valueSeq().toArray(),
  },
};

