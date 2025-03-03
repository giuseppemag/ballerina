import { Fun } from "../../../../state";
import { BasicUpdater, Updater } from "../../state";
import { OrderedMap } from "immutable";

export type OrderedMapUpdater<
  Entity,
  Field extends keyof Entity,
  DisplayName extends string,
> = Entity extends {
  [_ in Field]: OrderedMap<infer key, infer value>;
}
  ? {
      [f in DisplayName]: {
        add: Fun<[key, value], Updater<Entity>>;
        remove: Fun<key, Updater<Entity>>;
        set: Fun<key, Fun<BasicUpdater<value>, Updater<Entity>>>;
      };
    }
  : "Error: orderedMapUpdater has been invoked on a field which is not an OrderedMap";

export const orderedMapUpdater =
  <Entity>() =>
  <Field extends keyof Entity, DisplayName extends string>(
    field: Field,
    displayName: DisplayName,
  ): OrderedMapUpdater<Entity, Field, DisplayName> =>
    ({
      [displayName]: {
        add: Fun(
          ([key, value]: [unknown, unknown]): Updater<Entity> =>
            Updater(
              (entity) =>
                ({
                  ...entity,
                  [field]: (entity[field] as OrderedMap<unknown, unknown>).set(
                    key,
                    value,
                  ),
                }) as Entity,
            ),
        ),
        remove: Fun(
          (key: unknown): Updater<Entity> =>
            Updater(
              (entity) =>
                ({
                  ...entity,
                  [field]: (
                    entity[field] as OrderedMap<unknown, unknown>
                  ).remove(key),
                }) as Entity,
            ),
        ),
        set: Fun((key: unknown) =>
          Fun(
            (fieldUpdater: BasicUpdater<unknown>): Updater<Entity> =>
              Updater(
                (entity) =>
                  ({
                    ...entity,
                    [field]:
                      (entity[field] as OrderedMap<unknown, unknown>).has(
                        key,
                      ) == false
                        ? entity[field]
                        : (entity[field] as OrderedMap<unknown, unknown>).set(
                            key,
                            fieldUpdater(
                              (
                                entity[field] as OrderedMap<unknown, unknown>
                              ).get(key)!,
                            ),
                          ),
                  }) as Entity,
              ),
          ),
        ),
      },
    }) as OrderedMapUpdater<Entity, Field, DisplayName>;
