import { Map, OrderedMap } from "immutable";
export type Guid = string;
export type Identifiable = {
    Id: Guid;
};
export type SmallIdentifiable = {
    id: string;
};
export declare const Identifiable: {
    Operations: {
        toMap: <T extends Identifiable>(values: Array<T>) => Map<Guid, T>;
        toOrderedMap: <T extends Identifiable>(values: Array<T>) => OrderedMap<Guid, T>;
    };
};
export declare const SmallIdentifiable: {
    Operations: {
        toMap: <T extends SmallIdentifiable>(values: Array<T>) => Map<Guid, T>;
        toOrderedMap: <T extends SmallIdentifiable>(values: Array<T>) => OrderedMap<Guid, T>;
    };
};
//# sourceMappingURL=state.d.ts.map