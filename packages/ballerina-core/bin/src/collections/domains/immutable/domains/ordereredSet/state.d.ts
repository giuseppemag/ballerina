import { OrderedSet } from "immutable";
import { Updater } from "../../../../../fun/domains/updater/state";
export declare const OrderedSetRepo: {
    Updaters: {
        add: <e>(e: e) => Updater<OrderedSet<e>>;
        subtract: <e>(elements: Iterable<e>) => Updater<OrderedSet<e>>;
    };
};
//# sourceMappingURL=state.d.ts.map