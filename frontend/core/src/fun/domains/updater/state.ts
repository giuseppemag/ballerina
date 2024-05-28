import { BasicFun, Fun } from "../../state";

export type BasicUpdater<e> = BasicFun<e, e>;

export type Updater<e> = BasicUpdater<e> & {
  then(other: BasicUpdater<e>): Updater<e>;
  thenMany(others: Array<BasicUpdater<e>>): Updater<e>;
  insideOf: <p>() => <k extends keyof p>(k: k) => <up extends {
    Updaters:{ [_ in k]: BasicFun<BasicUpdater<e>, Updater<p>>; }
  }>(up: up) => Updater<p>;
};

export const Updater = <e>(_: BasicUpdater<e>): Updater<e> => {
  const u = _ as Updater<e>;
  u.thenMany = function (this: Updater<e>, others: Array<BasicUpdater<e>>): Updater<e> {
    return Updater(others.map(Updater).reduce((f, g) => f.then(g), this));
  };
  u.then = function (this: Updater<e>, other: BasicUpdater<e>): Updater<e> {
    return Updater(_ => other(this(_)));
  };
  u.insideOf = function <p>(this: Updater<e>): <k extends keyof p>(k: k) => <up extends {
    Updaters:{ [_ in k]: BasicFun<BasicUpdater<e>, Updater<p>>; }
  }>(up: up) => Updater<p> {
    return k => up => up.Updaters[k](this);
  };
  return u;
};
