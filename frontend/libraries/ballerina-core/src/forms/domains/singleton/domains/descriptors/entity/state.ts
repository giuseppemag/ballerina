import { FieldDescriptor } from "../field/state";


export type EntityDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields> = {
  [k in keyof E]: FieldDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields, k>;
};
export const EntityDescriptor = {
  Default: <E, EnumKeys, InfiniteEnumKeys, CustomTypeFields>(_: EntityDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields>): EntityDescriptor<E, EnumKeys, InfiniteEnumKeys, CustomTypeFields> => _
};
