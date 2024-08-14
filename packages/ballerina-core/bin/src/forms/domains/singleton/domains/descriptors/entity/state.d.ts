import { FieldDescriptor } from "../field/state";
export type EntityDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context> = {
    [k in keyof E]: FieldDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k, Context>;
};
export declare const EntityDescriptor: {
    Default: <E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context>(_: EntityDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context>) => EntityDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context>;
};
//# sourceMappingURL=state.d.ts.map