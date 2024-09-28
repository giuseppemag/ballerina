import { DebouncedStatus, DirtyStatus } from "../../../../../../../debounced/state";
import { AsyncState } from "../../../../../../state";
import { CollectionEntity } from "../../../collection/state";
import { LoadedEntity } from "../loaded-entity/state";

export type LoadedCollectionEntity<E> = LoadedEntity<E> & {
  isRemoved:boolean;
  lastUpdated: number;
  dirty: DirtyStatus;
  status: DebouncedStatus;
};
export const LoadedCollectionEntity = {
  Default:{
    fromEntity:<E>(e:CollectionEntity<E>) : LoadedCollectionEntity<E> =>
      ({
        value:AsyncState.Operations.hasValue(e.value.value.sync) ? e.value.value.sync.value : undefined,
        isSubmitting:AsyncState.Operations.isLoading(e.value.sync),
        isReloading:AsyncState.Operations.isLoading(e.value.value.sync),
        isBeingCreated:e.isBeingCreated,
        synchronizationErrors:[...AsyncState.Operations.errors(e.value.sync),...AsyncState.Operations.errors(e.value.value.sync)],
        isRemoved:e.removed,
        lastUpdated: e.value.lastUpdated,
        dirty: e.value.dirty,
        status: e.value.status
      })
  }
}
