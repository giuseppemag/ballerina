import { id } from "../../../fun/domains/id/state";
import { Unit } from "../../../fun/domains/unit/state";
import { BasicUpdater, Updater } from "../../../fun/domains/updater/state";
import { BasicFun, Fun } from "../../../fun/state";

export type Product<a, b> = { left: a; right: b };
export type Pair<a, b> = Product<a, b>;
export const Product = Object.assign(
  <a, b>() => ({
    Default: (left: a, right: b): Product<a, b> => ({ left, right }),
    Updaters: {
      left: Fun(
        (_: BasicUpdater<a>): Updater<Product<a, b>> =>
          Updater(Product<a, b>().Operations.map2(_, id)),
      ),
      right: Fun(
        (_: BasicUpdater<b>): Updater<Product<a, b>> =>
          Updater(Product<a, b>().Operations.map2(id, _)),
      ),
    },
    Operations: {
      map2: <a1, b1>(
        l: BasicFun<a, a1>,
        r: BasicFun<b, b1>,
      ): Fun<Product<a, b>, Product<a1, b1>> =>
        Fun((_) => Product.Default(l(_.left), r(_.right))),
    },
  }),
  {
    Default: <a, b>(left: a, right: b): Product<a, b> => ({ left, right }),
    Updaters: {
      left: <a, b>(_: BasicUpdater<a>): Updater<Product<a, b>> =>
        Updater(Product<a, b>().Operations.map2(_, id)),
      right: <a, b>(_: BasicUpdater<b>): Updater<Product<a, b>> =>
        Updater(Product<a, b>().Operations.map2(id, _)),
    },
    Operations: {
      map2: <a, b, a1, b1>(
        l: BasicFun<a, a1>,
        r: BasicFun<b, b1>,
      ): Fun<Product<a, b>, Product<a1, b1>> =>
        Fun((_) => Product.Default(l(_.left), r(_.right))),
    },
  },
);
