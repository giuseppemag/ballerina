import { BasicUpdater, Synchronized, Unit, Updater } from "@core";
import { Entity } from "../entity/state";
export type Singleton<E> = {
    entity: Entity<E>;
};
export declare const Singleton: <E>() => {
    Default: (entity: Entity<E>) => Singleton<E>;
    Updaters: {
        Core: {
            reloader: (u: BasicUpdater<Synchronized<Unit, E>>) => Updater<Singleton<E>>;
            entityValue: (u: BasicUpdater<E>) => Updater<Singleton<E>>;
            entity: import("@core").WideningWithChildren<Singleton<E>, "entity", {
                value: import("@core").Widening<Entity<E>, "value">;
            }>;
        };
        Template: {
            entityValue: (u: BasicUpdater<E>) => Updater<Singleton<E>>;
        };
    };
};
//# sourceMappingURL=state.d.ts.map