import { faker } from "@faker-js/faker"
import { CollectionReference, BoolExpr, Unit, InfiniteStreamSources, StreamPosition, PromiseRepo, OrderedMapRepo, EnumOptionsSources, EntityApis, unit, Guid, CollectionSelection } from "ballerina-core"
import { Range, OrderedMap, List } from "immutable"
import { City } from "../../address/state"
import { AddressApi } from "../../address/apis/mocks"
import { v4 } from "uuid"
import { PersonApi } from "../../../apis/mocks"

const permissions = ["create", "read", "update", "delete"]
const colors = [ faker.color.human(), faker.color.human(), faker.color.human(), faker.color.human()]
const genders = ["M", "F", "X", "Y"]
const interests = ["finance", "marketing", "management", "development"]

const streamApis: InfiniteStreamSources = (streamName: string) =>
  streamName == "departments" ?
    PersonApi.getDepartments()
    :
    streamName == "cities" ?
      AddressApi.getCities()
      :
      (_ => _ => {
        alert(`Cannot find stream API ${streamName}`)
        return Promise.resolve({
          hasMoreValues: false,
          data: OrderedMap(),
        })
      })
const enumApis: EnumOptionsSources = (enumName: string) =>
  enumName == "colors" ?
    () => PromiseRepo.Default.mock(() => colors.map(_ => ({Value: _})), undefined, 1, 0)
    :
    enumName == "permissions" ?
      () => PromiseRepo.Default.mock(() => permissions.map(_ => ({Value: _})), undefined, 1, 0)
    :
    enumName == "genders" ?
      () => PromiseRepo.Default.mock(() => genders.map(_ => ({Value: _})), undefined, 1, 0)
      :
      enumName == "interests" ?
        () => PromiseRepo.Default.mock(() => interests.map(_ => ({Value: _})), undefined, 1, 0)
        :
        () => PromiseRepo.Default.mock(() => {
          alert(`Cannot find enum API ${enumName}`)
          return []
        })
const entityApis: EntityApis = {
  create: (apiName: string) =>
    apiName == "person" ?
      ((e: any) => PromiseRepo.Default.mock(() => {
        console.log("person create api post body", JSON.stringify(e, undefined, 2))
        return unit
      }))
      : ((e: any) => {
        alert(`Cannot find entity API ${apiName} for 'create'`)
        return Promise.reject()
      }),
  get: (apiName: string) => {
    switch (apiName) {
      case "person":
        return (id: Guid) => {
          console.log(`get person ${id}`)
          return Promise.resolve({
            category: ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3],
            name: faker.person.firstName(),
            surname: faker.person.lastName(),
            birthday: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 45),
            subscribeToNewsletter: Math.random() > 0.5,
            favoriteColor: {Value: {Value: colors[Math.round(Math.random() * 10) % 4]}, IsSome: true},
            gender: {IsSome: false, Value: { Value: ""}},
            // gender: {Value: "M", IsSome: true},
            interests: [{Value: interests[1]}, {Value: interests[2]}],
            departments: [],
            mainAddress: {
              street: faker.location.street(),
              number: Math.floor(Math.random() * 500),
              city: Math.random() > 0.5 ?
                {IsSome: false, Value: {Value: ""}}
                :
                {Value: {...City.Default(v4(), faker.location.city())}, IsSome: true}
            },
            addresses: List([{
              street: faker.location.street(),
              number: Math.floor(Math.random() * 500),
              city: Math.random() > 0.5 ?
                {IsSome: false, Value: {Value: ""}}
                :
                {Value: {...City.Default(v4(), faker.location.city())}, IsSome: true}
            }]),
            emails: ["john@doe.it", "johnthedon@doe.com"],
            "addressesWithLabel": [
              {
                key: "home",
                value: {
                  street: faker.location.street(),
                  number: Math.floor(Math.random() * 500),
                  city: Math.random() > 0.5 ?
                    {IsSome: false, Value: {Value: ""}}
                    :
                    {Value: {...City.Default(v4(), faker.location.city())}, IsSome: true}
                }
              }
            ],
            "addressesByCity": [
              {
                key: {IsSome: true, Value: {...City.Default(v4(), faker.location.city())}},
                value: {
                  street: faker.location.street(),
                  number: Math.floor(Math.random() * 500),
                  city: Math.random() > 0.5 ?
                    {IsSome: false, Value: {Value: ""}}
                    :
                    {IsSome: true, Value: {...City.Default(v4(), faker.location.city())},}
                }
              },
              {
                key: {IsSome: true, Value: {...City.Default(v4(), faker.location.city())}},
                value: {
                  street: faker.location.street(),
                  number: Math.floor(Math.random() * 500),
                  city: Math.random() > 0.5 ?
                    {IsSome: false, Value: {Value: ""}}
                    :
                    {IsSome: true, Value: {...City.Default(v4(), faker.location.city())}}
                }
              }
            ],
            "addressesWithColorLabel": [],
            "permissions": [],
            "dependants":
             [
              {
                key: faker.person.firstName(),
                value: ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3]
              },
              {
                key: faker.person.firstName(),
                value: ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3]
              }
            ],
            "relatives": [["child", "adult", "senior"][Math.round(Math.random() * 10) % 3], ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3], ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3]],
            "friendsByCategory":
             [
              {
                key: ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3],
                value: faker.person.firstName()
              }
            ],
          })
        }
      default:
        return (id: Guid) => {
          alert(`Cannot find entity API ${apiName} for 'get' ${id}`)
          return Promise.reject()
        }
    }
  },
  update: (apiName: string) => (_id: Guid, _e: any) => {
    console.log(`update ${apiName} ${_id}`, JSON.stringify(_e, undefined, 2))
    switch (apiName) {
      case "person":
        return PromiseRepo.Default.mock(() => [])
      case 'errorPerson':
        return Promise.reject({
          status: 400,
          message: "Bad Request: Invalid person data provided",
        })
      default:
        alert(`Cannot find entity API ${apiName} for 'update'`)
        return Promise.resolve([])
    }
  },
  default: (apiName: string) =>
    apiName == "person" ?
      _ => PromiseRepo.Default.mock(() => {
        return ({
          name: "",
          surname: "",
          birthday: undefined,
          subscribeToNewsletter: false,
          favoriteColor: undefined,
          // CollectionSelection<CollectionReference>().Default.right("no selection"),
          gender: undefined,
          // CollectionSelection<CollectionReference>().Default.right("no selection"),
          interests: [],
          // OrderedMap(),
          departments: [],
          // OrderedMap(),
          mainAddress: {
            street: "",
            number: 0,
            city: undefined,
            // CollectionSelection<CollectionReference>().Default.right("no selection"),
          },
          addresses: [],
          // List(),
          emails: [],
          // List(),

          "addressesWithLabel": [],
          "addressesByCity": [],
          "addressesWithColorLabel": [],
          "permissions": [],
        })
      }
      )
      : _ => {
        alert(`Cannot find entity API ${apiName} for 'default'`)
        return Promise.reject()
      },
}

export const PersonFromConfigApis = {
  streamApis,
  enumApis,
  entityApis
}