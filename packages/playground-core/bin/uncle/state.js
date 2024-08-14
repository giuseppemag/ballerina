import { replaceWith } from "@ballerina/core";
import { simpleUpdater } from "@ballerina/core";
export const Uncle = {
    Default: () => ({
        flag: false
    }),
    Updaters: {
        Core: Object.assign({}, simpleUpdater()("flag"))
    },
    ForeignMutations: (_) => ({
        overrideFlag: (newValue) => _.setState(Uncle.Updaters.Core.flag(replaceWith(newValue)))
    })
};
//# sourceMappingURL=state.js.map