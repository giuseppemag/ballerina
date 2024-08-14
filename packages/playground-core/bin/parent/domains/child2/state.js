import { simpleUpdater } from "@ballerina/core";
export const Child2 = {
    Default: () => ({
        a: 1,
        b: "",
    }),
    Updaters: {
        Core: Object.assign(Object.assign({}, simpleUpdater()("a")), simpleUpdater()("b"))
    },
    ForeignMutations: (_) => ({})
};
//# sourceMappingURL=state.js.map