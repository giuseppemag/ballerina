// import { faker } from "@faker-js/faker"
// import { CollectionReference, BoolExpr, Unit, InfiniteStreamSources, StreamPosition, PromiseRepo, OrderedMapRepo, EnumOptionsSources, EntityApis, unit, Guid, CollectionSelection } from "ballerina-core"
// import { Range, OrderedMap } from "immutable"
// import { City } from "../../address/state"
// import { AddressApi } from "../../address/apis/mocks"
// import { v4 } from "uuid"
// import { PersonApi } from "../../../apis/mocks"

// const colors: Array<[CollectionReference, BoolExpr<Unit>]> = [
//   [CollectionReference.Default(v4(), faker.color.human()), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), faker.color.human()), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), faker.color.human()), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), faker.color.human()), BoolExpr.Default.true()]
// ]
// const genders: Array<[CollectionReference, BoolExpr<Unit>]> = [
//   [CollectionReference.Default(v4(), "M"), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), "F"), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), "X"), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), "Y"), BoolExpr.Default.true()]
// ]
// const interests: Array<[CollectionReference, BoolExpr<Unit>]> = [
//   [CollectionReference.Default(v4(), "finance"), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), "marketing"), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), "management"), BoolExpr.Default.true()],
//   [CollectionReference.Default(v4(), "development"), BoolExpr.Default.true()],
// ]

// const streamApis: InfiniteStreamSources = (streamName: string) =>
//   streamName == "departments" ?
//     PersonApi.getDepartments()
//     :
//     streamName == "cities" ?
//       AddressApi.getCities()
//       :
//       (_ => _ => {
//         alert(`Cannot find stream API ${streamName}`)
//         return Promise.resolve({
//           hasMoreValues: false,
//           data: OrderedMap(),
//         })
//       })
// const enumApis: EnumOptionsSources = (enumName: string) =>
//   enumName == "colors" ?
//     PromiseRepo.Default.mock(() => colors)
//     :
//     enumName == "genders" ?
//       PromiseRepo.Default.mock(() => genders)
//       :
//       enumName == "interests" ?
//         PromiseRepo.Default.mock(() => interests)
//         :
//         PromiseRepo.Default.mock(() => {
//           alert(`Cannot find enum API ${enumName}`)
//           return []
//         })
// const entityApis: EntityApis = {
//   create: (apiName: string) =>
//     apiName == "person" ?
//       ((e: any) => PromiseRepo.Default.mock(() => {
//         console.log("person created")
//         return unit
//       }))
//       : ((e: any) => {
//         alert(`Cannot find entity API ${apiName} for 'create'`)
//         return Promise.reject()
//       }),
//   get: (apiName: string) =>
//     apiName == "person" ?
//       (id: Guid) => Promise.resolve({
//         name: faker.person.firstName(),
//         surname: faker.person.lastName(),
//         birthday: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 45),
//         subscribeToNewsletter: Math.random() > 0.5,
//         favoriteColor: CollectionSelection<CollectionReference>().Default.right("no selection"),
//         gender: CollectionSelection<CollectionReference>().Default.right("no selection"),
//         interests: OrderedMap(),
//         departments: OrderedMap(),
//         address: {
//           street: faker.location.street(),
//           number: Math.floor(Math.random() * 500),
//           city: Math.random() > 0.5 ?
//             CollectionSelection<CollectionReference>().Default.right("no selection")
//             :
//             CollectionSelection<CollectionReference>().Default.left(City.Default(v4(), faker.location.city()))
//         }
//       })
//       : (id: Guid) => {
//         alert(`Cannot find entity API ${apiName} for 'get'`)
//         return Promise.reject()
//       },
//   update: (apiName: string) =>
//     apiName == "person" ?
//       e => PromiseRepo.Default.mock(() => []) :
//       e => {
//         alert(`Cannot find entity API ${apiName} for 'update'`)
//         return Promise.resolve([])
//       },
//   default: (apiName: string) =>
//     apiName == "person" ?
//       _ => PromiseRepo.Default.mock(() => {
//         return ({
//           name: "",
//           surname: "",
//           birthday: Date.now(),
//           subscribeToNewsletter: false,
//           favoriteColor: CollectionSelection<CollectionReference>().Default.right("no selection"),
//           gender: CollectionSelection<CollectionReference>().Default.right("no selection"),
//           interests: OrderedMap(),
//           departments: OrderedMap(),
//           address: {
//             street: "",
//             number: 0,
//             city: CollectionSelection<CollectionReference>().Default.right("no selection")
//           }
//         })
//       }
//       )
//       : _ => {
//         alert(`Cannot find entity API ${apiName} for 'default'`)
//         return Promise.reject()
//       },
// }

// export const PersonFromConfigApis = {
//   streamApis,
//   enumApis,
//   entityApis
// }