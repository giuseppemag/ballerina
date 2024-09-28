import { Set } from "immutable";
import { Updater } from "../../../../../fun/domains/updater/state";

export const SetRepo = {
  Updaters: {
    add: <e>(e: e): Updater<Set<e>> =>
      Updater(current =>
        current.add(e)
      ),
    remove: <e>(e: e): Updater<Set<e>> =>
      Updater(current =>
        current.remove(e)
      ),
    subtract: <e>(elements: Iterable<e>): Updater<Set<e>> =>
      Updater(current =>
        current.subtract(elements)
      )
  }
}
