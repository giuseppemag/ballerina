import { OrderedMap } from "immutable";
import { Collection, Guid, LoadedCollectionEntity } from "@core";
export type LoadedCollection<E> = {
    values?: OrderedMap<Guid, LoadedCollectionEntity<E>>;
    isReloading: boolean;
    synchronizationErrors: Array<any>;
};
export declare const LoadedCollection: {
    Default: {
        fromCollection: <E>(collection: Collection<E>) => LoadedCollection<E>;
    };
};
//# sourceMappingURL=state.d.ts.map