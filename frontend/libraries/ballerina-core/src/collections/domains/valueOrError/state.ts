export type ValueOrError<v, e> = { value: v } | e[];
export const ValueOrError = {
  Default: <v, e>(v: v): ValueOrError<v, e> => ({ value: v }),
  Updaters: {
    value: <v, e>(_: BasicUpdater<v>): Updater<ValueOrError<v, e>> =>
      Updater<ValueOrError<v, e>>((current) => ({
        ...current,
        value: _(current.value),
      })),
  },
  Operations: {
    value: <v, e>(_: ValueOrError<v, e>): v => _.value,
  },
};
