export * from "./src/apiResultStatus/state"
export * from "./src/async/state"
export * from "./src/async/domains/promise/state"
export * from "./src/async/domains/synchronized/state"
export * from "./src/async/domains/synchronized/domains/loaded-values/state"
export * from "./src/async/domains/synchronized/coroutines/synchronize"
export * from "./src/baseEntity/domains/identifiable/state"
export * from "./src/collections/domains/immutable/domains/map/state"
export * from "./src/collections/domains/immutable/domains/list/state"
export * from "./src/collections/domains/immutable/domains/orderedMap/state"
export * from "./src/collections/domains/immutable/domains/ordereredSet/state"
export * from "./src/coroutines/state"
export * from "./src/coroutines/template"
export * from "./src/coroutines/builder"
export * from "./src/debounced/state"
export * from "./src/debounced/coroutines/debounce"
export * from "./src/foreignMutations/state"
export * from "./src/fun/state"
export * from "./src/fun/domains/curry/state"
export * from "./src/fun/domains/id/state"
export * from "./src/fun/domains/simpleCallback/state"
export * from "./src/fun/domains/uncurry/state"
export * from "./src/fun/domains/unit/state"
export * from "./src/fun/domains/updater/state"
export * from "./src/fun/domains/updater/domains/simpleUpdater/state"
export * from "./src/fun/domains/updater/domains/maybeUpdater/state"
export * from "./src/fun/domains/updater/domains/mapUpdater/state"
export * from "./src/fun/domains/updater/domains/orderedMapUpdater/state"
export * from "./src/fun/domains/updater/domains/caseUpdater/state"
export * from "./src/fun/domains/updater/domains/replaceWith/state"
export * from "./src/infinite-data-stream/state"
export * from "./src/infinite-data-stream/template"
export * from "./src/infinite-data-stream/coroutines/runner"
export * from "./src/infinite-data-stream/coroutines/infiniteLoader"
export * from "./src/infinite-data-stream/coroutines/builder"
export * from "./src/state/domains/repository/state"
export * from "./src/template/state"
export * from "./src/validation/state"
export * from "./src/value/state"

// import { simpleUpdater, simpleUpdaterWithChildren } from "./src/fun/domains/updater/domains/simpleUpdater/state"
// import { Updater } from "./src/fun/domains/updater/state"

// // little testing playground and microsample: please do not remove
// type City = { name: string, population: number }
// const City = {
//   Default: (): City => ({
//     name: "Mirano", population: 25000
//   }),
//   Updaters: {
//     Core: {
//       ...simpleUpdater<City>()("name"),
//       ...simpleUpdater<City>()("population"),
//     }
//   }
// }
// type Address = { street: string, number: number, city: City }
// const Address = {
//   Default: (): Address => ({
//     street: "Don Minzoni", number: 20, city: City.Default()
//   }),
//   Updaters: {
//     Core: {
//       ...simpleUpdater<Address>()("street"),
//       ...simpleUpdater<Address>()("number"),
//       ...simpleUpdaterWithChildren<Address>()(City.Updaters)("city"),
//     },
//   }
// }
// type Person = { name: string, surname: string, address: Address }
// const Person = {
//   Default: (): Person => ({
//     name: "John", surname: "Doe", address: Address.Default()
//   }),
//   Updaters: {
//     Core: {
//       ...simpleUpdater<Person>()("name"),
//       ...simpleUpdater<Person>()("surname"),
//       ...simpleUpdaterWithChildren<Person>()(Address.Updaters)("address"),
//     }
//   }
// }

// const personUpdater:Updater<Person> = 
//   Person.Updaters.Core.address.children.Core.city.children.Core.name(_ =>"The Great " + _)
//   .then(Person.Updaters.Core.address(Address.Updaters.Core.street(_ => _ + " str.")))
//   .then(Person.Updaters.Core.address.children.Core.number(_ => _ + 1))
// console.log(personUpdater(Person.Default()))

// const addressUpdater:Updater<Address> = Address.Updaters.Core.city.children.name(_ =>"The Great " + _)
// console.log(addressUpdater(Address.Default()))