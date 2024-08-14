import { Fun } from "../../state";
export const Updater = (u) => {
    return Object.assign(u, {
        fun: Fun(u),
        then: function (other) {
            return Updater(_ => other(this(_)));
        },
        thenMany: function (others) {
            return Updater(others.map(_ => Updater(_)).reduce((f, g) => f.then(g), this));
        }
    });
};
/*export const Updater = Object.assign(<e>(_: BasicUpdater<e>): Updater<e> => {
  const u = _ as Updater<e>;
  u.fun = Fun(u);
  u.thenMany = function (this: Updater<e>, others: Array<BasicUpdater<e>>): Updater<e> {
    return Updater<e>(others.map(_ => Updater(_)).reduce((f, g) => f.then(g), this));
  };
  u.then = function (this: Updater<e>, other: BasicUpdater<e>): Updater<e> {
    return Updater<e>(_ => other(this(_)));
  };
  return u;
}, {
  withState:<e>(_: BasicFun<e,BasicUpdater<e>>) : Updater<e> =>
    Updater(e => _(e)(e))
    });
*/
/*
// little testing playground and microsample: please do not remove
import { simpleUpdater, simpleUpdaterWithChildren } from "./domains/simpleUpdater/state";
type City = { name: string, population: number }
const City = {
  Default: (): City => ({
    name: "Mirano", population: 25000
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<City>()("name"),
      ...simpleUpdater<City>()("population"),
    }
  }
}
type Address = { street: string, number: number, city: City}
const Address = {
  Default: (): Address => ({
    street: "via Don Minzoni", number: 20, city: City.Default()
  }),
  Updaters: {
    Core: {
    ...simpleUpdater<Address>()("street"),
    ...simpleUpdater<Address>()("number"),
       ...simpleUpdaterWithChildren<Address>()(City.Updaters)("city"),
    }
  }
}
type Person = { name: string, surname: string, address: Address }
const Person = {
  Default: (): Person => ({
    name: "John", surname: "Doe", address: Address.Default()
  }),
  Updaters: {
    Core: {
      ...simpleUpdater<Person>()("name"),
      ...simpleUpdater<Person>()("surname"),
      ...simpleUpdaterWithChildren<Person>()(Address.Updaters)("address"),
    }
  }
}
const personAndAddressUpdater:Updater<Person> =
    Person.Updaters.Core.name(_ => `Dr. ${_}`).then(
    Person.Updaters.Core.surname(_ => `${_}, von`)
    ).then(
    Person.Updaters.Core.address.children.Core.city.Core.name(_ => `${_} the Great`)
    )
*/
//# sourceMappingURL=state.js.map