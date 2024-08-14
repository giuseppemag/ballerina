import { BasicUpdater, Updater } from "../../../fun/domains/updater/state";
import { AsyncState } from "../../state";
export type Synchronized<value, syncResult> = value & {
    sync: AsyncState<syncResult>;
};
export declare const Synchronized: {
    Default: <value, syncResult>(initialValue: value, sync?: AsyncState<syncResult>) => Synchronized<value, syncResult>;
    Updaters: {
        sync: <value, syncResult>(_: BasicUpdater<AsyncState<syncResult>>) => Updater<Synchronized<value, syncResult>>;
        value: <value, syncResult>(_: BasicUpdater<value>) => Updater<Synchronized<value, syncResult>>;
    };
};
//# sourceMappingURL=state.d.ts.map