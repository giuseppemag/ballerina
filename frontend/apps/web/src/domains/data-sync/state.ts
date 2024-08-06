import { Unit, Guid, SynchronizableEntityDescriptors, unit, simpleUpdaterWithChildren, CollectionEntity, mapUpdater, ForeignMutationsInput, BasicUpdater, AsyncState } from "ballerina-core"
import { OrderedMap } from "immutable"
import { v4 } from "uuid"
import { UserData } from "./domains/entities/domains/singletons/domains/user/state"
import { Address } from "./domains/entities/domains/collections/domains/address/state"
import { Invoice } from "./domains/entities/domains/collections/domains/invoice/state"
import { Singletons, SingletonMutations } from "./domains/entities/domains/singletons/state"
import { Collections, CollectionMutations } from "./domains/entities/domains/collections/state"
import { Entities } from "./domains/entities/state"
import { Queue } from "./domains/queue/state"
import { singletonsConfig } from "./coroutines/singletons/config"
import { collectionsConfig } from "./coroutines/collections/config"
import { Forms } from "./domains/forms/state"

export type DataSync = {
  entities: Entities,
  queue: Queue,
  forms: Forms
}
export const DataSync = () => ({
  Default: (user: UserData | undefined, addresses: OrderedMap<Guid, Address>, invoices: OrderedMap<Guid, Invoice>): DataSync => ({
    entities: Entities.Default(user, addresses, invoices),
    queue: OrderedMap(),
    forms: Forms.Default(),
  }),
  Updaters: {
    Core: {
      ...simpleUpdaterWithChildren<DataSync>()(Entities.Updaters)("entities"),
      ...simpleUpdaterWithChildren<DataSync>()(Forms.Updaters)("forms"),
      ...mapUpdater<DataSync>()("queue", "queue"),
    }
  },
  ForeignMutations: (_: ForeignMutationsInput<DataSyncReadonlyContext, DataSyncWritableState>) => {
    const [SingletonLoaders, SingletonReloaders, SingletonDirtyCheckers, SingletonDirtySetters, SingletonUpdaters, SingletonEntityConfigs] = singletonsConfig();
    const [CollectionLoaders, CollectionDirtyCheckers, CollectionDirtySetters, CollectionUpdaters, CollectionEntityConfigs] = collectionsConfig();

    return ({
      reloadSingleton: <k extends (keyof Singletons) & (keyof SingletonMutations)>(k: k, entityId: Guid) => {
        // if (AsyncState.Operations.hasValue(_.context.entities.sync)) {
        if (!_.context.queue.some(value => value.entityId == entityId && value.entity == k && value.mutation == "reload")) {
          _.setState(
            DataSync().Updaters.Core.queue.add([
              v4(),
              {
                entity: k,
                mutation: "reload",
                entityId,
                dirtySetter: _ => SingletonDirtySetters[k](_),
                operation: SingletonReloaders[k]
              }
            ])
          )
        }
        // }
      },
      updateSingleton: <k extends (keyof Singletons) & (keyof SingletonMutations)>(k: k, entityId: Guid) =>
        <mutation extends keyof (SingletonMutations[k])>(
          mutation: mutation, mutationArg:SingletonMutations[k][mutation], updater: BasicUpdater<Singletons[k]>
        ) => {
          // if (AsyncState.Operations.hasValue(_.context.entities.sync)) {
          const entities = _.context.entities
          if (!_.context.queue.some(value => value.entityId == entityId && value.entity == k && value.mutation == mutation as any)) {
            _.setState(
              SingletonUpdaters[k]([unit, updater]).then(
                DataSync().Updaters.Core.queue.add([
                  v4(),
                  {
                    entity: k,
                    mutation: mutation as any,
                    entityId,
                    dirtySetter: _ => SingletonDirtySetters[k](_),
                    operation: SingletonLoaders[k](mutation as any, mutationArg)
                  }
                ])
              )
            )
          } else {
            _.setState(
              SingletonUpdaters[k]([unit, updater])
            )
          }
          // }
        },
      updateCollectionElement: <k extends (keyof Collections) & (keyof CollectionMutations)>(k: k, entityId: Guid) =>
        <mutation extends keyof (CollectionMutations[k])>(
          mutation: mutation, mutationArg:CollectionMutations[k][mutation], updater: BasicUpdater<Collections[k]>
        ) => {
          // if (AsyncState.Operations.hasValue(_.context.entities.sync)) {
          const entities = _.context.entities
          if (!_.context.queue.some(value => value.entityId == entityId && value.entity == k && value.mutation == mutation as any)) {
            _.setState(
              CollectionUpdaters[k]([entityId, updater]).then(
                DataSync().Updaters.Core.queue.add([
                  v4(),
                  {
                    entity: k,
                    mutation: mutation as any,
                    entityId,
                    dirtySetter: _ => CollectionDirtySetters[k](entityId, _),
                    operation: CollectionLoaders[k](mutation as any, mutationArg, entityId)
                  }
                ])
              )
            )
          } else {
            _.setState(
              CollectionUpdaters[k]([entityId, updater])
            )
          }
          // }
        },
      addElementToCollection: <k extends ((keyof Collections) & (keyof CollectionMutations)) & (keyof CollectionMutations)>(k: k) =>
        (entityId: Guid, newEntity: CollectionEntity<Collections[k]>) => {
          // if (AsyncState.Operations.hasValue(_.context.entities.sync)) {
          const entities = _.context.entities
          if (!_.context.queue.some(value => value.entityId == entityId && value.entity == k && value.mutation == "add")) {
            _.setState(
              (
                DataSync().Updaters.Core.queue.add([
                  v4(),
                  {
                    entity: k,
                    mutation: "add",
                    entityId,
                    dirtySetter: _ => CollectionDirtySetters[k](entityId, _),
                    operation: CollectionLoaders[k].add(entityId, newEntity)
                  }
                ])
              )
            )
            // }
          }
        },
      removeElementFromCollection: <k extends ((keyof Collections) & (keyof CollectionMutations)) & (keyof CollectionMutations)>(k: k) =>
        (entityId: Guid) => {
          // if (AsyncState.Operations.hasValue(_.context.entities.sync)) {
          const entities = _.context.entities
          // skip enqueuing of the entity in the patch-queue if it is already dirty
          // if (!CollectionDirtyCheckers[k]([entityId, entity])) {
          if (!_.context.queue.some(value => value.entityId == entityId && value.entity == k && value.mutation == "remove")) {
            _.setState(
              (
                DataSync().Updaters.Core.queue.add([
                  v4(),
                  {
                    entity: k,
                    mutation: "remove",
                    entityId,
                    dirtySetter: _ => CollectionDirtySetters[k](entityId, _),
                    operation: CollectionLoaders[k].remove(entityId)
                  }
                ])
              )
            )
          }
          // }
        },
    })
  }
})

export type DataSyncReadonlyContext = Unit
export type DataSyncWritableState = DataSync
export type DataSyncForeignMutationsExposed = ReturnType<typeof DataSync>["ForeignMutations"]
export type DataSyncForeignMutationsExpected = Unit
