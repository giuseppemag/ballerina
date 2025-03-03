import { Fun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";

export type MaybeUpdater<Entity, Field extends keyof Entity> = Entity extends {
  [_ in Field]: infer value | undefined;
}
  ? Required<{
      [f in Field]: Fun<BasicUpdater<value>, Updater<Entity>> & {
        both: Fun<BasicUpdater<value | undefined>, Updater<Entity>>;
      };
    }>
  : Entity extends {
        [_ in Field]?: infer value;
      }
    ? Required<{
        [f in Field]: Fun<BasicUpdater<value>, Updater<Entity>> & {
          both: Fun<BasicUpdater<value | undefined>, Updater<Entity>>;
        };
      }>
    : "Error: maybeUpdater has been invoked on a field which cannot be undefined";

export const maybeUpdater =
  <Entity>() =>
  <Field extends keyof Entity>(field: Field): MaybeUpdater<Entity, Field> =>
    ({
      [field]: Object.assign(
        Fun((fieldUpdater: BasicUpdater<Entity[Field]>): Updater<Entity> => {
          return Updater((currentEntity) =>
            currentEntity[field] == undefined
              ? currentEntity
              : ({
                  ...currentEntity,
                  [field]: fieldUpdater(currentEntity[field]),
                } as Entity),
          );
        }),
        {
          both: Fun(
            (
              fieldUpdater: BasicUpdater<Entity[Field] | undefined>,
            ): Updater<Entity> => {
              return Updater(
                (currentEntity) =>
                  ({
                    ...currentEntity,
                    [field]: fieldUpdater(currentEntity[field]),
                  }) as Entity,
              );
            },
          ),
        },
      ),
    }) as MaybeUpdater<Entity, Field>;

// // reference examples:
// type T = {
//   x:number,
//   y:string | undefined,
//   z?:boolean
// }

// const T = {
//   Updaters:{
//     ...maybeUpdater<T>()("x"),
//     ...maybeUpdater<T>()("y").y(...),
//     ...maybeUpdater<T>()("z").z.both(...),
//   }
// }
