import { Updater } from "../../../fun/domains/updater/state";
import { AsyncState } from "../../state";
export const Synchronized = {
    Default: (initialValue, sync) => (Object.assign(Object.assign({}, initialValue), { sync: sync !== null && sync !== void 0 ? sync : AsyncState.Default.unloaded() })),
    Updaters: {
        sync: (_) => Updater(current => (Object.assign(Object.assign({}, current), { sync: _(current.sync) }))),
        value: (_) => Updater(current => (Object.assign(Object.assign({}, current), (_(current))))),
    }
};
//# sourceMappingURL=state.js.map