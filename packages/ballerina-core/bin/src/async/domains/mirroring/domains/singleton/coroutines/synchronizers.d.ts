import { Unit, BasicUpdater, Updater, Value } from "@core";
import { Coroutine } from "../../../../../../coroutines/state";
import { DirtyStatus } from "../../../../../../debounced/state";
import { Fun, BasicFun } from "../../../../../../fun/state";
import { Synchronized } from "../../../../synchronized/state";
import { Entity } from "../../entity/state";
import { SynchronizationResult } from "../../synchronization-result/state";
import { Singleton } from "../state";
export type SingletonSynchronizers<Context, Singletons, SingletonMutations> = {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: {
        [_ in keyof (SingletonMutations[k])]: BasicFun<SingletonMutations[k][_], Coroutine<Context & Entity<Singletons[k]>, Entity<Singletons[k]>, SynchronizationResult>>;
    };
};
export declare const insideEntitySynchronizedAndDebounced: <Context, E>(k: Coroutine<Context & Synchronized<Value<Synchronized<Unit, E>>, Unit>, Synchronized<Value<Synchronized<Unit, E>>, Unit>, Unit>) => Coroutine<Context & Entity<E>, Entity<E>, SynchronizationResult>;
export type SingletonLoaders<Context, Singletons, SingletonMutations, SynchronizedEntities> = {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: <mutation extends (keyof SingletonSynchronizers<Context, Singletons, SingletonMutations>[k]) & (keyof SingletonMutations[k])>(mutation: mutation, mutationArg: SingletonMutations[k][mutation]) => Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
};
export declare const singletonEntityLoader: <Context, Singletons, SingletonMutations, SynchronizedEntities>(synchronizers: SingletonSynchronizers<Context, Singletons, SingletonMutations>) => <k extends (keyof Singletons) & (keyof SingletonMutations)>(k: k, narrowing_k: BasicFun<SynchronizedEntities, Singleton<Singletons[k]>>, widening_k: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>, dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>) => <mutation extends (keyof SingletonSynchronizers<Context, Singletons, SingletonMutations>[k]) & (keyof SingletonMutations[k])>(mutation: mutation, mutationArg: SingletonMutations[k][mutation]) => Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
export type SingletonReloadSynchronizers<Context, Singletons, SingletonMutations> = {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: Coroutine<Context & Entity<Singletons[k]>, Entity<Singletons[k]>, SynchronizationResult>;
};
export declare const reloaderToEntity: <Context, E>(k: Coroutine<Context & Synchronized<Unit, E>, Synchronized<Unit, E>, Unit>) => Coroutine<Context & Entity<E>, Entity<E>, SynchronizationResult>;
export type SingletonReloaders<Context, Singletons, SingletonMutations, SynchronizedEntities> = {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
};
export declare const singletonEntityReloader: <Context, Singletons, SingletonMutations, SynchronizedEntities>(synchronizers: SingletonReloadSynchronizers<Context, Singletons, SingletonMutations>) => <k extends (keyof Singletons) & (keyof SingletonMutations)>(k: k, narrowing_k: BasicFun<SynchronizedEntities, Singleton<Singletons[k]>>, widening_k: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>, dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>) => Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
export type SingletonDirtySetters<Context, Singletons, SingletonMutations, SynchronizedEntities> = {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: BasicFun<DirtyStatus, Coroutine<Context & SynchronizedEntities, SynchronizedEntities, Unit>>;
};
export declare const singletonDirtySetter: <Context, Singletons, SingletonMutations, SynchronizedEntities>() => <k extends (keyof Singletons) & (keyof SingletonMutations)>(k: k, narrowing_k: BasicFun<SynchronizedEntities, Singleton<Singletons[k]>>, widening_k: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>) => BasicFun<DirtyStatus, Coroutine<Context & SynchronizedEntities, SynchronizedEntities, Unit>>;
export type SingletonDirtyCheckers<Singletons, SingletonMutations> = {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: Fun<[Unit, Singleton<Singletons[k]>], boolean>;
};
export declare const singletonCheckNotDirty: <Singletons, SingletonMutations>() => <k extends (keyof Singletons) & (keyof SingletonMutations)>([_, e]: [Unit, Singleton<Singletons[k]>]) => boolean;
export type SingletonUpdaters<Singletons, SingletonMutations, SynchronizedEntities> = {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: Fun<[Unit, BasicUpdater<Singletons[k]>], Updater<SynchronizedEntities>>;
};
export declare const singletonEntityUpdater: <Singletons, SingletonMutations, SynchronizedEntities>() => <k extends (keyof Singletons) & (keyof SingletonMutations)>(widening_k: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>) => Fun<[Unit, BasicUpdater<Singletons[k]>], Updater<SynchronizedEntities>>;
export type SynchronizableSingletonEntity<Context, Singletons, SingletonMutations, SynchronizedEntities, k extends (keyof Singletons) & (keyof SingletonMutations)> = {
    entityName: k;
    narrowing: BasicFun<SynchronizedEntities, Singleton<Singletons[k]>>;
    widening: BasicFun<BasicUpdater<Singleton<Singletons[k]>>, Updater<SynchronizedEntities>>;
    dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>;
    reload: Coroutine<Context & Synchronized<Unit, Singletons[k]>, Synchronized<Unit, Singletons[k]>, Unit>;
} & {
    [_ in keyof (SingletonMutations[k])]: BasicFun<SingletonMutations[k][_], Coroutine<Context & Synchronized<Value<Synchronized<Unit, Singletons[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Singletons[k]>>, Unit>, Unit>>;
};
export type SynchronizableEntityDescriptors<Context, Singletons, SingletonMutations, SynchronizedEntities> = {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: SynchronizableSingletonEntity<Context, Singletons, SingletonMutations, SynchronizedEntities, k>;
};
export declare const singletonSynchronizationContext: <Context, Singletons, SingletonMutations, SynchronizedEntities>(entityDescriptors: SynchronizableEntityDescriptors<Context, Singletons, SingletonMutations, SynchronizedEntities>) => [SingletonLoaders<Context, Singletons, SingletonMutations, SynchronizedEntities>, SingletonReloaders<Context, Singletons, SingletonMutations, SynchronizedEntities>, SingletonDirtyCheckers<Singletons, SingletonMutations>, SingletonDirtySetters<Context, Singletons, SingletonMutations, SynchronizedEntities>, SingletonUpdaters<Singletons, SingletonMutations, SynchronizedEntities>, SynchronizableEntityDescriptors<Context, Singletons, SingletonMutations, SynchronizedEntities>];
//# sourceMappingURL=synchronizers.d.ts.map