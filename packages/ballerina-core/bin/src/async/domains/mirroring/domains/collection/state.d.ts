import { BasicUpdater, Guid, Synchronized, Updater, Unit, InsertionPosition } from "@core";
import { OrderedMap } from "immutable";
import { Entity } from "../entity/state";
export type CollectionEntity<E> = Entity<E> & {
    removed: boolean;
};
export declare const CollectionEntity: <E>() => {
    Default: (value: E) => CollectionEntity<E>;
    Updaters: {
        Core: {
            entity: (_: BasicUpdater<Entity<E>>) => Updater<CollectionEntity<E>>;
            removed: (_: BasicUpdater<boolean>) => Updater<CollectionEntity<E>>;
        };
    };
};
export type Collection<E> = {
    entities: Synchronized<Unit, OrderedMap<Guid, CollectionEntity<E>>>;
};
export declare const Collection: <E>() => {
    Default: (entities: OrderedMap<Guid, CollectionEntity<E>>) => Collection<E>;
    Updaters: {
        Core: {
            entity: {
                add: ([id, value, position]: [Guid, CollectionEntity<E>, InsertionPosition]) => Updater<Collection<E>>;
                remove: (id: Guid) => Updater<Collection<E>>;
                set: (id: Guid) => (u: BasicUpdater<CollectionEntity<E>>) => Updater<Collection<E>>;
            };
            removed: (id: Guid, u: BasicUpdater<boolean>) => Updater<Collection<E>>;
            entityValue: (id: Guid, u: BasicUpdater<E>) => Updater<Collection<E>>;
            entities: import("@core").Widening<Collection<E>, "entities">;
        };
        Template: {
            entityValue: (id: Guid, u: BasicUpdater<E>) => Updater<Collection<E>>;
        };
    };
};
//# sourceMappingURL=state.d.ts.map