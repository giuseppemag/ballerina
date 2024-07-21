import { Collection, OrderedMap } from "immutable";
import { Guid, LoadedCollection } from "../../../../../../../../main";
import { LoadedEntity } from "../loaded-entity/state";


export type LoadedEntities<Singletons, Collections, SingletonMutations, CollectionMutations> = {
  singletons: {
    [k in (keyof Singletons) & (keyof SingletonMutations)]: LoadedEntity<Singletons[k]>;
  }; collections: {
    [k in (keyof Collections) & (keyof CollectionMutations)]: LoadedCollection<Collections[k]>
  };
};
