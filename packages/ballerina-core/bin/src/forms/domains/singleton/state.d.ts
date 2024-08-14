import { SmallIdentifiable } from "@core";
import { InfiniteStreamState } from "../../../infinite-data-stream/state";
import { FormDefinition } from "./domains/descriptors/form/state";
export type SingletonForm<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields> = {
    [k in (keyof Entity) & (keyof CustomTypeFields)]: CustomTypeFields[k];
} & {
    [k in (keyof Entity) & (InfiniteEnumKeys)]: InfiniteStreamState<SmallIdentifiable & Entity[k]>;
};
export type SingletonFormReadonlyContext<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context> = {
    entity: Entity;
} & FormDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context> & Context;
export type SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields> = SingletonForm<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>;
export type SingletonFormForeignMutationsExpected<Entity, EnumKeys, InfiniteEnumKeys> = {
    updateEntity: <k extends keyof Entity>(k: k, newFieldValue: Entity[k]) => void;
};
//# sourceMappingURL=state.d.ts.map