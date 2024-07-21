import { Template } from "../../../../../../template/state";
import { SingletonFormReadonlyContext, SingletonFormWritableState, SingletonFormForeignMutationsExpected } from "../../../state";
import { FieldViews } from "../../../views/field-views";
import { EntityDescriptor } from "../entity/state";


export type FormDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields> = {
  entityDescriptor: EntityDescriptor<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>;
  fieldOrder: Array<keyof Entity>;
};
export type FormTemplateAndDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields> = {
  template: Template<
    SingletonFormReadonlyContext<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields> & SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>, SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>, SingletonFormForeignMutationsExpected<Entity, EnumKeys, InfiniteEnumKeys>, FieldViews>;
} & FormDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>;
