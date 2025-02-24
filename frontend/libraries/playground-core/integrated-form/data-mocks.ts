import { faker } from "@faker-js/faker"
import { v4 } from "uuid"
import { City } from "../person/domains/address/state"

const permissions = ["Create", "Read", "Update", "Delete"]

export const initialIntegratedFormData = {
    plotInfo: {
      landArea: {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100)
      }
    },
    subscribeToNewsletter: Math.random() > 0.5,
    dependants: [{key: "Steve", value: "adult"}, {key: "Alice", value: "senior"}],
    relatives: [["child", "adult", "senior"][Math.round(Math.random() * 10) % 3], ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3], ["child", "adult", "senior"][Math.round(Math.random() * 10) % 3]],
    departments: [],
    addresses: [],
    mainAddress: {
      street: faker.location.street(),
      number: Math.floor(Math.random() * 500),
      city: Math.random() > 0.5 ?
        {IsSome: false, Value: {Value: ""}}
        :
        {Value: {...City.Default(v4(), faker.location.city())}, IsSome: true}
    },
    emails: ["john@doe.it", "johnthedon@doe.com"],
    permissions: [],
    cityByDepartment: [],
  }