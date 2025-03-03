import { BasicFun, Fun } from "../../../../state";
import { unit, Unit } from "../../../unit/state";
import { BasicUpdater, Updater } from "../../state";
import { Map } from "immutable";

export type MapUpdater<
  Entity,
  Field extends keyof Entity,
  DisplayName extends string,
> = Entity extends {
  [_ in Field]: Map<infer key, infer value>;
}
  ? {
      [f in DisplayName]: {
        add: Fun<[key, value], Updater<Entity>>;
        remove: Fun<key, Updater<Entity>>;
        set: Fun<key, Fun<BasicUpdater<value>, Updater<Entity>>>;
        upsert: Fun<
          [key, BasicFun<Unit, value>, BasicUpdater<value>],
          Updater<Entity>
        >;
      };
    }
  : "Error: mapUpdater has been invoked on a field which is not a map";

export const mapUpdater =
  <Entity>() =>
  <Field extends keyof Entity, DisplayName extends string>(
    field: Field,
    displayName: DisplayName,
  ): MapUpdater<Entity, Field, DisplayName> =>
    ({
      [displayName]: {
        add: Fun(
          ([key, value]: [unknown, unknown]): Updater<Entity> =>
            Updater(
              (entity) =>
                ({
                  ...entity,
                  [field]: (entity[field] as Map<unknown, unknown>).set(
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
                  [field]: (entity[field] as Map<unknown, unknown>).remove(key),
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
                      (entity[field] as Map<unknown, unknown>).has(key) == false
                        ? entity[field]
                        : (entity[field] as Map<unknown, unknown>).set(
                            key,
                            fieldUpdater(
                              (entity[field] as Map<unknown, unknown>).get(
                                key,
                              )!,
                            ),
                          ),
                  }) as Entity,
              ),
          ),
        ),
        upsert: Fun(
          ([key, fallback, fieldUpdater]: [
            unknown,
            BasicFun<Unit, unknown>,
            BasicUpdater<unknown>,
          ]): Updater<Entity> =>
            Updater(
              (entity) =>
                ({
                  ...entity,
                  [field]: (entity[field] as Map<unknown, unknown>).set(
                    key,
                    (entity[field] as Map<unknown, unknown>).has(key)
                      ? fieldUpdater(
                          (entity[field] as Map<unknown, unknown>).get(key)!,
                        )
                      : fieldUpdater(fallback(unit)),
                  ),
                }) as Entity,
            ),
        ),
      },
    }) as MapUpdater<Entity, Field, DisplayName>;
