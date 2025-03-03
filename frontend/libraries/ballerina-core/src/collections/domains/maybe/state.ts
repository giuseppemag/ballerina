import { unit, Unit } from "../../../fun/domains/unit/state";
import { BasicUpdater, Updater } from "../../../fun/domains/updater/state";
import { BasicFun, Fun } from "../../../fun/state";

export type Maybe<e> = e | undefined;
export const Maybe = {
  Default: <e>(_: e | undefined) => _,
  Updaters: {
    value: <e>(_: BasicUpdater<e>): Updater<Maybe<e>> =>
      Updater(Maybe.Operations.map(_)),
    ensureValue: <e>(_: BasicFun<Unit, e>): Updater<Maybe<e>> =>
      Updater((__) => (__ != undefined ? __ : _(unit))),
  },
  Operations: {
    map: <a, b>(f: BasicFun<a, b>): Fun<Maybe<a>, Maybe<b>> =>
      Fun<Maybe<a>, Maybe<b>>((_) =>
        _ != undefined ? Maybe.Default(f(_)) : Maybe.Default(undefined),
      ),
  },
};
