import { AsyncState, Debounced, Value, unit } from "@core";
import { Synchronized } from "@core";
import { simpleUpdater } from "@core";
export const Entity = () => ({
    Default: (value) => ({
        value: Debounced.Default(Synchronized.Default(Value.Default(Synchronized.Default(unit, AsyncState.Default.loaded(value))))),
    }),
    Updaters: {
        Core: Object.assign({}, simpleUpdater()("value"))
    }
});
//# sourceMappingURL=state.js.map