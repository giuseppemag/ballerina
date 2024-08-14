import { AsyncState, LoadedCollectionEntity } from "@core";
export const LoadedCollection = ({
    Default: {
        fromCollection: (collection) => ({
            values: AsyncState.Operations.hasValue(collection.entities.sync) ?
                collection.entities.sync.value.map(LoadedCollectionEntity.Default.fromEntity)
                : undefined,
            synchronizationErrors: AsyncState.Operations.errors(collection.entities.sync),
            isReloading: collection.entities.sync.kind == "reloading"
        })
    }
});
//# sourceMappingURL=state.js.map