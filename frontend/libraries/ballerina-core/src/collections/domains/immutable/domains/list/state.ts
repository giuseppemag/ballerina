import { List } from "immutable";
import { Updater } from "../../../../../fun/domains/updater/state";
import { BasicFun } from "../../../../../fun/state";

export const ListRepo = {
  Default: {

  },
  Updaters: {
    remove<V>(elementIndex:number): Updater<List<V>> {
      return Updater((_) => _.remove(elementIndex));
    },
    push<V>(v:V): Updater<List<V>> {
      return Updater((_) => _.push(v));
    },
    filter<V>(predicate: BasicFun<V, boolean>): Updater<List<V>> {
      return Updater((_) => _.filter(predicate));
    },
  },
  Operations: {
  },
};

