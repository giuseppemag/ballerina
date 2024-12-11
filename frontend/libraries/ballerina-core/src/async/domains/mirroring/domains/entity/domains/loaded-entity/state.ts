import { Sum } from "../../../../../../../../main";
import { DebouncedStatus, DirtyStatus } from "../../../../../../../debounced/state";
import { AsyncState } from "../../../../../../state";
import { Entity } from "../../state";

export type LoadedEntity<E> = {
  value?: E;
  isSubmitting:boolean;
  isReloading:boolean;
  isBeingCreated:boolean;
  synchronizationErrors:Array<any>;
  lastUpdated: number;
  dirty: DirtyStatus;
  status: Sum<DebouncedStatus, "debug off">;
};
export const LoadedEntity = {
  Default:{
    fromEntity:<E>(e:Entity<E>) : LoadedEntity<E> =>
      ({
        value:AsyncState.Operations.hasValue(e.value.value.sync) ? e.value.value.sync.value : undefined,
        isSubmitting:AsyncState.Operations.isLoading(e.value.sync),
        isReloading:AsyncState.Operations.isLoading(e.value.value.sync),
        isBeingCreated:e.isBeingCreated,
        synchronizationErrors:[...AsyncState.Operations.errors(e.value.sync),...AsyncState.Operations.errors(e.value.value.sync)],
        lastUpdated: e.value.lastUpdated,
        dirty: e.value.dirty,
        status: e.value.status
      })
  }
}
