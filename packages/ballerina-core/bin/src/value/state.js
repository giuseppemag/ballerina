import { Updater } from "../fun/domains/updater/state";
export const Value = {
    Default: (v) => ({ value: v }),
    Updaters: {
        value: (_) => Updater(current => (Object.assign(Object.assign({}, current), { value: _(current.value) }))),
    },
    Operations: {
        value: (_) => _.value
    }
};
//# sourceMappingURL=state.js.map