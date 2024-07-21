import { Value, AsyncState, BasicUpdater, Debounced, Guid, Synchronized, Updater, mapUpdater, Unit, unit, simpleUpdater, simpleUpdaterWithChildren, OrderedMapRepo } from "ballerina-core";
import { OrderedMap } from "immutable";
import { Entity } from "../entity/state";

export type CollectionEntity<E> = Entity<E> & {
  removed: boolean
}
export const CollectionEntity = <E>() => ({
  Default: (value: E): CollectionEntity<E> =>
    Object.assign(Entity<E>().Default(value), { removed: false }),
  Updaters: {
    Core: {
      entity: (_: BasicUpdater<Entity<E>>): Updater<CollectionEntity<E>> =>
        Updater(e => ({
          ...(_(e)),
          removed: e.removed
        })),
      removed: (_: BasicUpdater<boolean>): Updater<CollectionEntity<E>> =>
        Updater(e => ({
          ...e,
          removed: _(e.removed)
        }))

    }
  }
})

export type Collection<E> = {
  entities: Synchronized<Unit, OrderedMap<Guid, CollectionEntity<E>>>;
};
export const Collection = <E>() => {
  return ({
    Default: (entities: OrderedMap<Guid, CollectionEntity<E>>): Collection<E> => ({
      entities: Synchronized.Default(unit, AsyncState.Default.loaded(entities.map(_ => ({ ..._, removed: false })))),
    }),
    Updaters: {
      Core: {
        ...simpleUpdater<Collection<E>>()("entities"),
        // reloader: (u: BasicUpdater<OrderedMap<Guid, CollectionEntity<E>>>): Updater<Collection<E>> =>
        //   Collection<E>().Updaters.Core.entities(
        //     Synchronized.Updaters.sync(
        //       AsyncState.Operations.map(
        //         u
        //       )
        //     )
        //   ),
        entity: {
          add: ([id, value]: [Guid, CollectionEntity<E>]): Updater<Collection<E>> =>
            Collection<E>().Updaters.Core.entities(
              Synchronized.Updaters.sync(
                AsyncState.Operations.map(
                  OrderedMapRepo.Updaters.set(id, value)
                )
              )
            ),
          remove: (id: Guid): Updater<Collection<E>> =>
            Collection<E>().Updaters.Core.entities(
              Synchronized.Updaters.sync(
                AsyncState.Operations.map(
                  OrderedMapRepo.Updaters.remove(id)
                )
              )
            ),
          set: (id: Guid) => (u: BasicUpdater<CollectionEntity<E>>): Updater<Collection<E>> =>
            Collection<E>().Updaters.Core.entities(
              Synchronized.Updaters.sync(
                AsyncState.Operations.map(
                  OrderedMapRepo.Updaters.update(id, u)
                )
              )
            ),
          // set: Fun<key, Fun<BasicUpdater<value>, Updater<Entity>>>;
        },
        removed: (id: Guid, u: BasicUpdater<boolean>): Updater<Collection<E>> =>
          Collection<E>().Updaters.Core.entity.set(id)(
            CollectionEntity<E>().Updaters.Core.removed(
              u
            )
          ),
        entityValue: (id: Guid, u: BasicUpdater<E>): Updater<Collection<E>> =>
          Collection<E>().Updaters.Core.entity.set(id)(
            CollectionEntity<E>().Updaters.Core.entity(
              Entity<E>().Updaters.Core.value(
                Debounced.Updaters.Core.value(
                  Synchronized.Updaters.value(
                    Value.Updaters.value(
                      Synchronized.Updaters.sync(
                        AsyncState.Operations.map(u)
                      )
                    )
                  )
                )
              )
            )
          ),
      },
      Template: {
        entityValue: (id: Guid, u: BasicUpdater<E>): Updater<Collection<E>> =>
          Collection<E>().Updaters.Core.entity.set(id)(
            CollectionEntity<E>().Updaters.Core.entity(
              Entity<E>().Updaters.Core.value(
                Debounced.Updaters.Template.value(
                  Synchronized.Updaters.value(
                    Value.Updaters.value(
                      Synchronized.Updaters.sync(
                        AsyncState.Operations.map(u)
                      )
                    )
                  )
                )
              )
            )
          ),
      }
    }
  })
};
