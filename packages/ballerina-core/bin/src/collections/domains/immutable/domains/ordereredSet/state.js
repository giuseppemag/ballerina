import { Updater } from "../../../../../fun/domains/updater/state";
export const OrderedSetRepo = {
    Updaters: {
        add: (e) => Updater(current => current.add(e)),
        subtract: (elements) => Updater(current => current.subtract(elements))
    }
};
//# sourceMappingURL=state.js.map