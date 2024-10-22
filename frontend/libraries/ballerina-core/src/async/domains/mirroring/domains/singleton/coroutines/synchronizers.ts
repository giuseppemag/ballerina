import { Unit, replaceWith, BasicUpdater, Updater, Value, AsyncState, unit, MutationArgumentComparator } from "../../../../../../../main";
import { CoTypedFactory } from "../../../../../../coroutines/builder";
import { Coroutine } from "../../../../../../coroutines/state";
import { Debounced, DirtyStatus } from "../../../../../../debounced/state";
import { Fun, BasicFun } from "../../../../../../fun/state";
import { Synchronized } from "../../../../synchronized/state";
import { Entity } from "../../entity/state";
import { SynchronizationResult } from "../../synchronization-result/state";
import { Singleton } from "../state";

export type SingletonSynchronizers<Context, Singletons, SingletonMutations> = {
  [k in (keyof Singletons) & (keyof SingletonMutations)]:
  {
    [_ in keyof (SingletonMutations[k])]: BasicFun<SingletonMutations[k][_], Coroutine<Context & Entity<Singletons[k]>, Entity<Singletons[k]>, SynchronizationResult>>
  }
};

export const insideEntitySynchronizedAndDebounced = <Context, E>(
  k: Coroutine<Context & Synchronized<Value<Synchronized<Unit, E>>, Unit>, Synchronized<Value<Synchronized<Unit, E>>, Unit>, Unit>):
  Coroutine<Context & Entity<E>, Entity<E>, SynchronizationResult> => {
  const Co = CoTypedFactory<Context, Entity<E>>();
  return Co.SetState(
    Entity<E>().Updaters.Core.value(
      Debounced.Updaters.Core.dirty(replaceWith<DirtyStatus>("dirty but being processed"))
    )
  ).then(() => k.embed<Context & Entity<E>, Entity<E>>(_ => ({ ..._, ..._.value }), (u) => Entity<E>().Updaters.Core.value(
    Debounced.Updaters.Core.value(u)
  )
  ).then(() =>  Co.Return<SynchronizationResult>("completed"))
  )}

export type SingletonLoaders<Context, Singletons, SingletonMutations, SynchronizedEntities> = {
  [k in (keyof Singletons) & (keyof SingletonMutations)]:
  <mutation extends (keyof SingletonSynchronizers<Context, Singletons, SingletonMutations>[k]) & (keyof SingletonMutations[k])>(mutation: mutation, mutationArg:SingletonMutations[k][mutation]) =>
    Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
};

export type SingletonMutationArgumentComparators<Singletons, SingletonMutation> = {
  [k in (keyof Singletons) & (keyof SingletonMutation)]: {[_ in keyof SingletonMutation[k]]: MutationArgumentComparator<SingletonMutation[k][_]>};
};

export const singletonEntityLoader = <Context, Singletons, SingletonMutations, SynchronizedEntities>(
  synchronizers: SingletonSynchronizers<Context, Singletons, SingletonMutations>) => <k extends (keyof Singletons) & (keyof SingletonMutations)>(
    k: k, narrowing_k: BasicFun<SynchronizedEntities, Singleton<Singletons[k]>>,
    widening_k: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>,
    dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>) => 
      <mutation extends (keyof SingletonSynchronizers<Context, Singletons, SingletonMutations>[k]) & (keyof SingletonMutations[k])>(mutation: mutation, mutationArg:SingletonMutations[k][mutation]) : 
      Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult> => {
      const Co = CoTypedFactory<Context, SynchronizedEntities>();

      return (synchronizers[k][mutation](mutationArg) as Coroutine<Context & Entity<Singletons[k]>, Entity<Singletons[k]>, SynchronizationResult>).embed<Context & SynchronizedEntities, SynchronizedEntities>(_ => ({ ..._, ...narrowing_k(_).entity }),
        Singleton<Singletons[k]>().Updaters.Core.entity.then(
          widening_k
        )
      ).then(syncResult =>
        Co.All<SynchronizationResult>(dependees).then(syncResults =>
          Co.Return([syncResult, ...syncResults].some(_ => _ == "should be enqueued again") ? "should be enqueued again" : "completed")
        )
      )
    }

// export type SingletonReloadSynchronizers<Context, Singletons, SingletonMutations> = {
//   [k in (keyof Singletons) & (keyof SingletonMutations)]:
//   Coroutine<Context & Entity<Singletons[k]>, Entity<Singletons[k]>, SynchronizationResult>
// };
// export const reloaderToEntity = <Context, E>(
//   k: Coroutine<Context & Synchronized<Unit, E>, Synchronized<Unit, E>, Unit>):
//   Coroutine<Context & Entity<E>, Entity<E>, SynchronizationResult> => {
//   const Co = CoTypedFactory<Context, Entity<E>>();
//   return Co.Seq([
//     k.embed(
//       _ => ({..._, ..._.value.value}),
//       (_) => Entity<E>().Updaters.Core.value(
//         Debounced.Updaters.Core.value(
//           Synchronized.Updaters.value(
//             Value.Updaters.value(
//               _
//             )
//           )
//         )
//       ))
//   ]).then(() =>
//     Co.Return("completed" as const)
//   )
// }

// export type SingletonReloaders<Context, Singletons, SingletonMutations, SynchronizedEntities> = {
//   [k in (keyof Singletons) & (keyof SingletonMutations)]: Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
// };
// export const singletonEntityReloader = <Context, Singletons, SingletonMutations, SynchronizedEntities>(
//   synchronizers: SingletonReloadSynchronizers<Context, Singletons, SingletonMutations>) => <k extends (keyof Singletons) & (keyof SingletonMutations)>(
//     k: k, narrowing_k: BasicFun<SynchronizedEntities, Singleton<Singletons[k]>>,
//     widening_k: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>,
//     dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>):
//     Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult> => {
//     const Co = CoTypedFactory<Context, SynchronizedEntities>();

//     return (synchronizers[k]).embed<Context & SynchronizedEntities, SynchronizedEntities>(_ => ({ ..._, ...narrowing_k(_).entity }),
//       Singleton<Singletons[k]>().Updaters.Core.entity.then(
//         widening_k
//       )
//     ).then(syncResult =>
//       Co.All<SynchronizationResult>(dependees).then(syncResults =>
//         Co.Return([syncResult, ...syncResults].some(_ => _ == "should be enqueued again") ? "should be enqueued again" : "completed")
//       )
//     )
//   }

export type SingletonDirtySetters<Context, Singletons, SingletonMutations, SynchronizedEntities> = {
  [k in (keyof Singletons) & (keyof SingletonMutations)]:
  BasicFun<DirtyStatus, Coroutine<Context & SynchronizedEntities, SynchronizedEntities, Unit>>;
};

export const singletonDirtySetter = <Context, Singletons, SingletonMutations, SynchronizedEntities>() => <k extends (keyof Singletons) & (keyof SingletonMutations)>(
  k: k, narrowing_k: BasicFun<SynchronizedEntities, Singleton<Singletons[k]>>,
  widening_k: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>):
  BasicFun<DirtyStatus, Coroutine<Context & SynchronizedEntities, SynchronizedEntities, Unit>> =>
  (dirtyStatus) => {
    const CoEntity = CoTypedFactory<Context, Entity<Singletons[k]>>();
    const Co = CoTypedFactory<Context, SynchronizedEntities>();

    return (CoEntity.SetState(
      Entity<Singletons[k]>().Updaters.Core.value(
        Debounced.Updaters.Core.dirty(replaceWith<DirtyStatus>(dirtyStatus))
      )
    )).embed<Context & SynchronizedEntities, SynchronizedEntities>(_ => ({ ..._, ...narrowing_k(_).entity }),
      Singleton<Singletons[k]>().Updaters.Core.entity.then(
        widening_k
      )
    )
  }

export type SingletonDirtyCheckers<Singletons, SingletonMutations> = {
  [k in (keyof Singletons) & (keyof SingletonMutations)]: Fun<[Unit, Singleton<Singletons[k]>], boolean>;
};
export const singletonCheckNotDirty = <Singletons, SingletonMutations>() => <k extends (keyof Singletons) & (keyof SingletonMutations)>([_, e]: [Unit, Singleton<Singletons[k]>]): boolean => e.entity.value.dirty != "not dirty";

export type SingletonUpdaters<Singletons, SingletonMutations, SynchronizedEntities> = {
  [k in (keyof Singletons) & (keyof SingletonMutations)]: Fun<[Unit, BasicUpdater<Singletons[k]>], Updater<SynchronizedEntities>>;
};
export const singletonEntityUpdater = <Singletons, SingletonMutations, SynchronizedEntities>() => <k extends (keyof Singletons) & (keyof SingletonMutations)>(widening_k: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>): Fun<[Unit, BasicUpdater<Singletons[k]>], Updater<SynchronizedEntities>> => Fun(([_, u]) => widening_k(
  Singleton<Singletons[k]>().Updaters.Template.entityValue(u)
)
);


export type SynchronizableSingletonEntity<Context, Singletons, SingletonMutations, SynchronizedEntities, k extends (keyof Singletons) & (keyof SingletonMutations)> = {
  entityName: k,
  narrowing: BasicFun<SynchronizedEntities, Singleton<Singletons[k]>>,
  widening: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>,
  dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>,
  // reload: Coroutine<Context & Synchronized<Unit, Singletons[k]>, Synchronized<Unit, Singletons[k]>, Unit>,
} & {
  [_ in keyof (SingletonMutations[k])]: [
    BasicFun<SingletonMutations[k][_], Coroutine<Context & Synchronized<Value<Synchronized<Unit, Singletons[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Singletons[k]>>, Unit>, Unit>>,
    MutationArgumentComparator<SingletonMutations[k][_]>
  ]
}

export type SynchronizableEntityDescriptors<Context, Singletons, SingletonMutations, SynchronizedEntities> = {
  [k in (keyof Singletons) & (keyof SingletonMutations)]: SynchronizableSingletonEntity<Context, Singletons, SingletonMutations, SynchronizedEntities, k>
}


export const singletonSynchronizationContext = <Context, Singletons, SingletonMutations, SynchronizedEntities>(
  entityDescriptors: SynchronizableEntityDescriptors<Context, Singletons, SingletonMutations, SynchronizedEntities>):
  [
    SingletonLoaders<Context, Singletons, SingletonMutations, SynchronizedEntities>,
    // SingletonReloaders<Context, Singletons, SingletonMutations, SynchronizedEntities>,
    SingletonDirtyCheckers<Singletons, SingletonMutations>,
    SingletonDirtySetters<Context, Singletons, SingletonMutations, SynchronizedEntities>,
    SingletonUpdaters<Singletons, SingletonMutations, SynchronizedEntities>,
    SynchronizableEntityDescriptors<Context, Singletons, SingletonMutations, SynchronizedEntities>,
    SingletonMutationArgumentComparators<Singletons, SingletonMutations>,
  ] => {
  const synchronizers: SingletonSynchronizers<Context, Singletons, SingletonMutations> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Singletons) & (keyof SingletonMutations)

    synchronizers[k] = {} as any
    Object.keys(entityDescriptors[k]).forEach(field => {
      // only update the mutation fields of the entity descriptor
      if (field != "entityName" && field != "narrowing" && field != "widening" && field != "dependees" && field != "reload")
        (synchronizers[k] as any)[field] = (mutationArg:any) => insideEntitySynchronizedAndDebounced((entityDescriptors[k] as any)[field](mutationArg)) as any
    })
  })
  const loaders: SingletonLoaders<Context, Singletons, SingletonMutations, SynchronizedEntities> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Singletons) & (keyof SingletonMutations)
    loaders[k] = singletonEntityLoader<Context, Singletons, SingletonMutations, SynchronizedEntities>(synchronizers)(k, entityDescriptors[k].narrowing, entityDescriptors[k].widening, entityDescriptors[k].dependees)
  })

  // let reloadSynchronizers: SingletonReloadSynchronizers<Context, Singletons, SingletonMutations> = {} as any
  // Object.keys(entityDescriptors).forEach(k_s => {
  //   const k = k_s as (keyof Singletons) & (keyof SingletonMutations)
  //   reloadSynchronizers[k] = reloaderToEntity((entityDescriptors[k])["reload"]) as any
  // })
  // let reloaders: SingletonReloaders<Context, Singletons, SingletonMutations, SynchronizedEntities> = {} as any
  // Object.keys(entityDescriptors).forEach(k_s => {
  //   const k = k_s as (keyof Singletons) & (keyof SingletonMutations)
  //   reloaders[k] = singletonEntityReloader<Context, Singletons, SingletonMutations, SynchronizedEntities>(reloadSynchronizers)(k, entityDescriptors[k].narrowing, entityDescriptors[k].widening, entityDescriptors[k].dependees)
  // })

  const dirtyCheckers: SingletonDirtyCheckers<Singletons, SingletonMutations> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Singletons) & (keyof SingletonMutations)
    dirtyCheckers[k] = Fun(singletonCheckNotDirty<Singletons, SingletonMutations>())
  })
  const dirtySetters: SingletonDirtySetters<Context, Singletons, SingletonMutations, SynchronizedEntities> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Singletons) & (keyof SingletonMutations)
    dirtySetters[k] = singletonDirtySetter<Context, Singletons, SingletonMutations, SynchronizedEntities>()(
      k, entityDescriptors[k].narrowing, entityDescriptors[k].widening
    )
  })
  const updaters: SingletonUpdaters<Singletons, SingletonMutations, SynchronizedEntities> = {} as any
  Object.keys(entityDescriptors).forEach(k_s => {
    const k = k_s as (keyof Singletons) & (keyof SingletonMutations)
    updaters[k] = singletonEntityUpdater<Singletons, SingletonMutations, SynchronizedEntities>()(entityDescriptors[k].widening)
  })
  const mutationComparators: SingletonMutationArgumentComparators<Singletons, SingletonMutations> = {} as any;
  Object.keys(entityDescriptors).forEach((k_s) => {
    const k = k_s as (keyof Singletons) & (keyof SingletonMutations)
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
      (mutationComparators[k] as any)[field] = (entityDescriptors[k] as any)[field][1];
    });
  });
  return [loaders, /*reloaders,*/ dirtyCheckers, dirtySetters, updaters, entityDescriptors, mutationComparators]
}

