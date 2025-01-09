import { BasicUpdater, Updater } from "../../../fun/domains/updater/state";
import { Value } from "../../state";

export type FlaggedValue<v> = Value<v> & { flag: boolean };

export const FlaggedValue = {
  Default: <v>(v: v, flag: boolean = false): FlaggedValue<v> => ({
    ...Value.Default(v),
    flag,
  }),
  Updaters: {
    Core: {
      value: <v>(_: BasicUpdater<v>): Updater<FlaggedValue<v>> =>
        Updater<FlaggedValue<v>>((current) => ({
          ...current,
          value: _(current.value),
        })),
    },
    Template: {
      flag: <v>(flag: boolean): Updater<FlaggedValue<v>> =>
        Updater<FlaggedValue<v>>((current) => ({
          ...current,
          flag,
        })),
    },
  },
};
