import { simpleUpdater, Singleton, Collection } from "ballerina-core";


export type InsideSingletons<Entities> = {
  [e_k in keyof Entities]: Singleton<Entities[e_k]>;
};

export type InsideCollections<Entities> = {
  [e_k in keyof Entities]: Collection<Entities[e_k]>;
};

export type SynchronizedEntities<Singletons, Collections> = {
  singletons: InsideSingletons<Singletons>;
  collections: InsideCollections<Collections>;
};
export const SynchronizedEntities = <Singletons, Collections>() => ({
  Updaters: {
    Core: {
      ...simpleUpdater<SynchronizedEntities<Singletons, Collections>>()("singletons"),
      ...simpleUpdater<SynchronizedEntities<Singletons, Collections>>()("collections"),
    }
  }
});
