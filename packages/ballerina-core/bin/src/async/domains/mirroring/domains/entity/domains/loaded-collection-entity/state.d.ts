import { CollectionEntity } from "../../../collection/state";
import { LoadedEntity } from "../loaded-entity/state";
export type LoadedCollectionEntity<E> = LoadedEntity<E> & {
    isRemoved: boolean;
};
export declare const LoadedCollectionEntity: {
    Default: {
        fromEntity: <E>(e: CollectionEntity<E>) => LoadedCollectionEntity<E>;
    };
};
//# sourceMappingURL=state.d.ts.map