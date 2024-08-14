import { Singleton, Collection } from "@core";
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
export declare const SynchronizedEntities: <Singletons, Collections>() => {
    Updaters: {
        Core: {
            collections: import("@core").Widening<SynchronizedEntities<Singletons, Collections>, "collections">;
            singletons: import("@core").Widening<SynchronizedEntities<Singletons, Collections>, "singletons">;
        };
    };
};
//# sourceMappingURL=state.d.ts.map