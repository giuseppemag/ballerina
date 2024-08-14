import { AsyncState, Debounced, Synchronized, Value, simpleUpdaterWithChildren } from "@core";
import { Entity } from "../entity/state";
export const Singleton = () => ({
    Default: (entity) => ({ entity }),
    Updaters: {
        Core: Object.assign(Object.assign({}, simpleUpdaterWithChildren()(Entity().Updaters.Core)("entity")), { reloader: (u) => Singleton().Updaters.Core.entity(Entity().Updaters.Core.value(Debounced.Updaters.Core.value(Synchronized.Updaters.value(Value.Updaters.value(u))))), entityValue: (u) => Singleton().Updaters.Core.entity(Entity().Updaters.Core.value(Debounced.Updaters.Core.value(Synchronized.Updaters.value(Value.Updaters.value(Synchronized.Updaters.sync(AsyncState.Operations.map(u))))))) }),
        Template: {
            entityValue: (u) => Singleton().Updaters.Core.entity(Entity().Updaters.Core.value(Debounced.Updaters.Template.value(Synchronized.Updaters.value(Value.Updaters.value(Synchronized.Updaters.sync(AsyncState.Operations.map(u))))))),
        }
    }
});
//# sourceMappingURL=state.js.map