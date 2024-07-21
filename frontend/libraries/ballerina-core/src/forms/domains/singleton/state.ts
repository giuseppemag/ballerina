import { SmallIdentifiable } from "../../../../main";
import { InfiniteStreamState } from "../../../infinite-data-stream/state";
import { FormDefinition } from "./domains/descriptors/form/state";


/* 
this structure may not be obvious at a first glange: the state of a form
is the intersection (&) of the states of all the custom fields (because those 
might be whole nested forms with their own state so we just lug it around),
as well as the state for fields that need to track information, such as the
InfiniteStreamState which will contain the currently loaded elements
*/
export type SingletonForm<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields> = {
  [k in (keyof Entity) & (keyof CustomTypeFields)]: CustomTypeFields[k];
} & {
  [k in (keyof Entity) & (InfiniteEnumKeys)]: InfiniteStreamState<SmallIdentifiable & Entity[k]>;
};
export type SingletonFormReadonlyContext<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields> = {
  entity: Entity;
} & FormDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>;

export type SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields> = SingletonForm<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>;
export type SingletonFormForeignMutationsExpected<Entity, EnumKeys, InfiniteEnumKeys> = {
  updateEntity: <k extends keyof Entity>(k: k, newFieldValue: Entity[k]) => void;
};
