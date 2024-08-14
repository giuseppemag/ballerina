import { Template } from "../../../../../../template/state";
import { SingletonFormReadonlyContext, SingletonFormWritableState, SingletonFormForeignMutationsExpected } from "../../../state";
import { FieldViews } from "../../../views/field-views";
import { EntityDescriptor } from "../entity/state";
export type FormDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context> = {
    entityDescriptor: EntityDescriptor<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context>;
    fieldOrder: Array<keyof Entity>;
};
export type FormTemplateAndDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context> = {
    template: Template<SingletonFormReadonlyContext<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context> & SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>, SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>, SingletonFormForeignMutationsExpected<Entity, EnumKeys, InfiniteEnumKeys>, FieldViews>;
} & FormDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context>;
//# sourceMappingURL=state.d.ts.map