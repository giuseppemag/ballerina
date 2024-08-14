import { Fun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";
import { OrderedMap } from "immutable";
export type OrderedMapUpdater<Entity, Field extends keyof Entity, DisplayName extends string> = Entity extends {
    [_ in Field]: OrderedMap<infer key, infer value>;
} ? {
    [f in DisplayName]: {
        add: Fun<[key, value], Updater<Entity>>;
        remove: Fun<key, Updater<Entity>>;
        set: Fun<key, Fun<BasicUpdater<value>, Updater<Entity>>>;
    };
} : "Error: orderedMapUpdater has been invoked on a field which is not an OrderedMap";
export declare const orderedMapUpdater: <Entity>() => <Field extends keyof Entity, DisplayName extends string>(field: Field, displayName: DisplayName) => OrderedMapUpdater<Entity, Field, DisplayName>;
//# sourceMappingURL=state.d.ts.map