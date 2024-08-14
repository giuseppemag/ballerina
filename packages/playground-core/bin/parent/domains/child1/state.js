import { simpleUpdater } from "@ballerina/core";
export const Child1 = {
    Default: () => ({
        x: 0,
        y: "",
    }),
    Updaters: {
        Core: Object.assign(Object.assign({}, simpleUpdater()("x")), simpleUpdater()("y"))
    },
    ForeignMutations: (_) => ({})
};
//# sourceMappingURL=state.js.map