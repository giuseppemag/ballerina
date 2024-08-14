import { Map, OrderedMap } from "immutable";
export const Identifiable = {
    Operations: {
        toMap: (values) => Map(values.map((_) => [_.Id, _])),
        toOrderedMap: (values) => OrderedMap(values.map((_) => [_.Id, _]))
    }
};
export const SmallIdentifiable = {
    Operations: {
        toMap: (values) => Map(values.map((_) => [_.id, _])),
        toOrderedMap: (values) => OrderedMap(values.map((_) => [_.id, _]))
    }
};
//# sourceMappingURL=state.js.map