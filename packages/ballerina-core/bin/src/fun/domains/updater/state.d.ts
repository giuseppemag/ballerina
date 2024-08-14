import { BasicFun, Fun } from "../../state";
export type BasicUpdater<e> = BasicFun<e, e>;
export type Updater<e> = BasicUpdater<e> & {
    fun: Fun<e, e>;
    then(other: BasicUpdater<e>): Updater<e>;
    thenMany(others: Array<BasicUpdater<e>>): Updater<e>;
};
export declare const Updater: <e>(u: BasicUpdater<e>) => Updater<e>;
//# sourceMappingURL=state.d.ts.map