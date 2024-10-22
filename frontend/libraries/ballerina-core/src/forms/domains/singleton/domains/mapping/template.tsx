import { List } from "immutable";
import { Template } from "../../../../../template/state";
import { Value } from "../../../../../value/state";
import { EntityFormContext, EntityFormState, EntityFormForeignMutationsExpected, OnChange, EntityFormView, EntityFormTemplate } from "../../state";
import { Mapping } from "./state";


export type MappedEntityFormTemplate<SourceEntity, Entity, FieldStates, ExtraContext, ExtraForeignMutationsExpected> = Template<
  Omit<EntityFormContext<Entity, (keyof Entity) & (keyof FieldStates), FieldStates, ExtraContext, ExtraForeignMutationsExpected>, "value"> & Value<SourceEntity>, EntityFormState<Entity, (keyof Entity) & (keyof FieldStates), FieldStates, ExtraContext, ExtraForeignMutationsExpected>, Omit<EntityFormForeignMutationsExpected<Entity, (keyof Entity) & (keyof FieldStates), FieldStates, ExtraContext, ExtraForeignMutationsExpected>, "onChange"> & { onChange: OnChange<SourceEntity>; }, EntityFormView<Entity, (keyof Entity) & (keyof FieldStates), FieldStates, ExtraContext, ExtraForeignMutationsExpected>
>;

export const MappedEntityFormTemplate = <SourceEntity, Entity, FieldStates, ExtraContext, ExtraForeignMutationsExpected>(
  mapping: Mapping<SourceEntity, Entity>,
  form: EntityFormTemplate<
    Entity, (keyof Entity) & (keyof FieldStates), FieldStates, ExtraContext, ExtraForeignMutationsExpected>
): MappedEntityFormTemplate<
  SourceEntity, Entity, FieldStates, ExtraContext, ExtraForeignMutationsExpected> => form
    .mapContext((_: Omit<EntityFormContext<Entity, (keyof Entity) & (keyof FieldStates), FieldStates, ExtraContext, ExtraForeignMutationsExpected>, "value"> & Value<SourceEntity>) => {
      const newContext = ({ ..._, value: mapping.from(_.value) }) as any
      return newContext
    })
    .mapForeignMutations((_: any) => ({
      ..._,
      onChange: (u, path) => {
        _.onChange(
          (current: any) => mapping.to([
            current,
            u(mapping.from(current))
          ]),
          List(mapping.pathFrom(path.toArray()))
        );
      }
    }));
