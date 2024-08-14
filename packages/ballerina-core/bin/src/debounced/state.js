import { Updater } from "../fun/domains/updater/state";
export const Debounced = {
    Default: (initialValue) => (Object.assign(Object.assign({}, initialValue), { lastUpdated: 0, dirty: "not dirty", status: "waiting for dirty" })),
    Updaters: {
        Core: {
            status: (_) => Updater(current => (Object.assign(Object.assign({}, current), { status: _(current.status) }))),
            dirty: (_) => Updater(current => (Object.assign(Object.assign({}, current), { dirty: _(current.dirty) }))),
            lastUpdated: (_) => Updater(current => (Object.assign(Object.assign({}, current), { lastUpdated: _(current.lastUpdated) }))),
            value: (_) => Updater(current => (Object.assign(Object.assign({}, (_(current))), { dirty: current.dirty, lastUpdated: current.lastUpdated, status: current.status }))),
        },
        Template: {
            value: (_) => 
            // Debounced.Updaters.Core.value(_).then(
            // 	Debounced.Updaters.Core.dirty(replaceWith<DirtyStatus>("dirty"))
            // ).then(
            // 	Debounced.Updaters.Core.lastUpdated(replaceWith(Date.now()))
            // )
            Updater(current => (Object.assign(Object.assign({}, (_(current))), { dirty: "dirty", lastUpdated: Date.now(), status: current.status })))
        }
    },
    Operations: {
        shouldCoroutineRun: (_) => _.dirty != "not dirty"
    }
};
//# sourceMappingURL=state.js.map