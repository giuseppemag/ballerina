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
    insert<V>(elementIndex:number, v:V): Updater<List<V>> {
      return Updater((_) => _.insert(elementIndex, v));
    },
    filter<V>(predicate: BasicFun<V, boolean>): Updater<List<V>> {
      return Updater((_) => _.filter(predicate));
    },
    move<V>(elementIndex:number, to:number): Updater<List<V>> {
      return Updater((_) => {
        const element = _.get(elementIndex)
        if(element == undefined) return _
        return _.remove(elementIndex).insert(to, element)
      });
    },
    duplicate<V>(elementIndex:number): Updater<List<V>> {
      return Updater((_) => {
        const element = _.get(elementIndex)
        if(element == undefined) return _
        return _.insert(elementIndex + 1, element)
      });
    },
  },
  Operations: {
  },
};

