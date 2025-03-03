import { Fun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";
import { OrderedSet } from "immutable";

export type OrderedSetUpdater<
  Entity,
  Field extends keyof Entity,
  DisplayName extends string,
> = Entity extends {
  [_ in Field]: OrderedSet<infer value>;
}
  ? {
      [f in DisplayName]: {
        add: Fun<value, Updater<Entity>>;
        remove: Fun<value, Updater<Entity>>;
      };
    }
  : "Error: orderedSetUpdater has been invoked on a filed which is not an OrderedSet";

export const orderedSetUpdater =
  <Entity>() =>
  <Field extends keyof Entity, DisplayName extends string>(
    field: Field,
    displayName: DisplayName,
  ): OrderedSetUpdater<Entity, Field, DisplayName> =>
    ({
      [displayName]: {
        add: Fun(
          (value: unknown): Updater<Entity> =>
            Updater(
              (entity) =>
                ({
                  ...entity,
                  [field]: (entity[field] as OrderedSet<unknown>).add(value),
                }) as Entity,
            ),
        ),
        remove: Fun(
          (value: unknown): Updater<Entity> =>
            Updater(
              (entity) =>
                ({
                  ...entity,
                  [field]: (entity[field] as OrderedSet<unknown>).remove(value),
                }) as Entity,
            ),
        ),
      },
    }) as OrderedSetUpdater<Entity, Field, DisplayName>;
