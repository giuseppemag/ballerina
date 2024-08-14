import { Map } from "immutable";
import { Updater } from "../../../../../fun/domains/updater/state";
export const MapRepo = {
    Default: {
        fromIdentifiables: (array) => Map(array.reduce((acc, item) => {
            acc[item.Id] = item;
            return acc;
        }, {})),
    },
    Updaters: {
        set(key, value) {
            return Updater((_) => _.set(key, value));
        },
        remove(key) {
            return Updater((_) => _.remove(key));
        },
        update: (k, _) => Updater((current) => current.has(k) ? current.set(k, _(current.get(k))) : current),
        upsert: (k, defaultValue, _) => Updater((current) => current.has(k) ? current.set(k, _(current.get(k))) : current.set(k, defaultValue({}))),
    }
};
//# sourceMappingURL=state.js.map