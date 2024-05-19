import { Map, OrderedMap } from "immutable";
import { Identifiable } from "../../../../../baseEntity/domains/identifiable/state";
import { Unit } from "../../../../../fun/domains/unit/state";
import { BasicUpdater, Updater } from "../../../../../fun/domains/updater/state";
import { BasicFun } from "../../../../../fun/state";

export const MapRepo = {
  Default: {
    fromIdentifiables: <T extends Identifiable>(array: T[]): Map<T["Id"], T> =>
      Map(
        array.reduce<Record<string, T>>((acc, item) => {
          acc[item.Id] = item;
          return acc;
        }, {})
      ),
  },
  Updaters:{
    upsert: <k, v>(k: k, defaultValue:BasicFun<Unit,v>, _: BasicUpdater<v>): Updater<OrderedMap<k, v>> =>
      Updater((current) =>
        current.has(k) ? current.set(k, _(current.get(k)!)) : current.set(k, defaultValue({}))
      ),
  }
};
