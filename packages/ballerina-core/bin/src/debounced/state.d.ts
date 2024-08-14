import { BasicUpdater, Updater } from "../fun/domains/updater/state";
export type DirtyStatus = "dirty" | "not dirty" | "dirty but being processed";
export type DebouncedStatus = "waiting for dirty" | "just detected dirty, starting processing" | "processing finished" | "state was still dirty but being processed, resetting to not dirty" | "processing shortcircuited" | "state was changed underwater back to dirty, leaving the dirty flag alone" | "inner call failed with transient failure";
export type Debounced<Value> = Value & {
    lastUpdated: number;
    dirty: DirtyStatus;
    status: DebouncedStatus;
};
export declare const Debounced: {
    Default: <v>(initialValue: v) => Debounced<v>;
    Updaters: {
        Core: {
            status: <v>(_: BasicUpdater<DebouncedStatus>) => Updater<Debounced<v>>;
            dirty: <v>(_: BasicUpdater<DirtyStatus>) => Updater<Debounced<v>>;
            lastUpdated: <v>(_: BasicUpdater<number>) => Updater<Debounced<v>>;
            value: <v>(_: BasicUpdater<v>) => Updater<Debounced<v>>;
        };
        Template: {
            value: <v>(_: BasicUpdater<v>) => Updater<Debounced<v>>;
        };
    };
    Operations: {
        shouldCoroutineRun: <v>(_: Debounced<v>) => boolean;
    };
};
//# sourceMappingURL=state.d.ts.map