import { Debounced, Value } from "@core";
import { Synchronized } from "@core";
import { Unit } from "@core";
export type Entity<E> = {
    value: Debounced<Synchronized<Value<Synchronized<Unit, E>>, Unit>>;
};
export declare const Entity: <E>() => {
    Default: (value: E) => Entity<E>;
    Updaters: {
        Core: {
            value: import("@core").Widening<Entity<E>, "value">;
        };
    };
};
//# sourceMappingURL=state.d.ts.map