import { LoadedCollection, LoadedEntity } from "@core";
export type LoadedEntities<Singletons, Collections, SingletonMutations, CollectionMutations> = {
    singletons: {
        [k in (keyof Singletons) & (keyof SingletonMutations)]: LoadedEntity<Singletons[k]>;
    };
    collections: {
        [k in (keyof Collections) & (keyof CollectionMutations)]: LoadedCollection<Collections[k]>;
    };
};
//# sourceMappingURL=state.d.ts.map