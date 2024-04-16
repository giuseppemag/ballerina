import { BasicUpdater } from "../fun/domains/updater/state";
import { BasicFun } from "../fun/state";

export type ForeignMutationsInput<context, state> = { context:context, setState:BasicFun<BasicUpdater<state>, void> }
