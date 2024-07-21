import { OrderedMap } from "immutable";
import { AsyncState, Collection, Guid, LoadedCollectionEntity } from "../../../../../../../../main";


export type LoadedCollection<E> = {
  values?:OrderedMap<Guid, LoadedCollectionEntity<E>>;
  isReloading:boolean;
  synchronizationErrors:Array<any>
}

export const LoadedCollection = 
  ({
    Default:{
      fromCollection:<E>(collection:Collection<E>) : 
       LoadedCollection<E> => ({
          values:AsyncState.Operations.hasValue(collection.entities.sync) ?
            collection.entities.sync.value.map(LoadedCollectionEntity.Default.fromEntity)
          : undefined,
          synchronizationErrors:AsyncState.Operations.errors(collection.entities.sync),
          isReloading:collection.entities.sync.kind == "reloading"
       })
    }
  })

