import { BasicUpdater, Updater } from "../fun/domains/updater/state";

export type Value<v> = { value: v };
export const Value = {
  Default: <v>(v: v): Value<v> => ({ value: v }),
  Updaters: {
    value: <v>(_: BasicUpdater<v>): Updater<Value<v>> =>
      Updater<Value<v>>((current) => ({ ...current, value: _(current.value) })),
  },
  Operations: {
    value: <v>(_: Value<v>): v => _.value,
  },
};
