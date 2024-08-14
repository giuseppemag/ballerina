import { OrderedMap } from "immutable";
import { Value, Guid, BasicUpdater, Updater, Unit, DirtyStatus } from "@core";
import { Coroutine } from "../../../../../../coroutines/state";
import { Fun, BasicFun } from "../../../../../../fun/state";
import { Synchronized } from "../../../../synchronized/state";
import { SynchronizationResult } from "../../synchronization-result/state";
import { Collection, CollectionEntity } from "../state";
export type CollectionSynchronizers<Context, Collections, CollectionMutations> = {
    [k in (keyof Collections) & (keyof CollectionMutations)]: {
        add: (entity: CollectionEntity<Collections[k]>, position?: InsertionPosition) => Coroutine<Context & CollectionEntity<Collections[k]>, CollectionEntity<Collections[k]>, SynchronizationResult>;
        remove: (entityId: Guid) => Coroutine<Context & CollectionEntity<Collections[k]>, CollectionEntity<Collections[k]>, SynchronizationResult>;
        reload: () => Coroutine<Context & Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Unit>;
    } & {
        [_ in keyof (CollectionMutations[k])]: BasicFun<CollectionMutations[k][_], Coroutine<Context & CollectionEntity<Collections[k]>, CollectionEntity<Collections[k]>, SynchronizationResult>>;
    };
};
export type CollectionLoaders<Context, Collections, CollectionMutations, SynchronizedEntities> = {
    [k in (keyof Collections) & (keyof CollectionMutations)]: {
        <mutation extends (keyof CollectionSynchronizers<Context, Collections, CollectionMutations>[k]) & (keyof CollectionMutations[k])>(mutation: mutation, mutationArg: CollectionMutations[k][mutation], entityId: Guid): Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
        add: (entityId: Guid, entity: CollectionEntity<Collections[k]>, position?: InsertionPosition) => Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
        remove: (entityId: Guid) => Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
        reload: () => Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>;
    };
};
export declare const collectionEntityLoader: <Context, Collections, CollectionMutations, SynchronizedEntities>(synchronizers: CollectionSynchronizers<Context, Collections, CollectionMutations>) => <k extends (keyof Collections) & (keyof CollectionMutations)>(k: k, id: BasicFun<Collections[k], Guid>, narrowing_k: BasicFun<SynchronizedEntities, Collection<Collections[k]>>, widening_k: BasicFun<BasicUpdater<Collection<Collections[k]>>, Updater<SynchronizedEntities>>, dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>) => CollectionLoaders<Context, Collections, CollectionMutations, SynchronizedEntities>[k];
export type CollectionDirtySetters<Context, Collections, CollectionMutations, SynchronizedEntities> = {
    [k in (keyof Collections) & (keyof CollectionMutations)]: (entityId: Guid, dirtyStatus: DirtyStatus) => Coroutine<Context & SynchronizedEntities, SynchronizedEntities, Unit>;
};
export declare const collectionDirtySetter: <Context, Collections, CollectionMutations, SynchronizedEntities>() => <k extends (keyof Collections) & (keyof CollectionMutations)>(k: k, narrowing_k: BasicFun<SynchronizedEntities, Collection<Collections[k]>>, widening_k: BasicFun<BasicUpdater<Collection<Collections[k]>>, Updater<SynchronizedEntities>>) => CollectionDirtySetters<Context, Collections, CollectionMutations, SynchronizedEntities>[k];
export type CollectionDirtyCheckers<Collections, CollectionMutations> = {
    [k in (keyof Collections) & (keyof CollectionMutations)]: Fun<[Guid, Collection<Collections[k]>], boolean>;
};
export declare const collectionCheckNotDirty: <Collections, CollectionMutations>() => <k extends (keyof Collections) & (keyof CollectionMutations)>([id, e]: [Guid, Collection<Collections[k]>]) => boolean;
export type CollectionUpdaters<Collections, CollectionMutations, SynchronizedEntities> = {
    [k in (keyof Collections) & (keyof CollectionMutations)]: Fun<[Guid, BasicUpdater<Collections[k]>], Updater<SynchronizedEntities>>;
};
export declare const collectionEntityUpdater: <Collections, CollectionMutations, SynchronizedEntities>() => <k extends (keyof Collections) & (keyof CollectionMutations)>(widening_k: BasicFun<BasicUpdater<Collection<Collections[k]>>, Updater<SynchronizedEntities>>) => Fun<[Guid, BasicUpdater<Collections[k]>], Updater<SynchronizedEntities>>;
export type InsertionPosition = {
    kind: "after";
    id: Guid;
} | {
    kind: "before";
    id: Guid;
} | {
    kind: "at the end";
} | {
    kind: "at the beginning";
};
export type SynchronizableCollectionEntity<Context, Collections, CollectionMutations, SynchronizedEntities, k extends (keyof Collections) & (keyof CollectionMutations)> = {
    entityName: k;
    id: BasicFun<Collections[k], Guid>;
    narrowing: BasicFun<SynchronizedEntities, Collection<Collections[k]>>;
    widening: BasicFun<BasicUpdater<Collection<Collections[k]>>, Updater<SynchronizedEntities>>;
    dependees: Array<Coroutine<Context & SynchronizedEntities, SynchronizedEntities, SynchronizationResult>>;
    add: (entity: CollectionEntity<Collections[k]>, position?: InsertionPosition) => Coroutine<Context & Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Unit>;
    remove: (entityId: Guid) => Coroutine<Context & Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Unit>;
    reload: () => Coroutine<Context & Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Synchronized<Unit, OrderedMap<Guid, CollectionEntity<Collections[k]>>>, Unit>;
} & (k extends keyof CollectionMutations ? {
    [_ in keyof (CollectionMutations[k])]: BasicFun<CollectionMutations[k][_], Coroutine<Context & Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Unit>>;
} : {
    submit: Coroutine<Context & Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Synchronized<Value<Synchronized<Unit, Collections[k]>>, Unit>, Unit>;
});
export type SynchronizableEntityDescriptor<Context, Collections, CollectionMutations, SynchronizedEntities> = {
    [k in (keyof Collections) & (keyof CollectionMutations)]: SynchronizableCollectionEntity<Context, Collections, CollectionMutations, SynchronizedEntities, k>;
};
export declare const collectionSynchronizationContext: <Context, Collections, CollectionMutations, SynchronizedEntities>(entityDescriptors: SynchronizableEntityDescriptor<Context, Collections, CollectionMutations, SynchronizedEntities>) => [CollectionLoaders<Context, Collections, CollectionMutations, SynchronizedEntities>, CollectionDirtyCheckers<Collections, CollectionMutations>, CollectionDirtySetters<Context, Collections, CollectionMutations, SynchronizedEntities>, CollectionUpdaters<Collections, CollectionMutations, SynchronizedEntities>, SynchronizableEntityDescriptor<Context, Collections, CollectionMutations, SynchronizedEntities>];
//# sourceMappingURL=synchronizers.d.ts.map