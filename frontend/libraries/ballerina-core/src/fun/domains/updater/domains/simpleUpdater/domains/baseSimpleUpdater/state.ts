import { Fun } from "../../../../../../state";
import { BasicUpdater, Updater } from "../../../../state";



export type BaseWidening<c, p extends c> = Fun<BasicUpdater<c>, Updater<p>>;

export type BaseSimpleUpdater<BaseEntity, Entity extends BaseEntity, Name extends string> = Required<{
  [_ in Name]: BaseWidening<BaseEntity, Entity>;
}>;
export const baseSimpleUpdater = <BaseEntity, Entity extends BaseEntity>() => <Name extends string>(name: Name): BaseSimpleUpdater<BaseEntity, Entity, Name> => ({
  [name]: Fun((baseUpdater: BasicUpdater<BaseEntity>): Updater<Entity> => {
    return Updater<Entity>(current => ({
      ...current,
      ...(baseUpdater(current)),
    }));
  }),
}) as BaseSimpleUpdater<BaseEntity, Entity, Name>;
