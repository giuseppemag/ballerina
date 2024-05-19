import { BasicUpdater, Updater, Widening } from "../../state";

export type SimpleUpdater<Entity, Field extends keyof Entity> = {
  [f in Field]: Widening<Entity, Field>;
};
export const simpleUpdater = <Entity>() => <Field extends keyof Entity>(field: Field): SimpleUpdater<Entity, Field> => ({
  [field]: (fieldUpdater: BasicUpdater<Entity[Field]>): Updater<Entity> => {
    return Updater(currentEntity => ({ ...currentEntity, [field]: fieldUpdater(currentEntity[field]) }) as Entity
    );
  },
}) as SimpleUpdater<Entity, Field>;
