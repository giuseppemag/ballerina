import { AsyncState, Debounced, Value, simpleUpdaterWithChildren, unit } from "@core";
import { Synchronized } from "@core";
import { Unit } from "@core";
import { simpleUpdater } from "@core";


export type Entity<E> = {
  value: Debounced<Synchronized<Value<Synchronized<Unit, E>>, Unit>>;
};
export const Entity = <E>() => ({
  Default: (value: E): Entity<E> => ({
    value: Debounced.Default(Synchronized.Default(Value.Default(Synchronized.Default(unit, AsyncState.Default.loaded(value))))),
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<Entity<E>>()("value"),
    }
  }
});
