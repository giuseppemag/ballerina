import { BasicUpdater, Updater } from "../fun/domains/updater/state";
export type Value<v> = {
    value: v;
};
export declare const Value: {
    Default: <v>(v: v) => Value<v>;
    Updaters: {
        value: <v>(_: BasicUpdater<v>) => Updater<Value<v>>;
    };
    Operations: {
        value: <v>(_: Value<v>) => v;
    };
};
//# sourceMappingURL=state.d.ts.map