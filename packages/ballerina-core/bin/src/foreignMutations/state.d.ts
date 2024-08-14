import { BasicUpdater } from "../fun/domains/updater/state";
import { BasicFun } from "../fun/state";
export type ForeignMutationsInput<context, state> = {
    context: context & state;
    setState: BasicFun<BasicUpdater<state>, void>;
};
//# sourceMappingURL=state.d.ts.map