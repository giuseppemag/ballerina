import { Fun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";





export type MaybeUpdater<Entity, Field extends keyof Entity> = Entity extends {
  [_ in Field]: infer value | undefined;
} ? {
    [f in Field]: Fun<BasicUpdater<value>, Updater<Entity>>;
  } : "Error: maybeUpdater has been invoked on a field which cannot be undefined";

export const maybeUpdater = <Entity>() => <Field extends keyof Entity>(field: Field): MaybeUpdater<Entity, Field> => ({
  [field]: Fun((fieldUpdater: BasicUpdater<Entity[Field]>): Updater<Entity> => {
    return Updater(currentEntity => currentEntity[field] == undefined ? currentEntity :
      ({ ...currentEntity, [field]: fieldUpdater(currentEntity[field]) }) as Entity
    );
  }),
}) as MaybeUpdater<Entity, Field>;
