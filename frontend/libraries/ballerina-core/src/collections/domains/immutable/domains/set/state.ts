import { OrderedSet } from "immutable";
import { Updater } from "../../../../../fun/domains/updater/state";

export const OrderedSetRepo = {
  Updaters: {
    add: <e>(e: e): Updater<OrderedSet<e>> =>
      Updater((current) => current.add(e)),
    subtract: <e>(elements: Iterable<e>): Updater<OrderedSet<e>> =>
      Updater((current) => current.subtract(elements)),
  },
};
