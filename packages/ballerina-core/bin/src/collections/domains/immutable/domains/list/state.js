import { Updater } from "../../../../../fun/domains/updater/state";
export const ListRepo = {
    Default: {},
    Updaters: {
        push(v) {
            return Updater((_) => _.push(v));
        },
        filter(predicate) {
            return Updater((_) => _.filter(predicate));
        },
    },
    Operations: {},
};
//# sourceMappingURL=state.js.map