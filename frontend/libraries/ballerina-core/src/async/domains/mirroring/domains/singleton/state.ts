import {
  AsyncState,
  BasicUpdater,
  Debounced,
  Synchronized,
  Unit,
  Updater,
  Value,
  simpleUpdaterWithChildren,
} from "ballerina-core";
import { Entity } from "../entity/state";

export type Singleton<E> = {
  entity: Entity<E>;
};
export const Singleton = <E>() => ({
  Default: (entity: Entity<E>): Singleton<E> => ({ entity }),
  Updaters: {
    Core: {
      ...simpleUpdaterWithChildren<Singleton<E>>()(Entity<E>().Updaters.Core)(
        "entity",
      ),
      reloader: (
        u: BasicUpdater<Synchronized<Unit, E>>,
      ): Updater<Singleton<E>> =>
        Singleton<E>().Updaters.Core.entity(
          Entity<E>().Updaters.Core.value(
            Debounced.Updaters.Core.value(
              Synchronized.Updaters.value(Value.Updaters.value(u)),
            ),
          ),
        ),
      entityValue: (u: BasicUpdater<E>): Updater<Singleton<E>> =>
        Singleton<E>().Updaters.Core.entity(
          Entity<E>().Updaters.Core.value(
            Debounced.Updaters.Core.value(
              Synchronized.Updaters.value(
                Value.Updaters.value(
                  Synchronized.Updaters.sync(AsyncState.Operations.map(u)),
                ),
              ),
            ),
          ),
        ),
    },
    Template: {
      entityValue: (u: BasicUpdater<E>): Updater<Singleton<E>> =>
        Singleton<E>().Updaters.Core.entity(
          Entity<E>().Updaters.Core.value(
            Debounced.Updaters.Template.value(
              Synchronized.Updaters.value(
                Value.Updaters.value(
                  Synchronized.Updaters.sync(AsyncState.Operations.map(u)),
                ),
              ),
            ),
          ),
        ),
    },
  },
});
