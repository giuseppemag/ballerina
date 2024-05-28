import { Fun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";

export type Widening<p, c extends keyof p> = Fun<BasicUpdater<p[c]>, Updater<p>>;

export type SimpleUpdater<Entity, Field extends keyof Entity> = {
  [f in Field]: Widening<Entity, Field>;
};
export const simpleUpdater = <Entity>() => <Field extends keyof Entity>(field: Field): SimpleUpdater<Entity, Field> => ({
  [field]: Fun((fieldUpdater: BasicUpdater<Entity[Field]>): Updater<Entity> => {
    return Updater(currentEntity => ({ ...currentEntity, [field]: fieldUpdater(currentEntity[field]) }) as Entity
    );
  }),
}) as SimpleUpdater<Entity, Field>;
