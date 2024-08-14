import { Template } from "../../../template/state";
import { SingletonFormWritableState, SingletonFormForeignMutationsExpected } from "./state";
import { FieldViews } from "./views/field-views";
export declare const SingletonFormTemplate: <Entity, EnumKeys extends keyof Entity, InfiniteEnumKeys extends keyof Entity, CustomTypeFields, Context>() => Template<{
    entity: Entity;
} & import("./domains/descriptors/form/state").FormDefinition<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields, Context> & Context & { [k in keyof Entity & keyof CustomTypeFields]: CustomTypeFields[k]; } & { [k_1 in keyof Entity & InfiniteEnumKeys]: import("../../../..").InfiniteStreamState<import("../../../..").SmallIdentifiable & Entity[k_1]>; }, SingletonFormWritableState<Entity, EnumKeys, InfiniteEnumKeys, CustomTypeFields>, SingletonFormForeignMutationsExpected<Entity, EnumKeys, InfiniteEnumKeys>, FieldViews>;
//# sourceMappingURL=template.d.ts.map