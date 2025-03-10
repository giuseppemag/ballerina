import {
  AsyncState,
  Debounced,
  Value,
  simpleUpdaterWithChildren,
  unit,
} from "ballerina-core";
import { Synchronized } from "ballerina-core";
import { Unit } from "ballerina-core";
import { simpleUpdater } from "ballerina-core";

export type Entity<E> = {
  value: Debounced<Synchronized<Value<Synchronized<Unit, E>>, Unit>>;
  isBeingCreated: boolean;
};
export const Entity = <E>() => ({
  Default: (value: E): Entity<E> => ({
    value: Debounced.Default(
      Synchronized.Default(
        Value.Default(
          Synchronized.Default(unit, AsyncState.Default.loaded(value)),
        ),
      ),
    ),
    isBeingCreated: false,
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<Entity<E>>()("value"),
      ...simpleUpdater<Entity<E>>()("isBeingCreated"),
    },
  },
});
