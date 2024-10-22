import { OrderedMap } from "immutable";
import { Value, Guid, BasicUpdater, Updater, Unit, CoTypedFactory, AsyncState, replaceWith, DirtyStatus, Entity, Debounced, Synchronize, Sum, unit } from "../../../../../../../main";
import { Coroutine } from "../../../../../../coroutines/state";
import { Fun, BasicFun } from "../../../../../../fun/state";
import { Synchronized } from "../../../../synchronized/state";
import { insideEntitySynchronizedAndDebounced } from "../../singleton/coroutines/synchronizers";
import { SynchronizationResult } from "../../synchronization-result/state";
import { Collection, CollectionEntity } from "../state";

export type CollectionSynchronizers<Context, Collections, CollectionMutations, WholeCollectionMutations> = {
  [k in (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)]: {
    add: (entity: CollectionEntity<Collections[k]>, position?: InsertionPosition) =>
      Coroutine<Context & CollectionEntity<Collections[k]>, CollectionEntity<Collections[k]>, SynchronizationResult>,
    remove: (entityId: Guid) =>
      Coroutine<Context & CollectionEntity<Collections[k]>, CollectionEntity<Collections[k]>, SynchronizationResult>,
    // reload: () =>
    //   Coroutine<Context & Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Unit>,
    wholeMutations:
    {
      [_ in keyof (WholeCollectionMutations[k])]: BasicFun<WholeCollectionMutations[k][_], Coroutine<Context & Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Unit>>
    }
  } &
  {
    [_ in keyof (CollectionMutations[k])]: BasicFun<CollectionMutations[k][_], Coroutine<Context & CollectionEntity<Collections[k]>, CollectionEntity<Collections[k]>, SynchronizationResult>>
  }
};

export type CollectionLoaders<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities> = {
  [k in (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)]: {
    <mutation extends (keyof CollectionSynchronizers<Context, Collections, CollectionMutations, WholeCollectionMutations>[k]) & (keyof CollectionMutations[k])>(mutation: mutation, mutationArg: CollectionMutations[k][mutation], entityId: Guid):
      Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>,
    add: (entityId: Guid, entity: CollectionEntity<Collections[k]>, position?: InsertionPosition) =>
      Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>,
    remove: (entityId: Guid) =>
      Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>,
    // reload: () =>
    //   Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>,
    wholeMutations: <mutation extends (keyof CollectionSynchronizers<Context, Collections, CollectionMutations, WholeCollectionMutations>[k]) & (keyof WholeCollectionMutations[k]) >(mutation: mutation, mutationArg: WholeCollectionMutations[k][mutation]) =>
      Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>,
  }
};

export const collectionEntityLoader = <Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>(
  synchronizers: CollectionSynchronizers<Context, Collections, CollectionMutations, WholeCollectionMutations>) =>
  <k extends (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)>(k: k,
    id: BasicFun<Collections[k], Guid>,
    narrowing_k: BasicFun<SynchronizedEntities, Collection<Collections[k]>>,
    widening_k: BasicFun<BasicUpdater<Collection<Collections[k]>>, Updater<SynchronizedEntities>>,
    dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>):
    CollectionLoaders<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>[k] =>
    Object.assign(
      <mutation extends (keyof CollectionSynchronizers<Context, Collections, CollectionMutations, WholeCollectionMutations>[k]) & (keyof CollectionMutations[k])>(mutation: mutation, mutationArg: CollectionMutations[k][mutation], entityId: Guid):
        Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult> => {
        const Co = CoTypedFactory<Context, SynchronizedEntities>();
        return Co.GetState().then(current => {
          const entities = narrowing_k(current).entities
          if (!AsyncState.Operations.hasValue(entities.sync) || !entities.sync.value.get(entityId))
            return Co.Return("completed" as const)
          return (synchronizers[k][mutation](mutationArg as any) as Coroutine<Context & CollectionEntity<Collections[k]>, CollectionEntity<Collections[k]>, SynchronizationResult>)
            .embed<Context & SynchronizedEntities, SynchronizedEntities>(
              _ => {
                const entities = narrowing_k(_).entities
                if (AsyncState.Operations.hasValue(entities.sync)) {
                  const entity = entities.sync.value.get(entityId)
                  if (entity != undefined)
                    return ({ ..._, ...entity })
                }
                return undefined
              },
              Fun(Collection<Collections[k]>().Updaters.Core.entity.set(entityId)).then(widening_k)
            ).then(syncResult =>
              Co.All<SynchronizationResult>(dependees).then(syncResults =>
                Co.Return([syncResult, ...syncResults].some(_ => _ == "should be enqueued again") ? "should be enqueued again" : "completed")
              )
            )
        })
      },
      {
        add: (entityId: Guid, entity: CollectionEntity<Collections[k]>, position?: InsertionPosition):
          Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult> => {
          const Co = CoTypedFactory<Context, SynchronizedEntities>();
          const CoColl = CoTypedFactory<Context, Collection<Collections[k]>>();
          return CoColl.SetState(
            _ => {
              // alert("state set?!?")
              // return Collection<Collections[k]>().Updaters.Core.entity.add([entityId, entity, position ?? { kind: "at the end" }])(_)
              return _
            }
          ).embed<Context & SynchronizedEntities, SynchronizedEntities>(_ => ({ ..._, ...(narrowing_k(_)) }), widening_k)
            .then(() =>
              synchronizers[k].add(entity).embed<Context & SynchronizedEntities, SynchronizedEntities>(
                _ => {
                  const entities = narrowing_k(_).entities
                  if (AsyncState.Operations.hasValue(entities.sync)) {
                    const entity = entities.sync.value.get(entityId)
                    if (entity != undefined)
                      return ({ ..._, ...(entity) })
                  }
                  return undefined
                },
                Fun(Collection<Collections[k]>().Updaters.Core.entity.set(entityId)).then(
                  widening_k
                )
              )
                // )
                // .then(_ => 
                //   CoColl.GetState().then(current => {
                //     if (!AsyncState.Operations.hasValue(current.entities.sync)) return CoColl.Return(unit)
                //     const syncedEntity = current.entities.sync.value.get(entityId)
                //     if (!syncedEntity || !AsyncState.Operations.hasValue(syncedEntity.value.value.sync)) return CoColl.Return(unit)
                //     if (id(syncedEntity.value.value.sync.value) == entityId) return CoColl.Return(unit)
                //     // otherwise, the id has changed (probably overridden by the API), let's save the new id
                //     return CoColl.SetState(
                //       Collection<Collections[k]>().Updaters.Core.entity.add([id(syncedEntity.value.value.sync.value), syncedEntity, position ?? { kind:"at the end" }]).then(
                //         Collection<Collections[k]>().Updaters.Core.entity.remove(entityId)
                //       )
                //     )
                //   }
                //   )
                //   .embed<Context & SynchronizedEntities, SynchronizedEntities>(_ => ({ ..._, ...(narrowing_k(_)) }), widening_k)
                .then((syncResult) =>
                  Co.All<SynchronizationResult>(dependees).then((syncResults) =>
                    Co.Return(
                      [syncResult, ...syncResults].some(
                        (_) => _ == "should be enqueued again"
                      )
                        ? "should be enqueued again"
                        : "completed"
                    )
                  )
                )
            )
        },
        remove: (entityId: Guid):
          Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult> => {
          const Co = CoTypedFactory<Context, SynchronizedEntities>();
          const CoColl = CoTypedFactory<Context, Collection<Collections[k]>>();
          return CoColl.SetState(
            // Collection<Collections[k]>().Updaters.Core.entity.remove(entityId)
            Collection<Collections[k]>().Updaters.Core.removed(entityId, replaceWith(true))
          ).embed<Context & SynchronizedEntities, SynchronizedEntities>(_ => ({ ..._, ...(narrowing_k(_)) }), widening_k)
            .then(() =>
              synchronizers[k].remove(entityId).embed<Context & SynchronizedEntities, SynchronizedEntities>(
                _ => {
                  const entities = narrowing_k(_).entities
                  if (AsyncState.Operations.hasValue(entities.sync)) {
                    const entity = entities.sync.value.get(entityId)
                    if (entity != undefined)
                      return ({ ..._, ...(entity) })
                  }
                  return undefined
                },
                Fun(Collection<Collections[k]>().Updaters.Core.entity.set(entityId)).then(
                  widening_k
                )
              )
            ).then((_) =>
              Co.GetState().then(current => {
                const entities = narrowing_k(current).entities
                if (!AsyncState.Operations.hasValue(entities.sync)) return Co.Return<SynchronizationResult>("completed")
                const entity = entities.sync.value.get(entityId)
                if (!entity || entity.value.sync.kind == "error") return Co.Return<SynchronizationResult>("completed")
                return Co.All<SynchronizationResult>(dependees).then((syncResults) =>
                  Co.Return(
                    syncResults.some(
                      (_) => _ == "should be enqueued again"
                    )
                      ? "should be enqueued again"
                      : "completed"
                  )
                )
              })
            )
        },
        wholeMutations: <mutation extends (keyof CollectionSynchronizers<Context, Collections, CollectionMutations, WholeCollectionMutations>[k]) & (keyof WholeCollectionMutations[k])>(mutation: mutation, mutationArg: WholeCollectionMutations[k][mutation]):
          Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult> => {
          const Co = CoTypedFactory<Context, SynchronizedEntities>();
          const CoColl = CoTypedFactory<Context, Collection<Collections[k]>>();
          return CoColl.Seq([
            synchronizers[k]["wholeMutations"][mutation](mutationArg).embed(
              _ => ({ ..._, ..._.entities }),
              Collection<Collections[k]>().Updaters.Core.entities,
            )
          ])
            .embed<Context & SynchronizedEntities, SynchronizedEntities>(_ => ({ ..._, ...(narrowing_k(_)) }), widening_k)
            .then((syncResult) =>
              Co.All<SynchronizationResult>(dependees).then((syncResults) =>
                Co.Return(
                  [syncResult, ...syncResults].some(
                    (_) => _ == "should be enqueued again"
                  )
                    ? "should be enqueued again"
                    : "completed"
                )
              )
            )
        }
      }
    )

export type CollectionDirtySetters<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities> = {
  [k in (keyof Collections) & (keyof CollectionMutations)]:
  (entityId: Guid, dirtyStatus: DirtyStatus) => Coroutine<Context & SynchronizedEntities, SynchronizedEntities, Unit>
};

export const collectionDirtySetter = <Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>() =>
  <k extends (keyof Collections) & (keyof CollectionMutations)>(k: k,
    narrowing_k: BasicFun<SynchronizedEntities, Collection<Collections[k]>>,
    widening_k: BasicFun<BasicUpdater<Collection<Collections[k]>>, Updater<SynchronizedEntities>>):
    CollectionDirtySetters<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>[k] =>
    (entityId: Guid, dirtyStatus: DirtyStatus) => {
      const CoEntity = CoTypedFactory<Context, CollectionEntity<Collections[k]>>();
      const Co = CoTypedFactory<Context, SynchronizedEntities>();
      return (CoEntity.SetState(
        CollectionEntity<Collections[k]>().Updaters.Core.entity(
          Entity<Collections[k]>().Updaters.Core.value(
            Debounced.Updaters.Core.dirty(replaceWith<DirtyStatus>(dirtyStatus))
          )
        )
      )
      ).embed<Context & SynchronizedEntities, SynchronizedEntities>(
        _ => {
          const _narrowed = narrowing_k(_)
          const entities = _narrowed.entities
          if (AsyncState.Operations.hasValue(entities.sync)) {
            const entity = entities.sync.value.get(entityId)
            if (entity != undefined)
              return ({ ..._, ...entity })
          }
          return undefined
        },
        Fun(Collection<Collections[k]>().Updaters.Core.entity.set(entityId)).then(widening_k)
      )
    }

export type CollectionDirtyCheckers<Collections, CollectionMutations, WholeCollectionMutations> = {
  [k in (keyof Collections) & (keyof CollectionMutations)]: Fun<[Guid, Collection<Collections[k]>], boolean>;
};

export const collectionCheckNotDirty = <Collections, CollectionMutations, WholeCollectionMutations>() => <k extends (keyof Collections) & (keyof CollectionMutations)>([id, e]: [Guid, Collection<Collections[k]>]): boolean => {
  return AsyncState.Operations.hasValue(e.entities.sync) && e.entities.sync.value.get(id)?.value.dirty != "not dirty";
}

export type CollectionUpdaters<Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities> = {
  [k in (keyof Collections) & (keyof CollectionMutations)]: Fun<[Guid, BasicUpdater<Collections[k]>], Updater<SynchronizedEntities>>;
};

export const collectionEntityUpdater = <Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>() => <k extends (keyof Collections) & (keyof CollectionMutations)>(widening_k: BasicFun<BasicUpdater<Collection<Collections[k]>>, Updater<SynchronizedEntities>>): Fun<[Guid, BasicUpdater<Collections[k]>], Updater<SynchronizedEntities>> => Fun(([id, u]) => widening_k(
  Collection<Collections[k]>().Updaters.Template.entityValue(id, u)
));

export type CollectionMutationArgumentComparators<Collections, CollectionMutations> = {
  [k in keyof Collections & keyof CollectionMutations]: {[_ in keyof CollectionMutations[k]]: MutationArgumentComparator<CollectionMutations[k][_]>};
};

export type WholeCollectionMutationArgumentComparators<Collections, WholeCollectionMutations> = {
  [k in keyof Collections & keyof WholeCollectionMutations]: {[_ in keyof WholeCollectionMutations[k]]: MutationArgumentComparator<WholeCollectionMutations[k][_]>};
};

export type InsertionPosition = { kind: "after", id: Guid } | { kind: "before", id: Guid } | { kind: "at the end" } | { kind: "at the beginning" }

export type ComparisonResult = ">" | "<" | "==";

export type MutationArgumentComparator<T> = BasicFun<[T, T], ComparisonResult>;

export const withTrivialComparator = <f, ma>(_: f): [f, MutationArgumentComparator<ma>] => [_, (_) => "=="];

export type SynchronizableCollectionEntity<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities, k extends (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)> = {
  entityName: k,
  // default: BasicFun<void, CollectionEntity<Collections[k]>>,
  id: BasicFun<Collections[k], Guid>,
  narrowing: BasicFun<SynchronizedEntities, Collection<Collections[k]>>,
  widening: BasicFun<BasicUpdater<Collection<Collections[k]>>, Updater<SynchronizedEntities>>,
  dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>,
  add: (entity: CollectionEntity<Collections[k]>, position?: InsertionPosition) =>
    Coroutine<Context & Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Unit>,
  remove: (entityId: Guid) =>
    Coroutine<Context & Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Unit>,
  // reload: () =>
  //   Coroutine<Context & Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Unit>,
} & {
  [_ in keyof (CollectionMutations[k])]: [
    BasicFun<CollectionMutations[k][_], Coroutine<Context & Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Unit>>,
    MutationArgumentComparator<CollectionMutations[k][_]>,
  ]
} & {
  wholeMutations:{
    [_ in keyof (WholeCollectionMutations[k])]: [
      BasicFun<WholeCollectionMutations[k][_], Coroutine<Context & Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Unit>>,
      MutationArgumentComparator<WholeCollectionMutations[k][_]>
    ]
  }
}

export type SynchronizableEntityDescriptor<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities> = {
  [k in (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)]: SynchronizableCollectionEntity<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities, k>
}


export const collectionSynchronizationContext = <Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>(
  entityDescriptors: SynchronizableEntityDescriptor<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>):
  [
    CollectionLoaders<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>,
    CollectionDirtyCheckers<Collections, CollectionMutations, WholeCollectionMutations>,
    CollectionDirtySetters<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>,
    CollectionUpdaters<Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>,
    SynchronizableEntityDescriptor<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>,
    CollectionMutationArgumentComparators<Collections, CollectionMutations>,
    CollectionMutationArgumentComparators<Collections, WholeCollectionMutations>,
  ] => {
  let synchronizers: CollectionSynchronizers<Context, Collections, CollectionMutations, WholeCollectionMutations> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)
    synchronizers[k] = {} as any
    Object.keys(entityDescriptors[k]).forEach(field => {
      // only update the mutation fields of the entity descriptor
      if (field != "entityName" && field != "narrowing" && field != "widening" && field != "dependees" && field != "add" && field != "remove" && field != "default" && field != "reload" && field != "reloadElement")
        (synchronizers[k] as any)[field] = (mutationArg: any) => {
          return insideEntitySynchronizedAndDebounced((entityDescriptors[k] as any)[field](mutationArg)) as any
        }
    });

    (synchronizers[k] as any)["add"] = (entity: CollectionEntity<any>, position?: InsertionPosition) =>
      insideEntitySynchronizedAndDebounced((entityDescriptors[k] as any)["add"](entity, position)) as any
    (synchronizers[k] as any)["remove"] = (entityId: Guid) =>
      insideEntitySynchronizedAndDebounced((entityDescriptors[k] as any)["remove"](entityId)) as any
    (synchronizers[k] as any)["wholeMutations"] = {} as any
    Object.keys(entityDescriptors[k]["wholeMutations"]).forEach(field => {
      (synchronizers[k] as any)["wholeMutations"][field] = (mutationArg:any) => (entityDescriptors[k]["wholeMutations"] as any)[field](mutationArg)
    })
  })
  const loaders: CollectionLoaders<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)
    loaders[k] = collectionEntityLoader<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>(synchronizers)(k, entityDescriptors[k].id, entityDescriptors[k].narrowing, entityDescriptors[k].widening, entityDescriptors[k].dependees)
  })
  const dirtyCheckers: CollectionDirtyCheckers<Collections, CollectionMutations, WholeCollectionMutations> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)
    dirtyCheckers[k] = Fun(collectionCheckNotDirty<Collections, CollectionMutations, WholeCollectionMutations>())
  })
  const dirtySetters: CollectionDirtySetters<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)
    dirtySetters[k] =
      collectionDirtySetter<Context, Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>()
        (k, entityDescriptors[k].narrowing, entityDescriptors[k].widening)
  })
  const updaters: CollectionUpdaters<Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations)
    updaters[k] = collectionEntityUpdater<Collections, CollectionMutations, WholeCollectionMutations, SynchronizedEntities>()(entityDescriptors[k].widening)
  })
  const mutationComparators: CollectionMutationArgumentComparators<Collections, CollectionMutations> = {} as any;
  Object.keys(entityDescriptors).forEach((k_s) => {
    const k = k_s as (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations);
    mutationComparators[k] = {} as any;
    Object.keys(entityDescriptors[k]).forEach((field) => {
      if (
        field != "entityName" &&
        field != "narrowing" &&
        field != "widening" &&
        field != "dependees" &&
        field != "add" &&
        field != "remove" &&
        field != "default" &&
        field != "reload"
      )
        (mutationComparators[k] as any)[field] = (entityDescriptors[k] as any)[field][1]
    });
  });
  const wholeMutationComparators: WholeCollectionMutationArgumentComparators<Collections, WholeCollectionMutations> = {} as any;
  Object.keys(entityDescriptors).forEach((k_s) => {
    const k = k_s as (keyof Collections) & (keyof CollectionMutations) & (keyof WholeCollectionMutations);
    wholeMutationComparators[k] = {} as any;
    Object.keys(entityDescriptors[k]).forEach((field) => {
      if (
        field != "entityName" &&
        field != "narrowing" &&
        field != "widening" &&
        field != "dependees" &&
        field != "add" &&
        field != "remove" &&
        field != "default" &&
        field != "reload"
      )
        (wholeMutationComparators[k] as any)[field] = (entityDescriptors[k] as any)[field][1];
    });
  });
  return [loaders, dirtyCheckers, dirtySetters, updaters, entityDescriptors, mutationComparators, wholeMutationComparators]
}
