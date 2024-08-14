import { BasicFun, Fun } from "../../../../state";
import { Unit } from "../../../unit/state";
import { BasicUpdater, Updater } from "../../state";
import { Map } from "immutable";
export type MapUpdater<Entity, Field extends keyof Entity, DisplayName extends string> = Entity extends {
    [_ in Field]: Map<infer key, infer value>;
} ? {
    [f in DisplayName]: {
        add: Fun<[key, value], Updater<Entity>>;
        remove: Fun<key, Updater<Entity>>;
        set: Fun<key, Fun<BasicUpdater<value>, Updater<Entity>>>;
        upsert: Fun<[key, BasicFun<Unit, value>, BasicUpdater<value>], Updater<Entity>>;
    };
} : "Error: mapUpdater has been invoked on a field which is not a map";
export declare const mapUpdater: <Entity>() => <Field extends keyof Entity, DisplayName extends string>(field: Field, displayName: DisplayName) => MapUpdater<Entity, Field, DisplayName>;
//# sourceMappingURL=state.d.ts.map